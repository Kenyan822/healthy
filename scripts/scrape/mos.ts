/**
 * モスバーガーメニュースクレイパー（価格 + 栄養成分 + アレルゲン）
 *
 * 公式サイトからメニューデータを取得し、scripts/data/mos-menus.ts を生成する。
 *
 * 実行: npx tsx scripts/scrape/mos.ts [--dry-run]
 *   --dry-run: 詳細ページ5件のみ取得してレポート表示（ファイル生成なし）
 */

import puppeteer, { Browser, Page } from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ============================
// 設定
// ============================

const CONFIG = {
  chainId: "mos",
  baseUrl: "https://www.mos.jp",
  rateLimit: 2000, // 2秒間隔
  batchSize: 10,
  batchDelay: 10000, // バッチ間10秒
  maxRetries: 3,
  timeout: 30000,
};

// カテゴリ設定
const CATEGORIES = [
  { id: 27, name: "新とびきりバーガー", slug: "tobikiri" },
  { id: 1, name: "ハンバーガー", slug: "burger" },
  { id: 35, name: "モスライスバーガー/ホットドッグ", slug: "rice" },
  { id: 30, name: "モスの菜摘", slug: "natsumi" },
  { id: 33, name: "ソイパティ", slug: "soy" },
  { id: 7, name: "サイドメニュー", slug: "side" },
  { id: 34, name: "ドリンク/スープ", slug: "drink" },
  { id: 9, name: "デザート", slug: "dessert" },
  { id: 11, name: "モスワイワイセット", slug: "waiwai" },
  { id: 32, name: "低アレルゲンメニュー", slug: "lowallergy" },
  { id: 12, name: "朝モス", slug: "morning" },
];

// アレルゲン28品目
const ALLERGEN_SYMBOLS: Record<string, string> = {
  "卵": "卵",
  "乳": "乳",
  "小麦": "小麦",
  "えび": "えび",
  "かに": "かに",
  "そば": "そば",
  "落花生": "落花生",
  "くるみ": "くるみ",
  "アーモンド": "アーモンド",
  "あわび": "あわび",
  "いか": "いか",
  "いくら": "いくら",
  "オレンジ": "オレンジ",
  "カシューナッツ": "カシューナッツ",
  "キウイフルーツ": "キウイ",
  "牛肉": "牛肉",
  "ごま": "ごま",
  "さけ": "さけ",
  "さば": "さば",
  "大豆": "大豆",
  "鶏肉": "鶏肉",
  "バナナ": "バナナ",
  "豚肉": "豚肉",
  "マカダミアナッツ": "マカダミアナッツ",
  "もも": "もも",
  "やまいも": "やまいも",
  "りんご": "りんご",
  "ゼラチン": "ゼラチン",
  "魚介類": "魚介類",
};

// ============================
// 型定義
// ============================

interface MenuListItem {
  name: string;
  price: number;
  menuId: string;
  href: string;
  category: string;
  categorySlug: string;
}

interface ScrapedItem {
  name: string;
  price: number;
  menuId: string;
  category: string;
  categorySlug: string;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
  allergens: string[];
}

interface MosMenuItem {
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

// ============================
// スクレイピング
// ============================

async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

/**
 * カテゴリページからメニュー一覧を取得
 */
async function scrapeCategory(
  page: Page,
  category: { id: number; name: string; slug: string }
): Promise<MenuListItem[]> {
  const url = `${CONFIG.baseUrl}/menu/category/?c_id=${category.id}`;
  console.log(`  Fetching: ${url}`);

  await page.goto(url, { waitUntil: "networkidle2", timeout: CONFIG.timeout });

  const items = await page.evaluate(() => {
    const results: {
      name: string;
      price: number;
      menuId: string;
      href: string;
    }[] = [];

    const links = document.querySelectorAll('a[href*="/menu/detail/"]');

    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const text = link.textContent || "";

      const menuIdMatch = href.match(/menu_id=(\d+)/);
      if (!menuIdMatch) return;

      const menuId = menuIdMatch[1];

      const priceMatch = text.match(/¥(\d+)/);
      if (!priceMatch) return;

      const price = parseInt(priceMatch[1], 10);

      // 商品名（価格と期間限定タグを除去）
      let name = text
        .replace(/¥\d+/g, "")
        .replace(/期間限定/g, "")
        .replace(/時間限定/g, "")
        .replace(/数量限定/g, "")
        .replace(/【[^】]*】/g, "")
        .replace(/GREEN BURGER TERIYAKI/g, "")
        .trim();

      if (name && price > 0 && !results.find((r) => r.menuId === menuId)) {
        results.push({ name, price, menuId, href });
      }
    });

    return results;
  });

  return items.map((item) => ({
    ...item,
    category: category.name,
    categorySlug: category.slug,
  }));
}

