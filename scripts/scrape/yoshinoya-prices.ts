/**
 * 吉野家メニュー価格スクレイパー
 *
 * 実行: npx tsx scripts/scrape/yoshinoya-prices.ts [--dry-run]
 *
 * スクレイピングした価格をデータファイル(scripts/data/yoshinoya-menus.ts)に書き戻す。
 * DB投入は seed:yoshinoya で別途実行。
 */

import * as fs from "fs";
import * as path from "path";
import { BaseScraper } from "./common/scraper";
import { MenuMatcher } from "./common/matcher";
import { yoshinoyaMenuData } from "../data/yoshinoya-menus";
import type {
  ScraperConfig,
  ScrapedMenuItem,
  ExistingMenu,
  MatchResult,
  PriceUpdateReport,
} from "./common/types";

// 吉野家用設定
const YOSHINOYA_CONFIG: ScraperConfig = {
  chainId: "yoshinoya",
  baseUrl: "https://www.yoshinoya.com/menu",
  categories: [
    "gyudon", // 牛丼
    "yoshinoyanodon", // 吉野家の丼
    "karaage", // から揚げ
    "set", // 定食
    "yoshinomi", // おかず（皿メニュー）
    "gentei", // 期間限定
    "curry", // カレー
    "unajyu", // 鰻
    "morningset", // 朝食
    "kids", // お子様セット
    "sidemenu", // サイドメニュー・お飲み物
    "cc", // クッキング＆コンフォート限定
  ],
  rateLimit: 3000, // 3秒間隔
  batchSize: 10, // 10件ごとに長めの待機
  batchDelay: 10000, // バッチ間10秒
  maxRetries: 3,
  timeout: 30000,
};

class YoshinoyaScraper extends BaseScraper {
  private visitedUrls = new Set<string>();
  private maxDetailPages: number;
  private totalDetailCount = 0;

  constructor(maxDetailPages = 0) {
    super(YOSHINOYA_CONFIG);
    this.maxDetailPages = maxDetailPages;
  }

  /**
   * カテゴリページから個別メニューページURLを収集し、
   * 各個別ページからサイズ別価格を取得
   */
  async scrapeCategory(category: string): Promise<ScrapedMenuItem[]> {
    const url = `${this.config.baseUrl}/${category}/`;
    const items: ScrapedMenuItem[] = [];

    try {
      const $ = await this.fetchWithRetry(url);

      // カテゴリページから個別ページリンクとメニュー名を収集
      const menuLinks: { name: string; url: string }[] = [];

      $("#menu__grand > .menu__unit").each((_, el) => {
        const $el = $(el);
        const $link = $el.find("> a");
        const href = $link.attr("href");
        if (!href) return;

        // メニュー名（.menu__titleのテキスト、アイコンspanを除外）
        const menuName = $link
          .find(".menu__title")
          .clone()
          .children()
          .remove()
          .end()
          .text()
          .trim();
        if (!menuName) return;

        menuLinks.push({ name: menuName, url: href });
      });

      console.log(`  Found ${menuLinks.length} detail page links`);

      // 各個別ページをスクレイピング
      let detailCount = 0;
      for (const link of menuLinks) {
        // 上限チェック
        if (
          this.maxDetailPages > 0 &&
          this.totalDetailCount >= this.maxDetailPages
        ) {
          console.log(`    Limit reached (${this.maxDetailPages} pages)`);
          break;
        }

        // 重複チェック
        if (this.visitedUrls.has(link.url)) {
          console.log(`    Skip (already visited): ${link.name}`);
          continue;
        }
        this.visitedUrls.add(link.url);

        try {
          if (detailCount > 0) {
            await this.sleep(this.config.rateLimit);
          }

          if (detailCount > 0 && detailCount % this.config.batchSize === 0) {
            console.log(
              `    Batch pause (${this.config.batchDelay / 1000}s)...`
            );
            await this.sleep(this.config.batchDelay);
          }

          const detailItems = await this.scrapeDetailPage(
            link.url,
            link.name,
            category
          );
          items.push(...detailItems);

          const sizes = detailItems
            .map((i) => i.size || "default")
            .join(", ");
          console.log(
            `    ${link.name}: ${detailItems.length} price(s) [${sizes}]`
          );

          detailCount++;
          this.totalDetailCount++;
        } catch (error) {
          console.error(
            `    Error: ${link.name} - ${error instanceof Error ? error.message : error}`
          );
        }
      }

      return items;
    } catch (error) {
      console.error(`  Error scraping ${category}:`, error);
      return [];
    }
  }

