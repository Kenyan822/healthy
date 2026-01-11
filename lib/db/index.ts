import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

// データベースファイルのパス
const dbPath = path.join(process.cwd(), "data", "chain_restaurant.db");

// SQLite接続
const sqlite = new Database(dbPath);

// Drizzle ORM インスタンス
export const db = drizzle(sqlite, { schema });

// スキーマもエクスポート
export * from "./schema";
