/**
 * ローカルDB(data/chain_restaurant.db)の内容をTurso(本番)へ同期する。
 *
 * ⚠️ 本番データを変更するスクリプト。実行前に必ず --dry-run で差分を確認すること。
 *
 * 同期対象: chains / menus / price_history
 * 方式: ローカルを正としてUPSERT（本番にしかない行は削除しない）
 *
 * 実行:
 *   npx tsx scripts/sync-to-turso.ts --dry-run   # 差分表示のみ
 *   npx tsx scripts/sync-to-turso.ts             # 実際に同期（確認プロンプトあり）
 */

import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const TABLES = ["chains", "menus", "price_history"] as const;

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // 誤実行防止: 本番同期には --confirm を必須にする
  if (!dryRun && !process.argv.includes("--confirm")) {
    console.error(
      "本番データを変更します。同期するには --confirm を付けてください:\n" +
        "  npx tsx scripts/sync-to-turso.ts --confirm\n" +
        "差分確認のみ:\n" +
        "  npx tsx scripts/sync-to-turso.ts --dry-run"
    );
    process.exit(1);
  }

  if (!process.env.TURSO_DATABASE_URL) {
    console.error("TURSO_DATABASE_URL が設定されていません(.env.local)");
    process.exit(1);
  }

  const local = new Database(
    path.join(process.cwd(), "data", "chain_restaurant.db")
  );
  const remote = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // price_historyテーブルを本番にも作成
  if (!dryRun) {
    await remote.executeMultiple(`
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

  for (const table of TABLES) {
    const rows = local
      .prepare(`SELECT * FROM ${table}`)
      .all() as Record<string, unknown>[];

    if (rows.length === 0) {
      console.log(`${table}: ローカルに行がないためスキップ`);
      continue;
    }

    // 本番側の行数（参考表示）
    let remoteCount = "?";
    try {
      const res = await remote.execute(`SELECT COUNT(*) as c FROM ${table}`);
      remoteCount = String(res.rows[0].c);
    } catch {
      remoteCount = "テーブルなし";
    }

    console.log(
      `${table}: ローカル${rows.length}行 → 本番(現在${remoteCount}行)へUPSERT${dryRun ? "(dry-run)" : ""}`
    );

    if (dryRun) continue;

    const columns = Object.keys(rows[0]);
    // price_historyは自動採番のidを除外して挿入（重複を避けるため全削除→再投入）
    if (table === "price_history") {
      await remote.execute(`DELETE FROM price_history`);
      const cols = columns.filter((c) => c !== "id");
      const placeholders = cols.map(() => "?").join(", ");
      const stmts = rows.map((row) => ({
        sql: `INSERT INTO price_history (${cols.join(", ")}) VALUES (${placeholders})`,
        args: cols.map((c) => row[c]) as (string | number | null)[],
      }));
      // batchは分割して送る
      for (let i = 0; i < stmts.length; i += 500) {
        await remote.batch(stmts.slice(i, i + 500), "write");
      }
      continue;
    }

    const pk = table === "chains" ? "chain_id" : "menu_id";
    const placeholders = columns.map(() => "?").join(", ");
    const updates = columns
      .filter((c) => c !== pk)
      .map((c) => `${c} = excluded.${c}`)
      .join(", ");

    const stmts = rows.map((row) => ({
      sql: `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})
            ON CONFLICT(${pk}) DO UPDATE SET ${updates}`,
      args: columns.map((c) => row[c]) as (string | number | null)[],
    }));

    for (let i = 0; i < stmts.length; i += 500) {
      await remote.batch(stmts.slice(i, i + 500), "write");
      process.stdout.write(
        `\r  ${Math.min(i + 500, stmts.length)}/${stmts.length}`
      );
    }
    console.log(" ✓");
  }

  if (dryRun) {
    console.log("\n[DRY RUN] 実際に同期するには --dry-run なしで実行してください");
    return;
  }

  console.log("\n✅ 同期完了");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
