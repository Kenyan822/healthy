/**
 * いきなりステーキ価格スクレイパー（Puppeteer版）
 *
 * 実行: npx tsx scripts/scrape/ikinari-prices.ts [--dry-run]
 *
 * スクレイピングした価格をデータファイル(scripts/data/ikinari-menus.ts)に書き戻す。
 * DB投入は seed:ikinari で別途実行。
 */

import * as fs from "fs";
import * as path from "path";
import puppeteer, { type Browser, type Page } from "puppeteer";
import { MenuMatcher } from "./common/matcher";
import { ikinariMenuData } from "../data/ikinari-menus";
import type {
  ScrapedMenuItem,
  ExistingMenu,
  PriceUpdateReport,
} from "./common/types";

// いきなりステーキ用設定
const IKINARI_CONFIG = {
  chainId: "ikinari",
  baseUrl: "https://ikinaristeak.com/menu/",
  // 店舗タイプ: mt1=路面店/ロードサイド/商業施設, mt2=フードコート
  menuTypes: ["mt1", "mt2"],
  timeout: 60000,
};

interface ScrapedMenuWithType extends ScrapedMenuItem {
  menuType: string; // mt1 or mt2
}

/**
 * Puppeteerでいきなりステーキのメニューページをスクレイピング
 */
