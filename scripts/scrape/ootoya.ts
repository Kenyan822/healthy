/**
 * 大戸屋メニュースクレイパー（価格 + 栄養成分 + アレルゲン）
 *
 * 公式サイトからメニューデータを取得し、scripts/data/ootoya-menus.ts を生成する。
 *
 * 実行: npx tsx scripts/scrape/ootoya.ts [--dry-run]
 *   --dry-run: 詳細ページ5件のみ取得してレポート表示（ファイル生成なし）
 */

import axios, { AxiosError } from "axios";
import { load, type CheerioAPI, type Cheerio, type Element } from "cheerio";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ============================
// 設定
// ============================

const CONFIG = {
  chainId: "ootoya",
  storeId: "27186", // 池袋東口店
  baseUrl: "https://www.ootoya.com",
  rateLimit: 3000, // 3秒間隔
  batchSize: 10, // 10件ごとに長めの待機
  batchDelay: 15000, // バッチ間15秒
  maxRetries: 3,
  timeout: 30000,
};

// 除外カテゴリ
const EXCLUDED_CATEGORIES = new Set(["弁当", "惣菜", "ドリンク"]);

// カテゴリ → slug マッピング
const CATEGORY_SLUG_MAP: Record<string, string> = {
  定食: "teishoku",
  朝食: "breakfast",
  期間限定: "limited",
  黒酢あん: "kurozu",
  小鉢: "kobachi",
  おかず: "okazu",
  ごはんのおとも: "gohan",
  キッズメニュー: "kids",
  デザート: "dessert",
  麺セット: "men",
};

// ============================
// 型定義
// ============================

interface NutritionData {
  calories: number; // エネルギー (kcal)
  protein: number; // たんぱく質 (g)
  fat: number; // 脂質 (g)
  sugar: number; // 糖質 (g)
  fiber: number; // 食物繊維 (g)
  sodium: number; // 食塩相当量 (g)
}

interface ScrapedItem {
  name: string;
  category: string;
  detailUrl: string;
  itemId: string;
  imageUrl: string;
  teishokuPrice: number | null;
  tanpinPrice: number | null;
  nutrition: {
    gohan: NutritionData | null;
    gokokuGohan: NutritionData | null;
    tanpin: NutritionData | null;
  };
  allergens: string[];
}

