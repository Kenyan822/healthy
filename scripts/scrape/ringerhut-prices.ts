/**
 * リンガーハットメニュー価格スクレイパー
 *
 * 実行: npx tsx scripts/scrape/ringerhut-prices.ts [--dry-run]
 *
 * スクレイピングした価格をデータファイル(scripts/data/ringerhut-menus.ts)に書き戻す。
 * DB投入は npx tsx scripts/seed-ringerhut.ts で別途実行。
 */

import * as fs from "fs";
import * as path from "path";
import { BaseScraper } from "./common/scraper";
import { MenuMatcher } from "./common/matcher";
import { ringerhutMenuData } from "../data/ringerhut-menus";
import type {
  ScraperConfig,
  ScrapedMenuItem,
  ExistingMenu,
  PriceUpdateReport,
} from "./common/types";

// ============================
// 設定
// ============================

const RINGERHUT_CONFIG: ScraperConfig = {
  chainId: "ringerhut",
  baseUrl: "https://www.ringerhut.jp/menu",
  categories: [
    "champon",
    "saraudon",
    "seafood",
    "yasai",
    "side",
    "gyoza_teishoku",
    "kids",
    "seasonal",
  ],
  rateLimit: 3000,
  batchSize: 10,
  batchDelay: 15000,
  maxRetries: 3,
  timeout: 30000,
};

// ============================
// スクレイパー実装
// ============================

class RingerhutScraper extends BaseScraper {
  private visitedUrls = new Set<string>();
  private maxDetailPages: number;
  private totalDetailCount = 0;

  constructor(maxDetailPages = 0) {
    super(RINGERHUT_CONFIG);
    this.maxDetailPages = maxDetailPages;
  }

