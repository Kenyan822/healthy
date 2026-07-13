/**
 * サブウェイ スクレイパー（価格 + 栄養成分 フル生成）
 *
 * 公式サイトからメニューデータを取得し、scripts/data/subway-menus.ts を生成する。
 * DB投入は seed:subway で別途実行。
 *
 * 2026-07: サイト全面リニューアル対応（subway.co.jp / microCMS構成）
 * - 一覧: /menu/category/{slug}/ の div.card
 * - 詳細: /menu/{slug}/ の table.data-table（栄養は単一値、サイズ別は価格のみ）
 * - menu_id は既存データファイルと menu_name で突合して維持する（URL資産保護）
 *
 * 実行: npx tsx scripts/scrape/subway.ts [--dry-run]
 *   --dry-run: 詳細ページ5件のみ取得してレポート表示（ファイル生成なし）
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import * as readline from "readline";
import { subwayMenuData as existingMenuData } from "../data/subway-menus";

// scripts/はtsconfig excludeのためcheerio型をローカル定義
type CheerioDoc = ReturnType<typeof cheerio.load>;

// ============================
// 設定
// ============================

const CONFIG = {
  chainId: "subway",
  baseUrl: "https://subway.co.jp",
  rateLimit: 1000, // 1秒間隔
  batchSize: 10,
  batchDelay: 5000, // バッチ間5秒
  maxRetries: 3,
  timeout: 30000,
};

// 一覧ページのカテゴリ設定（partytrayは複数人向けのため除外）
const MENU_PAGES = [
  { url: "/menu/category/sandwich/", category: "サンドイッチ", slug: "sandwich" },
  { url: "/menu/category/snacksand/", category: "スナックサンド", slug: "snacksand" },
  { url: "/menu/category/salad/", category: "サラダ", slug: "salad" },
  { url: "/menu/category/sidemenu/", category: "サイドメニュー", slug: "side" },
  { url: "/menu/category/drink/", category: "ドリンク", slug: "drink" },
  { url: "/menu/category/morning/", category: "モーニング", slug: "morning" },
  { url: "/menu/category/kids/", category: "キッズ", slug: "kids" },
  { url: "/menu/category/topping_menu/", category: "トッピング", slug: "topping" },
];

// ============================
// 型定義
// ============================

interface ListItem {
  name: string; // サイズ付き表示名（例: アイスコーヒー（M））
  price: number | null;
  size: string | null;
  detailUrl: string;
  category: string;
  categorySlug: string;
}

interface NutritionData {
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number; // 食塩相当量(g)
}

interface ScrapedItem extends ListItem {
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
  // バッチ実行用: --yes で承認プロンプトをスキップ
  if (process.argv.includes("--yes")) return Promise.resolve("y");
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

async function fetchPage(url: string): Promise<CheerioDoc> {
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

function extractPrice(text: string): number | null {
  const match = text.match(/[¥￥]([0-9,]+)/);
  if (!match) return null;
  const price = parseInt(match[1].replace(/,/g, ""), 10);
  if (isNaN(price) || price <= 0 || price > 10000) return null;
  return price;
}

// 「368kcal」「14.3g」「901mg」等から数値を抽出
function extractNumeric(text: string): number {
  const match = text.replace(/,/g, "").match(/([0-9.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

// ============================
// 一覧ページスクレイピング
// ============================

/**
 * 一覧ページの div.card からメニューを抽出。
 * ラベルが（S）（M）（L）のものはサイズ別エントリ、
 * フットロングはスキップ（レギュラーを採用）。
 */
function extractMenuItems(
  $: CheerioDoc,
  category: string,
  categorySlug: string
): ListItem[] {
  const items: ListItem[] = [];

  $("div.card").each((_index, element) => {
    const $card = $(element);

    const $nameLink = $card.find("h2.name a").first();
    const menuName = $nameLink.text().trim();
    const href = $nameLink.attr("href") || $card.attr("data-href");
    if (!menuName || !href) return;

    const detailUrl = href.startsWith("http")
      ? href
      : `${CONFIG.baseUrl}${href}`;

    // dt.label / dd.price のペアを順に読む
    const entries: { label: string; price: number | null }[] = [];
    $card.find(".prices dl.items").each((_i, dl) => {
      const $dl = $(dl);
      const labels: string[] = [];
      const prices: (number | null)[] = [];
      $dl.find("dt.label").each((_j, dt) => labels.push($(dt).text().trim()));
      $dl.find("dd.price").each((_j, dd) =>
        prices.push(extractPrice($(dd).text().trim()))
      );
      labels.forEach((label, idx) => {
        entries.push({ label, price: prices[idx] ?? null });
      });
    });

    const sizeEntries = entries.filter((e) =>
      /^（?[SML]）?$/.test(e.label)
    );

    if (sizeEntries.length > 0) {
      // サイズ別（主にドリンク）
      for (const entry of sizeEntries) {
        const size = entry.label.replace(/[（）]/g, "");
        items.push({
          name: `${menuName}（${size}）`,
          price: entry.price,
          size,
          detailUrl,
          category,
          categorySlug,
        });
      }
      return;
    }

    // レギュラー優先（フットロングはスキップ）、なければ最初の価格
    const regular =
      entries.find((e) => e.label === "レギュラー" || e.label === "単品") ||
      entries.find((e) => e.label !== "フットロング");

    items.push({
      name: menuName,
      price: regular?.price ?? null,
      size: null,
      detailUrl,
      category,
      categorySlug,
    });
  });

  return items;
}

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
// 詳細ページスクレイピング
// ============================

