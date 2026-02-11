/**
 * 丸亀製麺メニュースクレイパー（価格 + 栄養成分 + アレルゲン）
 *
 * 公式サイトからメニューデータを取得し、scripts/data/marugame-menus.ts を生成する。
 *
 * 実行: npx tsx scripts/scrape/marugame.ts [--dry-run]
 *   --dry-run: 詳細ページ5件のみ取得してレポート表示（ファイル生成なし）
 */

import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

type CheerioAPI = ReturnType<typeof cheerio.load>;

// ============================
// 設定
// ============================

const CONFIG = {
  chainId: "marugame",
  baseUrl: "https://jp.marugame.com",
  rateLimit: 2000, // 2秒間隔
  batchSize: 10, // 10件ごとに長めの待機
  batchDelay: 10000, // バッチ間10秒
  maxRetries: 3,
  timeout: 30000,
};

// カテゴリ設定
const CATEGORIES = [
  { id: "udon", name: "うどん", path: "/menu/udon/" },
  { id: "tempura", name: "天ぷら", path: "/menu/tempura/" },
  { id: "topping", name: "薬味・トッピング", path: "/menu/topping/" },
  { id: "gohanmono", name: "ご飯もの", path: "/menu/gohanmono/" },
  { id: "udonut", name: "うどーなつ", path: "/menu/udonut/" },
];

// カテゴリslugマッピング
const CATEGORY_SLUG_MAP: Record<string, string> = {
  うどん: "udon",
  天ぷら: "tempura",
  "薬味・トッピング": "topping",
  "ご飯もの": "gohanmono",
  "うどーなつ": "udonut",
};

// サイズslugマッピング
const SIZE_SLUG_MAP: Record<string, string> = {
  並: "regular",
  大: "large",
  得: "xlarge",
};

// アレルゲン名マッピング（27品目）
const ALLERGEN_KEYS = [
  "wheat", "buckwheat", "egg", "milk", "peanut", "shrimp", "crab", "walnut",
  "abalone", "squid", "salmon_roe", "orange", "kiwi", "beef", "salmon", "mackerel",
  "soy", "chicken", "pork", "peach", "yam", "apple", "gelatin", "banana",
  "cashew", "sesame", "almond"
];

const ALLERGEN_JP_MAP: Record<string, string> = {
  wheat: "小麦", buckwheat: "そば", egg: "卵", milk: "乳", peanut: "落花生",
  shrimp: "えび", crab: "かに", walnut: "くるみ", abalone: "あわび", squid: "いか",
  salmon_roe: "いくら", orange: "オレンジ", kiwi: "キウイ", beef: "牛肉", salmon: "さけ",
  mackerel: "さば", soy: "大豆", chicken: "鶏肉", pork: "豚肉", peach: "もも",
  yam: "やまいも", apple: "りんご", gelatin: "ゼラチン", banana: "バナナ",
  cashew: "カシューナッツ", sesame: "ごま", almond: "アーモンド"
};

// ============================
// 型定義
// ============================

interface MenuListItem {
  id: string;
  name: string;
  href: string;
  category: string;
  price: {
    regular?: number;
    large?: number;
    xlarge?: number;
    piece?: number;
  };
  temperatures?: {
    hot?: boolean;
    cold?: boolean;
  };
}

interface NutritionItem {
  temperature: string;
  size: string;
  energy: number;
  protein: number;
  fat: number;
  carbohydrate: number;
  saltEquivalent: number;
}

interface ScrapedItem {
  id: string;
  name: string;
  category: string;
  price: MenuListItem["price"];
  temperatures?: MenuListItem["temperatures"];
  nutrition: NutritionItem[];
  allergens: string[];
}

interface MarugameMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  size: string;
  temperature: string;
  price: number;
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

async function fetchWithRetry(url: string): Promise<CheerioAPI> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      console.log(`  Fetching: ${url} (attempt ${attempt})`);

      const response = await axios.get(url, {
        timeout: CONFIG.timeout,
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });

      return cheerio.load(response.data);
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
        const backoff = Math.pow(2, attempt) * 3000;
        console.log(`  Retrying in ${backoff / 1000}s...`);
        await sleep(backoff);
      }
    }
  }

  throw lastError || new Error(`Failed to fetch: ${url}`);
}

// ============================
// Next.js JSONデータ抽出
// ============================

function extractNextData($: CheerioAPI): Record<string, unknown> | null {
  const script = $("#__NEXT_DATA__").html();
  if (!script) return null;

  try {
    return JSON.parse(script);
  } catch {
    return null;
  }
}

