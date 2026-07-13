// ============================
// 目的（Purpose）フィルター - 事実ベース指標
// ============================
export const purposes = {
  "high-protein": {
    id: "high-protein",
    name: "高タンパク",
    description: "タンパク質が豊富なメニュー",
    sortField: "protein" as const,
    sortOrder: "desc" as const,
    keywords: ["高タンパク", "タンパク質", "筋トレ", "プロテイン"],
    seoTitle: "高タンパクメニューランキング｜タンパク質が多い順",
  },
  "protein-dense": {
    id: "protein-dense",
    name: "タンパク質効率",
    description: "カロリーあたりのタンパク質が多いメニュー",
    sortField: "proteinDensity" as const,
    sortOrder: "desc" as const,
    keywords: ["タンパク質効率", "高タンパク低カロリー", "効率"],
    seoTitle: "タンパク質が多いメニューランキング｜カロリー効率順",
  },
  "low-calorie": {
    id: "low-calorie",
    name: "低カロリー",
    description: "カロリーを抑えたメニュー",
    sortField: "calories" as const,
    sortOrder: "asc" as const,
    keywords: ["低カロリー", "カロリー制限", "カロリー控えめ"],
    seoTitle: "低カロリーメニュー一覧｜カロリーが低い順",
  },
  "low-carb": {
    id: "low-carb",
    name: "低糖質",
    description: "糖質40g以下のメニュー（糖質が少ない順）",
    sortField: "carb" as const,
    sortOrder: "asc" as const,
    cap: { field: "carb", max: 40 } as const,
    keywords: ["低糖質", "糖質制限", "ローカーボ", "ケトジェニック"],
    seoTitle: "低糖質メニュー一覧｜糖質制限・ロカボ向け",
  },
  "low-fat": {
    id: "low-fat",
    name: "低脂質",
    description: "脂質20g以下のメニュー（脂質が少ない順）",
    sortField: "fat" as const,
    sortOrder: "asc" as const,
    cap: { field: "fat", max: 20 } as const,
    keywords: ["低脂質", "脂質制限", "ローファット"],
    seoTitle: "低脂質メニュー一覧｜脂質が少ない順",
  },
  balanced: {
    id: "balanced",
    name: "バランス重視",
    description: "PFCバランスの良いメニュー",
    sortField: "pfcBalance" as const,
    sortOrder: "desc" as const,
    keywords: ["バランス", "PFC", "PFCバランス"],
    seoTitle: "PFCバランスの良いメニュー一覧",
  },
  "cost-performance": {
    id: "cost-performance",
    name: "タンパク質コスパ",
    description: "タンパク質1gあたりの価格が安いメニュー",
    sortField: "costPerformance" as const,
    sortOrder: "asc" as const,
    keywords: ["コスパ", "コストパフォーマンス", "安い", "お得"],
    seoTitle: "タンパク質コスパランキング｜1gあたりの価格が安い順",
  },
} as const;

export type PurposeId = keyof typeof purposes;

// ============================
// 栄養フィルター
// ============================
export const nutritionFilters = {
  // タンパク質（20g〜60g、10g刻み）
  "protein-over-20g": {
    type: "protein" as const,
    min: 20,
    label: "タンパク質20g以上",
    seoTitle: "タンパク質20g以上のメニュー",
  },
  "protein-over-30g": {
    type: "protein" as const,
    min: 30,
    label: "タンパク質30g以上",
    seoTitle: "タンパク質30g以上のメニュー",
  },
  "protein-over-40g": {
    type: "protein" as const,
    min: 40,
    label: "タンパク質40g以上",
    seoTitle: "タンパク質40g以上のメニュー",
  },
  "protein-over-50g": {
    type: "protein" as const,
    min: 50,
    label: "タンパク質50g以上",
    seoTitle: "タンパク質50g以上のメニュー",
  },
  "protein-over-60g": {
    type: "protein" as const,
    min: 60,
    label: "タンパク質60g以上",
    seoTitle: "タンパク質60g以上のメニュー",
  },
  // 脂質（10g〜40g、10g刻み）
  "fat-under-10g": {
    type: "fat" as const,
    max: 10,
    label: "脂質10g以下",
    seoTitle: "脂質10g以下のメニュー",
  },
  "fat-under-20g": {
    type: "fat" as const,
    max: 20,
    label: "脂質20g以下",
    seoTitle: "脂質20g以下のメニュー",
  },
  "fat-under-30g": {
    type: "fat" as const,
    max: 30,
    label: "脂質30g以下",
    seoTitle: "脂質30g以下のメニュー",
  },
  "fat-under-40g": {
    type: "fat" as const,
    max: 40,
    label: "脂質40g以下",
    seoTitle: "脂質40g以下のメニュー",
  },
  // カロリー（400〜800kcal）
  "calorie-under-400": {
    type: "calories" as const,
    max: 400,
    label: "400kcal以下",
    seoTitle: "400kcal以下のメニュー",
  },
  "calorie-under-500": {
    type: "calories" as const,
    max: 500,
    label: "500kcal以下",
    seoTitle: "500kcal以下のメニュー",
  },
  "calorie-under-600": {
    type: "calories" as const,
    max: 600,
    label: "600kcal以下",
    seoTitle: "600kcal以下のメニュー",
  },
  "calorie-under-700": {
    type: "calories" as const,
    max: 700,
    label: "700kcal以下",
    seoTitle: "700kcal以下のメニュー",
  },
  "calorie-under-800": {
    type: "calories" as const,
    max: 800,
    label: "800kcal以下",
    seoTitle: "800kcal以下のメニュー",
  },
  // 糖質/炭水化物（20g〜100g）
  "carb-under-20g": {
    type: "carb" as const,
    max: 20,
    label: "糖質20g以下",
    seoTitle: "糖質20g以下のメニュー",
  },
  "carb-under-30g": {
    type: "carb" as const,
    max: 30,
    label: "糖質30g以下",
    seoTitle: "糖質30g以下のメニュー",
  },
  "carb-under-40g": {
    type: "carb" as const,
    max: 40,
    label: "糖質40g以下",
    seoTitle: "糖質40g以下のメニュー",
  },
  "carb-under-50g": {
    type: "carb" as const,
    max: 50,
    label: "糖質50g以下",
    seoTitle: "糖質50g以下のメニュー",
  },
  "carb-under-60g": {
    type: "carb" as const,
    max: 60,
    label: "糖質60g以下",
    seoTitle: "糖質60g以下のメニュー",
  },
  "carb-under-80g": {
    type: "carb" as const,
    max: 80,
    label: "糖質80g以下",
    seoTitle: "糖質80g以下のメニュー",
  },
  "carb-under-100g": {
    type: "carb" as const,
    max: 100,
    label: "糖質100g以下",
    seoTitle: "糖質100g以下のメニュー",
  },
} as const;

