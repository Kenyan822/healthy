/**
 * CoCo壱番屋メニュー価格スクレイパー
 *
 * 実行: npx tsx scripts/scrape/cocoichi-prices.ts [--dry-run]
 *
 * カテゴリページから税込価格をスクレイピングし、
 * データファイル(scripts/data/cocoichi-menus.ts)のpriceフィールドを更新する。
 * DB投入は seed:cocoichi で別途実行。
 *
 * CoCo壱サイトの特徴:
 * - カテゴリページ: /menu/list.html?cid={id}
 * - 価格表示: 税抜＋税込の2段階（税込を採用）
 * - サイト側カテゴリはデータファイルより細分化されている
 *   （カレーメニュー → 肉類/魚介類/野菜類、トッピング → 肉類/魚介類/野菜類/その他）
 */

import * as fs from "fs";
import * as path from "path";
import axios, { AxiosError } from "axios";
import { load, type CheerioAPI } from "cheerio";
import { MenuMatcher } from "./common/matcher";
import { cocoichiMenuData } from "../data/cocoichi-menus";
import type {
  ScrapedMenuItem,
  ExistingMenu,
  PriceUpdateReport,
} from "./common/types";

// CoCo壱用設定
const CONFIG = {
  chainId: "cocoichi",
  baseUrl: "https://www.ichibanya.co.jp",
  // カテゴリID → カテゴリ名
  categories: {
    "1": "肉類のカレー",
    "2": "期間/数量限定",
    "3": "魚介類のカレー",
    "4": "野菜類のカレー",
    "5": "その他のカレーメニュー",
    "6": "地域限定",
    "7": "お子さまメニュー",
    "8": "特定原材料を使用していないカレー",
    "12": "その他",
    "13": "デザート",
    "14": "ドリンク・スープ",
    "16": "サラダ",
    "17": "その他/トッピング",
    "18": "野菜類/トッピング",
    "19": "魚介類/トッピング",
    "20": "肉類/トッピング",
    "22": "麺類",
    "23": "スモールカレー",
    "24": "ハヤシライス",
  } as Record<string, string>,
  rateLimit: 3000,
  timeout: 30000,
  maxRetries: 3,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * レート制限付きfetch（リトライ対応）
 */
async function fetchPage(url: string): Promise<CheerioAPI> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      console.log(`  Fetching: ${url} (attempt ${attempt})`);

      const response = await axios.get(url, {
        timeout: CONFIG.timeout,
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        },
      });

      return load(response.data);
    } catch (error) {
      lastError = error as Error;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 403) {
          console.error(`  Access Denied: ${url}`);
          throw error;
        } else if (axiosError.response?.status === 404) {
          console.error(`  Not found: ${url}`);
          throw error;
        }
      }

      if (attempt < CONFIG.maxRetries) {
        const backoff = Math.pow(2, attempt) * 5000;
        console.log(`  Retrying in ${backoff / 1000}s...`);
        await sleep(backoff);
      }
    }
  }

  throw lastError || new Error(`Failed to fetch: ${url}`);
}

/**
 * カテゴリページからメニュー名+税込価格を取得
 *
 * HTML構造:
 * <div class="box-media">
 *   <h2 class="box-media__title">
 *     <i class="fa fa-arrow-circle-right"></i>ポークカレー
 *   </h2>
 *   <p class="box-media__price">
 *     <span>588</span>円（税込646円）
 *   </p>
 * </div>
 */
async function scrapeCategoryPage(
  categoryId: string,
  categoryName: string
): Promise<ScrapedMenuItem[]> {
  const url = `${CONFIG.baseUrl}/menu/list.html?cid=${categoryId}`;
  const $ = await fetchPage(url);
  const items: ScrapedMenuItem[] = [];

  $(".box-media").each((_, el) => {
    const $el = $(el);
    const name = $el.find(".box-media__title").text().trim();
    const priceBlock = $el.find(".box-media__price").text().trim();

    // 税込価格を抽出: "588円（税込646円）" → 646
    const taxIncMatch = priceBlock.match(/税込(\d[\d,]*)円/);
    let price: number | null = null;

    if (taxIncMatch) {
      price = parseInt(taxIncMatch[1].replace(/,/g, ""), 10);
    } else {
      // 税込表記がない場合（単一価格）: "300円" → 300
      const simpleMatch = priceBlock.match(/(\d[\d,]*)円/);
      if (simpleMatch) {
        price = parseInt(simpleMatch[1].replace(/,/g, ""), 10);
      }
    }

    if (name && price && !isNaN(price) && price > 0 && price < 100000) {
      items.push({
        name,
        price,
        category: categoryName,
      });
    }
  });

  return items;
}

