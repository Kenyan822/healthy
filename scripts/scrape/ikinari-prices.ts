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
// タブ構成: mt1=路面・ロードサイド・商業施設（レストラン）, mt3=フードコート
// 各タブ内に _lunch（ランチ）/ _global（グランドメニュー）セクションがある
const IKINARI_CONFIG = {
  chainId: "ikinari",
  baseUrl: "https://ikinaristeak.com/menu/",
  menuTypes: [
    { id: "mt1", tabId: "mt1", label: "路面・ロードサイド・商業施設", isFoodCourt: false },
    { id: "mt3", tabId: "mt3", label: "フードコート", isFoodCourt: true },
  ],
  timeout: 60000,
};

interface ScrapedMenuWithType extends ScrapedMenuItem {
  menuType: string; // mt1 or mt2
  isFoodCourt: boolean;
}

/**
 * 指定ミリ秒待機（page.waitForTimeout の代替）
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  console.log(
    `Menu types: ${IKINARI_CONFIG.menuTypes.map((t) => `${t.id}(${t.label})`).join(", ")}\n`
  );

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
      console.log(`\n--- Scraping ${menuType.id} (${menuType.label}) ---`);

      // タブをクリックして店舗タイプを切り替え
      const tabSelector = `#${menuType.tabId}`;
      try {
        await page.waitForSelector(tabSelector, { timeout: 5000 });
        await page.click(tabSelector);
        console.log(`  Tab clicked: ${tabSelector}`);
      } catch {
        console.log(
          `  Tab click failed, trying URL parameter: ?menu=${menuType.tabId}`
        );
        await page.goto(
          `${IKINARI_CONFIG.baseUrl}?menu=${menuType.tabId}`,
          {
            waitUntil: "networkidle2",
            timeout: IKINARI_CONFIG.timeout,
          }
        );
      }

      // タブ切り替え待機
      await delay(1500);

      // グランドメニューセクションの存在確認
      const globalSelector = `.${menuType.id}_global`;
      const globalCount = await page.$$eval(
        globalSelector,
        (els) => els.length
      );
      console.log(
        `  ${globalSelector}: ${globalCount} elements found`
      );

      // メニュー情報を抽出（グランドメニューセクションのみ）
      const menuItems = await extractMenuItems(
        page,
        menuType.id,
        menuType.isFoodCourt
      );
      items.push(...menuItems);
      console.log(`  Found ${menuItems.length} items in ${menuType.id}`);
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
 * 各メニューアイテムは個別の LI 要素で、CSSクラス .mt{X}_global を持つ。
 * querySelectorAll で全要素を取得し、各LIのテキストからメニュー名・サイズ・価格を抽出。
 */
