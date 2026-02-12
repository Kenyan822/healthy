/**
 * なか卯メニュー価格スクレイパー
 *
 * 実行: npx tsx scripts/scrape/nakau-prices.ts [--dry-run]
 *
 * カテゴリページから並盛価格をスクレイピングし、
 * データファイル(scripts/data/nakau-menus.ts)のpriceフィールドを更新する。
 * DB投入は seed:nakau で別途実行。
 *
 * なか卯サイトの特徴:
 * - User-Agentヘッダー必須（ないとAccessDenied）
 * - カテゴリページ: /jp/menu/category/{id}.html（店内メニュー）
 * - 詳細ページ不要（カテゴリページに並盛価格あり）
 * - 栄養データはPDFのみ（HTMLなし）
 */

import * as fs from "fs";
import * as path from "path";
import axios, { AxiosError } from "axios";
import { load, type CheerioAPI } from "cheerio";
import { MenuMatcher } from "./common/matcher";
import { nakauMenuData } from "../data/nakau-menus";
import type {
  ScrapedMenuItem,
  ExistingMenu,
  PriceUpdateReport,
} from "./common/types";

// なか卯用設定
const CONFIG = {
  chainId: "nakau",
  baseUrl: "https://www.nakau.co.jp",
  categories: {
    "1": "親子丼",
    "2": "丼・海鮮丼",
    "3": "うどん・そば",
    "5": "お子様",
    "6": "朝食",
    "7": "和風カレー",
    "8": "鶏から丼",
    "9": "おかず",
  } as Record<string, string>,
  rateLimit: 3000,
  timeout: 30000,
  maxRetries: 3,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * レート制限付きfetch（User-Agent必須、リトライ対応）
 */
async function fetchPage(url: string): Promise<CheerioAPI> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      console.log(`  Fetching: ${url} (attempt ${attempt})`);

      const response = await axios.get(url, {
        timeout: CONFIG.timeout,
        headers: {
          "User-Agent": CONFIG.userAgent,
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
        if (axiosError.response?.status === 403) {
          console.error(`  Access Denied: ${url}`);
          throw error; // 403はリトライしない
        } else if (axiosError.response?.status === 404) {
          console.error(`  Not found: ${url}`);
          throw error;
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

/**
 * カテゴリページからメニュー名+並盛価格を取得
 *
 * HTML構造:
 * <li class="c-product_list_item">
 *   <a class="c-product_list_link" href="/jp/menu/detail/in/{id}.html">
 *     <div class="c-product_list_block_text"><p>親子丼</p></div>
 *     <div class="c-product_list_block_price">
 *       <span class="c-product_list_block_price_unit">並盛</span>
 *       <span>450</span>円(税込)
 *     </div>
 *   </a>
 * </li>
 */
async function scrapeCategoryPage(
  categoryId: string,
  categoryName: string
): Promise<ScrapedMenuItem[]> {
  const url = `${CONFIG.baseUrl}/jp/menu/category/${categoryId}.html`;
  const $ = await fetchPage(url);
  const items: ScrapedMenuItem[] = [];

  $("li.c-product_list_item").each((_, el) => {
    const $el = $(el);
    const name = $el.find(".c-product_list_block_text p").text().trim().replace(/\s+/g, " ");
    const size =
      $el.find(".c-product_list_block_price_unit").text().trim() || undefined;

    // 価格: c-product_list_block_price内のspan（price_unitではない方）
    let priceText = "";
    $el.find(".c-product_list_block_price > span").each((_, span) => {
      const $span = $(span);
      if (!$span.hasClass("c-product_list_block_price_unit")) {
        priceText = $span.text().trim();
      }
    });

    const price = parseInt(priceText, 10);

    if (name && !isNaN(price) && price > 0 && price < 10000) {
      items.push({
        name,
        price,
        size,
        category: categoryName,
      });
    }
  });

  return items;
}

/**
 * 全カテゴリをスクレイピング
 */
async function scrapeAll(): Promise<ScrapedMenuItem[]> {
  const allItems: ScrapedMenuItem[] = [];
  const categoryIds = Object.keys(CONFIG.categories);

  console.log(`\n=== なか卯 Price Scraping ===`);
  console.log(`Categories: ${categoryIds.length}\n`);

  for (let i = 0; i < categoryIds.length; i++) {
    const id = categoryIds[i];
    const name = CONFIG.categories[id];

    console.log(
      `[${i + 1}/${categoryIds.length}] ${name} (category/${id}.html)`
    );

    try {
      const items = await scrapeCategoryPage(id, name);
      allItems.push(...items);
      console.log(`  Found ${items.length} items`);
    } catch (error) {
      console.error(
        `  ERROR: ${error instanceof Error ? error.message : error}`
      );
    }

    if (i < categoryIds.length - 1) {
      await sleep(CONFIG.rateLimit);
    }
  }

  console.log(`\n=== Scraping Complete ===`);
  console.log(`Total items: ${allItems.length}`);

  return allItems;
}

/**
 * 既存メニューをデータファイルから取得
 */
function getExistingMenus(): ExistingMenu[] {
  return nakauMenuData.map((menu) => ({
    menuId: menu.menu_id,
    menuName: menu.menu_name,
    price: menu.price,
  }));
}

/**
 * データファイルの price フィールドを更新（confidence 0.8以上のみ）
 * 同じmenuIdに複数マッチした場合は最高confidenceのもののみ適用
 */
function updateDataFile(matches: PriceUpdateReport["matched"]): number {
  const filePath = path.join(__dirname, "../data/nakau-menus.ts");
  let content = fs.readFileSync(filePath, "utf-8");
  let updatedCount = 0;

  // 同じmenuIdへの重複マッチを排除（最高confidence優先）
  const bestByMenuId = new Map<string, (typeof matches)[0]>();
  for (const match of matches) {
    if (match.confidence < 0.8) continue;
    const existing = bestByMenuId.get(match.menuId);
    if (!existing || match.confidence > existing.confidence) {
      bestByMenuId.set(match.menuId, match);
    }
  }

  for (const match of bestByMenuId.values()) {
    const escaped = match.menuId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(menu_id: "${escaped}",[^}]*?price:) (?:null|\\d+)`
    );
    const newContent = content.replace(regex, `$1 ${match.price}`);
    if (newContent !== content) {
      content = newContent;
      updatedCount++;
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  return updatedCount;
}

/**
 * レポート出力
 */
function printReport(report: PriceUpdateReport): void {
  console.log("\n========================================");
  console.log("        Matching Report");
  console.log("========================================\n");

  console.log(`Total scraped: ${report.totalMatched + report.totalUnmatched}`);
  console.log(`Matched: ${report.totalMatched}`);
  console.log(`Unmatched: ${report.totalUnmatched}`);

  const highConfidence = report.matched.filter((m) => m.confidence >= 0.95);
  const mediumConfidence = report.matched.filter(
    (m) => m.confidence >= 0.8 && m.confidence < 0.95
  );
  const lowConfidence = report.matched.filter((m) => m.confidence < 0.8);

  console.log(`\n--- High Confidence (>=0.95): ${highConfidence.length} ---`);
  for (const m of highConfidence.slice(0, 10)) {
    console.log(
      `  ✓ ${m.scrapedName} → ${m.menuName} (${m.price}円, ${m.matchType})`
    );
  }
  if (highConfidence.length > 10) {
    console.log(`  ... and ${highConfidence.length - 10} more`);
  }

  console.log(
    `\n--- Medium Confidence (0.8-0.95): ${mediumConfidence.length} ---`
  );
  for (const m of mediumConfidence) {
    console.log(
      `  ? ${m.scrapedName} → ${m.menuName} (${m.price}円, ${m.confidence.toFixed(2)})`
    );
  }

  console.log(`\n--- Low Confidence (<0.8): ${lowConfidence.length} ---`);
  for (const m of lowConfidence) {
    console.log(
      `  ⚠ ${m.scrapedName} → ${m.menuName} (${m.price}円, ${m.confidence.toFixed(2)})`
    );
  }

  if (report.unmatched.length > 0) {
    console.log(`\n--- Unmatched: ${report.unmatched.length} ---`);
    for (const item of report.unmatched) {
      const sizePart = item.size ? `（${item.size}）` : "";
      console.log(`  ✗ ${item.name}${sizePart}: ${item.price}円`);
    }
  }

  console.log("\n========================================\n");
}

/**
 * stdinから1行読み取る
 */
function prompt(message: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(message);
    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const autoYes = args.includes("--yes");

  if (dryRun) {
    console.log(
      "[DRY RUN] 全カテゴリをスクレイピングしてレポート表示します\n"
    );
  }

  // 1. スクレイピング実行
  let scrapedItems: ScrapedMenuItem[];

  if (dryRun) {
    // dry-run: 全カテゴリ
    const categoryIds = Object.keys(CONFIG.categories);
    scrapedItems = [];
    console.log(`\n=== なか卯 Price Scraping (DRY RUN) ===\n`);
    for (let i = 0; i < categoryIds.length; i++) {
      const id = categoryIds[i];
      const name = CONFIG.categories[id];
      console.log(`[${i + 1}/${categoryIds.length}] ${name}`);
      try {
        const items = await scrapeCategoryPage(id, name);
        scrapedItems.push(...items);
        console.log(`  Found ${items.length} items`);
      } catch (error) {
        console.error(
          `  ERROR: ${error instanceof Error ? error.message : error}`
        );
      }
      if (i < categoryIds.length - 1) await sleep(CONFIG.rateLimit);
    }
  } else {
    scrapedItems = await scrapeAll();
  }

  if (scrapedItems.length === 0) {
    console.error("No items scraped. Exiting.");
    process.exit(1);
  }

  // 1.5. 重複排除（同じメニュー名+サイズは最初の1件のみ）
  const seen = new Set<string>();
  const uniqueItems = scrapedItems.filter((item) => {
    const key = `${item.name}__${item.size || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(
    `\nDeduplication: ${scrapedItems.length} → ${uniqueItems.length} items`
  );
  scrapedItems = uniqueItems;

  // 2. 既存メニュー取得
  const existingMenus = getExistingMenus();
  console.log(`Existing menus in data file: ${existingMenus.length}`);

  // 3. マッチング
  const matcher = new MenuMatcher();

  // 手動マッピング（サイト名とDB名の表記が大きく異なるもの）
  matcher.setManualMappings({
    // おかず名称差異
    "京風つけもの": "つけもの",
    "具だくさん豚汁": "具だくさんとん汁",
    "ごはん（並盛）": "ライス（並盛）",
    "こだわり卵のプリン": "こだわり卵のプリン（カスタード）",
    "青ネギ": "追加青ネギ",

    // お子様セット（サイト: 「うき卯きセット」→ DB: 「セット」）
    "お子様親子丼 うき卯きセット": "お子様親子丼ぶりセット",
    "お子様カレー丼 うき卯きセット": "お子様カレー丼ぶりセット",
    "お子様きつねうどん うき卯きセット": "お子様きつねうどんセット",
    "お子様わかめうどん うき卯きセット": "お子様わかめうどんセット",
    // お子様セット（温うどんサイズ付きパターン）
    "お子様きつねうどん うき卯きセット（温うどん）": "お子様きつねうどんセット",
    "お子様わかめうどん うき卯きセット（温うどん）": "お子様わかめうどんセット",

    // お子様単品（サイト: 「【単品】」→ DB: サフィックスなし）
    "お子様親子丼【単品】": "お子様親子丼ぶり",
    "お子様カレー丼ぶり【単品】": "お子様カレー丼ぶり",
    "お子様きつねうどん【単品】": "お子様きつねうどん",
    "お子様わかめうどん【単品】": "お子様わかめうどん",
    // お子様単品（温うどんサイズ付きパターン）
    "お子様きつねうどん【単品】（温うどん）": "お子様きつねうどん",
    "お子様わかめうどん【単品】（温うどん）": "お子様わかめうどん",
  });

  const report = matcher.matchAll(scrapedItems, existingMenus);
  report.chainId = "nakau";

  // 4. レポート出力
  printReport(report);

  if (dryRun) {
    const updateCount = report.matched.filter(
      (m) => m.confidence >= 0.8
    ).length;
    console.log(
      `[DRY RUN] 本番実行すると ${updateCount} 件の価格がデータファイルに更新されます\n`
    );
    return;
  }

  // 5. 承認を求める
  const updateCount = report.matched.filter(
    (m) => m.confidence >= 0.8
  ).length;

  if (!autoYes) {
    const answer = await prompt(
      `\n${updateCount} 件の価格をデータファイルに更新しますか？ (y/n): `
    );
    if (answer.toLowerCase() !== "y") {
      console.log("キャンセルしました");
      return;
    }
  } else {
    console.log(`\n${updateCount} 件の価格をデータファイルに更新します（--yes）`);
  }

  // 6. データファイル更新
  report.totalUpdated = updateDataFile(report.matched);
  console.log(
    `\n✅ ${report.totalUpdated} 件の価格をデータファイルに更新しました`
  );
  console.log("💡 DBに反映するには npm run seed:nakau を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
