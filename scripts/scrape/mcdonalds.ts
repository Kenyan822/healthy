/**
 * マクドナルド スクレイパー（価格 + 栄養成分 フル生成）
 *
 * データソース（2026-07調査）:
 * - 価格: /menu/{category}/ ページ埋め込みのdataLayer JSON（税込・通常店舗価格）
 * - 栄養: /products/{id}/ 商品ページのSSR済みHTML（.pdp-card-item のラベル/値ペア）
 * ※特殊立地店舗・デリバリーは価格が異なる（公式注記）
 *
 * 生成先: scripts/data/mcdonalds-menus.ts → DB投入は npm run seed:mcdonalds
 *
 * 実行: npx tsx scripts/scrape/mcdonalds.ts [--dry-run]
 *   --dry-run: 商品5件のみ栄養取得してレポート表示（ファイル生成なし）
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import * as readline from "readline";

const CONFIG = {
  baseUrl: "https://www.mcdonalds.co.jp",
  rateLimit: 3000,
  batchSize: 10,
  batchDelay: 10000,
  maxRetries: 3,
  timeout: 30000,
};

// 単品系カテゴリのみ（セット・ハッピーセット・マックカフェは除外）
// 朝マック限定商品にtiming=breakfastを付けるため、morningを先に処理する
// （重複商品は先勝ちで、朝マック商品はバーガー一覧にも出現するため）
const MENU_PAGES = [
  { url: "/menu/morning/", category: "朝マック", slug: "morning", timing: "breakfast" },
  { url: "/menu/burger/", category: "バーガー", slug: "burger", timing: "anytime" },
  { url: "/menu/side/", category: "サイドメニュー", slug: "side", timing: "anytime" },
  { url: "/menu/drink/", category: "ドリンク", slug: "drink", timing: "anytime" },
  { url: "/menu/dessert/", category: "デザート・スイーツ", slug: "dessert", timing: "anytime" },
];

interface ListProduct {
  productId: string;
  name: string;
  price: number | null;
  category: string;
  categorySlug: string;
  timing: string;
}

interface McdonaldsMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number | null;
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

async function fetchHtml(url: string): Promise<string> {
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: CONFIG.timeout,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
      });
      return response.data as string;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 403 || status === 404) throw error;
        if (status === 429) await sleep(30000);
      }
      if (attempt === CONFIG.maxRetries) throw error;
      await sleep(Math.pow(2, attempt) * 2000);
    }
  }
  throw new Error(`Failed to fetch ${url}`);
}

/**
 * 一覧ページのdataLayer JSONから商品(id/name/category/price)を抽出。
 * dataLayerのオブジェクトは `"id":"8640","name":"...","price":250` 形式で、
 * undefined を含むためJSONとしてそのままパースできない箇所は補正する。
 */
function extractProducts(
  html: string,
  page: (typeof MENU_PAGES)[number]
): ListProduct[] {
  const products: ListProduct[] = [];
  const seen = new Set<string>();

  const objectPattern = /\{"id":"(\d+)"[^{}]*?"position":\d+\}/g;
  let match: RegExpExecArray | null;

  while ((match = objectPattern.exec(html)) !== null) {
    const jsonText = match[0].replace(/:undefined/g, ":null");
    try {
      const obj = JSON.parse(jsonText) as {
        id: string;
        name: string;
        is_set?: string;
        category?: string;
        price?: number | null;
      };

      if (obj.is_set === "yes") continue; // セット商品は除外
      if (seen.has(obj.id)) continue;
      seen.add(obj.id);

      products.push({
        productId: obj.id,
        name: obj.name,
        price: typeof obj.price === "number" ? obj.price : null,
        category: page.category,
        categorySlug: page.slug,
        timing: page.timing,
      });
    } catch {
      // パース不能なオブジェクトはスキップ
    }
  }

  return products;
}

/**
 * 商品ページから栄養成分を取得。
 * .pdp-card-item 内の「ラベルspan → 値span」ペアを先勝ちで読む
 * （同一ラベルの2個目以降はセット用のため無視）。
 */
function parseNutrition(html: string): {
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
} | null {
  const $ = cheerio.load(html);
  const values = new Map<string, number>();

  $(".pdp-card-item").each((_i, el) => {
    const $el = $(el);
    const label = $el.find("span").first().text().trim();
    const valueText = $el.find(".border-top span").first().text().trim();
    if (!label || !valueText || values.has(label)) return;

    const num = parseFloat(valueText.replace(/,/g, "").match(/([0-9.]+)/)?.[1] ?? "");
    if (!isNaN(num)) values.set(label, num);
  });

  if (!values.has("エネルギー")) return null;

  return {
    calories: values.get("エネルギー") ?? 0,
    protein: values.get("たんぱく質") ?? 0,
    fat: values.get("脂質") ?? 0,
    carb: values.get("炭水化物") ?? 0,
    sodium: values.get("食塩相当量") ?? 0,
  };
}

