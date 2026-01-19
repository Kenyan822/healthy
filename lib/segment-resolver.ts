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
      return {
        title: `${chainName}の${segment.data.name}メニュー｜${segment.data.keywords.slice(0, 2).join("・")}におすすめ`,
        description: `${chainName}で${segment.data.name}におすすめのメニューを紹介。${segment.data.description}`,
      };

    case "nutrition": {
      const filter = segment.data;
      const filterLabel =
        "min" in filter
          ? `${filter.type === "protein" ? "タンパク質" : ""}${filter.min}g以上`
          : `${filter.type === "fat" ? "脂質" : "糖質"}${filter.max}g以下`;
      return {
        title: `${chainName}の${filterLabel}メニュー一覧`,
        description: `${chainName}で${filterLabel}のメニューを探すならこちら。栄養成分付きで比較できます。`,
      };
    }

    case "price":
      return {
        title: `${chainName}の${segment.data.label}メニュー一覧`,
        description: `${chainName}で${segment.data.label}で食べられるメニューを紹介。お得にヘルシーな食事を。`,
      };

    case "timing":
      return {
        title: `${chainName}の${segment.data.label}｜${segment.data.keywords[0]}におすすめ`,
        description: `${chainName}の${segment.data.label}を紹介。${segment.data.keywords.join("・")}に最適なメニューを栄養成分付きで。`,
      };

    case "menu":
      return {
        title: `${segment.data.menu.menuName}（${chainName}）のカロリー・栄養成分`,
        description: `${chainName}の${segment.data.menu.menuName}の栄養成分を紹介。カロリー${segment.data.menu.calories}kcal、タンパク質${segment.data.menu.protein}g。`,
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