/**
 * 全カテゴリをスクレイピング
 */
async function scrapeAll(): Promise<ScrapedMenuItem[]> {
  const allItems: ScrapedMenuItem[] = [];
  const categoryIds = Object.keys(CONFIG.categories);

  console.log(`\n=== CoCo壱番屋 Price Scraping ===`);
  console.log(`Categories: ${categoryIds.length}\n`);

  for (let i = 0; i < categoryIds.length; i++) {
    const id = categoryIds[i];
    const name = CONFIG.categories[id];

    console.log(
      `[${i + 1}/${categoryIds.length}] ${name} (cid=${id})`
    );

    try {
      const items = await scrapeCategoryPage(id, name);
      allItems.push(...items);
      console.log(`  Found ${items.length} items`);
    } catch (error) {
      console.error(
        `  ERROR: ${error instanceof Error ? error.message : error}`
      );
    }

    if (i < categoryIds.length - 1) {
      await sleep(CONFIG.rateLimit);
    }
  }

  console.log(`\n=== Scraping Complete ===`);
  console.log(`Total items: ${allItems.length}`);

  return allItems;
}

/**
 * 既存メニューをデータファイルから取得
 */
function getExistingMenus(): ExistingMenu[] {
  return cocoichiMenuData.map((menu) => ({
    menuId: menu.menu_id,
    menuName: menu.menu_name,
    price: menu.price,
  }));
}

/**
 * データファイルの price フィールドを更新（confidence 0.8以上のみ）
 */
