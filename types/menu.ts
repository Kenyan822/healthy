export interface NutritionInfo {
  calories: number; // kcal
  protein: number; // g
  fat: number; // g
  carb: number; // g
  fiber?: number; // g
  sodium?: number; // g
  sugar?: number; // g
}

export interface MenuScores {
  muscleScore: number; // タンパク質効率スコア
  ketoScore: number; // ケトジェニックスコア
  healthScore: number; // 総合ヘルシースコア
}

export interface Menu {
  menuId: string;
  chainId: string;
  chainName: string;
  menuName: string;
  menuNameKana?: string;
  price?: number;
  nutrition: NutritionInfo;
  scores: MenuScores;
  category?: string;
  subcategory?: string;
  isSeasonal: boolean;
  isLimited: boolean;
  imageUrl?: string;
  description?: string;
  allergens?: string[];
  updatedAt: string;
}

export interface LatestMenu extends Menu {
  updateType: "new" | "updated" | "price_change";
}

export type KeywordCategory =
  | "chain_purpose" // チェーン店×目的
  | "station" // 駅関連
  | "nutrient" // 栄養素関連
  | "diet_goal"; // ダイエット目標

export interface PopularKeyword {
  id: string;
  keyword: string;
  displayText: string;
  category: KeywordCategory;
  searchVolume: number;
  trend: "up" | "down" | "stable";
  trendPercent?: number;
  relatedUrl: string;
}