async function scrapeIkinari(
  dryRun: boolean = false
): Promise<ScrapedMenuWithType[]> {
  const items: ScrapedMenuWithType[] = [];

  console.log("\n=== いきなりステーキ Price Scraping ===");
  console.log(`URL: ${IKINARI_CONFIG.baseUrl}`);
  console.log(`Menu types: ${IKINARI_CONFIG.menuTypes.join(", ")}\n`);

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // メニューページにアクセス
    console.log(`Navigating to ${IKINARI_CONFIG.baseUrl}...`);
    await page.goto(IKINARI_CONFIG.baseUrl, {
      waitUntil: "networkidle2",
      timeout: IKINARI_CONFIG.timeout,
    });

    // 各店舗タイプのメニューをスクレイピング
    for (const menuType of IKINARI_CONFIG.menuTypes) {
      if (dryRun && items.length >= 20) {
        console.log(`[DRY RUN] Skipping ${menuType} - already have enough items`);
        continue;
      }

      console.log(`\n--- Scraping ${menuType} ---`);

      // タブをクリックして店舗タイプを切り替え
      try {
        const tabSelector = `.menuTab li[data-menu="${menuType}"]`;
        await page.waitForSelector(tabSelector, { timeout: 5000 });
        await page.click(tabSelector);
        await page.waitForTimeout(1000); // タブ切り替え待機
      } catch {
        console.log(`Tab ${menuType} not found, trying URL parameter...`);
        await page.goto(`${IKINARI_CONFIG.baseUrl}?menu=${menuType}`, {
          waitUntil: "networkidle2",
          timeout: IKINARI_CONFIG.timeout,
        });
      }

      // メニュー情報を抽出
      const menuItems = await extractMenuItems(page, menuType);
      items.push(...menuItems);
      console.log(`Found ${menuItems.length} items in ${menuType}`);
    }
  } catch (error) {
    console.error("Scraping error:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log(`\n=== Scraping Complete ===`);
  console.log(`Total items: ${items.length}`);

  return items;
}

/**
 * ページからメニュー情報を抽出
 */
async function extractMenuItems(
  page: Page,
  menuType: string
): Promise<ScrapedMenuWithType[]> {
  return await page.evaluate((mt) => {
    const items: {
      name: string;
      price: number;
      size?: string;
      category?: string;
      menuType: string;
    }[] = [];

    // ページ内のテキストを取得
    const bodyText = document.body.innerText;
    const lines = bodyText.split("\n").map((l) => l.trim()).filter((l) => l);

    // 現在のメニュー名を追跡
    let currentMenuName = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // メニュー名を検出（ステーキ、ハンバーグ、コンボなどを含む行）
      if (
        /(?:ステーキ|ハンバーグ|コンボ|グリルチキン|ステーキ重|ヒレステーキ重)/.test(line) &&
        !/円$/.test(line) &&
        !/^\d+g$/.test(line) &&
        !line.includes("写真")
      ) {
        // ランチプレフィックスを除去して保存
        currentMenuName = line.replace(/^ランチ\s*/, "").trim();
      }

      // サイズと価格を検出
      // パターン1: "150g" の次の行に "1,800円"
      const sizeMatch = line.match(/^(\d+g)$/);
      if (sizeMatch && currentMenuName) {
        const size = sizeMatch[1];
        // 次の行で価格を探す
        const nextLine = lines[i + 1];
        if (nextLine) {
          const priceMatch = nextLine.match(/^([0-9,]+)円$/);
          if (priceMatch) {
            const price = parseInt(priceMatch[1].replace(/,/g, ""), 10);
            if (!isNaN(price) && price > 0 && price < 20000) {
              // 名前にサイズを含めるので、sizeフィールドは不要
              const fullName = `${currentMenuName} ${size}`;
              items.push({
                name: fullName,
                price,
                size: undefined, // マッチャーでサイズ付加を防ぐ
                category: undefined,
                menuType: mt,
              });
            }
          }
        }
      }

      // パターン2: "ステーキ80g+ハンバーグ100g" のようなコンボサイズ
      const comboMatch = line.match(/^(ステーキ\d+g\+ハンバーグ\d+g)$/);
      if (comboMatch && currentMenuName) {
        const size = comboMatch[1];
        const nextLine = lines[i + 1];
        if (nextLine) {
          const priceMatch = nextLine.match(/^([0-9,]+)円$/);
          if (priceMatch) {
            const price = parseInt(priceMatch[1].replace(/,/g, ""), 10);
            if (!isNaN(price) && price > 0 && price < 20000) {
              const fullName = `${currentMenuName} ${size}`;
              items.push({
                name: fullName,
                price,
                size: undefined, // マッチャーでサイズ付加を防ぐ
                category: undefined,
                menuType: mt,
              });
            }
          }
        }
      }
    }

    // サイドメニュー・トッピングの抽出
    const sidePatterns = [
      /ランチセット/,
      /ランチミニカレーライス/,
      /ランチサラダ/,
      /ランチ特製スープ/,
      /ランチライス/,
      /いきなりセット/,
      /ライス・サラダセット/,
      /ライス・スープセット/,
      /ライス（[^）]+）/,
      /サラダ/,
      /特製スープ/,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of sidePatterns) {
        if (pattern.test(line) && !line.includes("写真")) {
          const nextLine = lines[i + 1];
          if (nextLine) {
            const priceMatch = nextLine.match(/^([0-9,]+)円$/);
            if (priceMatch) {
              const price = parseInt(priceMatch[1].replace(/,/g, ""), 10);
              if (!isNaN(price) && price > 0 && price < 5000) {
                const menuName = line.replace(/^ランチ/, "").trim();
                if (!items.some((item) => item.name === menuName)) {
                  items.push({
                    name: menuName,
                    price,
                    size: undefined,
                    category: "サイド",
                    menuType: mt,
                  });
                }
              }
            }
          }
        }
      }
    }

    return items;
  }, menuType);
}

/**
 * 既存メニューをデータファイルから取得
 */
function getExistingMenus(): ExistingMenu[] {
  return ikinariMenuData.map((menu) => ({
    menuId: menu.menu_id,
    menuName: menu.menu_name,
    price: menu.price,
  }));
}

/**
 * データファイルの price フィールドを更新
 */
const UPDATE_CONFIDENCE_THRESHOLD = 0.85;

