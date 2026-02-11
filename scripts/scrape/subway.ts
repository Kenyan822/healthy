/**
 * サブウェイ スクレイパー（価格 + 栄養成分）
 *
 * 実行: npx tsx scripts/scrape/subway.ts [--dry-run]
 *
 * 各メニューの個別ページから価格と栄養成分をスクレイピングして
 * データファイル(scripts/data/subway-menus.ts)に書き戻す。
 * DB投入は seed:subway で別途実行。
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { MenuMatcher } from "./common/matcher";
import { subwayMenuData } from "../data/subway-menus";
import type {
  ExistingMenu,
  PriceUpdateReport,
} from "./common/types";

// 栄養成分を含むスクレイピング結果
interface ScrapedSubwayItem {
  name: string;
  price: number | null;
  detailUrl: string;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carb: number | null;
  sodium: number | null;
}

// サブウェイ用設定
const SUBWAY_CONFIG = {
  chainId: "subway",
  baseUrl: "https://www.subway.co.jp",
  menuPages: [
    "/menu/sandwich/",
    "/menu/salad/",
    "/menu/sidemenu/",
    "/menu/drink/",
    "/menu/morning/",
    "/menu/kids/",
  ],
  timeout: 30000,
  delayMs: 500, // リクエスト間隔
};

/**
 * 一覧ページから個別ページURLを取得
 */
async function getMenuDetailUrls(): Promise<
  { name: string; price: number | null; detailUrl: string }[]
> {
  const items: { name: string; price: number | null; detailUrl: string }[] = [];

  console.log("\n=== サブウェイ 一覧ページから個別URLを取得 ===");
  console.log(`Base URL: ${SUBWAY_CONFIG.baseUrl}`);
  console.log(`Menu pages: ${SUBWAY_CONFIG.menuPages.length}\n`);

  for (const pagePath of SUBWAY_CONFIG.menuPages) {
    const url = `${SUBWAY_CONFIG.baseUrl}${pagePath}`;
    console.log(`\n--- Scanning ${url} ---`);

    try {
      const response = await axios.get(url, {
        timeout: SUBWAY_CONFIG.timeout,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });

      const $ = cheerio.load(response.data);
      const pageItems = extractMenuLinks($);
      items.push(...pageItems);
      console.log(`Found ${pageItems.length} menu links`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log(`Page not found: ${url}`);
      } else {
        console.error(`Error scanning ${url}:`, error);
      }
    }

    await delay(SUBWAY_CONFIG.delayMs);
  }

  return items;
}

/**
 * 一覧ページからメニューリンクを抽出
 */
function extractMenuLinks(
  $: cheerio.CheerioAPI
): { name: string; price: number | null; detailUrl: string }[] {
  const items: { name: string; price: number | null; detailUrl: string }[] = [];

  $(".productList li a, ul.productList li a").each((_index, element) => {
    const $el = $(element);

    // メニュー名を取得
    const menuName = $el.find("h4.product_name_ja").text().trim();
    if (!menuName) return;

    // 個別ページURL
    const href = $el.attr("href");
    if (!href || !href.endsWith(".html")) return;

    // 価格を取得
    const priceAreas = $el.find(".price_area");
    let price: number | null = null;

    priceAreas.each((_i, priceArea) => {
      const $priceArea = $(priceArea);
      const priceName = $priceArea.find(".price_name").text().trim();

      if (priceName === "単品" || priceName === "レギュラー" || !priceName) {
        const priceYen = $priceArea.find(".price_yen").text().trim();
        const priceMatch = priceYen.match(/[¥￥]([0-9,]+)/);
        if (priceMatch) {
          const parsedPrice = parseInt(priceMatch[1].replace(/,/g, ""), 10);
          if (!isNaN(parsedPrice) && parsedPrice >= 100 && parsedPrice <= 2000) {
            price = parsedPrice;
            return false;
          }
        }
      }
    });

    items.push({
      name: menuName,
      price,
      detailUrl: href.startsWith("http")
        ? href
        : `${SUBWAY_CONFIG.baseUrl}${href}`,
    });
  });

  return items;
}

