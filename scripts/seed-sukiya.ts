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

function markPreviousMenusUnavailable(): number {
  const stmt = db.prepare(`
    UPDATE menus SET is_available = 0 WHERE chain_id = 'sukiya'
  `);
  const result = stmt.run();
  return result.changes;
}

function insertSukiyaMenus(): number {
  // スクレイピングで取得できず手動入力が必要なメニュー（サイトに存在しないもの）
  const manualPriceMenus = new Set([
    "いくら丼（ごはん少なめ）",
    "ベーコン（単品）",
    "お子様チーズカレー",
    "お子様チーズ牛丼",
  ]);

  // 販売終了した期間限定牛丼（price_source = "manual"）
  const discontinuedPrefixes = [
    "すきやき牛丼", "辛旨すきやき牛丼",
    "白髪ねぎ牛丼", "赤だれ白髪ねぎ牛丼",
    "にんにく白髪ねぎ牛丼", "にんにく赤だれ白髪ねぎ牛丼",
  ];

  const insertStmt = db.prepare(`
    INSERT INTO menus (
      menu_id, chain_id, menu_name, price, category,
      calories, protein, fat, carb, fiber, sodium,
      allergens,
      is_seasonal, is_limited, is_available, price_source,
      created_at, updated_at
    ) VALUES (
      ?, 'sukiya', ?, ?, ?,
      ?, ?, ?, ?, NULL, ?,
      ?,
      0, ?, ?, ?,
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
      sodium = excluded.sodium,
      allergens = excluded.allergens,
      is_seasonal = excluded.is_seasonal,
      is_limited = excluded.is_limited,
      is_available = excluded.is_available,
      price_source = excluded.price_source,
      updated_at = datetime('now')
  `);

  let count = 0;
  for (const menu of sukiyaMenuData) {
    // 店舗限定カテゴリの場合は is_limited = 1
    const isLimited = menu.category === "店舗限定" ? 1 : 0;
    // 販売終了・季節限定メニューは is_available = 0
    const isDiscontinued = discontinuedPrefixes.some((p) =>
      menu.menu_name.startsWith(p)
    );
    const isAvailable =
      menu.category === "うな丼" ||
      manualPriceMenus.has(menu.menu_name) ||
      isDiscontinued
        ? 0
        : 1;

    const priceSource =
      manualPriceMenus.has(menu.menu_name) || isDiscontinued
        ? "manual"
        : "scraper";

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
      isLimited,
      isAvailable,
      priceSource
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

  // 1. 既存メニューを非表示に設定
  const markedCount = markPreviousMenusUnavailable();
  console.log(`⏸️  既存すき家メニュー ${markedCount}件を非表示に設定`);

  // 2. データ投入（UPSERT: 既存は更新、新規は追加）
  const insertedCount = insertSukiyaMenus();
  console.log(`✅ すき家メニュー ${insertedCount}件をUPSERT`);

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
