/**
 * やよい軒メニュースクレイパー（価格 + 栄養成分 + アレルゲン）
 *
 * 公式サイトからメニューデータを取得し、scripts/data/yayoiken-menus.ts を生成する。
 *
 * 実行: npx tsx scripts/scrape/yayoiken.ts [--dry-run]
 *   --dry-run: 詳細ページ5件のみ取得してレポート表示（ファイル生成なし）
 */

import axios, { AxiosError } from "axios";
import { load, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ============================
// 設定
// ============================

const CONFIG = {
  chainId: "yayoiken",
  kenId: "13", // 東京
  baseUrl: "https://www.yayoiken.com",
  rateLimit: 3000, // 3秒間隔
  batchSize: 10, // 10件ごとに長めの待機
  batchDelay: 15000, // バッチ間15秒
  maxRetries: 3,
  timeout: 30000,
};

// 除外カテゴリ（イートインメニューと重複）
const EXCLUDED_CATEGORIES = new Set(["おうち定食（テイクアウト）"]);

// カテゴリ → slug マッピング
const CATEGORY_SLUG_MAP: Record<string, string> = {
  定食: "teishoku",
  "丼・麵・お子様メニュー": "don",
  朝食: "breakfast",
  サイドメニュー: "side",
};

// タブID → カテゴリ名マッピング
const TAB_CATEGORY_MAP: Record<string, string> = {
  "tab-set_meal": "定食",
  "tab-bowl": "丼・麵・お子様メニュー",
  "tab-breakfast": "朝食",
  "tab-side": "サイドメニュー",
  "tab-takeout": "おうち定食（テイクアウト）",
};

// ============================
// 型定義
// ============================

interface NutritionData {
  calories: number; // 熱量 (kcal)
  protein: number; // 蛋白質 (g)
  fat: number; // 脂質 (g)
  sugar: number; // 糖質 (g)
  fiber: number; // 食物繊維 (g)
  sodium: number; // 食塩相当量 (g)
}

interface NutritionVariant {
  tabName: string;
  nutrition: NutritionData;
}

interface ScrapedItem {
  name: string;
  category: string;
  detailUrl: string;
  itemId: string;
  listPrice: number | null;
  nutritionVariants: NutritionVariant[];
  allergens: string[];
}

interface YayoikenMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  fiber: number;
  sodium: number;
  sugar: number;
  allergens: string[];
  timing: string;
  is_seasonal: boolean;
  is_limited: boolean;
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

async function fetchWithRetry(url: string): Promise<CheerioAPI> {
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
        if (axiosError.response?.status === 404) {
          console.error(`  Page not found: ${url}`);
          throw error;
        } else if (axiosError.response?.status === 429) {
          console.error(`  Rate limited, waiting 30s...`);
          await sleep(30000);
        } else if (axiosError.code === "ECONNABORTED") {
          console.error(`  Timeout: ${url}`);
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

// ============================
// 一覧ページスクレイピング
// ============================

async function scrapeMenuList(): Promise<
  Omit<ScrapedItem, "nutritionVariants" | "allergens">[]
> {
  const url = `${CONFIG.baseUrl}/menu_list/index/${CONFIG.kenId}`;
  const $ = await fetchWithRetry(url);

  const items: Omit<ScrapedItem, "nutritionVariants" | "allergens">[] = [];

  // タブカテゴリ名を取得
  const categoryNames: string[] = [];
  $("#tab-category li.c-tab__item").each((_i, el) => {
    const tabId = $(el).attr("id") || "";
    const category = TAB_CATEGORY_MAP[tabId] || $(el).text().replace(/\s+/g, "").trim();
    categoryNames.push(category);
  });

  // 各タブパネルを走査
  $("#box-category > li.c-tab__cont-item").each((tabIndex, panel) => {
    const category = categoryNames[tabIndex] || "";

    // 除外カテゴリ
    if (EXCLUDED_CATEGORIES.has(category)) return;
    if (!category) return;

    // パネル内のメニューアイテムを走査
    $(panel)
      .find("a.c-content-index-menu-list__item-inr")
      .each((_j, el) => {
        const href = $(el).attr("href") || "";
        const name = $(el)
          .find(".c-content-index-menu-list__title")
          .text()
          .trim();

        // 価格抽出（税込）
        const priceText = $(el)
          .find(".c-content-index-menu-list__price")
          .text()
          .trim();
        const listPrice = priceText
          ? parseInt(priceText.replace(/,/g, ""), 10)
          : null;

        // アイテムID抽出
        const match = href.match(/\/view\/\d+\/(\d+)/);
        const itemId = match ? match[1] : "";

        if (name && itemId) {
          items.push({
            name,
            category,
            detailUrl: href,
            itemId,
            listPrice,
          });
        }
      });
  });

  return items;
}

// ============================
// 詳細ページスクレイピング
// ============================

function parseNutritionPanel($: CheerioAPI, panel: Element): NutritionData | null {
  const container = $(panel).find(".c-table__type01");
  if (container.length === 0) return null;

  const data: NutritionData = {
    calories: 0,
    protein: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
    sodium: 0,
  };

  container.find("dl.c-table__item").each((_i: number, dl: Element) => {
    const label = $(dl).find("dt.c-table__head").text().trim();
    const valueText = $(dl).find("dd.c-table__body").text().trim();
    const value = parseFloat(valueText.replace(/,/g, ""));

    if (isNaN(value)) return;

    if (label.includes("熱量")) data.calories = value;
    else if (label.includes("蛋白質") || label.includes("蛋⽩質"))
      data.protein = value;
    else if (label.includes("脂質")) data.fat = value;
    else if (label.includes("糖質")) data.sugar = value;
    else if (label.includes("食物繊維")) data.fiber = value;
    else if (label.includes("食塩相当量") || label.includes("⾷塩相当量"))
      data.sodium = value;
  });

  return data;
}

async function scrapeDetailPage(url: string): Promise<{
  nutritionVariants: NutritionVariant[];
  allergens: string[];
  price: number | null;
}> {
  const $ = await fetchWithRetry(url);

  // 価格（詳細ページ）
  const priceText = $(".c-page-sub__menu-detail-price-num").first().text().trim();
  const price = priceText ? parseInt(priceText.replace(/,/g, ""), 10) : null;

  // アレルゲン
  const allergens: string[] = [];
  $("li.c-label__allergy").each((_i: number, el: Element) => {
    const text = $(el).text().trim();
    if (text) allergens.push(text);
  });

  // 栄養成分
  const nutritionVariants: NutritionVariant[] = [];
  const nutritionSection = $("section.c-page-sub__nutrition");

  if (nutritionSection.length === 0) {
    return { nutritionVariants, allergens, price };
  }

  // タブ名取得
  const tabNames: string[] = [];
  nutritionSection
    .find(".c-tab__list-secondary li.c-tab__item")
    .each((_i: number, el: Element) => {
      // <br> を除去してテキスト取得
      const text = $(el)
        .find("span")
        .html()
        ?.replace(/<br[^>]*>/g, "")
        .trim() || $(el).text().replace(/\s+/g, "").trim();
      tabNames.push(text);
    });

  // パネル取得
  const panels = nutritionSection.find(
    ".c-tab__cont > li.c-tab__cont-item"
  );

  if (tabNames.length > 0 && panels.length > 0) {
    // タブあり → タブ名とパネルを対応
    tabNames.forEach((tabName, i) => {
      const panel = panels.eq(i);
      const nutrition = parseNutritionPanel($, panel);
      if (nutrition) {
        nutritionVariants.push({ tabName, nutrition });
      }
    });
  } else if (panels.length > 0) {
    // タブなし → 単一パネル
    const nutrition = parseNutritionPanel($, panels.eq(0));
    if (nutrition) {
      nutritionVariants.push({ tabName: "", nutrition });
    }
  }

  return { nutritionVariants, allergens, price };
}

// ============================
// データ変換
// ============================

function transformToMenuEntries(items: ScrapedItem[]): YayoikenMenuItem[] {
  const entries: YayoikenMenuItem[] = [];
  const categoryCounters: Record<string, number> = {};

  const suffixes = "abcdefghijklmnopqrstuvwxyz";

  for (const item of items) {
    const slug = CATEGORY_SLUG_MAP[item.category] || "other";
    if (!categoryCounters[slug]) categoryCounters[slug] = 0;
    categoryCounters[slug]++;
    const seq = String(categoryCounters[slug]).padStart(3, "0");
    const baseId = `yayoiken-${slug}-${seq}`;

    const timing = item.category === "朝食" ? "breakfast" : "anytime";
    const price = item.listPrice || 0;

    if (item.nutritionVariants.length > 1) {
      // 複数バリアント展開
      item.nutritionVariants.forEach((variant, i) => {
        const n = variant.nutrition;
        entries.push({
          menu_id: `${baseId}${suffixes[i]}`,
          menu_name: `${item.name}（${variant.tabName}）`,
          category: item.category,
          price,
          calories: n.calories,
          protein: n.protein,
          fat: n.fat,
          carb: Math.round((n.sugar + n.fiber) * 10) / 10,
          fiber: n.fiber,
          sodium: n.sodium,
          sugar: n.sugar,
          allergens: [...item.allergens],
          timing,
          is_seasonal: false,
          is_limited: false,
        });
      });
    } else if (item.nutritionVariants.length === 1) {
      // 単一バリアント
      const n = item.nutritionVariants[0].nutrition;
      entries.push({
        menu_id: baseId,
        menu_name: item.name,
        category: item.category,
        price,
        calories: n.calories,
        protein: n.protein,
        fat: n.fat,
        carb: Math.round((n.sugar + n.fiber) * 10) / 10,
        fiber: n.fiber,
        sodium: n.sodium,
        sugar: n.sugar,
        allergens: [...item.allergens],
        timing,
        is_seasonal: false,
        is_limited: false,
      });
    } else {
      // 栄養データなし
      entries.push({
        menu_id: baseId,
        menu_name: item.name,
        category: item.category,
        price,
        calories: 0,
        protein: 0,
        fat: 0,
        carb: 0,
        fiber: 0,
        sodium: 0,
        sugar: 0,
        allergens: [...item.allergens],
        timing,
        is_seasonal: false,
        is_limited: false,
      });
      console.warn(`  ⚠ 栄養データなし: ${item.name}`);
    }
  }

  return entries;
}

// ============================
// データファイル生成
// ============================

function generateDataFile(entries: YayoikenMenuItem[]): string {
  const date = new Date().toISOString().split("T")[0];
  const dataStr = JSON.stringify(entries, null, 2);

  return `// やよい軒メニューデータ（${date}版 公式サイトスクレイピングより）
// 基準地域: 東京 (ken_id: ${CONFIG.kenId})
// 自動生成ファイル - scripts/scrape/yayoiken.ts で生成

export interface YayoikenMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  fiber: number;
  sodium: number;
  sugar: number;
  allergens: string[];
  timing: string;
  is_seasonal: boolean;
  is_limited: boolean;
}

export const yayoikenMenuData: YayoikenMenuItem[] = ${dataStr};
`;
}

// ============================
// レポート出力
// ============================

function printReport(items: ScrapedItem[], entries: YayoikenMenuItem[]): void {
  console.log("\n========================================");
  console.log("        やよい軒 スクレイピングレポート");
  console.log("========================================\n");

  // カテゴリ別集計
  const catCounts: Record<string, number> = {};
  for (const item of items) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
  }

  console.log("📊 カテゴリ別スクレイピング結果:");
  for (const [cat, count] of Object.entries(catCounts)) {
    console.log(`   - ${cat}: ${count}件`);
  }
  console.log(`   合計: ${items.length}件\n`);

  // 栄養データ有無
  const withNutrition = items.filter((i) => i.nutritionVariants.length > 0);
  const withoutNutrition = items.filter(
    (i) => i.nutritionVariants.length === 0
  );

  console.log(
    `✅ 栄養データあり: ${withNutrition.length}件 / ❌ なし: ${withoutNutrition.length}件`
  );

  if (withoutNutrition.length > 0) {
    console.log("   栄養データなし:");
    for (const item of withoutNutrition) {
      console.log(`   - ${item.name} (${item.category})`);
    }
  }

  // 展開後のエントリ数
  console.log(`\n📦 DB登録エントリ数: ${entries.length}件`);

  // バリアント別集計
  const variantCounts: Record<string, number> = {};
  for (const item of items) {
    const key =
      item.nutritionVariants.length > 1
        ? `${item.nutritionVariants.length}タブ`
        : "単一";
    variantCounts[key] = (variantCounts[key] || 0) + 1;
  }
  for (const [key, count] of Object.entries(variantCounts)) {
    console.log(`   - ${key}: ${count}件`);
  }

  // 価格0のエントリ
  const noPriceEntries = entries.filter((e) => e.price === 0);
  if (noPriceEntries.length > 0) {
    console.log(`\n⚠ 価格未取得: ${noPriceEntries.length}件`);
    for (const e of noPriceEntries) {
      console.log(`   - ${e.menu_name}`);
    }
  }

  // サンプル表示
  console.log("\n📋 サンプル (先頭5件):");
  for (const entry of entries.slice(0, 5)) {
    console.log(
      `   ${entry.menu_id}: ${entry.menu_name} ¥${entry.price} | ${entry.calories}kcal P:${entry.protein}g F:${entry.fat}g C:${entry.carb}g`
    );
  }
}

// ============================
// メイン処理
// ============================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("=== やよい軒メニュースクレイパー ===");
  console.log(`基準地域: 東京 (ken_id: ${CONFIG.kenId})`);

  if (dryRun) {
    console.log("[DRY RUN] 詳細ページ5件のみ取得します\n");
  }

  // 1. 一覧ページスクレイピング
  console.log("\n📋 Step 1: 一覧ページ取得...");
  const listItems = await scrapeMenuList();
  console.log(`  ${listItems.length}件のメニューを発見\n`);

  // カテゴリ別件数
  const catCounts: Record<string, number> = {};
  for (const item of listItems) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(catCounts)) {
    console.log(`  - ${cat}: ${count}件`);
  }

  // 2. 詳細ページスクレイピング
  console.log("\n📋 Step 2: 詳細ページ取得...");
  const maxItems = dryRun ? 5 : listItems.length;
  const itemsToProcess = listItems.slice(0, maxItems);

  const scrapedItems: ScrapedItem[] = [];
  let processedCount = 0;

  for (const item of itemsToProcess) {
    try {
      const detail = await scrapeDetailPage(item.detailUrl);

      scrapedItems.push({
        ...item,
        listPrice: detail.price ?? item.listPrice,
        nutritionVariants: detail.nutritionVariants,
        allergens: detail.allergens,
      });

      processedCount++;
      console.log(`  [${processedCount}/${maxItems}] ${item.name} ✓`);

      // レート制限
      if (processedCount < maxItems) {
        await sleep(CONFIG.rateLimit);
      }

      // バッチ休止
      if (
        processedCount % CONFIG.batchSize === 0 &&
        processedCount < maxItems
      ) {
        console.log(`  バッチ休止 (${CONFIG.batchDelay / 1000}s)...`);
        await sleep(CONFIG.batchDelay);
      }
    } catch (error) {
      console.error(
        `  [${processedCount + 1}/${maxItems}] ${item.name} ✗ ${error instanceof Error ? error.message : String(error)}`
      );
      processedCount++;
    }
  }

  if (scrapedItems.length === 0) {
    console.error("\nスクレイピング結果が0件です。終了します。");
    process.exit(1);
  }

  // 3. データ変換
  console.log("\n📋 Step 3: データ変換...");
  const entries = transformToMenuEntries(scrapedItems);

  // 4. レポート出力
  printReport(scrapedItems, entries);

  if (dryRun) {
    console.log(
      `\n[DRY RUN] 本番実行すると ${entries.length} 件のメニューデータが生成されます`
    );
    console.log("本番実行: npx tsx scripts/scrape/yayoiken.ts\n");
    return;
  }

  // 5. 承認を求める
  const answer = await prompt(
    `\n${entries.length} 件のデータファイルを生成しますか？ (y/n): `
  );

  if (answer.toLowerCase() !== "y") {
    console.log("キャンセルしました");
    return;
  }

  // 6. データファイル生成
  const dataFilePath = path.join(
    process.cwd(),
    "scripts",
    "data",
    "yayoiken-menus.ts"
  );

  // 安全ガード: 取得件数が既存データの半分未満なら上書きを中止する
  // (サイト構造変更で一部ページしか取れていない場合のデータ消失防止)
  {
    const existing = fs.readFileSync(dataFilePath, "utf-8");
    const existingCount = (existing.match(/menu_id/g) || []).length;
    if (entries.length < existingCount / 2) {
      console.error(
        `\n⛔ 中止: 取得${entries.length}件は既存${existingCount}件の半分未満です。` +
          "サイト構造変更の可能性があるためデータファイルを上書きしません。"
      );
      process.exit(1);
    }
  }

  const fileContent = generateDataFile(entries);
  fs.writeFileSync(dataFilePath, fileContent, "utf-8");

  console.log(`\n✅ データファイルを生成しました: ${dataFilePath}`);
  console.log(`   ${entries.length} 件のメニューデータ`);
  console.log("\n次のステップ:");
  console.log("  1. 生成されたファイルを確認: scripts/data/yayoiken-menus.ts");
  console.log("  2. DB投入: npm run seed:yayoiken");
  console.log("  3. git commit で バージョン管理");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
