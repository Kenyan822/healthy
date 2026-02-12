/**
 * サブウェイ スクレイパー（価格 + 栄養成分 フル生成）
 *
 * 公式サイトからメニューデータを取得し、scripts/data/subway-menus.ts を生成する。
 * DB投入は seed:subway で別途実行。
 *
 * 実行: npx tsx scripts/scrape/subway.ts [--dry-run]
 *   --dry-run: 詳細ページ5件のみ取得してレポート表示（ファイル生成なし）
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import * as readline from "readline";

// scripts/はtsconfig excludeのためcheerio型をローカル定義
type CheerioDoc = ReturnType<typeof cheerio.load>;
type CheerioEl = ReturnType<CheerioDoc["root"]>;

// ============================
// 設定
// ============================

const CONFIG = {
  chainId: "subway",
  baseUrl: "https://www.subway.co.jp",
  rateLimit: 1000, // 1秒間隔
  batchSize: 10,
  batchDelay: 5000, // バッチ間5秒
  maxRetries: 3,
  timeout: 30000,
};

// 一覧ページのカテゴリ設定
const MENU_PAGES = [
  { url: "/menu/sandwich/", category: "サンドイッチ", slug: "sandwich" },
  { url: "/menu/salad/", category: "サラダ", slug: "salad" },
  { url: "/menu/sidemenu/", category: "サイドメニュー", slug: "side" },
  { url: "/menu/drink/", category: "ドリンク", slug: "drink" },
  { url: "/menu/morning/", category: "モーニング", slug: "morning" },
  { url: "/menu/kids/", category: "キッズ", slug: "kids" },
];

// ============================
// 型定義
// ============================

interface ListItem {
  name: string;
  price: number | null;
  size: string | null; // サイズ情報 (S/M/L等)
  detailUrl: string;
  category: string;
  categorySlug: string;
}

interface NutritionData {
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
}

interface ScrapedItem {
  name: string;
  price: number | null;
  detailUrl: string;
  category: string;
  categorySlug: string;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
}

interface SubwayMenuItem {
  menu_id: string;
  menu_name: string;
  price: number | null;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
  allergens: string[];
}

// ============================
// ユーティリティ
// ============================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function fetchPage(url: string): Promise<ReturnType<typeof cheerio.load>> {
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: CONFIG.timeout,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      return cheerio.load(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          throw error;
        }
        if (error.response?.status === 429) {
          console.warn(`  Rate limited, waiting 30s...`);
          await sleep(30000);
        }
      }
      if (attempt === CONFIG.maxRetries) throw error;
      const backoff = Math.pow(2, attempt) * 2000;
      console.warn(`  Retry ${attempt}/${CONFIG.maxRetries} after ${backoff}ms`);
      await sleep(backoff);
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

/**
 * price_yenテキストから価格を抽出
 */
function extractPrice(text: string): number | null {
  const match = text.match(/[¥￥]([0-9,]+)/);
  if (!match) return null;
  const price = parseInt(match[1].replace(/,/g, ""), 10);
  if (isNaN(price) || price <= 0 || price > 10000) return null;
  return price;
}

// ============================
// 一覧ページスクレイピング
// ============================

/**
 * 一覧ページからメニューアイテムを抽出
 * サイズ別のものは個別エントリとして返す
 */