async function extractMenuItems(
  page: Page,
  menuType: string,
  isFoodCourt: boolean
): Promise<ScrapedMenuWithType[]> {
  const result = await page.evaluate(
    (mt, fc) => {
      const items: {
        name: string;
        price: number;
        size?: string;
        category?: string;
        menuType: string;
        isFoodCourt: boolean;
      }[] = [];

      // グランドメニューの全LI要素を取得（ランチセクションは除外）
      const globalElements = document.querySelectorAll(`.${mt}_global`);
      if (globalElements.length === 0) return items;

      // ランチ要素を除外（_lunch クラスも持つ要素はスキップ）
      const grandElements = Array.from(globalElements).filter(
        (el) => !el.className.includes("_lunch")
      );

      for (const el of grandElements) {
        const text = (el as HTMLElement).innerText;
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l);

        if (lines.length === 0) continue;

        // 最初の数行からメニュー名を検出
        // 複数行にまたがる名前を結合（例: "グリル" + "チキンステーキ"）
        let menuName = "";
        let lineIdx = 0;

        for (let i = 0; i < Math.min(lines.length, 5); i++) {
          const line = lines[i];
          // 名前でない行を検出 → 名前収集後ならbreak、収集前ならskip
          const isNonName =
            /写真/.test(line) ||
            /円/.test(line) ||
            /^\d+g/.test(line) ||
            /^\d+g[0-9,]+円/.test(line) ||
            /増量/.test(line) ||
            /大盛/.test(line) ||
            /おかわり/.test(line) ||
            /対象店舗/.test(line) ||
            /盛り付け例/.test(line) ||
            /^ランチ/.test(line) ||
            /^ステーキ\d+g/.test(line) ||
            /^ハンバーグ\d+g/.test(line);

          if (isNonName) {
            if (menuName) {
              // 名前収集済み → 名前検出終了
              lineIdx = i;
              break;
            }
            lineIdx = i + 1;
            continue;
          }

          // メニュー名の一部と判断
          if (
            line.length < 25 &&
            !/^\d+g/.test(line) &&
            !/^[0-9,]+円/.test(line)
          ) {
            menuName += line;
            lineIdx = i + 1;
          } else {
            lineIdx = i;
            break;
          }
        }

        if (!menuName) continue;

        // 括弧付き説明を除去（「（オニオンソース付き）」等）
        const cleanName = menuName
          .replace(/（[^）]*付き）/g, "")
          .replace(/\([^)]*付き\)/g, "")
          .trim();

        // カテゴリ判定
        let category: string | undefined;
        if (
          /セット|ライス|サラダ|スープ|カレー/.test(cleanName) &&
          !/ステーキ|ハンバーグ|コンボ|チキン/.test(cleanName)
        ) {
          category = "サイド";
        } else if (
          /ブロッコリー|オニオンスライス|コーン|キャロット|マッシュポテト|カレールー|チーズソース|オニオンソース|和風おろし/.test(
            cleanName
          )
        ) {
          category = "トッピング";
        } else if (
          /ハンバーグ/.test(cleanName) &&
          /トッピング/.test(menuName)
        ) {
          category = "トッピング";
        }

        // サイズ・価格を抽出
        const remaining = lines.slice(lineIdx);
        let hasSizedItem = false; // サイズ付きアイテムが見つかったか

        for (let i = 0; i < remaining.length; i++) {
          const line = remaining[i];

          // 単純サイズ行 → 次行に価格
          const sizeOnly = line.match(/^(\d+g)$/);
          if (sizeOnly) {
            const nextLine = remaining[i + 1];
            if (nextLine) {
              const priceMatch = nextLine.match(/^([0-9,]+)円/);
              if (priceMatch) {
                const price = parseInt(
                  priceMatch[1].replace(/,/g, ""),
                  10
                );
                if (price > 0 && price < 20000) {
                  hasSizedItem = true;
                  items.push({
                    name: `${cleanName} ${sizeOnly[1]}`,
                    price,
                    size: undefined,
                    category,
                    menuType: mt,
                    isFoodCourt: fc,
                  });
                }
              }
            }
            continue;
          }

          // サイズ+価格同一行: "130g1,360円" or "130g 1,360円"
          const sizePrice = line.match(/^(\d+g)\s*([0-9,]+)円/);
          if (sizePrice) {
            const price = parseInt(sizePrice[2].replace(/,/g, ""), 10);
            if (price > 0 && price < 20000) {
              hasSizedItem = true;
              items.push({
                name: `${cleanName} ${sizePrice[1]}`,
                price,
                size: undefined,
                category,
                menuType: mt,
                isFoodCourt: fc,
              });
            }
            continue;
          }

          // コンボ: "ステーキ100g+\nハンバーグ150g\n1,690円" (改行あり)
          const comboStart = line.match(/^(ステーキ\d+g)\+$/);
          if (comboStart && i + 1 < remaining.length) {
            const nextLine = remaining[i + 1];
            const comboEnd = nextLine.match(/^(ハンバーグ\d+g)$/);
            if (comboEnd) {
              const comboSize = `${comboStart[1]}+${comboEnd[1]}`;
              const priceLine = remaining[i + 2];
              if (priceLine) {
                const priceMatch = priceLine.match(/^([0-9,]+)円/);
                if (priceMatch) {
                  const price = parseInt(
                    priceMatch[1].replace(/,/g, ""),
                    10
                  );
                  if (price > 0 && price < 20000) {
                    hasSizedItem = true;
                    items.push({
                      name: `${cleanName} ${comboSize}`,
                      price,
                      size: undefined,
                      category,
                      menuType: mt,
                      isFoodCourt: fc,
                    });
                  }
                }
              }
            }
            continue;
          }

          // コンボ同一行: "ステーキ60g+ハンバーグ100g1,470円"
          const comboInline = line.match(
            /^(ステーキ\d+g\+ハンバーグ\d+g)\s*([0-9,]+)円/
          );
          if (comboInline) {
            const price = parseInt(
              comboInline[2].replace(/,/g, ""),
              10
            );
            if (price > 0 && price < 20000) {
              hasSizedItem = true;
              items.push({
                name: `${cleanName} ${comboInline[1]}`,
                price,
                size: undefined,
                category,
                menuType: mt,
                isFoodCourt: fc,
              });
            }
            continue;
          }

          // 価格のみの行（サイドメニュー・トッピング等: サイズなし）
          // サイズ付きアイテムが既にあるメニュー（ステーキ等）では不要
          const priceOnly = line.match(/^([0-9,]+)円$/);
          if (
            priceOnly &&
            !sizeOnly &&
            !hasSizedItem &&
            items.every((it) => it.name !== cleanName)
          ) {
            const price = parseInt(
              priceOnly[1].replace(/,/g, ""),
              10
            );
            if (price > 0 && price < 5000) {
              items.push({
                name: cleanName,
                price,
                size: undefined,
                category: category || "サイド",
                menuType: mt,
                isFoodCourt: fc,
              });
            }
          }
        }
      }

      return items;
    },
    menuType,
    isFoodCourt
  );

  return result;
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
  const autoYes = args.includes("--yes") || args.includes("-y");

  if (dryRun) {
    console.log("[DRY RUN] スクレイピングしてレポート表示します\n");
  }

  // 1. スクレイピング実行
  const scrapeResult = await scrapeIkinari(dryRun);

  if (scrapeResult.length === 0) {
    console.error("No items scraped. Exiting.");
    process.exit(1);
  }

  // 2. フードコートアイテムに「（FC）」サフィックスを付与
  //    サイドメニュー等はFC/非FC共通なのでサフィックス不要
  for (const item of scrapeResult) {
    if (item.isFoodCourt && !item.category) {
      // メインメニュー（ステーキ等のg付き or ステーキ重）にのみ「（FC）」を追加
      if (/\d+g$/.test(item.name)) {
        item.name = `${item.name}（FC）`;
      } else if (/ステーキ重$/.test(item.name) || /ヒレステーキ重$/.test(item.name)) {
        item.name = `${item.name}（FC）`;
      }
    }
  }

  // 3. 重複排除
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

  // 4. 既存メニュー取得（データファイルから）
  const existingMenus = getExistingMenus();
  console.log(`Existing menus in data file: ${existingMenus.length}`);

  // 5. マッチング
  const matcher = new MenuMatcher();

  // 手動マッピング（サイト名とDB名の表記が大きく異なるもの）
  matcher.setManualMappings({
    // --- 路面店/商業施設（mt1）---
    // サイトでは「グリルチキンステーキ」が「グリル」+「チキンステーキ」で結合される
    "グリルチキンステーキ 220g": "グリルチキンステーキ 220g",
    "グリルチキンステーキ 440g": "グリルチキンステーキ 440g",
    // トッピングハンバーグ → ハンバーグ
    "トッピングハンバーグ 100g": "ハンバーグ 100g",
    "トッピングハンバーグ 150g": "ハンバーグ 150g",
    // ステーキ重（サイトではサイズ付き、DBではサイズなし）
    "ステーキ重 150g": "ステーキ重",
    "ヒレステーキ重 100g": "ヒレステーキ重",
    // サイドメニュー（サイトでは＆表記）
    "ライス＆サラダセット": "ライス・サラダセット",
    "ライス＆スープセット": "ライス・スープセット",
    "ライス＆ドリンクセット": "ライス・スープセット",
    // ワイルドコンボ（サイトはコンボ表記 → DBは合計グラム数）
    "ワイルドコンボ ステーキ100g+ハンバーグ150g": "ワイルドコンボ 250g",
    "ワイルドコンボ ステーキ150g+ハンバーグ150g": "ワイルドコンボ 300g",
    "ワイルドコンボ ステーキ300g+ハンバーグ150g": "ワイルドコンボ 450g",

    // --- フードコート（mt3）---
    "グリルチキンステーキ 220g（FC）": "グリルチキンステーキ 220g（FC）",
    "グリルチキンステーキ 440g（FC）": "グリルチキンステーキ 440g（FC）",
    "ステーキ重 150g（FC）": "ステーキ重（FC）",
    "ヒレステーキ重 100g（FC）": "ヒレステーキ重（FC）",
    // FCワイルドコンボ
    "ワイルドコンボ ステーキ60g+ハンバーグ100g（FC）": "ワイルドコンボ 160g（FC）",
    "ワイルドコンボ ステーキ80g+ハンバーグ150g（FC）": "ワイルドコンボ 230g（FC）",
    "ワイルドコンボ ステーキ100g+ハンバーグ150g（FC）": "ワイルドコンボ 250g（FC）",
    // FC限定ドリンク
    "ジンジャーエール": "ジンジャーエール（FC）",
    "カルピスソーダ": "カルピスソーダ（FC）",
    "アイスティー": "アイスティー（FC）",
    "アイスコーヒー": "アイスコーヒー（FC）",

    // --- 共通: 名前表記の差分 ---
    // ドリンク（サイトに修飾語がつく）
    "特定保健用食品（トクホ）サントリー黒烏龍茶": "サントリー黒烏龍茶",
    "機能性表示食品いきなりブランド黒烏龍茶": "いきなりブランド黒烏龍茶",
    "レッドブル（※柏店では取り扱っておりません）": "レッドブル",
    "グラスワイン（赤/白）": "グラスワイン",
    "ボトルワイン（赤/白）": "ボトルワイン",
    "コーラ": "コカ・コーラ",
    // セット名（サイトの説明が長い）
    "ミニカレーライスセット（ミニカレーライス・サラダ・スープ）": "ミニカレーライスセット",
    "ミニカレーライスセット（ミニカレーライス・サラダ・ドリンクまたはスープ）": "ミニカレーライスセット",
    "いきなりセット（ライス・サラダ・ドリンクまたはスープ）": "いきなりセット（ライス・サラダ・スープ）",
    // トッピング
    "和風おろしポン酢": "和風おろしポン酢ソース",
    // ライス（サイトは「ライス（おかわり無料）」→ 普通盛の価格）
    "ライス": "ライス（普通盛）",
  });

  const report = matcher.matchAll(uniqueItems, existingMenus);
  report.chainId = "ikinari";

  // 6. レポート出力
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

  if (!autoYes) {
    const answer = await prompt(
      `\n${updateCount} 件の価格をデータファイルに更新しますか？ (y/n): `
    );
    if (answer.toLowerCase() !== "y") {
      console.log("キャンセルしました");
      return;
    }
  } else {
    console.log(`\n--yes: ${updateCount} 件の価格を自動更新します`);
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