function updateDataFile(matches: PriceUpdateReport["matched"]): number {
  const filePath = path.join(__dirname, "../data/cocoichi-menus.ts");
  let content = fs.readFileSync(filePath, "utf-8");
  let updatedCount = 0;

  for (const match of matches) {
    if (match.confidence < 0.8) continue;

    const escaped = match.menuId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(menu_id: "${escaped}",[^}]*?price:) (?:null|\\d+)`
    );
    const newContent = content.replace(regex, `$1 ${match.price}`);
    if (newContent !== content) {
      content = newContent;
      updatedCount++;
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  return updatedCount;
}

/**
 * レポート出力
 */
function printReport(report: PriceUpdateReport): void {
  console.log("\n========================================");
  console.log("        Matching Report");
  console.log("========================================\n");

  console.log(`Total scraped: ${report.totalMatched + report.totalUnmatched}`);
  console.log(`Matched: ${report.totalMatched}`);
  console.log(`Unmatched: ${report.totalUnmatched}`);

  const highConfidence = report.matched.filter((m) => m.confidence >= 0.95);
  const mediumConfidence = report.matched.filter(
    (m) => m.confidence >= 0.8 && m.confidence < 0.95
  );
  const lowConfidence = report.matched.filter((m) => m.confidence < 0.8);

  console.log(`\n--- High Confidence (>=0.95): ${highConfidence.length} ---`);
  for (const m of highConfidence.slice(0, 15)) {
    console.log(
      `  ✓ ${m.scrapedName} → ${m.menuName} (${m.price}円, ${m.matchType})`
    );
  }
  if (highConfidence.length > 15) {
    console.log(`  ... and ${highConfidence.length - 15} more`);
  }

  console.log(
    `\n--- Medium Confidence (0.8-0.95): ${mediumConfidence.length} ---`
  );
  for (const m of mediumConfidence) {
    console.log(
      `  ? ${m.scrapedName} → ${m.menuName} (${m.price}円, ${m.confidence.toFixed(2)})`
    );
  }

  console.log(`\n--- Low Confidence (<0.8): ${lowConfidence.length} ---`);
  for (const m of lowConfidence) {
    console.log(
      `  ⚠ ${m.scrapedName} → ${m.menuName} (${m.price}円, ${m.confidence.toFixed(2)})`
    );
  }

  if (report.unmatched.length > 0) {
    console.log(`\n--- Unmatched: ${report.unmatched.length} ---`);
    for (const item of report.unmatched) {
      console.log(`  ✗ ${item.name}: ${item.price}円`);
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

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    console.log(
      "[DRY RUN] 3カテゴリだけスクレイピングしてレポート表示します\n"
    );
  }

  // 1. スクレイピング実行
  let scrapedItems: ScrapedMenuItem[];

  if (dryRun) {
    // dry-run: 最初の3カテゴリのみ
    const categoryIds = Object.keys(CONFIG.categories).slice(0, 3);
    scrapedItems = [];
    console.log(`\n=== CoCo壱番屋 Price Scraping (DRY RUN) ===\n`);
    for (let i = 0; i < categoryIds.length; i++) {
      const id = categoryIds[i];
      const name = CONFIG.categories[id];
      console.log(`[${i + 1}/${categoryIds.length}] ${name} (cid=${id})`);
      try {
        const items = await scrapeCategoryPage(id, name);
        scrapedItems.push(...items);
        console.log(`  Found ${items.length} items`);
      } catch (error) {
        console.error(
          `  ERROR: ${error instanceof Error ? error.message : error}`
        );
      }
      if (i < categoryIds.length - 1) await sleep(CONFIG.rateLimit);
    }
  } else {
    scrapedItems = await scrapeAll();
  }

  if (scrapedItems.length === 0) {
    console.error("No items scraped. Exiting.");
    process.exit(1);
  }

  // 1.5. 重複排除（同じメニュー名は最初の1件のみ）
  const seen = new Set<string>();
  const uniqueItems = scrapedItems.filter((item) => {
    const key = item.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(
    `\nDeduplication: ${scrapedItems.length} → ${uniqueItems.length} items`
  );
  scrapedItems = uniqueItems;

  // 2. 既存メニュー取得
  const existingMenus = getExistingMenus();
  console.log(`Existing menus in data file: ${existingMenus.length}`);

  // 3. マッチング
  const matcher = new MenuMatcher();

  // 手動マッピング（サイト名とDB名の表記が大きく異なるもの）
  matcher.setManualMappings({
    // サイトでは「CoCo de オフ」、DBでは「低糖質カレー」
    "CoCo de オフ": "低糖質カレー",
    // スープカレーはサイトで「(ライス付)」が付く
    "厚切りベーコンとスモークチーズのスープカレー（ライス付）": "厚切りベーコンとスモークチーズのスープカレー",
    "ローストチキンスープカレー(ライス付)": "ローストチキンスープカレー",
    "ベーススープカレー(ライス付)": "ベーススープカレー",
    // コンボはサイトで「マル得コンボ（カレーソース付）」
    "マル得コンボA（カレーソース付）": "コンボA",
    "マル得コンボB（カレーソース付）": "コンボB",
    "マル得コンボC（カレーソース付）": "コンボC",
    // トッピングの牛すじ煮込みはサイトで「（一部店舗限定）」付き
    "牛すじ煮込み（一部店舗限定）": "牛すじ煮込み",
  });

  const report = matcher.matchAll(scrapedItems, existingMenus);
  report.chainId = "cocoichi";

  // 4. レポート出力
  printReport(report);

  if (dryRun) {
    const updateCount = report.matched.filter(
      (m) => m.confidence >= 0.8
    ).length;
    console.log(
      `[DRY RUN] 本番実行すると ${updateCount} 件の価格がデータファイルに更新されます\n`
    );
    return;
  }

  // 5. 承認を求める
  const updateCount = report.matched.filter(
    (m) => m.confidence >= 0.8
  ).length;
  const answer = await prompt(
    `\n${updateCount} 件の価格をデータファイルに更新しますか？ (y/n): `
  );

  if (answer.toLowerCase() !== "y") {
    console.log("キャンセルしました");
    return;
  }

  // 6. データファイル更新
  report.totalUpdated = updateDataFile(report.matched);
  console.log(
    `\n✅ ${report.totalUpdated} 件の価格をデータファイルに更新しました`
  );
  console.log("💡 DBに反映するには npm run seed:cocoichi を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
