/**
 * seed共通ランナー
 *
 * 各チェーンのseedスクリプトの共通処理（チェーン登録・メニューUPSERT・
 * 価格履歴の記録・サマリー表示）を提供する。
 * 新規チェーンはこのランナーを使い、既存seedも順次移行する。
 *
 * 価格履歴: seed実行時にDB上の現在価格と投入価格を比較し、
 * 変化があれば price_history に追記する（新規メニューは old_price = NULL）。
 */

import Database from "better-sqlite3";
import path from "path";

export interface SeedMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number | null;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number | null;
  allergens: string[];
  timing?: string; // breakfast | lunch | anytime
  is_seasonal?: boolean;
  is_limited?: boolean;
}

export interface ChainInfo {
  chainId: string;
  chainName: string;
  chainNameEn: string;
  chainNameKana: string;
  category: string; // gyudon, fastfood, teishoku など chains.category に合わせる
  officialUrl: string;
  description?: string;
}

export interface SeedOptions {
  // メニューごとの price_source（省略時 "scraper"）
  priceSource?: (item: SeedMenuItem) => string;
  // メニューごとの販売中フラグ（省略時 true。販売終了品の明示用）
  isAvailable?: (item: SeedMenuItem) => boolean;
  // 履歴の記録元ラベル（省略時 "seed"）
  historySource?: string;
}

export interface SeedSummary {
  chainId: string;
  total: number;
  newMenus: number;
  priceChanges: number;
}

export function openDb(): Database.Database {
  return new Database(
    path.join(process.cwd(), "data", "chain_restaurant.db")
  );
}

export function ensurePriceHistoryTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_id TEXT NOT NULL,
      chain_id TEXT NOT NULL,
      old_price INTEGER,
      new_price INTEGER NOT NULL,
      source TEXT NOT NULL DEFAULT 'seed',
      recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_price_history_menu ON price_history(menu_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_chain_recorded ON price_history(chain_id, recorded_at);
  `);
}

export function upsertChain(db: Database.Database, chain: ChainInfo): void {
  db.prepare(
    `
    INSERT INTO chains (
      chain_id, chain_name, chain_name_en, chain_name_kana,
      category, official_url, description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(chain_id) DO UPDATE SET
      chain_name = excluded.chain_name,
      chain_name_en = excluded.chain_name_en,
      chain_name_kana = excluded.chain_name_kana,
      category = excluded.category,
      official_url = excluded.official_url,
      description = excluded.description,
      updated_at = datetime('now')
  `
  ).run(
    chain.chainId,
    chain.chainName,
    chain.chainNameEn,
    chain.chainNameKana,
    chain.category,
    chain.officialUrl,
    chain.description ?? null
  );
}

export function seedChainMenus(
  db: Database.Database,
  chainId: string,
  items: SeedMenuItem[],
  options: SeedOptions = {}
): SeedSummary {
  ensurePriceHistoryTable(db);

  // 現在価格のスナップショット（履歴判定用）
  const currentRows = db
    .prepare(`SELECT menu_id, price FROM menus WHERE chain_id = ?`)
    .all(chainId) as { menu_id: string; price: number | null }[];
  const currentPrices = new Map(currentRows.map((r) => [r.menu_id, r.price]));

  // 今回のデータに含まれないメニューを非表示化
  db.prepare(`UPDATE menus SET is_available = 0 WHERE chain_id = ?`).run(
    chainId
  );

  const upsertStmt = db.prepare(`
    INSERT INTO menus (
      menu_id, chain_id, menu_name, price, category,
      calories, protein, fat, carb, fiber, sodium,
      allergens, timing,
      is_seasonal, is_limited, is_available, price_source,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, NULL, ?,
      ?, ?,
      ?, ?, ?, ?,
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
      timing = excluded.timing,
      is_seasonal = excluded.is_seasonal,
      is_limited = excluded.is_limited,
      is_available = excluded.is_available,
      price_source = excluded.price_source,
      updated_at = datetime('now')
  `);

  const historyStmt = db.prepare(`
    INSERT INTO price_history (menu_id, chain_id, old_price, new_price, source)
    VALUES (?, ?, ?, ?, ?)
  `);

  const historySource = options.historySource ?? "seed";
  let newMenus = 0;
  let priceChanges = 0;

  const runAll = db.transaction(() => {
    for (const item of items) {
      const available = options.isAvailable ? options.isAvailable(item) : true;
      upsertStmt.run(
        item.menu_id,
        chainId,
        item.menu_name,
        item.price,
        item.category,
        item.calories,
        item.protein,
        item.fat,
        item.carb,
        item.sodium,
        JSON.stringify(item.allergens),
        item.timing ?? "anytime",
        item.is_seasonal ? 1 : 0,
        item.is_limited ? 1 : 0,
        available ? 1 : 0,
        options.priceSource ? options.priceSource(item) : "scraper"
      );

      if (!available) continue; // 販売終了品の価格変化は履歴に残さない
      if (item.price == null) continue;
      if (!currentPrices.has(item.menu_id)) {
        historyStmt.run(item.menu_id, chainId, null, item.price, historySource);
        newMenus++;
      } else if (currentPrices.get(item.menu_id) !== item.price) {
        historyStmt.run(
          item.menu_id,
          chainId,
          currentPrices.get(item.menu_id),
          item.price,
          historySource
        );
        priceChanges++;
      }
    }
  });
  runAll();

  return { chainId, total: items.length, newMenus, priceChanges };
}

export function printSeedSummary(
  db: Database.Database,
  summary: SeedSummary
): void {
  console.log(
    `✅ ${summary.chainId}: ${summary.total}件UPSERT（新規${summary.newMenus}件 / 価格変更${summary.priceChanges}件を履歴に記録）`
  );

  const categoryCounts = db
    .prepare(
      `SELECT category, COUNT(*) as count FROM menus
       WHERE chain_id = ? AND is_available = 1
       GROUP BY category ORDER BY count DESC`
    )
    .all(summary.chainId) as { category: string; count: number }[];

  console.log("📊 カテゴリ別メニュー数:");
  for (const { category, count } of categoryCounts) {
    console.log(`   - ${category}: ${count}件`);
  }
}