function extractMenuItems(
  $: CheerioDoc,
  category: string,
  categorySlug: string
): ListItem[] {
  const items: ListItem[] = [];

  $("ul.productList li a").each((_index, element) => {
    const $el = $(element);

    const menuName = $el.find("h4.product_name_ja").text().trim();
    if (!menuName) return;

    const href = $el.attr("href");
    if (!href || !href.endsWith(".html")) return;

    const detailUrl = href.startsWith("http")
      ? href
      : `${CONFIG.baseUrl}${href}`;

    // price_area を全て取得
    const priceAreas = $el.find(".price_area");
    const sizeEntries: { size: string | null; price: number | null }[] = [];

    priceAreas.each((_i, priceArea) => {
      const $pa = $(priceArea);
      const priceName = $pa.find(".price_name").text().trim();
      const priceYenText = $pa.find(".price_yen").text().trim();

      // 空の price_area はスキップ
      if (!priceYenText && !priceName) return;

      const price = extractPrice(priceYenText);

      if (priceName === "フットロング") {
        // フットロングはスキップ（レギュラーを採用）
        return;
      }

      if (
        priceName === "（S）" ||
        priceName === "（M）" ||
        priceName === "（L）"
      ) {
        // サイズ別 → 個別エントリ
        const sizeLabel = priceName.replace(/[（）]/g, "");
        sizeEntries.push({ size: sizeLabel, price });
      } else if (
        priceName === "単品" ||
        priceName === "レギュラー" ||
        !priceName
      ) {
        sizeEntries.push({ size: null, price });
      }
    });

    if (sizeEntries.length === 0) {
      // price_areaがない or 全て空 → 価格なしで1件登録
      items.push({
        name: menuName,
        price: null,
        size: null,
        detailUrl,
        category,
        categorySlug,
      });
    } else if (sizeEntries.some((e) => e.size !== null)) {
      // サイズ別エントリがある場合
      for (const entry of sizeEntries) {
        if (entry.size) {
          items.push({
            name: `${menuName}（${entry.size}）`,
            price: entry.price,
            size: entry.size,
            detailUrl,
            category,
            categorySlug,
          });
        }
      }
    } else {
      // サイズなし（単品/レギュラー等）→ 最初の有効な価格を採用
      const validEntry = sizeEntries.find((e) => e.price !== null) || sizeEntries[0];
      items.push({
        name: menuName,
        price: validEntry.price,
        size: null,
        detailUrl,
        category,
        categorySlug,
      });
    }
  });

  return items;
}

/**
 * 全一覧ページをスクレイピング
 */
async function scrapeListPages(): Promise<ListItem[]> {
  const allItems: ListItem[] = [];

  console.log("\n=== 一覧ページからメニュー情報を取得 ===\n");

  for (const page of MENU_PAGES) {
    const url = `${CONFIG.baseUrl}${page.url}`;
    console.log(`Scanning: ${url}`);

    try {
      const $ = await fetchPage(url);
      const items = extractMenuItems($, page.category, page.slug);
      allItems.push(...items);
      console.log(`  → ${items.length} items found`);
    } catch (error) {
      console.error(`  Error: ${error}`);
    }

    await sleep(CONFIG.rateLimit);
  }

  return allItems;
}

// ============================
// パン/トッピング/ソースのリンク収集
// ============================

/**
 * サンドイッチ詳細ページからパン/トッピング/ソースのリンクを収集
 */
async function collectCustomizeLinks(
  sampleDetailUrl: string
): Promise<ListItem[]> {
  console.log("\n=== カスタマイズ素材のリンクを収集 ===");
  console.log(`  Source: ${sampleDetailUrl}`);

  const $ = await fetchPage(sampleDetailUrl);
  const items: ListItem[] = [];
  const seen = new Set<string>();

  const linkPatterns: { pattern: string; category: string; slug: string }[] = [
    { pattern: "/menu/bread/", category: "パン", slug: "bread" },
    {
      pattern: "/menu/topping_menu/",
      category: "トッピング",
      slug: "topping",
    },
    { pattern: "/menu/sauce/", category: "ソース", slug: "sauce" },
  ];

  for (const { pattern, category, slug } of linkPatterns) {
    $(`a[href*="${pattern}"]`).each((_i, el) => {
      const href = $(el).attr("href");
      if (!href || !href.endsWith(".html")) return;

      const fullUrl = href.startsWith("http")
        ? href
        : `${CONFIG.baseUrl}${href}`;

      if (seen.has(fullUrl)) return;
      seen.add(fullUrl);

      items.push({
        name: "", // 詳細ページから取得
        price: null,
        size: null,
        detailUrl: fullUrl,
        category,
        categorySlug: slug,
      });
    });
  }

  console.log(
    `  → パン: ${items.filter((i) => i.categorySlug === "bread").length}, ` +
      `トッピング: ${items.filter((i) => i.categorySlug === "topping").length}, ` +
      `ソース: ${items.filter((i) => i.categorySlug === "sauce").length}`
  );

  return items;
}

// ============================
// 詳細ページスクレイピング
// ============================

/**
 * 詳細ページから栄養成分を取得
 * 複数サイズの場合、sizeに対応する栄養成分を返す
 */
