/**
 * 丸亀製麺メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:marugame または npx tsx scripts/seed-marugame.ts
 */

import Database from "better-sqlite3";
import path from "path";
import { marugameMenuData } from "./data/marugame-menus";

const db = new Database(
  path.join(process.cwd(), "data", "chain_restaurant.db")
);

function deletePreviousMarugameMenus(): number {
  const deleteStmt = db.prepare(`
    DELETE FROM menus WHERE chain_id = 'marugame'
  `);
  const result = deleteStmt.run();
  return result.changes;
}

function insertMarugameMenus(): number {
  const insertStmt = db.prepare(`
    INSERT INTO menus (
      menu_id, chain_id, menu_name, price, category,
      calories, protein, fat, carb, fiber, sodium, sugar,
      allergens, timing,
      is_seasonal, is_limited, is_available,
      created_at, updated_at
    ) VALUES (
      ?, 'marugame', ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?, 1,
      datetime('now'), datetime('now')
    )
  `);

  let count = 0;
  for (const menu of marugameMenuData) {
    insertStmt.run(
      menu.menu_id,
      menu.menu_name,
      menu.price,
      menu.category,
      menu.calories,
      menu.protein,
      menu.fat,
      menu.carb,
      0, // fiber（丸亀製麺のデータにはないため0）
      menu.sodium,
      0, // sugar（丸亀製麺のデータにはないため0）
      JSON.stringify(menu.allergens),
      "anytime", // timing
      0, // is_seasonal
      0  // is_limited
    );
    count++;
  }

  return count;
}

function getCategoryCounts(): { category: string; count: number }[] {
  const stmt = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM menus
    WHERE chain_id = 'marugame'
    GROUP BY category
    ORDER BY count DESC
  `);
  return stmt.all() as { category: string; count: number }[];
}

function main() {
  console.log("🍜 丸亀製麺データシード開始...\n");

  // 1. 既存データ削除
  const deletedCount = deletePreviousMarugameMenus();
  console.log(`🗑️  既存丸亀製麺メニュー ${deletedCount}件を削除`);

  // 2. 新規データ投入
  const insertedCount = insertMarugameMenus();
  console.log(`✅ 丸亀製麺メニュー ${insertedCount}件を投入`);

  // 3. カテゴリ別件数を表示
  console.log("\n📊 カテゴリ別メニュー数:");
  const categoryCounts = getCategoryCounts();
  for (const { category, count } of categoryCounts) {
    console.log(`   - ${category}: ${count}件`);
  }

  // 4. 合計確認
  const totalStmt = db.prepare(
    "SELECT COUNT(*) as count FROM menus WHERE chain_id = 'marugame'"
  );
  const total = totalStmt.get() as { count: number };
  console.log(`\n✨ 完了! 丸亀製麺メニュー合計: ${total.count}件`);
}

main();
