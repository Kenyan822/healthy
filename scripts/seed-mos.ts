/**
 * モスバーガーメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:mos または npx tsx scripts/seed-mos.ts
 */

import { mosMenuData } from "./data/mos-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 モスバーガーデータシード開始...\n");

  const db = openDb();
  const summary = seedChainMenus(db, "mos", mosMenuData);
  printSeedSummary(db, summary);
}

main();
