/**
 * やよい軒メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:yayoiken または npx tsx scripts/seed-yayoiken.ts
 */

import { yayoikenMenuData } from "./data/yayoiken-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 やよい軒データシード開始...\n");

  const db = openDb();
  const summary = seedChainMenus(db, "yayoiken", yayoikenMenuData);
  printSeedSummary(db, summary);
}

main();
