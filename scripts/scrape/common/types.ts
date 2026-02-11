/**
 * スクレイピング共通型定義
 */

// スクレイピングで取得したメニュー項目
export interface ScrapedMenuItem {
  name: string;
  price: number;
  size?: string; // 並盛、大盛など
  category?: string;
  url?: string;
}

// マッチング結果
export interface MatchResult {
  menuId: string;
  menuName: string;
  scrapedName: string;
  price: number;
  confidence: number; // 0-1
  matchType: "exact" | "normalized" | "fuzzy" | "manual";
}

// スクレイパー設定
export interface ScraperConfig {
  chainId: string;
  baseUrl: string;
  categories: string[];
  rateLimit: number; // リクエスト間隔（ms）
  batchSize: number; // バッチサイズ
  batchDelay: number; // バッチ間の待機時間（ms）
  maxRetries: number;
  timeout: number;
}

// 既存メニュー（DBから取得）
export interface ExistingMenu {
  menuId: string;
  menuName: string;
  price: number | null;
}

// スクレイピング結果サマリー
export interface ScrapeResult {
  chainId: string;
  scrapedAt: string;
  totalScraped: number;
  categories: {
    name: string;
    count: number;
  }[];
  items: ScrapedMenuItem[];
  errors: string[];
}

// 価格更新レポート
export interface PriceUpdateReport {
  chainId: string;
  updatedAt: string;
  totalMatched: number;
  totalUnmatched: number;
  totalUpdated: number;
  matched: MatchResult[];
  unmatched: ScrapedMenuItem[];
}