function parseNutritionTable(
  $: CheerioDoc,
  targetSize: string | null
): NutritionData | null {
  const table = $("table#nutorition");
  if (table.length === 0) return null;

  const rows = table.find("tr");

  // ドリンク等の複数サイズ対応
  const hasSizeHeaders = table.find("tr.nutorition-drink").length > 0;

  if (hasSizeHeaders && targetSize) {
    // サイズ別のテーブル: 対象サイズのセクションを探す
    let foundTarget = false;
    let headerRow: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const $row = $(rows[i]);

      if ($row.hasClass("nutorition-drink")) {
        const sizeLabel = $row.find("th").text().trim();
        foundTarget = sizeLabel === targetSize;
        continue;
      }

      if (foundTarget) {
        const ths = $row.find("th");
        if (ths.length > 0) {
          headerRow = [];
          ths.each((_j, th) => headerRow.push($(th).text().trim()));
          continue;
        }

        const tds = $row.find("td");
        if (tds.length > 0 && headerRow.length > 0) {
          return parseNutritionRow($, headerRow, $row);
        }
      }
    }
    return null;
  }

  // 単一サイズ: 最初のヘッダ行 + データ行
  const headerRow: string[] = [];
  let dataRowEl: CheerioEl | null = null;

  for (let i = 0; i < rows.length; i++) {
    const $row = $(rows[i]);

    if ($row.hasClass("nutorition-drink")) continue;

    const ths = $row.find("th");
    if (ths.length > 0 && headerRow.length === 0) {
      ths.each((_j, th) => headerRow.push($(th).text().trim()));
      continue;
    }

    const tds = $row.find("td");
    if (tds.length > 0 && headerRow.length > 0) {
      dataRowEl = $row;
      break;
    }
  }

  if (!dataRowEl || headerRow.length === 0) return null;
  return parseNutritionRow($, headerRow, dataRowEl);
}

function parseNutritionRow(
  $: CheerioDoc,
  headers: string[],
  $row: CheerioEl
): NutritionData | null {
  const values: number[] = [];
  $row.find("td").each((_j, td) => {
    values.push(parseFloat($(td).text().trim()) || 0);
  });

  const result: NutritionData = {
    calories: 0,
    protein: 0,
    fat: 0,
    carb: 0,
    sodium: 0,
  };

  headers.forEach((header, idx) => {
    const value = values[idx];
    if (value === undefined || isNaN(value)) return;

    if (header.includes("エネルギー")) result.calories = value;
    else if (header.includes("たんぱく質")) result.protein = value;
    else if (header.includes("脂質")) result.fat = value;
    else if (header.includes("炭水化物")) result.carb = value;
    else if (header.includes("ナトリウム")) result.sodium = value;
  });

  return result;
}

/**
 * 詳細ページからメニュー名と価格を取得（パン/トッピング/ソース用）
 */
function parseDetailPageInfo(
  $: CheerioDoc
): { name: string; price: number | null } {
  // メニュー名: <h3>メニュー名 <span>英語名</span></h3>
  const h3 = $("#menu-detail-right h3");
  let name = "";
  if (h3.length > 0) {
    // span を除外してテキスト取得
    const clone = h3.clone();
    clone.find("span").remove();
    name = clone.text().trim();
    // 全角スペース等の正規化
    name = name.replace(/\s+/g, " ").trim();
  }

  // 価格: .price-regular から取得
  let price: number | null = null;
  const priceEl = $(".detail-text-title .price-regular");
  if (priceEl.length > 0) {
    price = extractPrice(priceEl.text().trim());
  }

  return { name, price };
}

/**
 * 全詳細ページをスクレイピングして栄養成分を取得
 */
