export type ChainCategory =
  | "teishoku" // 定食
  | "gyudon" // 牛丼
  | "fastfood" // ファストフード
  | "cafe" // カフェ
  | "famires" // ファミレス
  | "ramen" // ラーメン
  | "curry" // カレー
  | "udon" // うどん・そば
  | "other"; // その他

export interface Chain {
  chainId: string;
  chainName: string;
  chainNameEn: string;
  chainNameKana?: string;
  category: ChainCategory;
  subcategory?: string;
  officialUrl?: string;
  logoUrl?: string;
  description?: string;
  storeCount?: number;
  menuCount?: number;
  averageProtein?: number;
  averageHealthScore?: number;
}

export interface ChainWithRank extends Chain {
  rank: number;
  popularMenuName?: string;
  monthlySearchVolume?: number;
}
