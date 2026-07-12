/**
 * 丸亀製麺メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:marugame または npx tsx scripts/seed-marugame.ts
 */

import { marugameMenuData } from "./data/marugame-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 丸亀製麺データシード開始...\n");

  const db = openDb();
  const summary = seedChainMenus(db, "marugame", marugameMenuData);
  printSeedSummary(db, summary);
}

main();
