import { sqliteTable, text, integer, real, unique, primaryKey, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

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
  // フラグ
  isSeasonal: integer("is_seasonal", { mode: "boolean" }).default(false),
  isLimited: integer("is_limited", { mode: "boolean" }).default(false),
  isAvailable: integer("is_available", { mode: "boolean" }).default(true),
  priceSource: text("price_source").default("scraper"), // scraper | manual | null
  // 人気度追跡
  viewCount: integer("view_count").default(0),
  favoriteCount: integer("favorite_count").default(0),
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

// 価格履歴テーブル（価格改定の時系列記録。seed実行時に価格変化を検知して追記）
export const priceHistory = sqliteTable(
  "price_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    menuId: text("menu_id").notNull(),
    chainId: text("chain_id").notNull(),
    oldPrice: integer("old_price"), // 新規メニューはnull
    newPrice: integer("new_price").notNull(),
    source: text("source").notNull().default("seed"), // seed | scraper | manual
    recordedAt: text("recorded_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => ({
    menuIdx: index("idx_price_history_menu").on(table.menuId),
    chainRecordedIdx: index("idx_price_history_chain_recorded").on(
      table.chainId,
      table.recordedAt
    ),
  })
);

// 駅マスターテーブル
export const stations = sqliteTable("stations", {
  stationId: text("station_id").primaryKey(),
  stationCd: text("station_cd"), // 駅データ.jpのID
  stationGCd: text("station_g_cd"), // グループコード
  stationName: text("station_name").notNull(),
  stationNameKana: text("station_name_kana"),
  stationNameEn: text("station_name_en"),
  prefecture: text("prefecture").notNull(),
  prefCode: integer("pref_code"),
  line: text("line"),
  lineCd: integer("line_cd"),
  lat: real("lat"),
  lng: real("lng"),
  address: text("address"),
  passengerCount: integer("passenger_count"), // 乗降客数
  passengerRank: integer("passenger_rank"), // 乗降客数ランキング
  lastCheckedAt: text("last_checked_at"), // チェーン店情報の最終チェック日
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

// 駅×チェーン店の中間テーブル
export const stationChains = sqliteTable("station_chains", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stationId: text("station_id")
    .notNull()
    .references(() => stations.stationId),
  chainId: text("chain_id")
    .notNull()
    .references(() => chains.chainId),
  placeId: text("place_id"), // Google Places ID
  placeName: text("place_name"), // 店舗名
  placeAddress: text("place_address"), // 店舗住所
  lat: real("lat"), // 店舗緯度
  lng: real("lng"), // 店舗経度
  distanceMeters: integer("distance_meters"), // 駅からの距離（m）
  rating: real("rating"), // Google評価
  userRatingsTotal: integer("user_ratings_total"), // 評価数
  lastCheckedAt: text("last_checked_at").notNull().default("CURRENT_TIMESTAMP"), // 最終チェック日
  createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

// ==========================================
// 認証関連テーブル
// ==========================================

// ユーザーテーブル
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"), // プロフィール画像URL（OAuth用）
  hashedPassword: text("hashed_password"), // OAuth認証時はnull
  plan: text("plan").notNull().default("free"), // 'free' | 'plus'
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// OAuthアカウントテーブル（Google等の外部認証用）
export const accounts = sqliteTable("accounts", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "oauth" | "oidc" | "email"
  provider: text("provider").notNull(), // "google" など
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => ({
  compoundKey: primaryKey({ columns: [table.provider, table.providerAccountId] }),
}));

// セッションテーブル（NextAuth用）
export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: text("expires").notNull(),
});

// お気に入りテーブル
export const userFavorites = sqliteTable("user_favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  menuId: text("menu_id")
    .notNull()
    .references(() => menus.menuId, { onDelete: "cascade" }),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  uniqueUserMenu: unique().on(table.userId, table.menuId),
}));

// 問い合わせ・情報提供テーブル
export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  category: text("category").notNull(), // 'general' | 'bug' | 'feature' | 'new_menu' | 'correction' | 'other'
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  // 情報提供系の追加情報
  chainId: text("chain_id").references(() => chains.chainId),
  menuName: text("menu_name"),
  sourceUrl: text("source_url"),
  // 管理用
  status: text("status").notNull().default("pending"), // 'pending' | 'in_progress' | 'resolved' | 'closed'
  adminNote: text("admin_note"),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// 型エクスポート
export type ChainInsert = typeof chains.$inferInsert;
export type ChainSelect = typeof chains.$inferSelect;
export type MenuInsert = typeof menus.$inferInsert;
export type MenuSelect = typeof menus.$inferSelect;
export type StationInsert = typeof stations.$inferInsert;
export type StationSelect = typeof stations.$inferSelect;
export type StationChainInsert = typeof stationChains.$inferInsert;
export type StationChainSelect = typeof stationChains.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
export type AccountInsert = typeof accounts.$inferInsert;
export type AccountSelect = typeof accounts.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;
export type SessionSelect = typeof sessions.$inferSelect;
export type UserFavoriteInsert = typeof userFavorites.$inferInsert;
export type UserFavoriteSelect = typeof userFavorites.$inferSelect;
export type ContactInsert = typeof contacts.$inferInsert;
export type ContactSelect = typeof contacts.$inferSelect;
export type PriceHistoryInsert = typeof priceHistory.$inferInsert;
export type PriceHistorySelect = typeof priceHistory.$inferSelect;