function generateDataFile(items: McdonaldsMenuItem[]): string {
  const date = new Date().toISOString().split("T")[0];
  const lines: string[] = [
    `// マクドナルドメニューデータ（${date} 公式サイトスクレイピングより）`,
    `// 自動生成ファイル - scripts/scrape/mcdonalds.ts で生成`,
    `// 価格は通常店舗の税込価格（特殊立地店舗・デリバリーは異なる）`,
    ``,
    `export interface McdonaldsMenuItem {`,
    `  menu_id: string;`,
    `  menu_name: string;`,
    `  category: string;`,
    `  price: number | null;`,
    `  calories: number;`,
    `  protein: number;`,
    `  fat: number;`,
    `  carb: number;`,
    `  sodium: number;`,
    `  allergens: string[];`,
    `  timing: string;`,
    `  is_seasonal: boolean;`,
    `  is_limited: boolean;`,
    `}`,
    ``,
    `export const mcdonaldsMenuData: McdonaldsMenuItem[] = ${JSON.stringify(items, null, 2)};`,
    ``,
  ];
  return lines.join("\n");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (dryRun) {
    console.log("[DRY RUN] 商品5件のみ栄養取得してレポート表示します\n");
  }

  // 1. 一覧ページから商品リストを収集
  console.log("=== 一覧ページから商品情報を取得 ===\n");
  const allProducts: ListProduct[] = [];
  const globalSeen = new Set<string>();

  for (const page of MENU_PAGES) {
    const url = `${CONFIG.baseUrl}${page.url}`;
    console.log(`Scanning: ${url}`);
    try {
      const html = await fetchHtml(url);
      const products = extractProducts(html, page).filter(
        (p) => !globalSeen.has(p.productId)
      );
      products.forEach((p) => globalSeen.add(p.productId));
      allProducts.push(...products);
      console.log(`  → ${products.length} products`);
    } catch (error) {
      console.error(`  Error: ${error}`);
    }
    await sleep(CONFIG.rateLimit);
  }

  console.log(`\nTotal products: ${allProducts.length}`);
  if (allProducts.length === 0) {
    console.error("No products found. Exiting.");
    process.exit(1);
  }

  // 2. 商品ページから栄養成分を取得
  const targets = dryRun ? allProducts.slice(0, 5) : allProducts;
  console.log(`\n=== 商品ページから栄養成分を取得 (${targets.length}件) ===\n`);

  const items: McdonaldsMenuItem[] = [];
  let noNutrition = 0;

  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    process.stdout.write(
      `\r[${i + 1}/${targets.length}] ${p.name.slice(0, 25).padEnd(25)}`
    );

    let nutrition = null;
    try {
      const html = await fetchHtml(`${CONFIG.baseUrl}/products/${p.productId}/`);
      nutrition = parseNutrition(html);
    } catch {
      console.warn(`\n  Failed: /products/${p.productId}/ (${p.name})`);
    }

    if (!nutrition) {
      noNutrition++;
      console.warn(`\n  No nutrition: ${p.name}`);
    }

    items.push({
      menu_id: `mcdonalds-${p.categorySlug}-p${p.productId}`,
      menu_name: p.name,
      category: p.category,
      price: p.price,
      calories: nutrition?.calories ?? 0,
      protein: nutrition?.protein ?? 0,
      fat: nutrition?.fat ?? 0,
      carb: nutrition?.carb ?? 0,
      sodium: nutrition?.sodium ?? 0,
      allergens: [],
      timing: p.timing,
      is_seasonal: false,
      is_limited: false,
    });

    if ((i + 1) % CONFIG.batchSize === 0) {
      await sleep(CONFIG.batchDelay);
    } else {
      await sleep(CONFIG.rateLimit);
    }
  }

  // 3. レポート
  console.log("\n\n========================================");
  console.log(`Total: ${items.length}件 / 栄養取得失敗: ${noNutrition}件`);
  const byCat = new Map<string, number>();
  items.forEach((m) => byCat.set(m.category, (byCat.get(m.category) ?? 0) + 1));
  for (const [cat, count] of byCat) console.log(`  ${cat}: ${count}件`);
  console.log("========================================\n");

  if (dryRun) {
    console.log("サンプル:", JSON.stringify(items.slice(0, 3), null, 2));
    console.log("\n[DRY RUN] 本番実行でデータファイルを生成します");
    return;
  }

  const answer = await prompt(
    `${items.length} 件のデータファイルを生成しますか？ (y/n): `
  );
  if (answer.toLowerCase() !== "y") {
    console.log("キャンセルしました");
    return;
  }

  const filePath = path.join(__dirname, "../data/mcdonalds-menus.ts");
  // 安全ガード: 取得件数が既存の半分未満なら上書き中止（サイト構造変更による消失防止）
  if (fs.existsSync(filePath)) {
    const existingCount = (
      fs.readFileSync(filePath, "utf-8").match(/"menu_id"/g) || []
    ).length;
    if (items.length < existingCount / 2) {
      console.error(
        `⛔ 中止: 取得${items.length}件は既存${existingCount}件の半分未満です。サイト構造変更の可能性があります。`
      );
      process.exit(1);
    }
  }
  fs.writeFileSync(filePath, generateDataFile(items), "utf-8");
  console.log(`\n${items.length} 件を ${filePath} に生成しました`);
  console.log("DBに反映するには npm run seed:mcdonalds を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
