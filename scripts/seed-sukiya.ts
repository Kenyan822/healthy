/**
 * すき家メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:sukiya または npx tsx scripts/seed-sukiya.ts
 */

import { sukiyaMenuData } from "./data/sukiya-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
  type SeedMenuItem,
} from "./common/seed-runner";

// スクレイピングで取得できず手動入力が必要なメニュー（サイトに存在しないもの）
const manualPriceMenus = new Set([
  "いくら丼（ごはん少なめ）",
  "ベーコン（単品）",
  "お子様チーズカレー",
  "お子様チーズ牛丼",
]);

// 販売終了した期間限定牛丼
const discontinuedPrefixes = [
  "すきやき牛丼", "辛旨すきやき牛丼",
  "白髪ねぎ牛丼", "赤だれ白髪ねぎ牛丼",
  "にんにく白髪ねぎ牛丼", "にんにく赤だれ白髪ねぎ牛丼",
];

function isDiscontinued(item: SeedMenuItem): boolean {
  return discontinuedPrefixes.some((p) => item.menu_name.startsWith(p));
}

function main() {
  console.log("🚀 すき家データシード開始...\n");

  const db = openDb();

  // 店舗限定カテゴリは is_limited 扱い（従来seedの挙動を踏襲）
  const items = sukiyaMenuData.map((menu) => ({
    ...menu,
    is_limited: menu.category === "店舗限定",
  }));

  const summary = seedChainMenus(db, "sukiya", items, {
    priceSource: (item) =>
      manualPriceMenus.has(item.menu_name) || isDiscontinued(item)
        ? "manual"
        : "scraper",
    isAvailable: (item) =>
      !(
        item.category === "うな丼" ||
        manualPriceMenus.has(item.menu_name) ||
        isDiscontinued(item)
      ),
  });
  printSeedSummary(db, summary);
}

main();
