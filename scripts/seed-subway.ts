/**
 * サブウェイメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:subway または npx tsx scripts/seed-subway.ts
 */

import { subwayMenuData } from "./data/subway-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 サブウェイデータシード開始...\n");

  const db = openDb();
  const summary = seedChainMenus(db, "subway", subwayMenuData);
  printSeedSummary(db, summary);
}

main();
