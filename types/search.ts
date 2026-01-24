import { MenuSelect, ChainSelect } from "@/lib/db/schema";

// プリセットID
export type PresetId =
  | "high_protein"
  | "low_fat"
  | "low_carb"
  | "balanced";

// ソート種別（事実ベース指標）
export type SortBy =
  | "protein"         // タンパク質量
  | "calories"        // カロリー
  | "proteinDensity"  // タンパク質密度 (protein / calories)
  | "carbRatio"       // 糖質比率 (carb × 4 / calories)
  | "fatRatio"        // 脂質比率 (fat × 9 / calories)
  | "pfcBalance"      // PFCバランス（理想比率との乖離）
  | "distance"        // 現在地からの近さ
  | "costPerformance"; // コスパ

// PFC検索パラメータ
export interface PFCSearchParams {
  // カスタムPFC検索
  protein?: number;
  fat?: number;
  carb?: number;
  // プリセット検索
  preset?: PresetId;
  // ソート
  sortBy: SortBy;
  // 位置情報（距離ソート時）
  lat?: number;
  lng?: number;
  // ページネーション
  page?: number;
  limit?: number;
}

// 検索結果のメニュー（付加情報あり）
export interface SearchResultMenu {
  menu: MenuSelect;
  chain: ChainSelect;
  // 事実ベース指標（計算値）
  proteinDensity?: number;    // タンパク質密度 (protein / calories × 100)
  carbRatio?: number;         // 糖質比率 (carb × 4 / calories)
  fatRatio?: number;          // 脂質比率 (fat × 9 / calories)
  pfcBalanceScore?: number;   // PFCバランススコア（理想との乖離）
  // 距離関連
  distance?: number;          // 現在地からの距離（km）
  nearestStoreName?: string;  // 最寄り店舗名
  // コスパ
  costPerProtein?: number;    // タンパク質1gあたりの価格
}

// 検索APIレスポンス
export interface SearchResponse {
  success: boolean;
  data: SearchResultMenu[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  // 検索条件（デバッグ用）
  query?: {
    preset?: PresetId;
    targetPFC?: { protein: number; fat: number; carb: number };
    sortBy: SortBy;
    chainId?: string;
  };
}

// プリセット定義の型
export interface PresetDefinition {
  id: PresetId;
  name: string;
  description: string;
  icon: string;
  filter?: {
    minProtein?: number;
    maxProtein?: number;
    minFat?: number;
    maxFat?: number;
    minCarb?: number;
    maxCarb?: number;
  };
  targetRatio?: {
    protein: number;
    fat: number;
    carb: number;
  };
  defaultSort: SortBy;
  sortOrder?: "asc" | "desc";
}

// 位置情報
export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

// 近くの店舗情報（Google Places API用）
export interface NearbyStore {
  chainId: string;
  storeName: string;
  address: string;
  distance: number; // km
  lat: number;
  lng: number;
  placeId?: string; // Google Places API の place_id
}
