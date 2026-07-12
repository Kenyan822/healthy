/**
 * リンガーハットメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:ringerhut または npx tsx scripts/seed-ringerhut.ts
 */

import { ringerhutMenuData } from "./data/ringerhut-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 リンガーハットデータシード開始...\n");

  const db = openDb();
  const summary = seedChainMenus(db, "ringerhut", ringerhutMenuData);
  printSeedSummary(db, summary);
}

main();
