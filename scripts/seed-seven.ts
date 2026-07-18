/**
 * セブン-イレブンメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:seven または npx tsx scripts/seed-seven.ts
 */

import { sevenMenuData } from "./data/seven-menus";
import {
  openDb,
  upsertChain,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 セブン-イレブンデータシード開始...\n");

  const db = openDb();

  upsertChain(db, {
    chainId: "seven",
    chainName: "セブン-イレブン",
    chainNameEn: "seven-eleven",
    chainNameKana: "せぶんいれぶん",
    category: "conbini",
    officialUrl: "https://www.sej.co.jp",
    description:
      "国内最大手のコンビニエンスストア。おにぎり・弁当・惣菜・ホットスナックなどオリジナル商品の栄養成分と価格を掲載。関東地域の商品ラインナップ基準。",
  });

  // 商品・価格に地域差があるため関東基準。価格は税込を四捨五入
  const summary = seedChainMenus(db, "seven", sevenMenuData);
  printSeedSummary(db, summary);
}

main();
