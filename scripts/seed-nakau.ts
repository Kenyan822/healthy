/**
 * なか卯メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:nakau または npx tsx scripts/seed-nakau.ts
 */

import Database from "better-sqlite3";
import path from "path";
import { nakauMenuData } from "./data/nakau-menus";

const db = new Database(
  path.join(process.cwd(), "data", "chain_restaurant.db")
);

function deletePreviousNakauMenus(): number {
  const deleteStmt = db.prepare(`
    DELETE FROM menus WHERE chain_id = 'nakau'
  `);
  const result = deleteStmt.run();
  return result.changes;
}

function insertNakauMenus(): number {
  const insertStmt = db.prepare(`
    INSERT INTO menus (
      menu_id, chain_id, menu_name, price, category,
      calories, protein, fat, carb, fiber, sodium,
      allergens,
      is_seasonal, is_limited, is_available,
      created_at, updated_at
    ) VALUES (
      ?, 'nakau', ?, ?, ?,
      ?, ?, ?, ?, NULL, ?,
      ?,
      0, 0, 1,
      datetime('now'), datetime('now')
    )
  `);

  let count = 0;
  for (const menu of nakauMenuData) {
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
      JSON.stringify(menu.allergens)
    );
    count++;
  }

  return count;
}

function getCategoryCounts(): { category: string; count: number }[] {
  const stmt = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM menus
    WHERE chain_id = 'nakau'
    GROUP BY category
    ORDER BY count DESC
  `);
  return stmt.all() as { category: string; count: number }[];
}

function main() {
  console.log("🚀 なか卯データシード開始...\n");

  // 1. 既存データ削除
  const deletedCount = deletePreviousNakauMenus();
  console.log(`🗑️  既存なか卯メニュー ${deletedCount}件を削除`);

  // 2. 新規データ投入
  const insertedCount = insertNakauMenus();
  console.log(`✅ なか卯メニュー ${insertedCount}件を投入`);

  // 3. カテゴリ別件数を表示
  console.log("\n📊 カテゴリ別メニュー数:");
  const categoryCounts = getCategoryCounts();
  for (const { category, count } of categoryCounts) {
    console.log(`   - ${category}: ${count}件`);
  }

  // 4. 合計確認
  const totalStmt = db.prepare(
    "SELECT COUNT(*) as count FROM menus WHERE chain_id = 'nakau'"
  );
  const total = totalStmt.get() as { count: number };
  console.log(`\n✨ 完了! なか卯メニュー合計: ${total.count}件`);
}

main();