export type NutritionFilterId = keyof typeof nutritionFilters;

// ============================
// 価格フィルター
// ============================
export const priceFilters = {
  "under-400yen": {
    max: 400,
    label: "400円以下",
    seoTitle: "400円以下のメニュー",
  },
  "under-500yen": {
    max: 500,
    label: "500円以下",
    seoTitle: "500円以下のメニュー",
  },
  "under-600yen": {
    max: 600,
    label: "600円以下",
    seoTitle: "600円以下のメニュー",
  },
  "under-700yen": {
    max: 700,
    label: "700円以下",
    seoTitle: "700円以下のメニュー",
  },
  "under-800yen": {
    max: 800,
    label: "800円以下",
    seoTitle: "800円以下のメニュー",
  },
  "under-900yen": {
    max: 900,
    label: "900円以下",
    seoTitle: "900円以下のメニュー",
  },
  "under-1000yen": {
    max: 1000,
    label: "1000円以下",
    seoTitle: "1000円以下のメニュー",
  },
  "under-1100yen": {
    max: 1100,
    label: "1100円以下",
    seoTitle: "1100円以下のメニュー",
  },
  "under-1200yen": {
    max: 1200,
    label: "1200円以下",
    seoTitle: "1200円以下のメニュー",
  },
  "under-1300yen": {
    max: 1300,
    label: "1300円以下",
    seoTitle: "1300円以下のメニュー",
  },
  "under-1400yen": {
    max: 1400,
    label: "1400円以下",
    seoTitle: "1400円以下のメニュー",
  },
  "under-1500yen": {
    max: 1500,
    label: "1500円以下",
    seoTitle: "1500円以下のメニュー",
  },
} as const;

export type PriceFilterId = keyof typeof priceFilters;

// ============================
// 時間帯フィルター
// ============================
export const timingFilters = {
  breakfast: {
    value: "breakfast" as const,
    label: "朝食メニュー",
    seoTitle: "朝食におすすめのメニュー",
    keywords: ["朝食", "モーニング", "朝ごはん"],
  },
  lunch: {
    value: "lunch" as const,
    label: "ランチメニュー",
    seoTitle: "ランチにおすすめのメニュー",
    keywords: ["ランチ", "昼食", "お昼"],
  },
} as const;

export type TimingFilterId = keyof typeof timingFilters;
export type TimingValue = "breakfast" | "lunch" | "anytime";

// ============================
// フィルターID一覧取得
// ============================
export const allPurposeIds = Object.keys(purposes) as PurposeId[];
export const allNutritionFilterIds = Object.keys(
  nutritionFilters
) as NutritionFilterId[];
export const allPriceFilterIds = Object.keys(priceFilters) as PriceFilterId[];
export const allTimingFilterIds = Object.keys(
  timingFilters
) as TimingFilterId[];

// ============================
// ヘルパー関数
// ============================
export function isPurposeId(id: string): id is PurposeId {
  return id in purposes;
}

export function isNutritionFilterId(id: string): id is NutritionFilterId {
  return id in nutritionFilters;
}

export function isPriceFilterId(id: string): id is PriceFilterId {
  return id in priceFilters;
}

export function isTimingFilterId(id: string): id is TimingFilterId {
  return id in timingFilters;
}