/**
 * 詳細ページの table.data-table（栄養情報表）を解析。
 * th行とtd行が交互に並ぶ縦積み構造。
 * サイズ別の栄養は公式が提供していないため単一値を返す。
 */
function parseNutritionTable($: CheerioDoc): NutritionData | null {
  const table = $('table.data-table[data-label="栄養情報表"]').first();
  if (table.length === 0) return null;

  const pairs = new Map<string, string>();
  let pendingHeaders: string[] = [];

  table.find("tr").each((_i, tr) => {
    const $tr = $(tr);
    const ths = $tr.find("th");
    const tds = $tr.find("td");

    if (ths.length > 0) {
      pendingHeaders = [];
      ths.each((_j, th) => pendingHeaders.push($(th).text().trim()));
    } else if (tds.length > 0 && pendingHeaders.length > 0) {
      tds.each((_j, td) => {
        const header = pendingHeaders[_j];
        if (header) pairs.set(header, $(td).text().trim());
      });
    }
  });

  if (pairs.size === 0) return null;

  const result: NutritionData = {
    calories: extractNumeric(pairs.get("エネルギー") ?? ""),
    protein: extractNumeric(pairs.get("たんぱく質") ?? ""),
    fat: extractNumeric(pairs.get("脂質") ?? ""),
    carb: extractNumeric(pairs.get("炭水化物") ?? ""),
    sodium: extractNumeric(pairs.get("食塩相当量") ?? ""),
  };

  if (result.calories === 0 && result.protein === 0) return null;
  return result;
}

/**
 * 詳細ページから栄養成分を取得（同一URLはキャッシュしてリクエストを節約）
 */
async function scrapeDetailPages(
  items: ListItem[],
  dryRun: boolean
): Promise<ScrapedItem[]> {
  const results: ScrapedItem[] = [];
  const nutritionCache = new Map<string, NutritionData | null>();

  const toScrape = dryRun ? items.slice(0, 5) : items;

  console.log(`\n=== 詳細ページから栄養成分を取得 ===`);
  console.log(`Target ${toScrape.length} items...\n`);

  let fetchCount = 0;

  for (let i = 0; i < toScrape.length; i++) {
    const item = toScrape[i];
    process.stdout.write(
      `\r[${i + 1}/${toScrape.length}] ${item.name.slice(0, 25).padEnd(25)}`
    );

    let nutrition = nutritionCache.get(item.detailUrl);
    if (nutrition === undefined) {
      try {
        const $ = await fetchPage(item.detailUrl);
        nutrition = parseNutritionTable($);
      } catch {
        console.warn(`\n  Failed: ${item.detailUrl}`);
        nutrition = null;
      }
      nutritionCache.set(item.detailUrl, nutrition);

      fetchCount++;
      if (fetchCount % CONFIG.batchSize === 0) {
        await sleep(CONFIG.batchDelay);
      } else {
        await sleep(CONFIG.rateLimit);
      }
    }

    if (!nutrition) {
      console.warn(`\n  No nutrition data: ${item.name}`);
    }

    results.push({
      ...item,
      calories: nutrition?.calories ?? 0,
      protein: nutrition?.protein ?? 0,
      fat: nutrition?.fat ?? 0,
      carb: nutrition?.carb ?? 0,
      sodium: nutrition?.sodium ?? 0,
    });
  }

  console.log(
    `\n\nScraping complete: ${results.length} items (${results.filter((r) => r.calories > 0).length} with nutrition)`
  );

  return results;
}

// ============================
// menu_id 割り当て（既存ID維持）
// ============================