/**
 * 詳細ページから栄養成分とアレルゲンを取得
 */
async function scrapeDetailPage(
  page: Page,
  item: MenuListItem
): Promise<{
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
  allergens: string[];
}> {
  const url = `${CONFIG.baseUrl}${item.href}`;

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: CONFIG.timeout });

    // 1. まずアレルゲン情報を取得（ページ読み込み直後に表示されている）
    const allergenData = await page.evaluate((allergenKeys: string[]) => {
      const bodyText = document.body.innerText;
      const allergens: string[] = [];
      for (const key of allergenKeys) {
        const pattern = new RegExp(`${key}[\\s\\n]*●`);
        if (pattern.test(bodyText)) {
          allergens.push(key);
        }
      }
      return allergens;
    }, Object.keys(ALLERGEN_SYMBOLS));

    // 2. 「栄養成分情報」タブをクリックして詳細な栄養成分を展開
    await page.evaluate(() => {
      const links = document.querySelectorAll("a, button");
      for (const link of links) {
        if (link.textContent?.trim() === "栄養成分情報") {
          (link as HTMLElement).click();
          break;
        }
      }
    });

    // 展開されるまで少し待つ
    await new Promise((r) => setTimeout(r, 500));

    // 3. 栄養成分を取得
    const nutritionData = await page.evaluate(() => {
      const bodyText = document.body.innerText;

      // カロリー取得
      const calMatch = bodyText.match(/(\d+)\s*kcal/i);
      const calories = calMatch ? parseInt(calMatch[1], 10) : 0;

      // 詳細な栄養成分を取得
      const proteinMatch = bodyText.match(/たんぱく質\s*(\d+(?:\.\d+)?)\s*g/);
      const fatMatch = bodyText.match(/脂質\s*(\d+(?:\.\d+)?)\s*g/);
      const carbMatch = bodyText.match(/炭水化物\s*(\d+(?:\.\d+)?)\s*g/);
      const sodiumMatch = bodyText.match(/食塩相当量\s*(\d+(?:\.\d+)?)\s*g/);

      const protein = proteinMatch ? parseFloat(proteinMatch[1]) : 0;
      const fat = fatMatch ? parseFloat(fatMatch[1]) : 0;
      const carb = carbMatch ? parseFloat(carbMatch[1]) : 0;
      const sodium = sodiumMatch ? parseFloat(sodiumMatch[1]) : 0;

      return { calories, protein, fat, carb, sodium };
    });

    const data = {
      ...nutritionData,
      allergens: allergenData,
    };

    return {
      calories: data.calories,
      protein: data.protein,
      fat: data.fat,
      carb: data.carb,
      sodium: data.sodium,
      allergens: data.allergens.map((a) => ALLERGEN_SYMBOLS[a] || a),
    };
  } catch (error) {
    console.error(`    Error fetching detail: ${error}`);
    return { calories: 0, protein: 0, fat: 0, carb: 0, sodium: 0, allergens: [] };
  }
}

/**
 * 全カテゴリをスクレイピング
 */
