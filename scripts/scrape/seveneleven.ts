/**
 * セブン-イレブン スクレイパー（栄養+価格 フル生成・ローリング型）
 *
 * コンビニは商品の入れ替わりが速く終売ページは消えるため、
 * 実行のたびに現行ラインナップ全体を再取得してデータファイルを丸ごと生成する。
 *
 * データソース(2026-07実地調査):
 * - カテゴリ: /products/a/{cat}/kanto/ (地域差があるため関東を基準に統一。
 *   ローソンの栄養値も関東基準なのでサイト全体で整合)
 * - 詳細: /products/a/item/{商品ID}/ (完全SSR)。<h1>商品名、item_priceに税込価格、
 *   栄養は「熱量：343kcal、たんぱく質：7.1g、…」の1行テキスト
 * - Imperva WAF があるためブラウザUA+3秒間隔は必須。403連発時は中止して時間を置く
 *
 * 実行: npx tsx scripts/scrape/seveneleven.ts [--dry-run] [--yes]
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as readline from "readline";

const CONFIG = {
  baseUrl: "https://www.sej.co.jp",
  rateLimit: 3000,
  batchSize: 10,
  batchDelay: 10000,
  maxRetries: 3,
  timeout: 30000,
};

// 食品カテゴリのみ(飲料・日用品は対象外)
const CATEGORIES = [
  { slug: "onigiri", label: "おにぎり" },
  { slug: "bento", label: "お弁当" },
  { slug: "sushi", label: "寿司" },
  { slug: "sandwich", label: "サンドイッチ" },
  { slug: "bread", label: "パン" },
  { slug: "men", label: "麺類" },
  { slug: "pasta", label: "パスタ" },
  { slug: "salad", label: "サラダ" },
  { slug: "dailydish", label: "惣菜" },
  { slug: "hotsnack", label: "ホットスナック" },
  { slug: "oden", label: "おでん" },
  { slug: "chukaman", label: "中華まん" },
  { slug: "sweets", label: "スイーツ" },
];

interface SevenMenuItem {
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
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Accept: "text/html",
          "Accept-Language": "ja",
        },
      });
      return res.data as string;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) throw error;
        // WAFブロック(403)は少し長めに待ってリトライ
        if (status === 403 || status === 429) await sleep(30000);
      }
      if (attempt === CONFIG.maxRetries) throw error;
      await sleep(Math.pow(2, attempt) * 2000);
    }
  }
  throw new Error(`Failed: ${url}`);
}

function num(text: string | undefined | null): number | null {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/([0-9.]+)/);
  return m ? parseFloat(m[1]) : null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // 1. 関東の各カテゴリページから商品IDを収集(先勝ちでカテゴリ確定)
  console.log("=== カテゴリページ(関東)から商品ID収集 ===");
  const products = new Map<string, string>(); // id -> category label
  for (const cat of CATEGORIES) {
    try {
      let html = await fetchHtml(`${CONFIG.baseUrl}/products/a/${cat.slug}/kanto/`);
      let ids = [...html.matchAll(/\/products\/a\/item\/(\d+)\//g)].map((m) => m[1]);
      // 地域ページが空のカテゴリ(全国一律など)は全国版にフォールバック
      if (ids.length === 0) {
        await sleep(CONFIG.rateLimit);
        html = await fetchHtml(`${CONFIG.baseUrl}/products/a/${cat.slug}/`);
        ids = [...html.matchAll(/\/products\/a\/item\/(\d+)\//g)].map((m) => m[1]);
      }
      let added = 0;
      for (const id of ids) {
        if (!products.has(id)) {
          products.set(id, cat.label);
          added++;
        }
      }
      console.log(`${cat.slug}: +${added}`);
    } catch (e) {
      console.error(`${cat.slug}: カテゴリ取得失敗 ${e}`);
    }
    await sleep(CONFIG.rateLimit);
  }
  console.log(`合計 ${products.size} 商品`);
  if (products.size === 0) process.exit(1);

  // 2. 詳細ページから栄養・価格を取得
  const targets = [...products.entries()].slice(0, dryRun ? 5 : undefined);
  const items: SevenMenuItem[] = [];
  let failed = 0;
  for (let i = 0; i < targets.length; i++) {
    const [id, category] = targets[i];
    process.stdout.write(`\r[${i + 1}/${targets.length}] ${id}`);
    try {
      const html = await fetchHtml(`${CONFIG.baseUrl}/products/a/item/${id}/`);
      const name = html
        .match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]
        ?.replace(/<[^>]+>/g, "")
        .trim()
        .replace(/\s+/g, " ");
      // 「255円（税込275.40円）」→ 税込を四捨五入で整数化(他チェーンと表記を統一)
      const priceRaw = num(html.match(/税込([\d,.]+)円/)?.[1]);
      const price = priceRaw != null ? Math.round(priceRaw) : null;
      // 「熱量：343kcal、たんぱく質：7.1g、脂質：11.1g、炭水化物：54.8g（糖質：52.4g、食物繊維：2.4g）、食塩相当量：1.5g」
      const nutText = html.match(/熱量[：:][^<]+/)?.[0] ?? "";
      const calories = num(nutText.match(/熱量[：:]\s*([\d,.]+)\s*kcal/)?.[1]);
      if (!name || calories == null) {
        failed++;
        continue; // 栄養未掲載(飲料・雑貨等)はスキップ
      }
      items.push({
        menu_id: `seven-p${id}`,
        menu_name: name,
        category,
        price,
        calories: Math.round(calories),
        protein: num(nutText.match(/たんぱく質[：:]\s*([\d,.]+)\s*g/)?.[1]) ?? 0,
        fat: num(nutText.match(/脂質[：:]\s*([\d,.]+)\s*g/)?.[1]) ?? 0,
        carb: num(nutText.match(/炭水化物[：:]\s*([\d,.]+)\s*g/)?.[1]) ?? 0,
        sodium: num(nutText.match(/食塩相当量[：:]\s*([\d,.]+)\s*g/)?.[1]),
        allergens: [],
        timing: "anytime",
        is_seasonal: false,
        is_limited: false,
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
  const filePath = path.join(__dirname, "../data/seven-menus.ts");
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
  const content = `// セブン-イレブンメニューデータ（${date} 公式サイトより自動生成・ローリング型）
// 生成: scripts/scrape/seveneleven.ts / 関東地域の商品ラインナップ基準、価格は税込を四捨五入
// sodiumは食塩相当量(g)

export interface SevenMenuItem {
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

export const sevenMenuData: SevenMenuItem[] = ${JSON.stringify(items, null, 2)};
`;
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`${items.length}件を ${filePath} に生成しました`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
