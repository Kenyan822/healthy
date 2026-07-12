/**
 * 吉野家メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:yoshinoya または npx tsx scripts/seed-yoshinoya.ts
 */

import { yoshinoyaMenuData } from "./data/yoshinoya-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 吉野家データシード開始...\n");

  const db = openDb();

  // 地域限定・C&C限定カテゴリは is_limited 扱い（従来seedの挙動を踏襲）
  const items = yoshinoyaMenuData.map((menu) => ({
    ...menu,
    is_limited:
      menu.category === "地域限定" || menu.category === "C&C限定",
  }));

  const summary = seedChainMenus(db, "yoshinoya", items);
  printSeedSummary(db, summary);
}

main();