/**
 * 既存データファイルと menu_name で突合して menu_id を維持する。
 * 新規メニューにはカテゴリ内の既存最大連番+1から採番。
 */
function assignMenuIds(items: ScrapedItem[]): SubwayMenuItem[] {
  const existingByName = new Map(
    existingMenuData.map((m) => [m.menu_name, m.menu_id])
  );

  // カテゴリスラッグごとの既存最大連番
  const maxCounter = new Map<string, number>();
  for (const m of existingMenuData) {
    const match = m.menu_id.match(/^subway-([a-z_]+)-(\d+)/);
    if (match) {
      const slug = match[1];
      const num = parseInt(match[2], 10);
      maxCounter.set(slug, Math.max(maxCounter.get(slug) ?? 0, num));
    }
  }

  return items.map((item) => {
    let menuId = existingByName.get(item.name);

    if (!menuId) {
      const next = (maxCounter.get(item.categorySlug) ?? 0) + 1;
      maxCounter.set(item.categorySlug, next);
      const num = String(next).padStart(3, "0");
      menuId = item.size
        ? `subway-${item.categorySlug}-${num}-${item.size.toLowerCase()}`
        : `subway-${item.categorySlug}-${num}`;
    }

    return {
      menu_id: menuId,
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
}

// ============================
// データファイル生成
// ============================

function generateDataFile(items: SubwayMenuItem[]): string {
  const lines: string[] = [];
  const date = new Date().toISOString().split("T")[0];

  lines.push(`/**`);
  lines.push(` * サブウェイメニューデータ（${date} 公式サイトより自動生成）`);
  lines.push(` * 自動生成ファイル - scripts/scrape/subway.ts で生成`);
  lines.push(` * sodiumは食塩相当量(g)。ドリンクの栄養値は公式掲載の単一値（サイズ別未公表）`);
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

  const categoryOrder = MENU_PAGES.map((p) => p.category);

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
  console.log(`With price: ${items.filter((i) => i.price !== null).length}`);
  console.log(
    `With nutrition: ${items.filter((i) => i.calories > 0).length}`
  );

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

  const noPriceItems = items.filter(
    (i) => i.price === null && i.category !== "トッピング"
  );
  if (noPriceItems.length > 0) {
    console.log(`\nItems without price (excluding toppings):`);
    for (const item of noPriceItems.slice(0, 20)) {
      console.log(`  - ${item.name} [${item.category}]`);
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
    console.log("[DRY RUN] 詳細ページ5件のみ取得してレポート表示します\n");
  }

  // 1. 一覧ページからメニュー情報を取得
  const listItems = await scrapeListPages();

  if (listItems.length === 0) {
    console.error("No items found from list pages. Exiting.");
    process.exit(1);
  }

  // 2. 重複排除（name+size+category）
  const seen = new Set<string>();
  const uniqueItems = listItems.filter((item) => {
    const key = `${item.name}|${item.category}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\nTotal unique items: ${uniqueItems.length}`);

  // 3. 詳細ページから栄養成分を取得
  const scrapedItems = await scrapeDetailPages(uniqueItems, dryRun);

  // 4. レポート出力
  printReport(scrapedItems);

  if (dryRun) {
    console.log("[DRY RUN] 本番実行でデータファイルを生成します\n");
    return;
  }

  // 5. menu_id 割り当て（既存ID維持）
  const menuItems = assignMenuIds(scrapedItems);
  const preserved = menuItems.filter((m) =>
    existingMenuData.some((e) => e.menu_id === m.menu_id)
  ).length;
  console.log(
    `menu_id: 既存維持 ${preserved}件 / 新規採番 ${menuItems.length - preserved}件`
  );

  // 6. 承認を求める
  const answer = await prompt(
    `\n${menuItems.length} 件のデータファイルを生成しますか？ (y/n): `
  );

  if (answer.toLowerCase() !== "y") {
    console.log("キャンセルしました");
    return;
  }

  // 7. データファイル生成
  // 安全ガード: 取得件数が既存の半分未満なら上書き中止（サイト構造変更による消失防止）
  if (menuItems.length < existingMenuData.length / 2) {
    console.error(
      `⛔ 中止: 取得${menuItems.length}件は既存${existingMenuData.length}件の半分未満です。サイト構造変更の可能性があります。`
    );
    process.exit(1);
  }
  const content = generateDataFile(menuItems);
  const filePath = path.join(__dirname, "../data/subway-menus.ts");
  fs.writeFileSync(filePath, content, "utf-8");

  console.log(`\n${menuItems.length} 件を ${filePath} に生成しました`);
  console.log("DBに反映するには npm run seed:subway を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
