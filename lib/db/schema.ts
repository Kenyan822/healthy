import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// チェーン店テーブル
export const chains = sqliteTable("chains", {
  chainId: text("chain_id").primaryKey(),
  chainName: text("chain_name").notNull(),
  chainNameEn: text("chain_name_en").notNull(),
  chainNameKana: text("chain_name_kana"),
  category: text("category").notNull(), // teishoku, gyudon, fastfood, cafe, famires, ramen, curry, udon, other
  subcategory: text("subcategory"),
  officialUrl: text("official_url"),
  logoUrl: text("logo_url"),
  description: text("description"),
  storeCount: integer("store_count"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

// メニューテーブル
export const menus = sqliteTable("menus", {
  menuId: text("menu_id").primaryKey(),
  chainId: text("chain_id")
    .notNull()
    .references(() => chains.chainId),
  menuName: text("menu_name").notNull(),
  menuNameKana: text("menu_name_kana"),
  price: integer("price"),
  category: text("category"),
  subcategory: text("subcategory"),
  // 栄養成分
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  fat: real("fat").notNull(),
  carb: real("carb").notNull(),
  fiber: real("fiber"),
  sodium: real("sodium"),
  sugar: real("sugar"),
  // スコア
  muscleScore: real("muscle_score"),
  dietScore: real("diet_score"),
  healthScore: real("health_score"),
  // フラグ
  isSeasonal: integer("is_seasonal", { mode: "boolean" }).default(false),
  isLimited: integer("is_limited", { mode: "boolean" }).default(false),
  isAvailable: integer("is_available", { mode: "boolean" }).default(true),
  // 人気度追跡
  viewCount: integer("view_count").default(0),
  searchCount: integer("search_count").default(0),
  // 時間帯
  timing: text("timing").default("anytime"), // breakfast | lunch | anytime
  // その他
  imageUrl: text("image_url"),
  description: text("description"),
  allergens: text("allergens"), // JSON配列として保存
  menuSlug: text("menu_slug"), // URLスラッグ（例: gyudon, chicken-kaasan）
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

// 駅マスターテーブル
export const stations = sqliteTable("stations", {
  stationId: text("station_id").primaryKey(),
  stationName: text("station_name").notNull(),
  stationNameKana: text("station_name_kana"),
  stationNameEn: text("station_name_en"),
  prefecture: text("prefecture").notNull(),
  line: text("line"),
  lat: real("lat"),
  lng: real("lng"),
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// 型エクスポート
export type ChainInsert = typeof chains.$inferInsert;
export type ChainSelect = typeof chains.$inferSelect;
export type MenuInsert = typeof menus.$inferInsert;
export type MenuSelect = typeof menus.$inferSelect;
export type StationInsert = typeof stations.$inferInsert;
export type StationSelect = typeof stations.$inferSelect;
