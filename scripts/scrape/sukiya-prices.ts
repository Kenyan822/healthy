/**
 * すき家メニュー価格スクレイパー
 *
 * 実行: npx tsx scripts/scrape/sukiya-prices.ts [--dry-run]
 *
 * スクレイピングした価格をデータファイル(scripts/data/sukiya-menus.ts)に書き戻す。
 * DB投入は seed:sukiya で別途実行。
 */

import * as fs from "fs";
import * as path from "path";
import { BaseScraper } from "./common/scraper";
import { MenuMatcher } from "./common/matcher";
import { sukiyaMenuData } from "../data/sukiya-menus";
import type {
  ScraperConfig,
  ScrapedMenuItem,
  ExistingMenu,
  PriceUpdateReport,
} from "./common/types";

// すき家用設定
const SUKIYA_CONFIG: ScraperConfig = {
  chainId: "sukiya",
  baseUrl: "https://www.sukiya.jp/menu/in",
  categories: [
    "gyudon", // 牛丼（ライト含む）
    "curry", // カレー
    "oshokujisalad", // お食事サラダ
    "don", // こだわり丼
    "gyusuki", // 牛すき鍋
    "special", // 定食
    "morning", // 朝食
    "kids", // お子様
    "side", // おかず・牛皿
    "drink", // ドリンク・スイーツ
    "beer", // ビールセット
  ],
  rateLimit: 3000,
  batchSize: 10,
  batchDelay: 10000,
  maxRetries: 3,
  timeout: 30000,
};

/**
 * サイトのサイズ名をDB命名に正規化
 *
 * サイト表記 → DB表記:
 *   "ごはんミニ" → "ミニ"
 *   "ごはん並盛" → "並盛"
 *   "ごはん大盛" → "大盛"
 *   "（肉）並盛" → "並盛"
 *   "（肉）中盛" → "中盛"
 *   "（肉）2倍盛" → "2倍盛"
 *   "ごはん少な目" → "ごはん少なめ"
 */
function normalizeSize(size: string): string {
  return (
    size
      // 「ごはん」接頭辞を除去（ミニ・並盛・大盛）
      .replace(/^ごはん(ミニ|並盛|大盛)$/, "$1")
      // 「お肉」接頭辞を除去（牛丼ライト系: お肉ミニ→ミニ）
      .replace(/^お肉(ミニ|並盛|大盛)$/, "$1")
      // 「（肉）」接頭辞を除去（定食系: （肉）並盛→並盛）
      .replace(/^（肉）/, "")
      // 「少な目」→「少なめ」（サイト側の表記ゆれ）
      .replace(/少な目/, "少なめ")
      // 「並」→「並盛」（ごはんの並サイズ表記）
      .replace(/^並$/, "並盛")
  );
}

class SukiyaScraper extends BaseScraper {
  private visitedUrls = new Set<string>();
  private maxDetailPages: number;
  private totalDetailCount = 0;

  constructor(maxDetailPages = 0) {
    super(SUKIYA_CONFIG);
    this.maxDetailPages = maxDetailPages;
  }

