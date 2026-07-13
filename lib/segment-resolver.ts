import {
  purposes,
  nutritionFilters,
  priceFilters,
  timingFilters,
  isPurposeId,
  isNutritionFilterId,
  isPriceFilterId,
  isTimingFilterId,
  type PurposeId,
  type NutritionFilterId,
  type PriceFilterId,
  type TimingFilterId,
} from "./filters";
import type { MenuSelect, ChainSelect } from "./db/schema";

// ============================
// セグメントタイプ定義
// ============================
export type MenuWithChain = { menu: MenuSelect; chain: ChainSelect };

export type SegmentType =
  | { type: "purpose"; data: (typeof purposes)[PurposeId] }
  | { type: "nutrition"; data: (typeof nutritionFilters)[NutritionFilterId] }
  | { type: "price"; data: (typeof priceFilters)[PriceFilterId] }
  | { type: "timing"; data: (typeof timingFilters)[TimingFilterId] }
  | { type: "menu"; data: MenuWithChain }
  | { type: "notfound" };

// ============================
// セグメント判別関数
// ============================
export function resolveSegment(
  segment: string,
  menuLookup?: (slug: string) => MenuWithChain | null
): SegmentType {
  // 1. 目的（purpose）チェック
  if (isPurposeId(segment)) {
    return { type: "purpose", data: purposes[segment] };
  }

  // 2. 栄養フィルターチェック
  if (isNutritionFilterId(segment)) {
    return { type: "nutrition", data: nutritionFilters[segment] };
  }

  // 3. 時間帯チェック
  if (isTimingFilterId(segment)) {
    return { type: "timing", data: timingFilters[segment] };
  }

  // 4. 価格フィルターチェック
  if (isPriceFilterId(segment)) {
    return { type: "price", data: priceFilters[segment] };
  }

  // 5. メニュースラッグチェック（オプション）
  if (menuLookup) {
    const menu = menuLookup(segment);
    if (menu) {
      return { type: "menu", data: menu };
    }
  }

  return { type: "notfound" };
}

// ============================
// SEOメタデータ生成ヘルパー
// ============================
export function generateSegmentMetadata(
  chainName: string,
  segment: SegmentType
): {
  title: string;
  description: string;
} {
  switch (segment.type) {
    case "purpose":
      // titleは検索ユーザーの語彙(seoTitle)に合わせる。UI表示のnameとは分離
      return {
        title: `${chainName}の${segment.data.seoTitle}`,
        description: `${chainName}の${segment.data.description}を全メニューの栄養成分データから抽出。カロリー・タンパク質・脂質・価格つきで比較できます。`,
      };

    case "nutrition": {
      // filter.labelをそのまま使う(再構築するとカロリー系フィルタで誤表記になる)
      const filter = segment.data;
      return {
        title: `${chainName}の${filter.label}メニュー一覧｜栄養成分つき`,
        description: `${chainName}で${filter.label}のメニューを一覧掲載。カロリー・タンパク質・脂質・炭水化物と価格で比較できます。`,
      };
    }

    case "price":
      return {
        title: `${chainName}の${segment.data.label}メニュー一覧`,
        description: `${chainName}で${segment.data.label}で食べられるメニューを紹介。栄養成分付きで比較できます。`,
      };

    case "timing":
      return {
        title: `${chainName}の${segment.data.label}｜${segment.data.keywords[0]}におすすめ`,
        description: `${chainName}の${segment.data.label}を紹介。${segment.data.keywords.join("・")}に最適なメニューを栄養成分付きで。`,
      };

    case "menu":
      return {
        title: `${segment.data.menu.menuName}のカロリー・タンパク質・脂質（PFC）｜${chainName}`,
        description: `${chainName}「${segment.data.menu.menuName}」の栄養成分: カロリー${segment.data.menu.calories}kcal、タンパク質${segment.data.menu.protein}g、脂質${segment.data.menu.fat}g、炭水化物${segment.data.menu.carb}g。価格と他メニュー比較も掲載。`,
      };

    default:
      return {
        title: chainName,
        description: `${chainName}のメニュー情報`,
      };
  }
}

// ============================
// 全セグメントID取得（静的生成用）
// ============================
export function getAllSegmentIds(): string[] {
  return [
    ...Object.keys(purposes),
    ...Object.keys(nutritionFilters),
    ...Object.keys(priceFilters),
    ...Object.keys(timingFilters),
  ];
}

// ============================
// フィルター条件からセグメントIDを逆引き
// ============================
export function getSegmentIdFromFilter(
  type: "protein" | "fat" | "carb",
  value: number,
  direction: "over" | "under"
): string | null {
  const prefix =
    type === "protein" ? "protein" : type === "fat" ? "fat" : "carb";
  const suffix = direction === "over" ? `over-${value}g` : `under-${value}g`;
  const id = `${prefix}-${suffix}`;
  return id in nutritionFilters ? id : null;
}