  /**
   * 個別メニューページからサイズ別価格（税込・店内）を取得
   *
   * HTML構造:
   * <div class="tab__contents__eatin">
   *   <div class="menu__price__table">
   *     <ul>
   *       <li>
   *         <div class="menu__price__wrapper">
   *           <div class="menu__label">並盛</div>
   *           <div class="menu__price">
   *             <span class="menu__price__taxout">453</span>円
   *             <div class="menu__price__cap">
   *               (税込<span class="menu__price__taxin">498</span>円)
   *             </div>
   *           </div>
   *         </div>
   *       </li>
   *     </ul>
   *   </div>
   * </div>
   */
  private async scrapeDetailPage(
    url: string,
    fallbackName: string,
    category: string
  ): Promise<ScrapedMenuItem[]> {
    const $ = await this.fetchWithRetry(url);
    const items: ScrapedMenuItem[] = [];

    // メニュー名（h1）
    const menuName = $("h1").first().text().trim() || fallbackName;

    // 店内価格（税込）を取得
    const $eatinPanel = $(".tab__contents__eatin");
    const $priceTable =
      $eatinPanel.length > 0
        ? $eatinPanel.find(".menu__price__table li")
        : $(".menu__price__table li");

    $priceTable.each((_, priceEl) => {
      const $priceEl = $(priceEl);

      // サイズ名
      const size = $priceEl.find(".menu__label").text().trim() || undefined;

      // 税込価格（カンマ除去: "1,078" → "1078"）
      const taxinText = $priceEl
        .find(".menu__price__taxin")
        .first()
        .text()
        .trim()
        .replace(/,/g, "");
      const price = parseInt(taxinText, 10);

      if (!isNaN(price) && price > 0 && price < 10000) {
        items.push({
          name: menuName,
          price,
          size,
          category,
          url,
        });
      }
    });

    return items;
  }
}

/**
 * 既存メニューをデータファイルから取得
 */
function getExistingMenus(): ExistingMenu[] {
  return yoshinoyaMenuData.map((menu) => ({
    menuId: menu.menu_id,
    menuName: menu.menu_name,
    price: menu.price,
  }));
}

/**
 * データファイルの price フィールドを更新（confidence 0.9以上のみ）
 * ※吉野家はトッピング名と丼名が似ているため閾値を高めに設定
 */
const UPDATE_CONFIDENCE_THRESHOLD = 0.9;

