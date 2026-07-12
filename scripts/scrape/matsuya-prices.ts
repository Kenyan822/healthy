/**
 * 松屋メニュー価格スクレイパー
 *
 * 実行: npx tsx scripts/scrape/matsuya-prices.ts [--dry-run]
 *
 * スクレイピングした価格をデータファイル(scripts/data/matsuya-menus.ts)に書き戻す。
 * DB投入は seed:matsuya で別途実行。
 */

import * as fs from "fs";
import * as path from "path";
import { BaseScraper } from "./common/scraper";
import { MenuMatcher } from "./common/matcher";
import { matsuyaMenuData } from "../data/matsuya-menus";
import type {
  ScraperConfig,
  ScrapedMenuItem,
  ExistingMenu,
  PriceUpdateReport,
} from "./common/types";

// 松屋用設定
const MATSUYA_CONFIG: ScraperConfig = {
  chainId: "matsuya",
  baseUrl: "https://www.matsuyafoods.co.jp/matsuya/menu",
  categories: [
    "gyumeshi", // 牛めし
    "curry", // カレー
    "teishoku", // 定食
    "don", // 丼
    "low_carbohydrate", // ロカボ応援
    "morning", // モーニング
    "lunch", // ランチ
    "sidemenu", // サイドメニュー
    "topping", // セットメニュー
    "limited", // おすすめ・期間限定
    "okosama", // おこさま
    "drink", // ドリンク
  ],
  rateLimit: 3000, // 3秒間隔
  batchSize: 10, // 10件ごとに長めの待機
  batchDelay: 10000, // バッチ間10秒
  maxRetries: 3,
  timeout: 30000,
};

class MatsuyaScraper extends BaseScraper {
  // 訪問済み個別ページURL（重複スクレイピング防止）
  private visitedUrls = new Set<string>();
  // 個別ページの取得上限（0=無制限）
  private maxDetailPages: number;
  private totalDetailCount = 0;