// ============================
// カテゴリ一覧ページスクレイピング
// ============================

async function scrapeMenuList(): Promise<MenuListItem[]> {
  const items: MenuListItem[] = [];

  for (const category of CATEGORIES) {
    const url = `${CONFIG.baseUrl}${category.path}`;
    const $ = await fetchWithRetry(url);
    const nextData = extractNextData($);

    if (!nextData) {
      console.error(`  Failed to extract __NEXT_DATA__ from ${url}`);
      continue;
    }

    // @ts-expect-error - Dynamic JSON structure
    const pageProps = nextData.props?.pageProps;
    if (!pageProps?.menus?.shop) {
      console.error(`  No menus.shop found in ${url}`);
      continue;
    }

    const shopMenus = pageProps.menus.shop as Array<{
      id: string;
      name: string;
      href: string;
      price?: {
        regular?: number;
        large?: number;
        xlarge?: number;
        piece?: number;
      };
      temperatures?: {
        hot?: boolean;
        cold?: boolean;
      };
    }>;

    for (const menu of shopMenus) {
      items.push({
        id: menu.id,
        name: menu.name,
        href: menu.href,
        category: category.name,
        price: menu.price || {},
        temperatures: menu.temperatures,
      });
    }

    console.log(`  ${category.name}: ${shopMenus.length}件`);
    await sleep(CONFIG.rateLimit);
  }

  return items;
}

// ============================
// 詳細ページスクレイピング
// ============================

async function scrapeDetailPage(href: string): Promise<{
  nutrition: NutritionItem[];
  allergens: string[];
}> {
  const url = `${CONFIG.baseUrl}${href}`;
  const $ = await fetchWithRetry(url);
  const nextData = extractNextData($);

  if (!nextData) {
    return { nutrition: [], allergens: [] };
  }

  // @ts-expect-error - Dynamic JSON structure
  const pageProps = nextData.props?.pageProps;

  // 栄養成分
  const nutritionData = pageProps?.nutritionItemData;
  const nutrition: NutritionItem[] = [];

  if (nutritionData?.items && Array.isArray(nutritionData.items)) {
    for (const item of nutritionData.items) {
      nutrition.push({
        temperature: item.temperature || "",
        size: item.size || "",
        energy: parseFloat(item.energy) || 0,
        protein: parseFloat(item.protein) || 0,
        fat: parseFloat(item.fat) || 0,
        carbohydrate: parseFloat(item.carbohydrate) || 0,
        saltEquivalent: parseFloat(item.saltEquivalent) || 0,
      });
    }
  }

  // アレルゲン
  const allergenData = pageProps?.allergenItemData;
  const allergens: string[] = [];

  if (allergenData) {
    for (const key of ALLERGEN_KEYS) {
      if (allergenData[key] === "1" || allergenData[key] === 1) {
        const jpName = ALLERGEN_JP_MAP[key];
        if (jpName) allergens.push(jpName);
      }
    }
  }

  return { nutrition, allergens };
}

// ============================
// データ変換
// ============================

function transformToMenuEntries(items: ScrapedItem[]): MarugameMenuItem[] {
  const entries: MarugameMenuItem[] = [];
  const categoryCounters: Record<string, number> = {};

  for (const item of items) {
    const slug = CATEGORY_SLUG_MAP[item.category] || "other";

    // 栄養データがある場合
    if (item.nutrition.length > 0) {
      for (const nut of item.nutrition) {
        if (!categoryCounters[slug]) categoryCounters[slug] = 0;
        categoryCounters[slug]++;
        const seq = String(categoryCounters[slug]).padStart(3, "0");

        const sizeSlug = SIZE_SLUG_MAP[nut.size] || nut.size || "single";
        const tempSlug = nut.temperature === "温かい" ? "hot" : nut.temperature === "冷たい" ? "cold" : "";
        const menuId = tempSlug
          ? `marugame-${slug}-${seq}-${sizeSlug}-${tempSlug}`
          : `marugame-${slug}-${seq}-${sizeSlug}`;

        // 価格を決定
        let price = 0;
        if (nut.size === "並" && item.price.regular) price = item.price.regular;
        else if (nut.size === "大" && item.price.large) price = item.price.large;
        else if (nut.size === "得" && item.price.xlarge) price = item.price.xlarge;
        else if (item.price.piece) price = item.price.piece;
        else if (item.price.regular) price = item.price.regular;

        // メニュー名生成
        let menuName = item.name;
        if (nut.size && nut.size !== "1個") menuName += `（${nut.size}）`;
        if (nut.temperature) menuName += `【${nut.temperature}】`;

        entries.push({
          menu_id: menuId,
          menu_name: menuName,
          category: item.category,
          size: nut.size || "1個",
          temperature: nut.temperature || "",
          price,
          calories: nut.energy,
          protein: nut.protein,
          fat: nut.fat,
          carb: nut.carbohydrate,
          sodium: nut.saltEquivalent,
          allergens: [...item.allergens],
        });
      }
    } else {
      // 栄養データなし（価格のみ）
      if (!categoryCounters[slug]) categoryCounters[slug] = 0;
      categoryCounters[slug]++;
      const seq = String(categoryCounters[slug]).padStart(3, "0");
      const menuId = `marugame-${slug}-${seq}`;

      const price = item.price.piece || item.price.regular || 0;

      entries.push({
        menu_id: menuId,
        menu_name: item.name,
        category: item.category,
        size: "1個",
        temperature: "",
        price,
        calories: 0,
        protein: 0,
        fat: 0,
        carb: 0,
        sodium: 0,
        allergens: [...item.allergens],
      });
      console.warn(`  ⚠ 栄養データなし: ${item.name}`);
    }
  }

  return entries;
}