/**
 * 個別ページから栄養成分を取得
 */
async function scrapeNutritionFromDetail(
  item: { name: string; price: number | null; detailUrl: string }
): Promise<ScrapedSubwayItem> {
  const result: ScrapedSubwayItem = {
    name: item.name,
    price: item.price,
    detailUrl: item.detailUrl,
    calories: null,
    protein: null,
    fat: null,
    carb: null,
    sodium: null,
  };

  try {
    const response = await axios.get(item.detailUrl, {
      timeout: SUBWAY_CONFIG.timeout,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // 栄養成分テーブルを取得（typo: "nutorition"）
    const nutritionTable = $('table#nutorition');
    if (nutritionTable.length === 0) {
      return result;
    }

    // ヘッダー行からカラム位置を特定
    const headers: string[] = [];
    nutritionTable.find("tr").first().find("th").each((_i, th) => {
      headers.push($(th).text().trim());
    });

    // データ行から値を取得
    const values: string[] = [];
    nutritionTable.find("tr").eq(1).find("td").each((_i, td) => {
      values.push($(td).text().trim());
    });

    // カラム位置に基づいて値を設定
    headers.forEach((header, idx) => {
      const value = parseFloat(values[idx]);
      if (isNaN(value)) return;

      if (header.includes("エネルギー")) {
        result.calories = value;
      } else if (header.includes("たんぱく質")) {
        result.protein = value;
      } else if (header.includes("脂質")) {
        result.fat = value;
      } else if (header.includes("炭水化物")) {
        result.carb = value;
      } else if (header.includes("ナトリウム")) {
        result.sodium = value;
      }
    });
  } catch (error) {
    console.error(`  ⚠ Failed to fetch ${item.detailUrl}`);
  }

  return result;
}

/**
 * 全メニューをスクレイピング
 */
async function scrapeSubway(
  dryRun: boolean = false
): Promise<ScrapedSubwayItem[]> {
  // 1. 一覧ページから個別URL取得
  const menuLinks = await getMenuDetailUrls();

  // 重複排除
  const seen = new Set<string>();
  const uniqueLinks = menuLinks.filter((item) => {
    if (seen.has(item.detailUrl)) return false;
    seen.add(item.detailUrl);
    return true;
  });

  console.log(
    `\nDeduplication: ${menuLinks.length} → ${uniqueLinks.length} unique links`
  );

  // dryRunの場合は最大20件に制限
  const linksToScrape = dryRun ? uniqueLinks.slice(0, 20) : uniqueLinks;

  console.log(`\n=== 個別ページから栄養成分を取得 ===`);
  console.log(`Scraping ${linksToScrape.length} pages...\n`);

  const items: ScrapedSubwayItem[] = [];

  for (let i = 0; i < linksToScrape.length; i++) {
    const link = linksToScrape[i];
    process.stdout.write(
      `\r[${i + 1}/${linksToScrape.length}] ${link.name.slice(0, 20).padEnd(20)}`
    );

    const item = await scrapeNutritionFromDetail(link);
    items.push(item);

    await delay(SUBWAY_CONFIG.delayMs);
  }

  console.log(`\n\n=== Scraping Complete ===`);
  console.log(`Total items with nutrition: ${items.filter((i) => i.calories !== null).length}/${items.length}`);

  return items;
}

/**
 * 既存メニューをデータファイルから取得
 */
function getExistingMenus(): ExistingMenu[] {
  return subwayMenuData.map((menu) => ({
    menuId: menu.menu_id,
    menuName: menu.menu_name,
    price: menu.price,
  }));
}

/**
 * データファイルを更新（価格と栄養成分）
 */
const UPDATE_CONFIDENCE_THRESHOLD = 0.85;

interface MatchedItem {
  menuId: string;
  menuName: string;
  scrapedName: string;
  confidence: number;
  price: number | null;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carb: number | null;
  sodium: number | null;
}

function updateDataFile(matches: MatchedItem[]): number {
  const filePath = path.join(__dirname, "../data/subway-menus.ts");
  let content = fs.readFileSync(filePath, "utf-8");
  let updatedCount = 0;

  for (const match of matches) {
    if (match.confidence < UPDATE_CONFIDENCE_THRESHOLD) continue;

    const escaped = match.menuId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // メニューブロック全体をマッチ
    const blockRegex = new RegExp(
      `(\\{[^}]*menu_id: "${escaped}"[^}]*\\})`,
      "s"
    );
    const blockMatch = content.match(blockRegex);
    if (!blockMatch) continue;

    let block = blockMatch[1];
    let changed = false;

    // 価格を更新
    if (match.price !== null) {
      const priceRegex = /price: (?:null|\d+)/;
      const newBlock = block.replace(priceRegex, `price: ${match.price}`);
      if (newBlock !== block) {
        block = newBlock;
        changed = true;
      }
    }

    // 栄養成分を更新
    if (match.calories !== null) {
      const caloriesRegex = /calories: (?:null|\d+(?:\.\d+)?)/;
      const newBlock = block.replace(caloriesRegex, `calories: ${match.calories}`);
      if (newBlock !== block) {
        block = newBlock;
        changed = true;
      }
    }

    if (match.protein !== null) {
      const proteinRegex = /protein: (?:null|\d+(?:\.\d+)?)/;
      const newBlock = block.replace(proteinRegex, `protein: ${match.protein}`);
      if (newBlock !== block) {
        block = newBlock;
        changed = true;
      }
    }

    if (match.fat !== null) {
      const fatRegex = /fat: (?:null|\d+(?:\.\d+)?)/;
      const newBlock = block.replace(fatRegex, `fat: ${match.fat}`);
      if (newBlock !== block) {
        block = newBlock;
        changed = true;
      }
    }

    if (match.carb !== null) {
      const carbRegex = /carb: (?:null|\d+(?:\.\d+)?)/;
      const newBlock = block.replace(carbRegex, `carb: ${match.carb}`);
      if (newBlock !== block) {
        block = newBlock;
        changed = true;
      }
    }

    if (match.sodium !== null) {
      const sodiumRegex = /sodium: (?:null|\d+(?:\.\d+)?)/;
      const newBlock = block.replace(sodiumRegex, `sodium: ${match.sodium}`);
      if (newBlock !== block) {
        block = newBlock;
        changed = true;
      }
    }

    if (changed) {
      content = content.replace(blockMatch[1], block);
      updatedCount++;
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  return updatedCount;
}

/**
 * レポートを出力
 */
function printReport(
  matches: MatchedItem[],
  unmatched: ScrapedSubwayItem[]
): void {
  console.log("\n========================================");
  console.log("        Matching Report");
  console.log("========================================\n");

  const total = matches.length + unmatched.length;
  console.log(`Total scraped: ${total}`);
  console.log(`Matched: ${matches.length}`);
  console.log(`Unmatched: ${unmatched.length}`);

  const highConfidence = matches.filter((m) => m.confidence >= 0.95);
  const mediumConfidence = matches.filter(
    (m) => m.confidence >= UPDATE_CONFIDENCE_THRESHOLD && m.confidence < 0.95
  );
  const lowConfidence = matches.filter(
    (m) => m.confidence < UPDATE_CONFIDENCE_THRESHOLD
  );

  console.log(`\n--- High Confidence (≥0.95): ${highConfidence.length} ---`);
  for (const m of highConfidence.slice(0, 20)) {
    const nutritionStr = m.calories !== null ? `${m.calories}kcal` : "栄養なし";
    const priceStr = m.price !== null ? `${m.price}円` : "価格なし";
    console.log(`  ✓ ${m.scrapedName} → ${m.menuName} (${priceStr}, ${nutritionStr})`);
  }
  if (highConfidence.length > 20) {
    console.log(`  ... and ${highConfidence.length - 20} more`);
  }

  console.log(
    `\n--- Medium Confidence (${UPDATE_CONFIDENCE_THRESHOLD}-0.95): ${mediumConfidence.length} ---`
  );
  for (const m of mediumConfidence) {
    console.log(
      `  ? ${m.scrapedName} → ${m.menuName} (${m.confidence.toFixed(2)})`
    );
  }

  console.log(
    `\n--- Low Confidence (<${UPDATE_CONFIDENCE_THRESHOLD}): ${lowConfidence.length} ---`
  );
  for (const m of lowConfidence) {
    console.log(
      `  ⚠ ${m.scrapedName} → ${m.menuName} (${m.confidence.toFixed(2)})`
    );
  }

  if (unmatched.length > 0) {
    console.log(`\n--- Unmatched: ${unmatched.length} ---`);
    for (const item of unmatched.slice(0, 20)) {
      const priceStr = item.price !== null ? `${item.price}円` : "価格なし";
      console.log(`  ✗ ${item.name}: ${priceStr}`);
    }
    if (unmatched.length > 20) {
      console.log(`  ... and ${unmatched.length - 20} more`);
    }
  }

  console.log("\n========================================\n");
}

/**
 * stdinから1行読み取る
 */
function prompt(message: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(message);
    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    console.log("[DRY RUN] 最大20件をスクレイピングしてレポート表示します\n");
  }

  // 1. スクレイピング実行
  const scrapeResult = await scrapeSubway(dryRun);

  if (scrapeResult.length === 0) {
    console.error("No items scraped. Exiting.");
    process.exit(1);
  }

  // 2. 既存メニュー取得
  const existingMenus = getExistingMenus();
  console.log(`Existing menus in data file: ${existingMenus.length}`);

  // 3. マッチング
  const matcher = new MenuMatcher();

  // 手動マッピング
  matcher.setManualMappings({
    "てり焼きチキン": "てり焼きチキン～焦がし醬油仕立て～",
    "サラダチキン": "サラダチキン（ハニーマスタードソース）",
    "てり焼きチキン（サラダ）": "てり焼きチキン～焦がし醬油仕立て～（サラダ）",
    "キッズてりチキ": "てりチキ",
    "キッズハムたま": "ハムたま",
    "キッズたまご": "たまご",
    "キッズてりたま": "てりたま",
    "ローストビーフ　～プレミアム製法～": "ローストビーフ",
  });

  // マッチング実行
  const scrapedForMatch = scrapeResult.map((item) => ({
    name: item.name,
    price: item.price ?? 0,
  }));

  const matchReport = matcher.matchAll(scrapedForMatch, existingMenus);

  // マッチ結果に栄養成分を追加
  const matchedItems: MatchedItem[] = matchReport.matched.map((m) => {
    const scraped = scrapeResult.find((s) => s.name === m.scrapedName);
    return {
      menuId: m.menuId,
      menuName: m.menuName,
      scrapedName: m.scrapedName,
      confidence: m.confidence,
      price: scraped?.price ?? null,
      calories: scraped?.calories ?? null,
      protein: scraped?.protein ?? null,
      fat: scraped?.fat ?? null,
      carb: scraped?.carb ?? null,
      sodium: scraped?.sodium ?? null,
    };
  });

  const unmatchedItems = scrapeResult.filter(
    (s) => !matchReport.matched.some((m) => m.scrapedName === s.name)
  );

  // 4. レポート出力
  printReport(matchedItems, unmatchedItems);

  if (dryRun) {
    const updateCount = matchedItems.filter(
      (m) => m.confidence >= UPDATE_CONFIDENCE_THRESHOLD
    ).length;
    console.log(
      `[DRY RUN] 本番実行すると ${updateCount} 件がデータファイルに更新されます\n`
    );
    return;
  }

  // 5. 承認を求める
  const updateCount = matchedItems.filter(
    (m) => m.confidence >= UPDATE_CONFIDENCE_THRESHOLD
  ).length;
  const answer = await prompt(
    `\n${updateCount} 件をデータファイルに更新しますか？ (y/n): `
  );

  if (answer.toLowerCase() !== "y") {
    console.log("キャンセルしました");
    return;
  }

  // 6. データファイル更新
  const updatedCount = updateDataFile(matchedItems);
  console.log(
    `\n✅ ${updatedCount} 件をデータファイルに更新しました`
  );
  console.log("💡 DBに反映するには npm run seed:subway を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
