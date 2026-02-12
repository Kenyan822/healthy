import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Turso接続
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Drizzle ORM インスタンス
export const db = drizzle(client, { schema });

// スキーマもエクスポート
export * from "./schema";
