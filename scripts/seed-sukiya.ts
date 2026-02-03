/**
 * すき家メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:sukiya または npx tsx scripts/seed-sukiya.ts
 */

import Database from "better-sqlite3";
import path from "path";
import { sukiyaMenuData } from "./data/sukiya-menus";

const db = new Database(
  path.join(process.cwd(), "data", "chain_restaurant.db")
);

function deletePreviousSukiyaMenus(): number {
  const deleteStmt = db.prepare(`
    DELETE FROM menus WHERE chain_id = 'sukiya'
  `);
  const result = deleteStmt.run();
  return result.changes;
}

function insertSukiyaMenus(): number {
  const insertStmt = db.prepare(`
    INSERT INTO menus (
      menu_id, chain_id, menu_name, price, category,
      calories, protein, fat, carb, fiber, sodium,
      allergens,
      is_seasonal, is_limited, is_available,
      created_at, updated_at
    ) VALUES (
      ?, 'sukiya', ?, NULL, ?,
      ?, ?, ?, ?, NULL, ?,
      ?,
      0, ?, 1,
      datetime('now'), datetime('now')
    )
  `);

  let count = 0;
  for (const menu of sukiyaMenuData) {
    // 店舗限定カテゴリの場合は is_limited = 1
    const isLimited = menu.category === "店舗限定" ? 1 : 0;

    insertStmt.run(
      menu.menu_id,
      menu.menu_name,
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
    WHERE chain_id = 'sukiya'
    GROUP BY category
    ORDER BY count DESC
  `);
  return stmt.all() as { category: string; count: number }[];
}

function main() {
  console.log("🚀 すき家データシード開始...\n");

  // 1. 既存データ削除
  const deletedCount = deletePreviousSukiyaMenus();
  console.log(`🗑️  既存すき家メニュー ${deletedCount}件を削除`);

  // 2. 新規データ投入
  const insertedCount = insertSukiyaMenus();
  console.log(`✅ すき家メニュー ${insertedCount}件を投入`);

  // 3. カテゴリ別件数を表示
  console.log("\n📊 カテゴリ別メニュー数:");
  const categoryCounts = getCategoryCounts();
  for (const { category, count } of categoryCounts) {
    console.log(`   - ${category}: ${count}件`);
  }

  // 4. 合計確認
  const totalStmt = db.prepare(
    "SELECT COUNT(*) as count FROM menus WHERE chain_id = 'sukiya'"
  );
  const total = totalStmt.get() as { count: number };
  console.log(`\n✨ 完了! すき家メニュー合計: ${total.count}件`);
}

main();
