/**
 * 松屋メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:matsuya または npx tsx scripts/seed-matsuya.ts
 */

import { matsuyaMenuData } from "./data/matsuya-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 松屋データシード開始...\n");

  const db = openDb();

  // 店舗限定カテゴリは is_limited 扱い（従来seedの挙動を踏襲）
  const items = matsuyaMenuData.map((menu) => ({
    ...menu,
    is_limited: menu.is_limited || menu.category === "店舗限定",
  }));

  const summary = seedChainMenus(db, "matsuya", items);
  printSeedSummary(db, summary);
}

main();