function updateDataFile(matches: PriceUpdateReport["matched"]): number {
  const filePath = path.join(__dirname, "../data/ikinari-menus.ts");
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
  const lowConfidence = report.matched.filter(
    (m) => m.confidence < UPDATE_CONFIDENCE_THRESHOLD
  );

  console.log(`\n--- High Confidence (≥0.95): ${highConfidence.length} ---`);
  for (const m of highConfidence.slice(0, 15)) {
    console.log(
      `  ✓ ${m.scrapedName} → ${m.menuName} (${m.price}円, ${m.matchType})`
    );
  }
  if (highConfidence.length > 15) {
    console.log(`  ... and ${highConfidence.length - 15} more`);
  }

  console.log(
    `\n--- Medium Confidence (${UPDATE_CONFIDENCE_THRESHOLD}-0.95): ${mediumConfidence.length} ---`
  );
  for (const m of mediumConfidence) {
    console.log(
      `  ? ${m.scrapedName} → ${m.menuName} (${m.price}円, ${m.confidence.toFixed(2)})`
    );
  }

  console.log(
    `\n--- Low Confidence (<${UPDATE_CONFIDENCE_THRESHOLD}): ${lowConfidence.length} ---`
  );
  for (const m of lowConfidence) {
    console.log(
      `  ⚠ ${m.scrapedName} → ${m.menuName} (${m.price}円, ${m.confidence.toFixed(2)})`
    );
  }

  if (report.unmatched.length > 0) {
    console.log(`\n--- Unmatched: ${report.unmatched.length} ---`);
    for (const item of report.unmatched.slice(0, 20)) {
      const sizePart = item.size ? `（${item.size}）` : "";
      console.log(`  ✗ ${item.name}${sizePart}: ${item.price}円`);
    }
    if (report.unmatched.length > 20) {
      console.log(`  ... and ${report.unmatched.length - 20} more`);
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

  if (dryRun) {
    console.log("[DRY RUN] スクレイピングしてレポート表示します\n");
  }

  // 1. スクレイピング実行
  const scrapeResult = await scrapeIkinari(dryRun);

  if (scrapeResult.length === 0) {
    console.error("No items scraped. Exiting.");
    process.exit(1);
  }

  // 2. 重複排除
  const seen = new Set<string>();
  const uniqueItems = scrapeResult.filter((item) => {
    const key = `${item.name}__${item.size || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(
    `\nDeduplication: ${scrapeResult.length} → ${uniqueItems.length} items`
  );

  // 3. 既存メニュー取得（データファイルから）
  const existingMenus = getExistingMenus();
  console.log(`Existing menus in data file: ${existingMenus.length}`);

  // 4. マッチング
  const matcher = new MenuMatcher();

  // 手動マッピング（サイト名とDB名の表記が大きく異なるもの）
  matcher.setManualMappings({
    // チキンステーキ → グリルチキンステーキ
    "チキンステーキ 220g": "グリルチキンステーキ 220g",
    "チキンステーキ 440g": "グリルチキンステーキ 440g",
    // トッピングハンバーグ → ハンバーグ（トッピング）
    "トッピングハンバーグ 100g": "ハンバーグ 100g",
    "トッピングハンバーグ 150g": "ハンバーグ 150g",
    // いきなりセット
    "（ライス・サラダ・スープ）": "いきなりセット（ライス・サラダ・スープ）",
    // ライス・サラダセット
    "サラダセット": "ライス・サラダセット",
    // ステーキ重（サイトではサイズ付き、DBではサイズなし）
    "ステーキ重 150g": "ステーキ重",
    "ヒレステーキ重 100g": "ヒレステーキ重",
  });

  const report = matcher.matchAll(uniqueItems, existingMenus);
  report.chainId = "ikinari";

  // 5. レポート出力
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

  // 6. 承認を求める
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

  // 7. データファイル更新
  report.totalUpdated = updateDataFile(report.matched);
  console.log(
    `\n✅ ${report.totalUpdated} 件の価格をデータファイルに更新しました`
  );
  console.log("💡 DBに反映するには npm run seed:ikinari を実行してください");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