  async scrapeCategory(category: string): Promise<ScrapedMenuItem[]> {
    const url = `${this.config.baseUrl}/${category}/`;
    const items: ScrapedMenuItem[] = [];

    try {
      const $ = await this.fetchWithRetry(url);

      // カテゴリページからメニューリンクと名前を収集
      const menuLinks: { name: string; url: string }[] = [];

      $("a").each((_, el) => {
        const $el = $(el);
        const href = $el.attr("href") || "";

        // 相対URLで子パスのもの（例: nagasaki_cp/, small_cp/）
        if (
          href &&
          !href.startsWith("http") &&
          !href.startsWith("/") &&
          !href.startsWith("#") &&
          href !== "../" &&
          href.endsWith("/")
        ) {
          let menuName = $el.find("img").attr("alt") || "";
          if (!menuName) {
            menuName = $el.text().trim();
          }
          if (!menuName) return;

          // テイクアウト・デリバリー除外
          if (/テイクアウト|デリバリー/.test(menuName)) return;

          const fullUrl = `${this.config.baseUrl}/${category}/${href}`;

          if (!menuLinks.some((l) => l.url === fullUrl)) {
            menuLinks.push({ name: menuName, url: fullUrl });
          }
        }
      });

      console.log(`  Found ${menuLinks.length} detail page links`);

      let detailCount = 0;
      for (const link of menuLinks) {
        if (
          this.maxDetailPages > 0 &&
          this.totalDetailCount >= this.maxDetailPages
        ) {
          console.log(`    Limit reached (${this.maxDetailPages} pages)`);
          break;
        }

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

          for (const item of detailItems) {
            console.log(`    ${item.name}: ${item.price}円`);
          }

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
   * 個別メニューページから価格を取得
   *
   * リンガーハットの詳細ページ構造:
   * - メニュー名: h1.menuname
   * - 価格: table.singleprice の最初のテーブル > td.price の最初の行（標準価格）
   * - 標準価格と特別価格（地域差）の2種類あり → 標準価格を採用
   */
  private async scrapeDetailPage(
    url: string,
    fallbackName: string,
    category: string
  ): Promise<ScrapedMenuItem[]> {
    const $ = await this.fetchWithRetry(url);
    const items: ScrapedMenuItem[] = [];

    // メニュー名: h1.menuname
    let menuName = $("h1.menuname").first().text().trim();
    if (!menuName) {
      // フォールバック: og:title
      menuName = $('meta[property="og:title"]').attr("content") || "";
    }
    if (!menuName) {
      menuName = fallbackName;
    }
    menuName = menuName.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

    // 店内標準価格: table.singleprice の最初のテーブルの td.price
    // 「820円」「1,320円」などカンマ区切りあり
    let price = 0;
    const firstPriceCell = $("table.singleprice").first().find("td.price").first().text().trim();
    // 「820円\n840円」→ 最初の行が標準価格
    const priceMatch = firstPriceCell.match(/([\d,]{2,6})円/);
    if (priceMatch) {
      price = parseInt(priceMatch[1].replace(/,/g, ""), 10);
    }

    // フォールバック: ページテキストから抽出
    if (price === 0) {
      const allText = $("body").text().replace(/\s+/g, " ");
      const eatInMatch = allText.match(/店内[^テ]*?([\d,]{3,6})円/);
      if (eatInMatch) {
        price = parseInt(eatInMatch[1].replace(/,/g, ""), 10);
      } else {
        const firstPrice = allText.match(/([\d,]{3,6})円/);
        if (firstPrice) {
          price = parseInt(firstPrice[1].replace(/,/g, ""), 10);
        }
      }
    }

    if (price > 0 && price < 10000) {
      items.push({
        name: menuName,
        price,
        category,
        url,
      });
    }

    return items;
  }
}

// ============================
// 既存メニューデータ
// ============================

function getExistingMenus(): ExistingMenu[] {
  return ringerhutMenuData.map((menu) => ({
    menuId: menu.menu_id,
    menuName: menu.menu_name,
    price: menu.price,
  }));
}

// ============================
// データファイル更新
// ============================

const UPDATE_CONFIDENCE_THRESHOLD = 0.9;

function updateDataFile(matches: PriceUpdateReport["matched"]): number {
  const filePath = path.join(__dirname, "../data/ringerhut-menus.ts");
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

// ============================
// レポート出力
// ============================

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

  console.log(`\n--- High Confidence (>=0.95): ${highConfidence.length} ---`);
  for (const m of highConfidence.slice(0, 15)) {
    console.log(
      `  OK ${m.scrapedName} -> ${m.menuName} (${m.price}円, ${m.matchType})`
    );
  }
  if (highConfidence.length > 15) {
    console.log(`  ... and ${highConfidence.length - 15} more`);
  }

  console.log(
    `\n--- Medium Confidence (0.9-0.95): ${mediumConfidence.length} ---`
  );
  for (const m of mediumConfidence) {
    console.log(
      `  ? ${m.scrapedName} -> ${m.menuName} (${m.price}円, ${m.confidence.toFixed(2)})`
    );
  }

  console.log(`\n--- Low Confidence (<0.8): ${lowConfidence.length} ---`);
  for (const m of lowConfidence) {
    console.log(
      `  !! ${m.scrapedName} -> ${m.menuName} (${m.price}円, ${m.confidence.toFixed(2)})`
    );
  }

  if (report.unmatched.length > 0) {
    console.log(`\n--- Unmatched: ${report.unmatched.length} ---`);
    for (const item of report.unmatched) {
      console.log(`  X ${item.name}: ${item.price}円`);
    }
  }

  console.log("\n========================================\n");
}

// ============================
// ユーティリティ
// ============================

function prompt(message: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(message);
    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

// ============================
// メイン処理
// ============================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    console.log("[DRY RUN] 10件だけスクレイピングしてレポート表示します\n");
  }

  // 1. スクレイピング実行
  const scraper = new RingerhutScraper(dryRun ? 10 : 0);
  const scrapeResult = await scraper.scrapeAll();

  if (scrapeResult.items.length === 0) {
    console.error("No items scraped. Exiting.");
    process.exit(1);
  }

  // 1.5. 重複排除
  const seen = new Set<string>();
  const uniqueItems = scrapeResult.items.filter((item) => {
    const key = `${item.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(
    `\nDeduplication: ${scrapeResult.items.length} -> ${uniqueItems.length} items`
  );
  scrapeResult.items = uniqueItems;

  // 2. 既存メニュー取得（データファイルから）
  const existingMenus = getExistingMenus();
  console.log(`\nExisting menus in data file: ${existingMenus.length}`);

  // 3. マッチング
  const matcher = new MenuMatcher();

  // リンガーハット固有の手動マッピング
  // サイト名 → データファイル名
  matcher.setManualMappings({
    // ちゃんぽん
    "長崎ちゃんぽん": "長崎ちゃんぽん",
    // 皿うどん
    "長崎皿うどん": "長崎皿うどん",
    // 海鮮
    "海鮮ちゃんぽん": "海鮮ちゃんぽん（あさりスープ）",
    // ぎょうざ定食（ごはん）
    "ぎょうざ7個定食（ごはん）": "ぎょうざ7個定食",
    "ぎょうざ10個定食（ごはん）": "ぎょうざ10個定食",
    "ぎょうざ15個定食（ごはん）": "ぎょうざ15個定食",
    // ぎょうざ定食（半チャーハン）
    "ぎょうざ7個定食（半チャーハン）": "ぎょうざ7個定食（半チャーハン）",
    // キッズ
    "ちびっこ ちゃんぽんセット": "ちびっこちゃんぽん（ぎょうざ+プリン）",
    "ちびっこ さらうどんセット": "ちびっこさらうどん（ぎょうざ+プリン）",
    "ちびっこ チャーハンセット": "ちびっこチャーハン（ぎょうざ+プリン）",
    // 鶏白湯
    "鶏白湯ちゃんぽん": "鶏白湯長崎ちゃんぽん",
    // 食べるスープ
    "野菜たっぷり食べるスープ": "野菜たっぷり食べるスープ",
    // 季節限定
    "九条ねぎのあんかけしょうゆちゃんぽん": "九条ネギのあんかけしょうゆちゃんぽん（麺200g）",
    "牛もつちゃんぽん 醤油": "牛もつちゃんぽん（麺200g）",
    "プレミアム長崎ちゃんぽん": "プレミアム長崎ちゃんぽん",
    "リンガーハットの焼きそば": "リンガーハットの焼きそば（麺300g）",
    "ちゃルボナーラ": "ちゃルボナーラ（麺300g）",
    "広島限定お好み焼き風皿うどん": "広島お好み焼き風皿うどん",
    // 季節限定（つけ麺・まぜめん）
    "和風醤油つけ麺炭火鴨肉入り": "和風醤油つけ麺炭火焼き鴨肉入り",
    "肉味噌まぜ麺": "肉みそまぜめん",
    "肉味噌釜玉ちゃんぽん": "肉味噌釜玉ちゃんぽん",
    // サイドメニュー
    "ぎょうざ（3個）": "ぎょうざ（3個）",
    "ぎょうざ（5個）": "ぎょうざ（5個）",
    "食べるミルクセーキ（プレーン）": "ミルクセーキ（小）",
    "杏仁豆腐（ブルーベリー）": "杏仁豆腐",
    // 焼き太めん
    "焼き太めん皿うどん": "焼き太めん皿うどん",
    "やわらか太めん皿うどん": "やわらか太めん皿うどん",
  });

  const report = matcher.matchAll(scrapeResult.items, existingMenus);
  report.chainId = "ringerhut";

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
  console.log(`\n${report.totalUpdated} 件の価格をデータファイルに更新しました`);
  console.log("DBに反映するには npx tsx scripts/seed-ringerhut.ts を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