// ============================
// データファイル生成
// ============================

function generateDataFile(entries: MarugameMenuItem[]): string {
  const date = new Date().toISOString().split("T")[0];
  const dataStr = JSON.stringify(entries, null, 2);

  return `// 丸亀製麺メニューデータ（${date}版 公式サイトスクレイピングより）
// 自動生成ファイル - scripts/scrape/marugame.ts で生成

export interface MarugameMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  size: string;
  temperature: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
  allergens: string[];
}

export const marugameMenuData: MarugameMenuItem[] = ${dataStr};
`;
}

// ============================
// レポート出力
// ============================

function printReport(items: ScrapedItem[], entries: MarugameMenuItem[]): void {
  console.log("\n========================================");
  console.log("       丸亀製麺 スクレイピングレポート");
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
  const withNutrition = items.filter((i) => i.nutrition.length > 0);
  const withoutNutrition = items.filter((i) => i.nutrition.length === 0);

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

  // 価格0のエントリ
  const noPriceEntries = entries.filter((e) => e.price === 0);
  if (noPriceEntries.length > 0) {
    console.log(`\n⚠ 価格未取得: ${noPriceEntries.length}件`);
    for (const e of noPriceEntries.slice(0, 10)) {
      console.log(`   - ${e.menu_name}`);
    }
    if (noPriceEntries.length > 10) {
      console.log(`   ...他${noPriceEntries.length - 10}件`);
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

  console.log("=== 丸亀製麺メニュースクレイパー ===");

  if (dryRun) {
    console.log("[DRY RUN] 詳細ページ5件のみ取得します\n");
  }

  // 1. カテゴリ一覧ページスクレイピング
  console.log("\n📋 Step 1: カテゴリ一覧ページ取得...");
  const listItems = await scrapeMenuList();
  console.log(`  合計${listItems.length}件のメニューを発見\n`);

  // 2. 詳細ページスクレイピング
  console.log("\n📋 Step 2: 詳細ページ取得...");
  const maxItems = dryRun ? 5 : listItems.length;
  const itemsToProcess = listItems.slice(0, maxItems);

  const scrapedItems: ScrapedItem[] = [];
  let processedCount = 0;

  for (const item of itemsToProcess) {
    try {
      const detail = await scrapeDetailPage(item.href);

      scrapedItems.push({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        temperatures: item.temperatures,
        nutrition: detail.nutrition,
        allergens: detail.allergens,
      });

      processedCount++;
      console.log(`  [${processedCount}/${maxItems}] ${item.name} ✓`);

      // レート制限
      if (processedCount < maxItems) {
        await sleep(CONFIG.rateLimit);
      }

      // バッチ休止
      if (processedCount % CONFIG.batchSize === 0 && processedCount < maxItems) {
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
    console.log("本番実行: npx tsx scripts/scrape/marugame.ts\n");
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
    "marugame-menus.ts"
  );
  const fileContent = generateDataFile(entries);
  fs.writeFileSync(dataFilePath, fileContent, "utf-8");

  console.log(`\n✅ データファイルを生成しました: ${dataFilePath}`);
  console.log(`   ${entries.length} 件のメニューデータ`);
  console.log("\n次のステップ:");
  console.log("  1. 生成されたファイルを確認: scripts/data/marugame-menus.ts");
  console.log("  2. seed スクリプトを作成して DB投入");
  console.log("  3. git commit でバージョン管理");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
