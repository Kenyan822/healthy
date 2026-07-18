/**
 * ローソン スクレイパー（栄養+価格 フル生成・ローリング型）
 *
 * コンビニは毎週火曜に商品が入れ替わり終売ページは404になるため、
 * 実行のたびに現行ラインナップ全体を再取得してデータファイルを丸ごと生成する。
 * menu_id は公式の商品ID(URL内の数字)由来なので実行間で安定する。
 *
 * データソース(2026-07実地調査):
 * - カテゴリindex: /recommend/original/{cat}/ に現行商品の詳細リンクが列挙
 * - 詳細: /recommend/original/detail/{id}_{catid}.html (完全SSR、dt/dd栄養表)
 * - 栄養は関東地域基準値(公式注記)。価格は「ローソン標準価格」(FC推奨売価・税込)
 *
 * 実行: npx tsx scripts/scrape/lawson.ts [--dry-run] [--yes]
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as readline from "readline";

const CONFIG = {
  baseUrl: "https://www.lawson.co.jp",
  rateLimit: 3000,
  batchSize: 10,
  batchDelay: 10000,
  maxRetries: 3,
  timeout: 30000,
};

// 食品カテゴリのみ(coffee/liquorは対象外)
const CATEGORIES = [
  { slug: "rice", label: "おにぎり・ご飯" },
  { slug: "bento", label: "お弁当" },
  { slug: "chilledbento", label: "チルド弁当" },
  { slug: "sushi", label: "寿司" },
  { slug: "noodle", label: "麺類" },
  { slug: "pasta", label: "パスタ" },
  { slug: "sandwich", label: "サンドイッチ" },
  { slug: "bakery", label: "パン" },
  { slug: "salad", label: "サラダ" },
  { slug: "fry", label: "ホットスナック" },
  { slug: "gratin", label: "グラタン" },
  { slug: "soup", label: "スープ" },
  { slug: "konamono", label: "粉もの" },
  { slug: "machikadochubo", label: "まちかど厨房" },
  { slug: "dessert", label: "スイーツ" },
  { slug: "gateau", label: "ケーキ" },
  { slug: "kenkosnack", label: "健康スナック" },
  { slug: "gentei", label: "限定商品" },
];

interface LawsonMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number | null;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number | null;
  allergens: string[];
  timing: string;
  is_seasonal: boolean;
  is_limited: boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function prompt(question: string): Promise<string> {
  if (process.argv.includes("--yes")) return Promise.resolve("y");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a); }));
}

async function fetchHtml(url: string): Promise<string> {
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      const res = await axios.get(url, {
        timeout: CONFIG.timeout,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html",
        },
      });
      return res.data as string;
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
  throw new Error(`Failed: ${url}`);
}

function num(text: string | undefined): number | null {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/([0-9.]+)/);
  return m ? parseFloat(m[1]) : null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // 1. カテゴリindexから現行商品の詳細URLを収集(先勝ちでカテゴリ確定)
  console.log("=== カテゴリindexから商品リンク収集 ===");
  const products = new Map<string, { catId: string; category: string }>();
  for (const cat of CATEGORIES) {
    try {
      const html = await fetchHtml(`${CONFIG.baseUrl}/recommend/original/${cat.slug}/`);
      const links = [...html.matchAll(/\/recommend\/original\/detail\/(\d+)_(\d+)\.html/g)];
      let added = 0;
      for (const m of links) {
        if (!products.has(m[1])) {
          products.set(m[1], { catId: m[2], category: cat.label });
          added++;
        }
      }
      console.log(`${cat.slug}: +${added}`);
    } catch (e) {
      console.error(`${cat.slug}: index取得失敗 ${e}`);
    }
    await sleep(CONFIG.rateLimit);
  }
  console.log(`合計 ${products.size} 商品`);
  if (products.size === 0) process.exit(1);

  // 2. 詳細ページから栄養・価格を取得
  const targets = [...products.entries()].slice(0, dryRun ? 5 : undefined);
  const items: LawsonMenuItem[] = [];
  let failed = 0;
  for (let i = 0; i < targets.length; i++) {
    const [id, info] = targets[i];
    process.stdout.write(`\r[${i + 1}/${targets.length}] ${id}`);
    try {
      const html = await fetchHtml(
        `${CONFIG.baseUrl}/recommend/original/detail/${id}_${info.catId}.html`
      );
      const name = html.match(/<h2[^>]*>([^<]+)<\/h2>/)?.[1]?.trim().replace(/\s+/g, " ");
      const price = num(html.match(/ローソン標準価格<\/dt>\s*<dd><span>([\d,]+)<\/span>/)?.[1]);
      const pairs = new Map(
        [...html.matchAll(/<dt[^>]*>([^<]+)<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/g)].map((m) => [
          m[1].trim(),
          m[2].trim(),
        ])
      );
      const calories = num(pairs.get("熱量"));
      if (!name || calories == null) {
        failed++;
        continue; // 栄養表なし(ギフト等)はスキップ
      }
      items.push({
        menu_id: `lawson-p${id}`,
        menu_name: name,
        category: info.category,
        price,
        calories,
        protein: num(pairs.get("たんぱく質")) ?? 0,
        fat: num(pairs.get("脂質")) ?? 0,
        carb: num(pairs.get("炭水化物")) ?? 0,
        sodium: num(pairs.get("食塩相当量")),
        allergens: [],
        timing: "anytime",
        is_seasonal: false,
        is_limited: info.category === "限定商品",
      });
    } catch {
      failed++;
    }
    if ((i + 1) % CONFIG.batchSize === 0) await sleep(CONFIG.batchDelay);
    else await sleep(CONFIG.rateLimit);
  }
  console.log(`\n取得 ${items.length}件 / 失敗・栄養なし ${failed}件`);

  if (dryRun) {
    console.log(JSON.stringify(items.slice(0, 3), null, 2));
    return;
  }

  // 3. 安全ガード(取得数が既存の半分未満なら中止)
  const filePath = path.join(__dirname, "../data/lawson-menus.ts");
  if (fs.existsSync(filePath)) {
    const existing = (fs.readFileSync(filePath, "utf-8").match(/"menu_id"/g) || []).length;
    if (items.length < existing / 2) {
      console.error(`⛔ 中止: 取得${items.length}件は既存${existing}件の半分未満`);
      process.exit(1);
    }
  }

  const answer = await prompt(`${items.length}件のデータファイルを生成しますか？ (y/n): `);
  if (answer.toLowerCase() !== "y") return;

  const date = new Date().toISOString().split("T")[0];
  const content = `// ローソンメニューデータ（${date} 公式サイトより自動生成・ローリング型）
// 生成: scripts/scrape/lawson.ts / 栄養は関東地域基準値、価格はローソン標準価格(税込)
// sodiumは食塩相当量(g)

export interface LawsonMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number | null;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number | null;
  allergens: string[];
  timing: string;
  is_seasonal: boolean;
  is_limited: boolean;
}

export const lawsonMenuData: LawsonMenuItem[] = ${JSON.stringify(items, null, 2)};
`;
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`${items.length}件を ${filePath} に生成しました`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