async function scrapeDetailPages(
  items: ListItem[],
  dryRun: boolean
): Promise<ScrapedItem[]> {
  const results: ScrapedItem[] = [];

  // dryRunの場合は最大5件に制限
  const toScrape = dryRun ? items.slice(0, 5) : items;

  console.log(`\n=== 詳細ページから栄養成分を取得 ===`);
  console.log(`Scraping ${toScrape.length} pages...\n`);

  let batchCount = 0;

  for (let i = 0; i < toScrape.length; i++) {
    const item = toScrape[i];
    const displayName = (item.name || item.detailUrl.split("/").pop() || "")
      .slice(0, 25)
      .padEnd(25);
    process.stdout.write(
      `\r[${i + 1}/${toScrape.length}] ${displayName}`
    );

    try {
      const $ = await fetchPage(item.detailUrl);

      // パン/トッピング/ソースの場合、詳細ページから名前と価格を取得
      let name = item.name;
      let price = item.price;
      if (!name) {
        const info = parseDetailPageInfo($);
        name = info.name;
        if (price === null) price = info.price;
      }

      if (!name) {
        console.warn(`\n  Skip: no name found for ${item.detailUrl}`);
        continue;
      }

      // 栄養成分取得
      const nutrition = parseNutritionTable($, item.size);

      if (nutrition) {
        results.push({
          name,
          price,
          detailUrl: item.detailUrl,
          category: item.category,
          categorySlug: item.categorySlug,
          calories: nutrition.calories,
          protein: nutrition.protein,
          fat: nutrition.fat,
          carb: nutrition.carb,
          sodium: nutrition.sodium,
        });
      } else {
        console.warn(`\n  No nutrition data: ${name}`);
        // 栄養データがなくても登録（0で埋める）
        results.push({
          name,
          price,
          detailUrl: item.detailUrl,
          category: item.category,
          categorySlug: item.categorySlug,
          calories: 0,
          protein: 0,
          fat: 0,
          carb: 0,
          sodium: 0,
        });
      }
    } catch (error) {
      console.warn(`\n  Failed: ${item.detailUrl}`);
    }

    batchCount++;
    if (batchCount >= CONFIG.batchSize) {
      await sleep(CONFIG.batchDelay);
      batchCount = 0;
    } else {
      await sleep(CONFIG.rateLimit);
    }
  }

  console.log(
    `\n\nScraping complete: ${results.length} items (${results.filter((r) => r.calories > 0).length} with nutrition)`
  );

  return results;
}

// ============================
// データファイル生成
// ============================

function generateMenuId(categorySlug: string, index: number, size: string | null): string {
  const num = String(index).padStart(3, "0");
  if (size) {
    return `subway-${categorySlug}-${num}-${size.toLowerCase()}`;
  }
  return `subway-${categorySlug}-${num}`;
}

