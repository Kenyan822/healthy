/**
 * なか卯メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:nakau または npx tsx scripts/seed-nakau.ts
 */

import { nakauMenuData } from "./data/nakau-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 なか卯データシード開始...\n");

  const db = openDb();
  const summary = seedChainMenus(db, "nakau", nakauMenuData);
  printSeedSummary(db, summary);
}

main();
