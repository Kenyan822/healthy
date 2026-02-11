/**
 * 松屋メニュースクレイパー（価格 + 栄養成分 + アレルゲン）
 *
 * 公式サイトからメニューデータを取得し、scripts/data/matsuya-menus.ts を生成する。
 *
 * 実行: npx tsx scripts/scrape/matsuya.ts [--dry-run]
 *   --dry-run: 詳細ページ10件のみ取得してレポート表示（ファイル生成なし）
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
  chainId: "matsuya",
  baseUrl: "https://www.matsuyafoods.co.jp/matsuya/menu",
  rateLimit: 3000, // 3秒間隔
  batchSize: 10,
  batchDelay: 15000,
  maxRetries: 3,
  timeout: 30000,
};

// カテゴリ設定
const CATEGORIES = [
  { id: "gyumeshi", name: "牛めし", slug: "gyumeshi" },
  { id: "curry", name: "カレー", slug: "curry" },
  { id: "teishoku", name: "定食", slug: "teishoku" },
  { id: "don", name: "丼", slug: "don" },
  { id: "low_carbohydrate", name: "ロカボ", slug: "locabo" },
  { id: "morning", name: "朝食", slug: "morning" },
  { id: "sidemenu", name: "サイドメニュー", slug: "sidemenu" },
  { id: "topping", name: "セットメニュー", slug: "set" },
  { id: "limited", name: "期間限定", slug: "limited" },
];

// 除外パターン（弁当セット等）
const EXCLUDE_PATTERNS = [
  /弁当\d+個セット/,
  /テイクアウト/,
];

// ============================
// 型定義
// ============================

interface NutritionData {
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
}

interface ScrapedItem {
  name: string;
  size: string;
  category: string;
  price: number;
  nutrition: NutritionData;
  allergens: string[];
  url: string;
}

interface MatsuyaMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
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
// 栄養成分パース
// ============================

function parseNutrition(text: string): NutritionData {
  const nutrition: NutritionData = {
    calories: 0,
    protein: 0,
    fat: 0,
    carb: 0,
    sodium: 0,
  };

  // "カロリー／687kcal" → 687
  const caloriesMatch = text.match(/カロリー[／/](\d+(?:\.\d+)?)/);
  if (caloriesMatch) nutrition.calories = parseFloat(caloriesMatch[1]);

  // "たんぱく質／17.1g"
  const proteinMatch = text.match(/たんぱく質[／/](\d+(?:\.\d+)?)/);
  if (proteinMatch) nutrition.protein = parseFloat(proteinMatch[1]);

  // "脂質／28.9g"
  const fatMatch = text.match(/脂質[／/](\d+(?:\.\d+)?)/);
  if (fatMatch) nutrition.fat = parseFloat(fatMatch[1]);

  // "炭水化物／85.5g"
  const carbMatch = text.match(/炭水化物[／/](\d+(?:\.\d+)?)/);
  if (carbMatch) nutrition.carb = parseFloat(carbMatch[1]);

  // "食塩相当量／3g"
  const sodiumMatch = text.match(/食塩相当量[／/](\d+(?:\.\d+)?)/);
  if (sodiumMatch) nutrition.sodium = parseFloat(sodiumMatch[1]);

  return nutrition;
}

// ============================
// カテゴリページスクレイピング
// ============================

async function scrapeCategoryPage(categoryId: string): Promise<{ name: string; url: string }[]> {
  const url = `${CONFIG.baseUrl}/${categoryId}/`;
  const $ = await fetchWithRetry(url);

  const menuLinks: { name: string; url: string }[] = [];

  $("ul.menu_inner > li").each((_, el) => {
    const $el = $(el);

    let menuName = $el.find("span.txt").first().text().trim();
    if (!menuName) {
      menuName = $el.find("img").first().attr("alt") || "";
    }
    if (!menuName) return;

    // 除外パターンチェック
    for (const pattern of EXCLUDE_PATTERNS) {
      if (pattern.test(menuName)) return;
    }

    const detailHref = $el.find("a.item-menu-cmn").attr("href");
    if (detailHref) {
      // URL正規化: /menu/../matsuya/ → /matsuya/
      let normalizedUrl = detailHref.replace("/menu/../", "/");
      if (!normalizedUrl.startsWith("http")) {
        normalizedUrl = `https://www.matsuyafoods.co.jp${normalizedUrl}`;
      }
      menuLinks.push({ name: menuName, url: normalizedUrl });
    }
  });

  return menuLinks;
}

// ============================
// 詳細ページスクレイピング
// ============================

async function scrapeDetailPage(url: string, categorySlug: string): Promise<ScrapedItem[]> {
  const $ = await fetchWithRetry(url);
  const items: ScrapedItem[] = [];

  // メニュー名
  const menuName = $("h1.ttl").text().trim();
  if (!menuName) return [];

  // 価格とサイズのリストを取得
  const prices: { size: string; price: number }[] = [];
  $("ul.ul-text > li").each((_, el) => {
    const $el = $(el);
    const size = $el.find("p.th").text().trim() || "単品";
    const priceText = $el.find("p.td > span.clr").first().text().trim();
    const price = parseInt(priceText, 10);

    if (!isNaN(price) && price > 0 && price < 10000) {
      prices.push({ size, price });
    }
  });

  // 栄養成分セクションを探す
  const nutritionList: NutritionData[] = [];
  let inNutritionSection = false;

  $(".row-block").each((_, block) => {
    const $block = $(block);
    const heading = $block.find("h3.pttl").text().trim();

    if (heading === "栄養成分") {
      inNutritionSection = true;
      // 栄養成分のpタグを取得
      $block.find(".accordion p").each((_, p) => {
        const text = $(p).text().trim();
        if (text.includes("カロリー")) {
          nutritionList.push(parseNutrition(text));
        }
      });
    }
  });

  // アレルゲン情報を取得
  const allergens: string[] = [];
  $(".row-block").each((_, block) => {
    const $block = $(block);
    const heading = $block.find("h3.pttl").text().trim();

    if (heading.includes("アレルギー") || heading.includes("特定原材料")) {
      $block.find("ul.ul-data > li").each((_, li) => {
        const $li = $(li);
        const allergenName = $li.find("p.th span").text().trim();
        const hasAllergen = $li.find("p.td").text().trim() === "○";
        if (hasAllergen && allergenName) {
          allergens.push(allergenName);
        }
      });
    }
  });

  // 価格と栄養成分をマッチング
  for (let i = 0; i < prices.length; i++) {
    const { size, price } = prices[i];
    const nutrition = nutritionList[i] || {
      calories: 0,
      protein: 0,
      fat: 0,
      carb: 0,
      sodium: 0,
    };

    items.push({
      name: menuName,
      size,
      category: categorySlug,
      price,
      nutrition,
      allergens: [...allergens],
      url,
    });
  }

  return items;
}

// ============================
// データ変換
// ============================

function transformToMenuEntries(items: ScrapedItem[]): MatsuyaMenuItem[] {
  const entries: MatsuyaMenuItem[] = [];
  const categoryCounters: Record<string, number> = {};

  for (const item of items) {
    const slug = item.category;
    if (!categoryCounters[slug]) categoryCounters[slug] = 0;
    categoryCounters[slug]++;
    const seq = String(categoryCounters[slug]).padStart(3, "0");

    // メニューID生成
    const menuId = `matsuya-${slug}-${seq}`;

    // メニュー名生成（サイズ付き）
    const menuName = item.size && item.size !== "単品"
      ? `${item.name}（${item.size}）`
      : item.name;

    // タイミング判定
    const timing = item.category === "morning" ? "breakfast" : "anytime";

    entries.push({
      menu_id: menuId,
      menu_name: menuName,
      category: getCategoryName(item.category),
      price: item.price,
      calories: item.nutrition.calories,
      protein: item.nutrition.protein,
      fat: item.nutrition.fat,
      carb: item.nutrition.carb,
      sodium: item.nutrition.sodium,
      allergens: item.allergens,
      timing,
      is_seasonal: item.category === "limited",
      is_limited: item.category === "limited",
    });
  }

  return entries;
}

function getCategoryName(slug: string): string {
  const category = CATEGORIES.find((c) => c.slug === slug);
  return category?.name || slug;
}

// ============================
// データファイル生成
// ============================

function generateDataFile(entries: MatsuyaMenuItem[]): string {
  const date = new Date().toISOString().split("T")[0];
  const dataStr = JSON.stringify(entries, null, 2);

  return `// 松屋メニューデータ（${date}版 公式サイトスクレイピングより）
// 自動生成ファイル - scripts/scrape/matsuya.ts で生成

export interface MatsuyaMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
  allergens: string[];
  timing: string;
  is_seasonal: boolean;
  is_limited: boolean;
}

export const matsuyaMenuData: MatsuyaMenuItem[] = ${dataStr};
`;
}

// ============================
// レポート出力
// ============================

function printReport(items: ScrapedItem[], entries: MatsuyaMenuItem[]): void {
  console.log("\n========================================");
  console.log("        松屋 スクレイピングレポート");
  console.log("========================================\n");

  // カテゴリ別集計
  const catCounts: Record<string, number> = {};
  for (const item of items) {
    const catName = getCategoryName(item.category);
    catCounts[catName] = (catCounts[catName] || 0) + 1;
  }

  console.log("📊 カテゴリ別スクレイピング結果:");
  for (const [cat, count] of Object.entries(catCounts)) {
    console.log(`   - ${cat}: ${count}件`);
  }
  console.log(`   合計: ${items.length}件\n`);

  // 栄養データ有無
  const withNutrition = items.filter((i) => i.nutrition.calories > 0);
  const withoutNutrition = items.filter((i) => i.nutrition.calories === 0);

  console.log(
    `✅ 栄養データあり: ${withNutrition.length}件 / ❌ なし: ${withoutNutrition.length}件`
  );

  if (withoutNutrition.length > 0 && withoutNutrition.length <= 10) {
    console.log("   栄養データなし:");
    for (const item of withoutNutrition) {
      console.log(`   - ${item.name}（${item.size}）`);
    }
  }

  // 展開後のエントリ数
  console.log(`\n📦 DB登録エントリ数: ${entries.length}件`);

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

  console.log("=== 松屋メニュースクレイパー ===");

  if (dryRun) {
    console.log("[DRY RUN] 詳細ページ10件のみ取得します\n");
  }

  // 訪問済みURL（重複防止）
  const visitedUrls = new Set<string>();
  const allItems: ScrapedItem[] = [];
  let totalDetailCount = 0;
  const maxDetailPages = dryRun ? 10 : 0;

  // 1. 各カテゴリをスクレイピング
  for (const category of CATEGORIES) {
    console.log(`\n📋 カテゴリ: ${category.name}`);

    try {
      const menuLinks = await scrapeCategoryPage(category.id);
      console.log(`  ${menuLinks.length}件のメニューリンクを発見`);

      let categoryCount = 0;
      for (const link of menuLinks) {
        // 上限チェック
        if (maxDetailPages > 0 && totalDetailCount >= maxDetailPages) {
          console.log(`  上限到達 (${maxDetailPages}件)`);
          break;
        }

        // 重複チェック
        if (visitedUrls.has(link.url)) {
          continue;
        }
        visitedUrls.add(link.url);

        try {
          // レート制限
          if (categoryCount > 0) {
            await sleep(CONFIG.rateLimit);
          }

          // バッチ休止
          if (categoryCount > 0 && categoryCount % CONFIG.batchSize === 0) {
            console.log(`  バッチ休止 (${CONFIG.batchDelay / 1000}s)...`);
            await sleep(CONFIG.batchDelay);
          }

          const items = await scrapeDetailPage(link.url, category.slug);
          allItems.push(...items);

          const sizes = items.map((i) => i.size).join(", ");
          console.log(`  [${totalDetailCount + 1}] ${link.name}: ${items.length}件 [${sizes}]`);

          categoryCount++;
          totalDetailCount++;
        } catch (error) {
          console.error(
            `  Error: ${link.name} - ${error instanceof Error ? error.message : error}`
          );
        }
      }
    } catch (error) {
      console.error(`  カテゴリエラー: ${error instanceof Error ? error.message : error}`);
    }

    // カテゴリ間の待機
    await sleep(CONFIG.rateLimit);
  }

  if (allItems.length === 0) {
    console.error("\nスクレイピング結果が0件です。終了します。");
    process.exit(1);
  }

  // 2. データ変換
  console.log("\n📋 データ変換中...");
  const entries = transformToMenuEntries(allItems);

  // 3. レポート出力
  printReport(allItems, entries);

  if (dryRun) {
    console.log(
      `\n[DRY RUN] 本番実行すると ${entries.length} 件のメニューデータが生成されます`
    );
    console.log("本番実行: npx tsx scripts/scrape/matsuya.ts\n");
    return;
  }

  // 4. 承認を求める
  const answer = await prompt(
    `\n${entries.length} 件のデータファイルを生成しますか？ (y/n): `
  );

  if (answer.toLowerCase() !== "y") {
    console.log("キャンセルしました");
    return;
  }

  // 5. データファイル生成
  const dataFilePath = path.join(
    process.cwd(),
    "scripts",
    "data",
    "matsuya-menus.ts"
  );
  const fileContent = generateDataFile(entries);
  fs.writeFileSync(dataFilePath, fileContent, "utf-8");

  console.log(`\n✅ データファイルを生成しました: ${dataFilePath}`);
  console.log(`   ${entries.length} 件のメニューデータ`);
  console.log("\n次のステップ:");
  console.log("  1. 生成されたファイルを確認: scripts/data/matsuya-menus.ts");
  console.log("  2. DB投入: npm run seed:matsuya");
  console.log("  3. git commit でバージョン管理");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
