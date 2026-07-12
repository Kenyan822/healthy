/**
 * マクドナルドメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:mcdonalds または npx tsx scripts/seed-mcdonalds.ts
 */

import { mcdonaldsMenuData } from "./data/mcdonalds-menus";
import {
  openDb,
  upsertChain,
  seedChainMenus,
  printSeedSummary,
} from "./common/seed-runner";

function main() {
  console.log("🚀 マクドナルドデータシード開始...\n");

  const db = openDb();

  upsertChain(db, {
    chainId: "mcdonalds",
    chainName: "マクドナルド",
    chainNameEn: "mcdonalds",
    chainNameKana: "まくどなるど",
    category: "fastfood",
    officialUrl: "https://www.mcdonalds.co.jp",
    description:
      "世界最大級のハンバーガーチェーン。バーガー・サイドメニュー・朝マックの栄養成分と価格を掲載。",
  });

  // 価格は店舗タイプ(通常/準都心/都心)で異なるため通常店舗価格を採用
  const summary = seedChainMenus(db, "mcdonalds", mcdonaldsMenuData);
  printSeedSummary(db, summary);
}

main();