async function scrapeAll(
  page: Page,
  maxDetailPages = 0,
  skipDetails = false
): Promise<ScrapedItem[]> {
  const allItems: ScrapedItem[] = [];
  const seenMenuIds = new Set<string>();
  const menuListItems: MenuListItem[] = [];

  // Step 1: カテゴリ一覧から商品リストを取得
  console.log("\n📋 Step 1: カテゴリ一覧ページ取得...");

  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = CATEGORIES[i];
    console.log(`[${i + 1}/${CATEGORIES.length}] Scraping: ${category.name}`);

    try {
      const items = await scrapeCategory(page, category);

      for (const item of items) {
        if (!seenMenuIds.has(item.menuId)) {
          seenMenuIds.add(item.menuId);
          menuListItems.push(item);
        }
      }

      console.log(`  Found ${items.length} items`);

      if (i < CATEGORIES.length - 1) {
        await sleep(CONFIG.rateLimit);
      }
    } catch (error) {
      console.error(`  Error: ${error}`);
    }
  }

  console.log(`\n  合計 ${menuListItems.length} 件のメニューを発見\n`);

  // Step 2: 詳細ページから栄養成分とアレルゲンを取得
  console.log("📋 Step 2: 詳細ページ取得...");

  const itemsToProcess =
    maxDetailPages > 0 ? menuListItems.slice(0, maxDetailPages) : menuListItems;

  let processedCount = 0;

  for (const item of itemsToProcess) {
    try {
      let calories = 0;
      let protein = 0;
      let fat = 0;
      let carb = 0;
      let sodium = 0;
      let allergens: string[] = [];

      if (!skipDetails) {
        const detail = await scrapeDetailPage(page, item);
        calories = detail.calories;
        protein = detail.protein;
        fat = detail.fat;
        carb = detail.carb;
        sodium = detail.sodium;
        allergens = detail.allergens;
      }

      allItems.push({
        name: item.name,
        price: item.price,
        menuId: item.menuId,
        category: item.category,
        categorySlug: item.categorySlug,
        calories,
        protein,
        fat,
        carb,
        sodium,
        allergens,
      });

      processedCount++;
      const nutritionStr = `${calories}kcal P:${protein}g F:${fat}g C:${carb}g`;
      const allergenStr = allergens.length > 0 ? ` [${allergens.slice(0, 3).join(",")}${allergens.length > 3 ? "..." : ""}]` : "";
      console.log(
        `  [${processedCount}/${itemsToProcess.length}] ${item.name} ¥${item.price} ${nutritionStr}${allergenStr}`
      );

      // レート制限
      if (!skipDetails && processedCount < itemsToProcess.length) {
        await sleep(CONFIG.rateLimit);
      }

      // バッチ休止
      if (
        !skipDetails &&
        processedCount % CONFIG.batchSize === 0 &&
        processedCount < itemsToProcess.length
      ) {
        console.log(`  バッチ休止 (${CONFIG.batchDelay / 1000}s)...`);
        await sleep(CONFIG.batchDelay);
      }
    } catch (error) {
      console.error(`  Error: ${item.name} - ${error}`);
      processedCount++;
    }
  }

  return allItems;
}

// ============================
// データ変換・出力
// ============================

function transformToMenuEntries(items: ScrapedItem[]): MosMenuItem[] {
  const entries: MosMenuItem[] = [];
  const categoryCounters: Record<string, number> = {};

  for (const item of items) {
    const slug = item.categorySlug;

    if (!categoryCounters[slug]) categoryCounters[slug] = 0;
    categoryCounters[slug]++;
    const seq = categoryCounters[slug];

    const menuId = `mos-${slug}-${seq}`;

    entries.push({
      menu_id: menuId,
      menu_name: item.name,
      category: item.category,
      price: item.price,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carb: item.carb,
      sodium: item.sodium,
      allergens: item.allergens,
    });
  }

  return entries;
}

