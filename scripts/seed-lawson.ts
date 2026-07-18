/**
 * ローソンメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:lawson または npx tsx scripts/seed-lawson.ts
 */

import { lawsonMenuData } from "./data/lawson-menus";
import {
  openDb,
  upsertChain,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 ローソンデータシード開始...\n");

  const db = openDb();

  upsertChain(db, {
    chainId: "lawson",
    chainName: "ローソン",
    chainNameEn: "lawson",
    chainNameKana: "ろーそん",
    category: "conbini",
    officialUrl: "https://www.lawson.co.jp",
    description:
      "全国展開のコンビニエンスストア。おにぎり・弁当・麺類・ホットスナックなどオリジナル商品の栄養成分と価格を掲載。栄養成分は関東地域基準。",
  });

  // 価格は「ローソン標準価格」(税込)。商品入れ替わりが速いため毎週フル更新
  const summary = seedChainMenus(db, "lawson", lawsonMenuData);
  printSeedSummary(db, summary);
}

main();
