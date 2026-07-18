/**
 * ファミリーマート スクレイパー（栄養+価格 フル生成・ローリング型）
 *
 * コンビニは毎週火曜に商品が入れ替わるため、実行のたびに現行ラインナップ
 * 全体を再取得してデータファイルを丸ごと生成する。
 *
 * データソース(2026-07実地調査):
 * - 栄養: 安全・安心ページ /goods/safety/*.html (カテゴリ別・完全SSR)。
 *   商品ごとに <p class="name"> + item_nutritional_info テーブル(5項目) + 商品画像コード
 * - 価格: カテゴリページ /goods/{cat}.html の ly-mod-infoset3 ブロック(税込表記)
 * - 突合: 商品コード(画像ファイル名とURL末尾が共通)優先、なければ正規化名で名寄せ。
 *   価格が見つからない商品は price: null で掲載(栄養情報だけでも価値がある)
 *
 * 実行: npx tsx scripts/scrape/familymart.ts [--dry-run] [--yes]
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as readline from "readline";

const CONFIG = {
  baseUrl: "https://www.family.co.jp",
  rateLimit: 3000,
  maxRetries: 3,
  timeout: 30000,
};

// 栄養ソース: 安全・安心ページ(カテゴリ確定もここ)
const SAFETY_PAGES = [
  { slug: "goods010", category: "おにぎり" },
  { slug: "goods020", category: "お弁当" },
  { slug: "goods030", category: "寿司" },
  { slug: "goods040", category: "サンドイッチ・パン" },
  { slug: "goods060", category: "麺類" },
  { slug: "goods070", category: "パスタ" },
  { slug: "goods080", category: "サラダ" },
  { slug: "goods090", category: "チルド惣菜" },
  { slug: "goods100", category: "スープ・グラタン" },
  { slug: "friedfoods", category: "ホットスナック" },
  { slug: "chukaman", category: "中華まん" },
];

// 価格ソース: 商品カテゴリページ(食品系のみ)
const PRICE_PAGES = [
  "omusubi", "obento", "sushi", "sandwich", "bread", "noodle", "pasta",
  "salad", "sidedishes", "deli", "chilleddaily", "friedfoods", "chukaman",
];

interface FamilymartMenuItem {
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
        if (status === 403 || status === 404) throw error;
        if (status === 429) await sleep(30000);
      }
      if (attempt === CONFIG.maxRetries) throw error;
      await sleep(Math.pow(2, attempt) * 2000);
    }
  }
  throw new Error(`Failed: ${url}`);
}

// 全角スペース・空白差・【地域】プレフィックスを吸収した名寄せキー
function normName(name: string): string {
  return name.normalize("NFKC").replace(/^【[^】]*】/, "").replace(/\s+/g, "");
}

function num(text: string | undefined | null): number | null {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/([0-9.]+)/);
  return m ? parseFloat(m[1]) : null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // 1. カテゴリページから価格マップ構築(商品コード・正規化名の両キー)
  console.log("=== カテゴリページから価格収集 ===");
  const priceByCode = new Map<string, number>();
  const priceByName = new Map<string, number>();
  for (const cat of PRICE_PAGES) {
    try {
      const html = await fetchHtml(`${CONFIG.baseUrl}/goods/${cat}.html`);
      // 商品ブロック: <a href="…/{コード}.html" class="ly-mod-infoset3-link">内に名前と価格(税込)
      const blocks = [
        ...html.matchAll(
          /<a href="[^"]*\/(\d+)\.html"\s+class="ly-mod-infoset3-link">([\s\S]*?)<\/a>/g
        ),
      ];
      let added = 0;
      for (const m of blocks) {
        const code = m[1];
        const block = m[2];
        const name = block.match(/infoset3-name">([^<]+)</)?.[1]?.trim();
        const price = num(block.match(/税込([\d,.]+)円/)?.[1]);
        if (!name || price == null) continue;
        if (code && !priceByCode.has(code)) priceByCode.set(code, Math.round(price));
        if (!priceByName.has(normName(name))) priceByName.set(normName(name), Math.round(price));
        added++;
      }
      console.log(`${cat}: +${added}`);
    } catch (e) {
      console.error(`${cat}: 価格ページ取得失敗 ${e}`);
    }
    await sleep(CONFIG.rateLimit);
  }
  console.log(`価格マップ: コード${priceByCode.size}件 / 名前${priceByName.size}件`);

  // 2. 安全・安心ページから栄養を取得し価格を突合
  console.log("=== 安全・安心ページから栄養収集 ===");
  const items: FamilymartMenuItem[] = [];
  const seenIds = new Set<string>();
  let noPrice = 0;
  for (const page of SAFETY_PAGES) {
    try {
      const html = await fetchHtml(`${CONFIG.baseUrl}/goods/safety/${page.slug}.html`);
      // 商品単位: <li><img src=".../goods/{コード}.jpg" ...> ～ 次の<li>まで
      const chunks = html.split(/<li><img src="\/content\/dam\/family\/goods\//).slice(1);
      let added = 0;
      for (const chunk of chunks) {
        const code = chunk.match(/^(\d+)\.jpg/)?.[1];
        // 定番品は素のテキスト、カテゴリページ掲載品は<a>リンクで名前が包まれる
        const name = chunk
          .match(/<p class="name">\s*(?:<a[^>]*>)?\s*([^<]+)</)?.[1]
          ?.trim()
          .replace(/\s+/g, " ");
        if (!name) continue;
        // 栄養テーブル: 熱量/たんぱく質/脂質/炭水化物/食塩相当量 の5列固定
        const nut = [...chunk.matchAll(/<td class="con_nut">([^<]*)<\/td>/g)].map((m) =>
          num(m[1])
        );
        const calories = nut[0];
        if (calories == null) continue; // 栄養未掲載(発売前など)はスキップ
        const menuId = code ? `familymart-p${code}` : `familymart-n${normName(name)}`;
        if (seenIds.has(menuId)) continue;
        seenIds.add(menuId);
        const price =
          (code ? priceByCode.get(code) : undefined) ??
          priceByName.get(normName(name)) ??
          null;
        if (price == null) noPrice++;
        items.push({
          menu_id: menuId,
          menu_name: name,
          category: page.category,
          price,
          calories: Math.round(calories),
          protein: nut[1] ?? 0,
          fat: nut[2] ?? 0,
          carb: nut[3] ?? 0,
          sodium: nut[4],
          allergens: [],
          timing: "anytime",
          is_seasonal: false,
          is_limited: false,
        });
        added++;
      }
      console.log(`${page.slug}(${page.category}): +${added}`);
    } catch (e) {
      console.error(`${page.slug}: 取得失敗 ${e}`);
    }
    await sleep(CONFIG.rateLimit);
    if (dryRun && items.length >= 10) break;
  }
  console.log(`合計 ${items.length}件(うち価格なし${noPrice}件)`);
  if (items.length === 0) process.exit(1);

  if (dryRun) {
    console.log(JSON.stringify(items.slice(0, 3), null, 2));
    return;
  }

  // 3. 安全ガード(取得数が既存の半分未満なら中止)
  const filePath = path.join(__dirname, "../data/familymart-menus.ts");
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
  const content = `// ファミリーマートメニューデータ（${date} 公式サイトより自動生成・ローリング型）
// 生成: scripts/scrape/familymart.ts / 栄養は安全・安心ページ、価格はカテゴリページ(税込)の突合
// sodiumは食塩相当量(g)。価格が突合できなかった商品は price: null

export interface FamilymartMenuItem {
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

export const familymartMenuData: FamilymartMenuItem[] = ${JSON.stringify(items, null, 2)};
`;
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`${items.length}件を ${filePath} に生成しました`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