interface OotoyaMenuItem {
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
  Omit<ScrapedItem, "nutrition" | "allergens">[]
> {
  const url = `${CONFIG.baseUrl}/menu_list/index/${CONFIG.storeId}`;
  const $ = await fetchWithRetry(url);

  const items: Omit<ScrapedItem, "nutrition" | "allergens">[] = [];

  // タブボタンからタブID → カテゴリ名のマッピングを作成
  // h3.c-heading-no2 がないタブパネル（麺セット、ドリンク等）のフォールバック用
  const tabCategoryMap: Record<string, string> = {};
  $(".c-tab-01__control button[role='tab']").each((_i, el) => {
    const panelId = $(el).attr("aria-controls") || "";
    const tabText = $(el).text().trim();
    if (panelId && tabText) {
      tabCategoryMap[panelId] = tabText;
    }
  });

  // 各タブパネルを走査
  $(".c-tab-01__content[id^='tabpanel']").each((_i, panel) => {
    const $panel = $(panel);
    const panelId = $panel.attr("id") || "";
    const fallbackCategory = tabCategoryMap[panelId] || "";

    // パネル内のカテゴリ見出しとカードを走査
    let currentCategory = "";

    $panel.find("h3.c-heading-no2, a.c-card-01").each((_j, el) => {
      const $el = $(el);

      // カテゴリ見出し
      if ($el.is("h3.c-heading-no2")) {
        currentCategory = $el.text().trim();
        return;
      }

      // h3がないタブパネルの場合、タブボタンのテキストを使用
      const category = currentCategory || fallbackCategory;

      // 除外カテゴリ
      if (EXCLUDED_CATEGORIES.has(category)) return;
      // カテゴリ未設定
      if (!category) return;

      // メニューカード
      const href = $el.attr("href") || "";
      const name = $el.find("h3.c-card-01__title").text().trim();

      // 価格抽出: "1,230" のテキスト部分を取得
      const priceNumber = $el.find(".c-card-01__price").clone().children().remove().end().text().trim();
      const teishokuPrice = priceNumber ? parseInt(priceNumber.replace(/,/g, ""), 10) : null;

      const tanpinNumber = $el.find(".c-card-01__single-price").clone().children().remove().end().text().trim();
      const tanpinPrice = tanpinNumber ? parseInt(tanpinNumber.replace(/,/g, ""), 10) : null;

      // アイテムID抽出
      const match = href.match(/\/view\/\d+\/(\d+)/);
      const itemId = match ? match[1] : "";

      // 画像URL
      const imgSrc = $el.find("img").attr("src") || "";
      const imageUrl = imgSrc.startsWith("http")
        ? imgSrc
        : `${CONFIG.baseUrl}${imgSrc}`;

      if (name && itemId) {
        items.push({
          name,
          category,
          detailUrl: href,
          itemId,
          imageUrl,
          teishokuPrice,
          tanpinPrice,
        });
      }
    });
  });

  return items;
}

// ============================
// 詳細ページスクレイピング
// ============================

function parseNutritionTable($: CheerioAPI, tabPanel: Cheerio<Element>): NutritionData | null {
  const table = tabPanel.find("table.c-table-01");
  if (table.length === 0) return null;

  const data: NutritionData = {
    calories: 0,
    protein: 0,
    fat: 0,
    sugar: 0,
    fiber: 0,
    sodium: 0,
  };

  table.find("tr").each((_i, tr) => {
    const th = $(tr).find("th").text().trim();
    const tdText = $(tr).find("td").text().trim();
    const value = parseFloat(tdText.replace(/,/g, ""));

    if (isNaN(value)) return;

    if (th.includes("エネルギー")) data.calories = value;
    else if (th.includes("たんぱく質")) data.protein = value;
    else if (th === "脂質") data.fat = value;
    else if (th === "糖質") data.sugar = value;
    else if (th.includes("食物繊維")) data.fiber = value;
    else if (th.includes("食塩相当量")) data.sodium = value;
  });

  return data;
}

async function scrapeDetailPage(
  url: string
): Promise<{
  nutrition: ScrapedItem["nutrition"];
  allergens: string[];
  teishokuPrice: number | null;
  tanpinPrice: number | null;
}> {
  const $ = await fetchWithRetry(url);

  // 価格（詳細ページの方が信頼性が高い）
  let teishokuPrice: number | null = null;
  let tanpinPrice: number | null = null;

  $(".c-list-price-01__item").each((_i, el) => {
    const title = $(el).find(".c-list-price-01__title").text().trim();
    const numberText = $(el)
      .find(".c-list-price-01__detail-number")
      .text()
      .trim();
    const price = parseInt(numberText.replace(/,/g, ""), 10);

    if (isNaN(price)) return;

    if (title === "定食" || title === "") {
      teishokuPrice = price;
    } else if (title === "単品") {
      tanpinPrice = price;
    } else if (!teishokuPrice) {
      // 「定食」ラベルがない場合（小鉢等）
      teishokuPrice = price;
    }
  });

  // 栄養成分（タブ形式）
  const nutrition: ScrapedItem["nutrition"] = {
    gohan: null,
    gokokuGohan: null,
    tanpin: null,
  };

  const tabs = $(".c-tab-01__control button[role='tab']");
  const panels = $(".c-tab-01__content");

  if (tabs.length > 0) {
    // タブあり → タブテキストで振り分け（定食系）
    tabs.each((i, tab) => {
      const tabText = $(tab).text().trim();
      const panel = panels.eq(i);

      if (tabText === "ご飯") {
        nutrition.gohan = parseNutritionTable($, panel);
      } else if (tabText === "五穀ご飯") {
        nutrition.gokokuGohan = parseNutritionTable($, panel);
      } else if (tabText === "単品") {
        nutrition.tanpin = parseNutritionTable($, panel);
      }
    });
  } else if (panels.length > 0) {
    // タブなし・パネルあり → 単一栄養テーブル（小鉢・おかず等）
    nutrition.tanpin = parseNutritionTable($, panels.eq(0));
  } else {
    // パネルもなし → c-box-information-02 にフォールバック
    const singleTable = $(".c-box-information-02 table.c-table-01");
    if (singleTable.length > 0) {
      nutrition.tanpin = parseNutritionTable($, $(".c-box-information-02"));
    }
  }

  // アレルゲン
  const allergens: string[] = [];
  $(".c-box-menu-01__allergy .c-tag-allergy-01").each((_i, el) => {
    const text = $(el).text().trim();
    if (text) allergens.push(text);
  });

  return { nutrition, allergens, teishokuPrice, tanpinPrice };
}

// ============================
// データ変換
// ============================

function transformToMenuEntries(items: ScrapedItem[]): OotoyaMenuItem[] {
  const entries: OotoyaMenuItem[] = [];
  const categoryCounters: Record<string, number> = {};

  for (const item of items) {
    const slug = CATEGORY_SLUG_MAP[item.category] || "other";
    if (!categoryCounters[slug]) categoryCounters[slug] = 0;
    categoryCounters[slug]++;
    const seq = String(categoryCounters[slug]).padStart(3, "0");
    const baseId = `ootoya-${slug}-${seq}`;

    const timing = item.category === "朝食" ? "breakfast" : "anytime";
    const isSeasonal = item.category === "期間限定";
    const isLimited = item.category === "期間限定";

    const hasMultipleVariants =
      item.nutrition.gohan || item.nutrition.gokokuGohan;

    if (hasMultipleVariants) {
      // 3バリアント展開
      if (item.nutrition.gohan) {
        const n = item.nutrition.gohan;
        entries.push({
          menu_id: `${baseId}a`,
          menu_name: `${item.name}（ご飯）`,
          category: item.category,
          price: item.teishokuPrice || 0,
          calories: n.calories,
          protein: n.protein,
          fat: n.fat,
          carb: Math.round((n.sugar + n.fiber) * 10) / 10,
          fiber: n.fiber,
          sodium: n.sodium,
          sugar: n.sugar,
          allergens: [...item.allergens],
          timing,
          is_seasonal: isSeasonal,
          is_limited: isLimited,
        });
      }

      if (item.nutrition.gokokuGohan) {
        const n = item.nutrition.gokokuGohan;
        // 五穀ご飯にはごま・大麦が含まれる
        const gokokuAllergens = [...item.allergens];
        if (!gokokuAllergens.includes("ごま")) gokokuAllergens.push("ごま");
        entries.push({
          menu_id: `${baseId}b`,
          menu_name: `${item.name}（五穀ご飯）`,
          category: item.category,
          price: item.teishokuPrice || 0,
          calories: n.calories,
          protein: n.protein,
          fat: n.fat,
          carb: Math.round((n.sugar + n.fiber) * 10) / 10,
          fiber: n.fiber,
          sodium: n.sodium,
          sugar: n.sugar,
          allergens: gokokuAllergens,
          timing,
          is_seasonal: isSeasonal,
          is_limited: isLimited,
        });
      }

      if (item.nutrition.tanpin) {
        const n = item.nutrition.tanpin;
        entries.push({
          menu_id: `${baseId}c`,
          menu_name: `${item.name}（単品）`,
          category: item.category,
          price: item.tanpinPrice || item.teishokuPrice || 0,
          calories: n.calories,
          protein: n.protein,
          fat: n.fat,
          carb: Math.round((n.sugar + n.fiber) * 10) / 10,
          fiber: n.fiber,
          sodium: n.sodium,
          sugar: n.sugar,
          allergens: [...item.allergens],
          timing,
          is_seasonal: isSeasonal,
          is_limited: isLimited,
        });
      }
    } else if (item.nutrition.tanpin) {
      // 単一バリアント
      const n = item.nutrition.tanpin;
      entries.push({
        menu_id: baseId,
        menu_name: item.name,
        category: item.category,
        price: item.teishokuPrice || item.tanpinPrice || 0,
        calories: n.calories,
        protein: n.protein,
        fat: n.fat,
        carb: Math.round((n.sugar + n.fiber) * 10) / 10,
        fiber: n.fiber,
        sodium: n.sodium,
        sugar: n.sugar,
        allergens: [...item.allergens],
        timing,
        is_seasonal: isSeasonal,
        is_limited: isLimited,
      });
    } else {
      // 栄養データなし（価格のみ）
      entries.push({
        menu_id: baseId,
        menu_name: item.name,
        category: item.category,
        price: item.teishokuPrice || item.tanpinPrice || 0,
        calories: 0,
        protein: 0,
        fat: 0,
        carb: 0,
        fiber: 0,
        sodium: 0,
        sugar: 0,
        allergens: [...item.allergens],
        timing,
        is_seasonal: isSeasonal,
        is_limited: isLimited,
      });
      console.warn(`  ⚠ 栄養データなし: ${item.name}`);
    }
  }

  return entries;
}

// ============================
// データファイル生成
// ============================

function generateDataFile(entries: OotoyaMenuItem[]): string {
  const date = new Date().toISOString().split("T")[0];
  const dataStr = JSON.stringify(entries, null, 2);

  return `// 大戸屋メニューデータ（${date}版 公式サイトスクレイピングより）
// 基準店舗: 大戸屋ごはん処 池袋東口店 (store_id: ${CONFIG.storeId})
// 自動生成ファイル - scripts/scrape/ootoya.ts で生成

export interface OotoyaMenuItem {
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

export const ootoyaMenuData: OotoyaMenuItem[] = ${dataStr};
`;
}

// ============================
// レポート出力
// ============================

function printReport(items: ScrapedItem[], entries: OotoyaMenuItem[]): void {
  console.log("\n========================================");
  console.log("        大戸屋 スクレイピングレポート");
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
  const withNutrition = items.filter(
    (i) => i.nutrition.gohan || i.nutrition.gokokuGohan || i.nutrition.tanpin
  );
  const withoutNutrition = items.filter(
    (i) => !i.nutrition.gohan && !i.nutrition.gokokuGohan && !i.nutrition.tanpin
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

  // バリアント別
  const variantCounts = {
    gohan: entries.filter((e) => e.menu_name.includes("（ご飯）")).length,
    gokoku: entries.filter((e) => e.menu_name.includes("（五穀ご飯）")).length,
    tanpin: entries.filter((e) => e.menu_name.includes("（単品）")).length,
    single: entries.filter(
      (e) =>
        !e.menu_name.includes("（ご飯）") &&
        !e.menu_name.includes("（五穀ご飯）") &&
        !e.menu_name.includes("（単品）")
    ).length,
  };
  console.log(`   - ご飯: ${variantCounts.gohan}件`);
  console.log(`   - 五穀ご飯: ${variantCounts.gokoku}件`);
  console.log(`   - 単品: ${variantCounts.tanpin}件`);
  console.log(`   - 単一: ${variantCounts.single}件`);

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

  console.log("=== 大戸屋メニュースクレイパー ===");
  console.log(`基準店舗: 池袋東口店 (${CONFIG.storeId})`);

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
        // 詳細ページの価格を優先
        teishokuPrice: detail.teishokuPrice ?? item.teishokuPrice,
        tanpinPrice: detail.tanpinPrice ?? item.tanpinPrice,
        nutrition: detail.nutrition,
        allergens: detail.allergens,
      });

      processedCount++;
      console.log(
        `  [${processedCount}/${maxItems}] ${item.name} ✓`
      );

      // レート制限
      if (processedCount < maxItems) {
        await sleep(CONFIG.rateLimit);
      }

      // バッチ休止
      if (processedCount % CONFIG.batchSize === 0 && processedCount < maxItems) {
        console.log(
          `  バッチ休止 (${CONFIG.batchDelay / 1000}s)...`
        );
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
    console.log(
      "本番実行: npx tsx scripts/scrape/ootoya.ts\n"
    );
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
    "ootoya-menus.ts"
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
  console.log("  1. 生成されたファイルを確認: scripts/data/ootoya-menus.ts");
  console.log("  2. DB投入: npm run seed:ootoya");
  console.log("  3. git commit で バージョン管理");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