  async scrapeCategory(category: string): Promise<ScrapedMenuItem[]> {
    const url = `${this.config.baseUrl}/${category}/`;
    const items: ScrapedMenuItem[] = [];

    try {
      const $ = await this.fetchWithRetry(url);

      const menuLinks: { name: string; url: string }[] = [];

      // カテゴリページからメニューリンクと名前を収集
      // li.page_menu_list_li がメニュー項目の正確なセレクタ
      $("li.page_menu_list_li").each((_, el) => {
        const $el = $(el);
        const $link = $el.find("a").first();
        const href = $link.attr("href");
        if (!href || !href.includes("/menu/in/")) return;

        // メニュー名: div.pro_name または span.pro_name
        const menuName = ($link.find("div.pro_name").text().trim() ||
          $link.find("span.pro_name").text().trim())
          // <br>タグはCheerioでは改行にならないが、念のため空白を正規化
          .replace(/\s+/g, "");
        if (!menuName) return;

        // 相対URLを絶対URLに変換
        const absoluteUrl = href.startsWith("http")
          ? href
          : `https://www.sukiya.jp${href}`;

        menuLinks.push({ name: menuName, url: absoluteUrl });
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
   * 個別メニューページからサイズ別価格（税込）を取得
   *
   * HTML構造:
   * <ul class="pro_page_size_list">
   *   <li class="pro_page_size_li amount01">
   *     <div class="size_img"><img src="...icon_dish_amount_02.png"></div>
   *     <div class="size">並盛</div>
   *     <div class="price"><span>450</span>円</div>
   *   </li>
   * </ul>
   *
   * 注: HTMLにはコメントアウトされた同構造のブロックが先にあるが、
   *     Cheerioはコメントを無視するので問題ない
   */
  private async scrapeDetailPage(
    url: string,
    fallbackName: string,
    category: string
  ): Promise<ScrapedMenuItem[]> {
    const $ = await this.fetchWithRetry(url);
    const items: ScrapedMenuItem[] = [];

    // メニュー名: h2.pro_page_title（h1は固定の「メニューMENU」）
    // media_sp版とmedia_pc版の2つがあるが、firstで取得
    const rawName =
      $("h2.pro_page_title").first().text().trim() || fallbackName;
    // <br>由来の空白を除去して正規化
    const menuName = rawName.replace(/\s+/g, "");

    // 価格リスト: ul.pro_page_size_list > li.pro_page_size_li
    $("ul.pro_page_size_list > li.pro_page_size_li").each((_, el) => {
      const $el = $(el);

      // サイズ名（単品は空文字）
      const rawSize = $el.find("div.size").text().trim() || undefined;
      // サイズ名をDB命名に正規化
      const size = rawSize ? normalizeSize(rawSize) : undefined;

      // 価格（div.price > span）
      const priceText = $el
        .find("div.price > span")
        .first()
        .text()
        .trim()
        .replace(/,/g, "");
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
  return sukiyaMenuData.map((menu) => ({
    menuId: menu.menu_id,
    menuName: menu.menu_name,
    price: menu.price,
  }));
}

/**
 * データファイルの price フィールドを更新（confidence 0.9以上のみ）
 */
const UPDATE_CONFIDENCE_THRESHOLD = 0.9;

function updateDataFile(matches: PriceUpdateReport["matched"]): number {
  const filePath = path.join(__dirname, "../data/sukiya-menus.ts");
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

  console.log(`\n--- High Confidence (>=0.95): ${highConfidence.length} ---`);
  for (const m of highConfidence.slice(0, 20)) {
    console.log(
      `  OK ${m.scrapedName} -> ${m.menuName} (${m.price}JPY, ${m.matchType})`
    );
  }
  if (highConfidence.length > 20) {
    console.log(`  ... and ${highConfidence.length - 20} more`);
  }

  console.log(
    `\n--- Medium Confidence (0.9-0.95): ${mediumConfidence.length} ---`
  );
  for (const m of mediumConfidence) {
    console.log(
      `  ? ${m.scrapedName} -> ${m.menuName} (${m.price}JPY, ${m.confidence.toFixed(2)})`
    );
  }

  console.log(`\n--- Low Confidence (<0.8): ${lowConfidence.length} ---`);
  for (const m of lowConfidence) {
    console.log(
      `  !! ${m.scrapedName} -> ${m.menuName} (${m.price}JPY, ${m.confidence.toFixed(2)})`
    );
  }

  if (report.unmatched.length > 0) {
    console.log(`\n--- Unmatched: ${report.unmatched.length} ---`);
    for (const item of report.unmatched) {
      const sizePart = item.size ? ` (${item.size})` : "";
      console.log(`  X ${item.name}${sizePart}: ${item.price}JPY`);
    }
  }

  console.log("\n========================================\n");
}

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
    console.log("[DRY RUN] スクレイピングしてレポート表示します（データファイル更新なし）\n");
  }

  // 1. スクレイピング実行（dry-runでも全件取得）
  const scraper = new SukiyaScraper(0);
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
    `\nDeduplication: ${scrapeResult.items.length} -> ${uniqueItems.length} items`
  );
  scrapeResult.items = uniqueItems;

  // 2. 既存メニュー取得（データファイルから）
  const existingMenus = getExistingMenus();
  console.log(`\nExisting menus in data file: ${existingMenus.length}`);

  // 3. マッチング
  const matcher = new MenuMatcher();

  matcher.setManualMappings({
    // === 定食: サイト名とDB名の不一致 ===
    // 焼鮭定食 → DB: 鮭定食
    "焼鮭定食（ミニ）": "鮭定食（ミニ）",
    "焼鮭定食（並盛）": "鮭定食（並盛）",
    "焼鮭定食（大盛）": "鮭定食（大盛）",
    // 塩さば定食 → DB: さば定食
    "塩さば定食（ミニ）": "さば定食（ミニ）",
    "塩さば定食（並盛）": "さば定食（並盛）",
    "塩さば定食（大盛）": "さば定食（大盛）",

    // === お子様メニュー: サイトは「すきすきセット」付き、DBはなし ===
    "お子様牛丼すきすきセット": "お子様牛丼",
    "お子様カレーすきすきセット": "お子様カレー",
    "お子様とりそぼろ丼すきすきセット": "お子様とりそぼろ丼",

    // === おかず: サイト名とDB名の不一致 ===
    "山かけ(わさび付)": "山かけ",
    // 「炙り塩さば」→ DB: 「塩サバ」
    "炙り塩さば": "塩サバ",
    // 「焼鮭」→ DB: 「鮭」
    "焼鮭": "鮭",
    // 「からあげ」のサイズがDB名と異なる
    "からあげ（2個）": "からあげ（2個）",
    "からあげ（6個）": "からあげ（6個）",
    // 「ささみチキン」→ DB: 「ささみチキン（単品）」
    "ささみチキン": "ささみチキン（単品）",
    // 「キムチ」→ DB: 「キムチ単品」
    "キムチ": "キムチ単品",
    // 「ソーセージ」のサイズ表記
    "ソーセージ（1本）": "ソーセージ（単品）",

    // === こだわり丼: メガいくら丼は独立メニュー ===
    "メガいくら丼": "いくら丼（メガ）",

    // === 一品: DB名に「（ドレッシング除く）」が付く ===
    "サラダ": "サラダ（ドレッシング除く）",
    "オクラサラダ": "オクラサラダ（ドレッシング除く）",

    // === 牛すき鍋定食（specialに残っている場合用） ===
    "牛すき鍋定食（ミニ）": "牛すき鍋定食（たまご1個）（ミニ）",
    "牛すき鍋定食（並盛）": "牛すき鍋定食（たまご1個）（並盛）",
    "牛すき鍋定食（大盛）": "牛すき鍋定食（たまご1個）（大盛）",
    // 旧マッピング互換
    "牛すき鍋定食（ごはんミニ）": "牛すき鍋定食（たまご1個）（ミニ）",
    "牛すき鍋定食（ごはん並盛）": "牛すき鍋定食（たまご1個）（並盛）",
    "牛すき鍋定食（ごはん大盛）": "牛すき鍋定食（たまご1個）（大盛）",
    // 牛・旨辛豆腐鍋定食
    "牛・旨辛豆腐鍋定食（ミニ）": "牛・旨辛豆腐鍋定食（たまご1個）（ミニ）",
    "牛・旨辛豆腐鍋定食（並盛）": "牛・旨辛豆腐鍋定食（たまご1個）（並盛）",
    "牛・旨辛豆腐鍋定食（大盛）": "牛・旨辛豆腐鍋定食（たまご1個）（大盛）",
    "牛・旨辛豆腐鍋定食（ごはんミニ）": "牛・旨辛豆腐鍋定食（たまご1個）（ミニ）",
    "牛・旨辛豆腐鍋定食（ごはん並盛）": "牛・旨辛豆腐鍋定食（たまご1個）（並盛）",
    "牛・旨辛豆腐鍋定食（ごはん大盛）": "牛・旨辛豆腐鍋定食（たまご1個）（大盛）",
    // 単品: 全角スペースを含む
    "牛すき鍋　単品": "牛すき鍋単品",
    "牛・旨辛豆腐鍋　単品": "牛・旨辛豆腐鍋単品",
  });

  const report = matcher.matchAll(scrapeResult.items, existingMenus);
  report.chainId = "sukiya";

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
  console.log("DBに反映するには npm run seed:sukiya を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