  constructor(maxDetailPages = 0) {
    super(MATSUYA_CONFIG);
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

      $("ul.menu_inner > li").each((_, el) => {
        const $el = $(el);

        let menuName = $el.find("span.txt").first().text().trim();
        if (!menuName) {
          menuName = $el.find("img").first().attr("alt") || "";
        }
        if (!menuName) return;

        const detailHref = $el.find("a.item-menu-cmn").attr("href");
        if (detailHref) {
          // URL正規化: /menu/../matsuya/ → /matsuya/
          const normalizedUrl = detailHref.replace("/menu/../", "/");
          menuLinks.push({ name: menuName, url: normalizedUrl });
        } else {
          // リンクがない場合はカテゴリページの価格を使用
          $el.find("div.description li").each((_, priceEl) => {
            const $priceEl = $(priceEl);
            const size =
              $priceEl.find("span.txt_bold").text().trim() || undefined;
            const priceText = $priceEl.find("strong.price").text().trim();
            const priceMatch = priceText.match(/(\d+)円/);
            if (priceMatch) {
              const price = parseInt(priceMatch[1], 10);
              if (!isNaN(price) && price > 0 && price < 10000) {
                items.push({ name: menuName, price, size, category });
              }
            }
          });
        }
      });

      console.log(`  Found ${menuLinks.length} detail page links`);

      // 各個別ページをスクレイピング
      let detailCount = 0;
      for (const link of menuLinks) {
        // 上限チェック
        if (this.maxDetailPages > 0 && this.totalDetailCount >= this.maxDetailPages) {
          console.log(`    Limit reached (${this.maxDetailPages} pages)`);
          break;
        }

        // 重複チェック（同じメニューが複数カテゴリに出る場合）
        if (this.visitedUrls.has(link.url)) {
          console.log(`    Skip (already visited): ${link.name}`);
          continue;
        }
        this.visitedUrls.add(link.url);

        try {
          // レート制限
          if (detailCount > 0) {
            await this.sleep(this.config.rateLimit);
          }

          // バッチ処理: 10件ごとに長めの待機
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

          const sizes = detailItems.map((i) => i.size || "default").join(", ");
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
   * 個別メニューページからサイズ別価格を取得
   *
   * HTML構造:
   * <ul class="ul-text">
   *   <li>
   *     <p class="th">並盛</p>                           ← サイズ名（ない場合もある）
   *     <p class="td">
   *       <span class="clr">460</span>                   ← 価格
   *       <span class="clr fs">円</span>
   *       <span class="fs">(税込)</span>
   *     </p>
   *   </li>
   * </ul>
   */
  private async scrapeDetailPage(
    url: string,
    fallbackName: string,
    category: string
  ): Promise<ScrapedMenuItem[]> {
    const $ = await this.fetchWithRetry(url);
    const items: ScrapedMenuItem[] = [];

    // メニュー名（h1.ttlが最も正確）
    const menuName = $("h1.ttl").text().trim() || fallbackName;

    // 価格リスト（ul.ul-text > li のみ。アレルゲンはul.ul-data、バッジはdiv.box-text内）
    $("ul.ul-text > li").each((_, priceEl) => {
      const $priceEl = $(priceEl);

      // サイズ名（p.th）- ない場合は単一価格のメニュー
      const size = $priceEl.find("p.th").text().trim() || undefined;

      // 価格（p.td内の最初のspan.clr）
      const priceText = $priceEl.find("p.td > span.clr").first().text().trim();
      const price = parseInt(priceText, 10);

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
  return matsuyaMenuData.map((menu) => ({
    menuId: menu.menu_id,
    menuName: menu.menu_name,
    price: menu.price,
  }));
}

/**
 * データファイルの price フィールドを更新（confidence 0.8以上のみ）
 */
function updateDataFile(matches: PriceUpdateReport["matched"]): number {
  const filePath = path.join(__dirname, "../data/matsuya-menus.ts");
  let content = fs.readFileSync(filePath, "utf-8");
  let updatedCount = 0;

  for (const match of matches) {
    if (match.confidence < 0.8) continue;

    const escaped = match.menuId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // データファイルはJSON形式（"menu_id": ...）と旧インライン形式の両方がありうる
    const regex = new RegExp(
      `("?menu_id"?: "${escaped}",[^}]*?"?price"?:) (?:null|\\d+)`
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
 * レポートを出力
 */
function printReport(report: PriceUpdateReport): void {
  console.log("\n========================================");
  console.log("        Matching Report");
  console.log("========================================\n");

  console.log(`Total scraped: ${report.totalMatched + report.totalUnmatched}`);
  console.log(`Matched: ${report.totalMatched}`);
  console.log(`Unmatched: ${report.totalUnmatched}`);
  console.log(`Updated: ${report.totalUpdated}`);

  // マッチしたもの（confidence別）
  const highConfidence = report.matched.filter((m) => m.confidence >= 0.95);
  const mediumConfidence = report.matched.filter(
    (m) => m.confidence >= 0.8 && m.confidence < 0.95
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

  // マッチしなかったもの
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

  // 1. スクレイピング実行（dry-runは10件のみ）
  const scraper = new MatsuyaScraper(dryRun ? 10 : 0);
  const scrapeResult = await scraper.scrapeAll();

  if (scrapeResult.items.length === 0) {
    console.error("No items scraped. Exiting.");
    process.exit(1);
  }

  // 1.5. 重複排除（同じメニュー名+サイズは最初の1件のみ）
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
    冷奴: "冷やっこ",
    "ソーセージ半熟玉子": "ソーセージ＆半熟玉子",
  });

  const report = matcher.matchAll(scrapeResult.items, existingMenus);
  report.chainId = "matsuya";

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
  console.log("💡 DBに反映するには npm run seed:matsuya を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