function generateDataFile(entries: MosMenuItem[]): string {
  const date = new Date().toISOString().split("T")[0];

  const lines: string[] = [];
  lines.push(`/**`);
  lines.push(` * モスバーガーメニューデータ（${date}版 公式サイトスクレイピングより）`);
  lines.push(` * 自動生成ファイル - scripts/scrape/mos.ts で生成`);
  lines.push(` */`);
  lines.push(``);
  lines.push(`export interface MosMenuItem {`);
  lines.push(`  menu_id: string;`);
  lines.push(`  menu_name: string;`);
  lines.push(`  category: string;`);
  lines.push(`  price: number;`);
  lines.push(`  calories: number;`);
  lines.push(`  protein: number;`);
  lines.push(`  fat: number;`);
  lines.push(`  carb: number;`);
  lines.push(`  sodium: number;`);
  lines.push(`  allergens: string[];`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const mosMenuData: MosMenuItem[] = [`);

  // カテゴリごとにグループ化
  let currentCategory = "";
  for (const entry of entries) {
    if (entry.category !== currentCategory) {
      if (currentCategory !== "") {
        lines.push(``);
      }
      lines.push(`  // 【${entry.category}】`);
      currentCategory = entry.category;
    }

    const allergenStr =
      entry.allergens.length > 0
        ? `[${entry.allergens.map((a) => `"${a}"`).join(", ")}]`
        : "[]";

    lines.push(
      `  { menu_id: "${entry.menu_id}", menu_name: "${entry.menu_name}", category: "${entry.category}", price: ${entry.price}, calories: ${entry.calories}, protein: ${entry.protein}, fat: ${entry.fat}, carb: ${entry.carb}, sodium: ${entry.sodium}, allergens: ${allergenStr} },`
    );
  }

  lines.push(`];`);

  return lines.join("\n");
}

// ============================
// レポート
// ============================

function printReport(items: ScrapedItem[], entries: MosMenuItem[]): void {
  console.log("\n========================================");
  console.log("       モスバーガー スクレイピングレポート");
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

  // 栄養成分取得状況
  const withCalories = items.filter((i) => i.calories > 0);
  const withProtein = items.filter((i) => i.protein > 0);
  const withAllergens = items.filter((i) => i.allergens.length > 0);

  console.log(`✅ カロリー取得: ${withCalories.length}件 / ${items.length}件`);
  console.log(`✅ たんぱく質取得: ${withProtein.length}件 / ${items.length}件`);
  console.log(`✅ アレルゲン取得: ${withAllergens.length}件 / ${items.length}件`);

  // 価格0のエントリ
  const noPriceEntries = entries.filter((e) => e.price === 0);
  if (noPriceEntries.length > 0) {
    console.log(`\n⚠ 価格未取得: ${noPriceEntries.length}件`);
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
// メイン
// ============================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("=== モスバーガーメニュースクレイパー ===");

  if (dryRun) {
    console.log("[DRY RUN] 詳細ページ5件のみ取得します\n");
  }

  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    // スクレイピング実行
    const scrapedItems = await scrapeAll(page, dryRun ? 5 : 0);

    if (scrapedItems.length === 0) {
      console.error("\nスクレイピング結果が0件です。終了します。");
      await browser.close();
      process.exit(1);
    }

    // データ変換
    console.log("\n📋 Step 3: データ変換...");
    const entries = transformToMenuEntries(scrapedItems);

    // レポート出力
    printReport(scrapedItems, entries);

    if (dryRun) {
      console.log(
        `\n[DRY RUN] 本番実行すると ${entries.length} 件のメニューデータが生成されます`
      );
      console.log("本番実行: npx tsx scripts/scrape/mos.ts\n");
      await browser.close();
      return;
    }

    // 承認を求める
    const answer = await prompt(
      `\n${entries.length} 件のデータファイルを生成しますか？ (y/n): `
    );

    if (answer.toLowerCase() !== "y") {
      console.log("キャンセルしました");
      await browser.close();
      return;
    }

    // データファイル生成
    const dataFilePath = path.join(
      process.cwd(),
      "scripts",
      "data",
      "mos-menus.ts"
    );
    const fileContent = generateDataFile(entries);
    fs.writeFileSync(dataFilePath, fileContent, "utf-8");

    console.log(`\n✅ データファイルを生成しました: ${dataFilePath}`);
    console.log(`   ${entries.length} 件のメニューデータ`);
    console.log("\n次のステップ:");
    console.log("  1. 生成されたファイルを確認: scripts/data/mos-menus.ts");
    console.log("  2. npm run seed:mos で DB投入");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
