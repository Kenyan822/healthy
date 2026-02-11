/**
 * いきなりステーキメニューデータをDBに投入するスクリプト
 * 実行: npm run seed:ikinari または npx tsx scripts/seed-ikinari.ts
 */

import Database from "better-sqlite3";
import path from "path";
import { ikinariMenuData } from "./data/ikinari-menus";

const db = new Database(
  path.join(process.cwd(), "data", "chain_restaurant.db")
);

function deletePreviousIkinariMenus(): number {
  const deleteStmt = db.prepare(`
    DELETE FROM menus WHERE chain_id = 'ikinari'
  `);
  const result = deleteStmt.run();
  return result.changes;
}

function insertIkinariMenus(): number {
  const insertStmt = db.prepare(`
    INSERT INTO menus (
      menu_id, chain_id, menu_name, price, category,
      calories, protein, fat, carb, fiber, sodium,
      allergens,
      is_seasonal, is_limited, is_available,
      created_at, updated_at
    ) VALUES (
      ?, 'ikinari', ?, ?, ?,
      ?, ?, ?, ?, NULL, ?,
      ?,
      0, ?, 1,
      datetime('now'), datetime('now')
    )
  `);

  let count = 0;
  for (const menu of ikinariMenuData) {
    const isLimited = menu.category === "キャンペーンメニュー" ? 1 : 0;

    insertStmt.run(
      menu.menu_id,
      menu.menu_name,
      menu.price,
      menu.category,
      menu.calories,
      menu.protein,
      menu.fat,
      menu.carb,
      menu.sodium,
      JSON.stringify(menu.allergens),
      isLimited
    );
    count++;
  }

  return count;
}

function getCategoryCounts(): { category: string; count: number }[] {
  const stmt = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM menus
    WHERE chain_id = 'ikinari'
    GROUP BY category
    ORDER BY count DESC
  `);
  return stmt.all() as { category: string; count: number }[];
}

function main() {
  console.log("🚀 いきなりステーキデータシード開始...\n");

  // 1. 既存データ削除
  const deletedCount = deletePreviousIkinariMenus();
  console.log(`🗑️  既存いきなりステーキメニュー ${deletedCount}件を削除`);

  // 2. 新規データ投入
  const insertedCount = insertIkinariMenus();
  console.log(`✅ いきなりステーキメニュー ${insertedCount}件を投入`);

  // 3. カテゴリ別件数を表示
  console.log("\n📊 カテゴリ別メニュー数:");
  const categoryCounts = getCategoryCounts();
  for (const { category, count } of categoryCounts) {
    console.log(`   - ${category}: ${count}件`);
  }

  // 4. 合計確認
  const totalStmt = db.prepare(
    "SELECT COUNT(*) as count FROM menus WHERE chain_id = 'ikinari'"
  );
  const total = totalStmt.get() as { count: number };
  console.log(`\n✨ 完了! いきなりステーキメニュー合計: ${total.count}件`);
}

main();
