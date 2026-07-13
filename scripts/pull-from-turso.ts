/**
 * Turso(本番)からローカルDB(data/chain_restaurant.db)を再構築する。
 *
 * 用途: GitHub Actions等のクリーン環境でバッチを動かす前段
 * (ローカルDBはgit管理外のため、CIでは本番から引いて作る)。
 *
 * 対象はバッチが使うテーブルのみ: chains / menus / price_history
 * （users等の個人情報テーブルは引かない）
 *
 * 実行: npx tsx scripts/pull-from-turso.ts
 */

import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const TABLES = ["chains", "menus", "price_history"] as const;

async function main() {
  if (!process.env.TURSO_DATABASE_URL) {
    console.error("TURSO_DATABASE_URL が設定されていません");
    process.exit(1);
  }

  const remote = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const dbPath = path.join(process.cwd(), "data", "chain_restaurant.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const local = new Database(dbPath);

  for (const table of TABLES) {
    // 本番のDDLをそのまま使ってテーブルを作る
    const ddl = await remote.execute({
      sql: `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?`,
      args: [table],
    });
    if (ddl.rows.length === 0) {
      console.error(`本番に ${table} テーブルがありません`);
      process.exit(1);
    }
    local.exec(`DROP TABLE IF EXISTS ${table}`);
    local.exec(ddl.rows[0].sql as string);

    // インデックスも複製
    const indexes = await remote.execute({
      sql: `SELECT sql FROM sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL`,
      args: [table],
    });
    for (const row of indexes.rows) {
      local.exec(row.sql as string);
    }

    // 行コピー
    const rows = await remote.execute(`SELECT * FROM ${table}`);
    if (rows.rows.length > 0) {
      const columns = rows.columns;
      const stmt = local.prepare(
        `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`
      );
      const insertAll = local.transaction(() => {
        for (const row of rows.rows) {
          stmt.run(...columns.map((c) => row[c] as string | number | null));
        }
      });
      insertAll();
    }
    console.log(`✅ ${table}: ${rows.rows.length}行を取得`);
  }

  console.log("\n本番からのローカルDB再構築が完了しました");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
