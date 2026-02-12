/**
 * やよい軒メニューデータをDBに投入するスクリプト
 * 実行: npm run seed:yayoiken または npx tsx scripts/seed-yayoiken.ts
 */

import Database from "better-sqlite3";
import path from "path";
import { yayoikenMenuData } from "./data/yayoiken-menus";

const db = new Database(
  path.join(process.cwd(), "data", "chain_restaurant.db")
);

function markPreviousMenusUnavailable(): number {
  const stmt = db.prepare(`
    UPDATE menus SET is_available = 0 WHERE chain_id = 'yayoiken'
  `);
  const result = stmt.run();
  return result.changes;
}

function insertYayoikenMenus(): number {
  const insertStmt = db.prepare(`
    INSERT INTO menus (
      menu_id, chain_id, menu_name, price, category,
      calories, protein, fat, carb, fiber, sodium, sugar,
      allergens, timing,
      is_seasonal, is_limited, is_available,
      created_at, updated_at
    ) VALUES (
      ?, 'yayoiken', ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?, 1,
      datetime('now'), datetime('now')
    )
    ON CONFLICT(menu_id) DO UPDATE SET
      menu_name = excluded.menu_name,
      price = excluded.price,
      category = excluded.category,
      calories = excluded.calories,
      protein = excluded.protein,
      fat = excluded.fat,
      carb = excluded.carb,
      fiber = excluded.fiber,
      sodium = excluded.sodium,
      sugar = excluded.sugar,
      allergens = excluded.allergens,
      timing = excluded.timing,
      is_seasonal = excluded.is_seasonal,
      is_limited = excluded.is_limited,
      is_available = excluded.is_available,
      updated_at = datetime('now')
  `);

  let count = 0;
  for (const menu of yayoikenMenuData) {
    insertStmt.run(
      menu.menu_id,
      menu.menu_name,
      menu.price,
      menu.category,
      menu.calories,
      menu.protein,
      menu.fat,
      menu.carb,
      menu.fiber,
      menu.sodium,
      menu.sugar,
      JSON.stringify(menu.allergens),
      menu.timing,
      menu.is_seasonal ? 1 : 0,
      menu.is_limited ? 1 : 0
    );
    count++;
  }

  return count;
}

function getCategoryCounts(): { category: string; count: number }[] {
  const stmt = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM menus
    WHERE chain_id = 'yayoiken'
    GROUP BY category
    ORDER BY count DESC
  `);
  return stmt.all() as { category: string; count: number }[];
}

function main() {
  console.log("🚀 やよい軒データシード開始...\n");

  // 1. 既存メニューを非表示に設定
  const markedCount = markPreviousMenusUnavailable();
  console.log(`⏸️  既存やよい軒メニュー ${markedCount}件を非表示に設定`);

  // 2. データ投入（UPSERT: 既存は更新、新規は追加）
  const insertedCount = insertYayoikenMenus();
  console.log(`✅ やよい軒メニュー ${insertedCount}件をUPSERT`);

  // 3. カテゴリ別件数を表示
  console.log("\n📊 カテゴリ別メニュー数:");
  const categoryCounts = getCategoryCounts();
  for (const { category, count } of categoryCounts) {
    console.log(`   - ${category}: ${count}件`);
  }

  // 4. 合計確認
  const totalStmt = db.prepare(
    "SELECT COUNT(*) as count FROM menus WHERE chain_id = 'yayoiken'"
  );
  const total = totalStmt.get() as { count: number };
  console.log(`\n✨ 完了! やよい軒メニュー合計: ${total.count}件`);
}

main();
