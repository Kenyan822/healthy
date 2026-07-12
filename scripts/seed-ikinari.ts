/**
 * いきなり！ステーキメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:ikinari または npx tsx scripts/seed-ikinari.ts
 */

import { ikinariMenuData } from "./data/ikinari-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 いきなり！ステーキデータシード開始...\n");

  const db = openDb();
  const summary = seedChainMenus(db, "ikinari", ikinariMenuData);
  printSeedSummary(db, summary);
}

main();