function updateDataFile(matches: PriceUpdateReport["matched"]): number {
  const filePath = path.join(__dirname, "../data/yoshinoya-menus.ts");
  let content = fs.readFileSync(filePath, "utf-8");
  let updatedCount = 0;

  for (const match of matches) {
    if (match.confidence < UPDATE_CONFIDENCE_THRESHOLD) continue;

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
 * マッチ済みの価格からご飯増量(+55円)・肉2倍盛(+327円)の派生価格を計算
 * サイト上ではオプション扱いで独立メニューとして存在しないため、
 * ベースメニューの価格から計算して補完する
 */
function generateDerivedPrices(
  matchedItems: MatchResult[],
  existingMenus: ExistingMenu[]
): MatchResult[] {
  const derived: MatchResult[] = [];

  // ご飯増量: カレー/ハヤシの並盛価格 + 55円(店内税込)
  const gohanZouryoPairs: [string, string][] = [
    ["黒カレー（並盛）", "黒カレー（ご飯増量）"],
    ["牛黒カレー（並盛）", "牛黒カレー（ご飯増量）"],
    ["肉だく牛黒カレー（並盛）", "肉だく牛黒カレー（ご飯増量）"],
    ["牛カルビ黒カレー（並盛）", "牛カルビ黒カレー（ご飯増量）"],
    ["牛×牛カルビ黒カレー（並盛）", "牛×牛カルビ黒カレー（ご飯増量）"],
    ["から揚げ黒カレー（並盛）", "から揚げ黒カレー（ご飯増量）"],
    ["牛ハヤシライス（並盛）", "牛ハヤシライス（ご飯増量）"],
    ["肉だく牛ハヤシライス（並盛）", "肉だく牛ハヤシライス（ご飯増量）"],
  ];

  for (const [baseName, derivedName] of gohanZouryoPairs) {
    const baseMatch = matchedItems.find((m) => m.menuName === baseName);
    const derivedMenu = existingMenus.find((m) => m.menuName === derivedName);
    if (baseMatch && derivedMenu) {
      derived.push({
        menuId: derivedMenu.menuId,
        menuName: derivedMenu.menuName,
        scrapedName: `${baseName} + ご飯増量`,
        price: baseMatch.price + 55,
        confidence: 0.95,
        matchType: "manual",
      });
    }
  }

  // 肉2倍盛: 鍋の並盛価格 + 327円(店内税込)
  const niku2baiPairs: [string, string][] = [
    ["牛すき鍋膳（並盛）", "牛すき鍋膳（肉2倍盛）"],
    ["牛すき鍋（単品・並盛）", "牛すき鍋（単品・肉2倍盛）"],
    ["牛カレー鍋膳（並盛）", "牛カレー鍋膳（肉2倍盛）"],
    ["牛カレー鍋（単品・並盛）", "牛カレー鍋（単品・肉2倍盛）"],
  ];

  for (const [baseName, derivedName] of niku2baiPairs) {
    const baseMatch = matchedItems.find((m) => m.menuName === baseName);
    const derivedMenu = existingMenus.find((m) => m.menuName === derivedName);
    if (baseMatch && derivedMenu) {
      derived.push({
        menuId: derivedMenu.menuId,
        menuName: derivedMenu.menuName,
        scrapedName: `${baseName} + 肉2倍盛`,
        price: baseMatch.price + 327,
        confidence: 0.95,
        matchType: "manual",
      });
    }
  }

  return derived;
}

/**
 * レポートを出力
 */
function printReport(report: PriceUpdateReport): void {
  console.log("\n========================================");
  console.log("        Matching Report");
  console.log("========================================\n");

  console.log(
    `Total scraped: ${report.totalMatched + report.totalUnmatched}`
  );
  console.log(`Matched: ${report.totalMatched}`);
  console.log(`Unmatched: ${report.totalUnmatched}`);
  console.log(`Updated: ${report.totalUpdated}`);

  const highConfidence = report.matched.filter((m) => m.confidence >= 0.95);
  const mediumConfidence = report.matched.filter(
    (m) => m.confidence >= UPDATE_CONFIDENCE_THRESHOLD && m.confidence < 0.95
  );
  const lowConfidence = report.matched.filter((m) => m.confidence < 0.8);

  console.log(`\n--- High Confidence (≥0.95): ${highConfidence.length} ---`);
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
 *
 * --dry-run: 10件だけスクレイピングしてレポート表示（データファイル更新なし）
 * 通常: 全件スクレイピング → レポート → 承認 → データファイル更新
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    console.log("[DRY RUN] 10件だけスクレイピングしてレポート表示します\n");
  }

  // 1. スクレイピング実行
  const scraper = new YoshinoyaScraper(dryRun ? 10 : 0);
  const scrapeResult = await scraper.scrapeAll();

  if (scrapeResult.items.length === 0) {
    console.error("No items scraped. Exiting.");
    process.exit(1);
  }

  // 1.5. 重複排除
  const seen = new Set<string>();
  const uniqueItems = scrapeResult.items.filter((item) => {
    const key = `${item.name}__${item.size || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(
    `\nDeduplication: ${scrapeResult.items.length} → ${uniqueItems.length} items`
  );
  scrapeResult.items = uniqueItems;

  // 2. 既存メニュー取得（データファイルから）
  const existingMenus = getExistingMenus();
  console.log(`\nExisting menus in data file: ${existingMenus.length}`);

  // 3. マッチング
  const matcher = new MenuMatcher();

  // 手動マッピング（サイト名とDB名の表記が大きく異なるもの）
  matcher.setManualMappings({
    // === サイズなし → 並盛へマッピング ===
    "から揚げ黒カレー": "から揚げ黒カレー（並盛）",
    "牛カレー鍋膳": "牛カレー鍋膳（並盛）",
    "牛すき鍋膳": "牛すき鍋膳（並盛）",
    "肉だく牛ハヤシライス": "肉だく牛ハヤシライス（並盛）",
    "牛ハヤシライス": "牛ハヤシライス（並盛）",
    "肉だく牛黒カレー": "肉だく牛黒カレー（並盛）",
    "牛黒カレー": "牛黒カレー（並盛）",
    "牛カルビ黒カレー": "牛カルビ黒カレー（並盛）",
    "牛×牛カルビ黒カレー": "牛×牛カルビ黒カレー（並盛）",
    "黒カレー": "黒カレー（並盛）",
    "ご飯": "ご飯（並盛）",
    // オム系
    "肉だく牛オム黒カレー": "肉だく牛オム黒カレー（並盛）",
    "肉だく牛オムハヤシライス": "肉だく牛オムハヤシライス（並盛）",
    "牛オム黒カレー": "牛オム黒カレー（並盛）",
    "牛オムハヤシライス": "牛オムハヤシライス（並盛）",

    // === 朝定食: サイトでは（鮭）なし ===
    "焼魚定食": "焼魚定食（鮭）",
    "特朝定食": "特朝定食（鮭）",

    // === お子様: サイトでは「セット」付き ===
    "ミニ牛丼セット": "ミニ牛丼",
    "ミニカレーセット": "ミニカレー",

    // === サイドメニュー: サイト名とDB名の表記差異 ===
    "とん汁": "豚汁",
    "クワトロチーズ": "チーズ",
    "鮭（単品）": "鮭",
    "納豆": "納豆（タレ・カラシ・ネギ含む）",
    "鬼おろしポン酢": "鬼おろしポン酢（単品）",
    "鬼おろしわさび": "鬼おろしわさび（単品）",

    // === W定食: サイトでは「W定食（...）」形式 ===
    "W定食（牛皿・牛カルビ定食）": "牛皿・牛カルビ定食",
    "W定食（牛皿・ねぎ塩豚定食）": "牛皿・ねぎ塩豚定食",
    "W定食（牛皿・ねぎ塩牛カルビ定食）": "牛皿・ねぎ塩牛カルビ定食",
    "W定食（牛皿・から揚げ定食）": "牛皿・から揚げ定食",
    "W定食（牛皿・大判豚肩ロース焼き定食（旨ダレ生姜））":
      "牛皿・大判豚肩ロース焼き定食（旨ダレ生姜）",

    // === 鍋の単品: サイト名とDB名の形式差異 ===
    "牛すき鍋（単品）": "牛すき鍋（単品・並盛）",
    "牛カレー鍋（単品）": "牛カレー鍋（単品・並盛）",

    // === ファミリーパック: 数字 → 漢数字 ===
    "牛皿ファミリーパック（3人前）": "牛皿ファミリーパック（三人前）",
    "牛皿ファミリーパック（4人前）": "牛皿ファミリーパック（四人前）",
  });

  // トッピング付き商品・コンビ商品をスキップ（DBに個別登録なし）
  // 吉野家はベース商品とトッピングが別々に栄養成分登録されている
  const toppingPatterns = [
    // 牛丼のトッピング組み合わせ
    /^肉だく牛丼/,
    /^ねぎだく牛丼/,
    /^チーズ牛丼/,
    /^キムチ牛丼/,
    /^ねぎラー油牛丼/,
    /^鬼おろしポン酢牛丼/,
    /^鬼おろしわさび牛丼/,
    /^ねぎ玉牛丼/,
    // 豚丼のトッピング組み合わせ
    /^チーズ豚丼/,
    /^キムチ豚丼/,
    // 牛カルビ丼のトッピング組み合わせ
    /^チーズ牛カルビ丼/,
    /^キムチ牛カルビ丼/,
    // 特殊メニュー
    /^スタミナ超特盛丼/,
    /^チーズ黒カレー/, // チーズトッピング
  ];

  // トッピング付き商品を除外
  const filteredItems = scrapeResult.items.filter((item) => {
    const fullName = item.size ? `${item.name}（${item.size}）` : item.name;
    return !toppingPatterns.some((pattern) => pattern.test(fullName));
  });
  console.log(
    `\nFiltered topping combos: ${scrapeResult.items.length} → ${filteredItems.length} items`
  );

  const report = matcher.matchAll(filteredItems, existingMenus);
  report.chainId = "yoshinoya";

  // 3.5. 派生価格を計算（ご飯増量+55円、肉2倍盛+327円）
  const derivedMatches = generateDerivedPrices(report.matched, existingMenus);
  report.matched.push(...derivedMatches);
  report.totalMatched += derivedMatches.length;
  if (derivedMatches.length > 0) {
    console.log(`\nDerived prices: ${derivedMatches.length} items`);
  }

  // 4. レポート出力
  printReport(report);

  if (dryRun) {
    const updateCount = report.matched.filter(
      (m) => m.confidence >= UPDATE_CONFIDENCE_THRESHOLD
    ).length;
    console.log(
      `[DRY RUN] 本番実行すると ${updateCount} 件の価格がデータファイルに更新されます\n`
    );
    return;
  }

  // 5. 承認を求める
  const updateCount = report.matched.filter(
    (m) => m.confidence >= UPDATE_CONFIDENCE_THRESHOLD
  ).length;
  const answer = await prompt(
    `\n${updateCount} 件の価格をデータファイルに更新しますか？ (y/n): `
  );

  if (answer.toLowerCase() !== "y") {
    console.log("キャンセルしました");
    return;
  }

  // 6. データファイル更新
  report.totalUpdated = updateDataFile(report.matched);
  console.log(`\n✅ ${report.totalUpdated} 件の価格をデータファイルに更新しました`);
  console.log("💡 DBに反映するには npm run seed:yoshinoya を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
