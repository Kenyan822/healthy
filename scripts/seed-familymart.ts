/**
 * ファミリーマートメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:familymart または npx tsx scripts/seed-familymart.ts
 */

import { familymartMenuData } from "./data/familymart-menus";
import {
  openDb,
  upsertChain,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 ファミリーマートデータシード開始...\n");

  const db = openDb();

  upsertChain(db, {
    chainId: "familymart",
    chainName: "ファミリーマート",
    chainNameEn: "familymart",
    chainNameKana: "ふぁみりーまーと",
    category: "conbini",
    officialUrl: "https://www.family.co.jp",
    description:
      "全国展開のコンビニエンスストア。おにぎり・弁当・サンドイッチ・ホットスナックなどオリジナル商品の栄養成分と価格を掲載。",
  });

  // 価格は税込。栄養と価格が別ページのため突合できない商品は価格なしで掲載
  const summary = seedChainMenus(db, "familymart", familymartMenuData);
  printSeedSummary(db, summary);
}

main();
