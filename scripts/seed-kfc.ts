/**
 * ケンタッキーフライドチキンメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:kfc または npx tsx scripts/seed-kfc.ts
 */

import { kfcMenuData } from "./data/kfc-menus";
import {
  openDb,
  upsertChain,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 KFCデータシード開始...\n");

  const db = openDb();

  upsertChain(db, {
    chainId: "kfc",
    chainName: "ケンタッキーフライドチキン",
    chainNameEn: "kfc",
    chainNameKana: "けんたっきーふらいどちきん",
    category: "fastfood",
    officialUrl: "https://www.kfc.co.jp",
    description:
      "オリジナルチキンで知られるフライドチキンチェーン。高タンパクなチキンメニューの栄養成分と価格を掲載。",
  });

  const summary = seedChainMenus(db, "kfc", kfcMenuData);
  printSeedSummary(db, summary);
}

main();