function generateDataFile(items: SubwayMenuItem[]): string {
  const lines: string[] = [];
  const date = new Date().toISOString().split("T")[0];

  lines.push(`/**`);
  lines.push(` * サブウェイメニューデータ（${date} 公式サイトより自動生成）`);
  lines.push(` * 自動生成ファイル - scripts/scrape/subway.ts で生成`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`export interface SubwayMenuItem {`);
  lines.push(`  menu_id: string;`);
  lines.push(`  menu_name: string;`);
  lines.push(`  price: number | null;`);
  lines.push(`  category: string;`);
  lines.push(`  calories: number;`);
  lines.push(`  protein: number;`);
  lines.push(`  fat: number;`);
  lines.push(`  carb: number;`);
  lines.push(`  sodium: number;`);
  lines.push(`  allergens: string[];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const subwayMenuData: SubwayMenuItem[] = [`);

  // カテゴリ順にソート
  const categoryOrder = [
    "サンドイッチ",
    "サラダ",
    "サイドメニュー",
    "ドリンク",
    "モーニング",
    "キッズ",
    "パン",
    "トッピング",
    "ソース",
  ];

  const sorted = [...items].sort((a, b) => {
    const ai = categoryOrder.indexOf(a.category);
    const bi = categoryOrder.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  let currentCategory = "";
  for (const item of sorted) {
    if (item.category !== currentCategory) {
      currentCategory = item.category;
      lines.push(`  // ========== ${currentCategory} ==========`);
    }

    const priceStr = item.price !== null ? String(item.price) : "null";
    const allergenStr = JSON.stringify(item.allergens);

    lines.push(
      `  { menu_id: "${item.menu_id}", menu_name: "${escapeString(item.menu_name)}", price: ${priceStr}, category: "${escapeString(item.category)}", calories: ${item.calories}, protein: ${item.protein}, fat: ${item.fat}, carb: ${item.carb}, sodium: ${item.sodium}, allergens: ${allergenStr} },`
    );
  }

  lines.push(`];`);
  lines.push(``);

  return lines.join("\n");
}

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// ============================
// レポート出力
// ============================

function printReport(items: ScrapedItem[]): void {
  console.log("\n========================================");
  console.log("        Scraping Report");
  console.log("========================================\n");

  console.log(`Total items: ${items.length}`);
  console.log(
    `With price: ${items.filter((i) => i.price !== null).length}`
  );
  console.log(
    `With nutrition: ${items.filter((i) => i.calories > 0).length}`
  );

  // カテゴリ別集計
  const categories = new Map<string, { total: number; withPrice: number }>();
  for (const item of items) {
    const cat = categories.get(item.category) || { total: 0, withPrice: 0 };
    cat.total++;
    if (item.price !== null) cat.withPrice++;
    categories.set(item.category, cat);
  }

  console.log("\nCategory breakdown:");
  for (const [cat, stats] of categories) {
    console.log(
      `  ${cat}: ${stats.total} items (${stats.withPrice} with price)`
    );
  }

  // 価格なしのアイテムを表示
  const noPriceItems = items.filter(
    (i) =>
      i.price === null &&
      !["パン", "ソース"].includes(i.category)
  );
  if (noPriceItems.length > 0) {
    console.log(`\nItems without price (excluding bread/sauce):`);
    for (const item of noPriceItems.slice(0, 20)) {
      console.log(`  - ${item.name} [${item.category}]`);
    }
    if (noPriceItems.length > 20) {
      console.log(`  ... and ${noPriceItems.length - 20} more`);
    }
  }

  console.log("\n========================================\n");
}

// ============================
// メイン処理
// ============================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    console.log(
      "[DRY RUN] 詳細ページ5件のみ取得してレポート表示します\n"
    );
  }

  // 1. 一覧ページからメニュー情報を取得
  const listItems = await scrapeListPages();

  if (listItems.length === 0) {
    console.error("No items found from list pages. Exiting.");
    process.exit(1);
  }

  // 2. パン/トッピング/ソースのリンクを収集
  const sandwichItem = listItems.find(
    (i) => i.categorySlug === "sandwich" && i.detailUrl.endsWith(".html")
  );

  let customizeItems: ListItem[] = [];
  if (sandwichItem) {
    customizeItems = await collectCustomizeLinks(sandwichItem.detailUrl);
    await sleep(CONFIG.rateLimit);
  }

  // 3. 全アイテムを統合（重複排除）
  const allItems = [...listItems, ...customizeItems];
  const seen = new Set<string>();
  const uniqueItems = allItems.filter((item) => {
    // name+size+categoryで重複判定（パン等は名前空なのでURLで）
    const key = item.name
      ? `${item.name}|${item.size || ""}|${item.category}`
      : item.detailUrl;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(
    `\nTotal unique items: ${uniqueItems.length} (list: ${listItems.length}, customize: ${customizeItems.length})`
  );

  // 4. 詳細ページから栄養成分を取得
  const scrapedItems = await scrapeDetailPages(uniqueItems, dryRun);

  // 5. レポート出力
  printReport(scrapedItems);

  if (dryRun) {
    console.log("[DRY RUN] 本番実行でデータファイルを生成します\n");
    return;
  }

  // 6. menu_id を付与してデータファイル用のオブジェクトに変換
  const categoryCounters = new Map<string, number>();
  const menuItems: SubwayMenuItem[] = scrapedItems.map((item) => {
    const count = (categoryCounters.get(item.categorySlug) || 0) + 1;
    categoryCounters.set(item.categorySlug, count);

    // サイズ情報を名前から抽出
    const sizeMatch = item.name.match(/（([SML])）$/);
    const size = sizeMatch ? sizeMatch[1] : null;

    return {
      menu_id: generateMenuId(item.categorySlug, count, size),
      menu_name: item.name,
      price: item.price,
      category: item.category,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carb: item.carb,
      sodium: item.sodium,
      allergens: [],
    };
  });

  // 7. 承認を求める
  const answer = await prompt(
    `\n${menuItems.length} 件のデータファイルを生成しますか？ (y/n): `
  );

  if (answer.toLowerCase() !== "y") {
    console.log("キャンセルしました");
    return;
  }

  // 8. データファイル生成
  const content = generateDataFile(menuItems);
  const filePath = path.join(__dirname, "../data/subway-menus.ts");
  fs.writeFileSync(filePath, content, "utf-8");

  console.log(`\n${menuItems.length} 件を ${filePath} に生成しました`);
  console.log("DBに反映するには npx tsx scripts/seed-subway.ts を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
