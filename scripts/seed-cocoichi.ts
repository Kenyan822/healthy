/**
 * CoCo壱番屋メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:cocoichi または npx tsx scripts/seed-cocoichi.ts
 */

import { cocoichiMenuData } from "./data/cocoichi-menus";
import {
  openDb,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 CoCo壱番屋データシード開始...\n");

  const db = openDb();
  const summary = seedChainMenus(db, "cocoichi", cocoichiMenuData);
  printSeedSummary(db, summary);
}

main();
