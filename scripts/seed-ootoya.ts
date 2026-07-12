/**
 * 大戸屋メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:ootoya または npx tsx scripts/seed-ootoya.ts
 */

import { ootoyaMenuData } from "./data/ootoya-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 大戸屋データシード開始...\n");

  const db = openDb();
  const summary = seedChainMenus(db, "ootoya", ootoyaMenuData);
  printSeedSummary(db, summary);
}

main();
