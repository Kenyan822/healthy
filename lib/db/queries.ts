import { db, chains, menus } from "./index";
import { eq, desc, asc, sql, and, gte, lte } from "drizzle-orm";

// 目的（purpose）の定義
export const purposes = {
  muscle: {
    id: "muscle",
    name: "筋トレ・バルクアップ",
    description: "高タンパクメニューで筋肉づくりをサポート",
    scoreField: "muscleScore" as const,
    sortOrder: "desc" as const,
  },
  diet: {
    id: "diet",
    name: "ダイエット",
    description: "低カロリー・低糖質で健康的に減量",
    scoreField: "dietScore" as const,
    sortOrder: "desc" as const,
  },
  health: {
    id: "health",
    name: "健康維持",
    description: "バランスの良い栄養で健康をキープ",
    scoreField: "healthScore" as const,
    sortOrder: "desc" as const,
  },
  lowcarb: {
    id: "lowcarb",
    name: "低糖質",
    description: "糖質を抑えたメニューでケトジェニック",
    scoreField: "dietScore" as const,
    sortOrder: "desc" as const,
  },
  protein: {
    id: "protein",
    name: "高タンパク",
    description: "タンパク質重視のメニューを厳選",
    scoreField: "muscleScore" as const,
    sortOrder: "desc" as const,
  },
} as const;

export type PurposeId = keyof typeof purposes;

// 全チェーン店を取得
export function getAllChains() {
  return db.select().from(chains).all();
}

// チェーン店IDで取得
export function getChainById(chainId: string) {
  return db.select().from(chains).where(eq(chains.chainId, chainId)).get();
}

// チェーン店のメニュー一覧を取得
export function getMenusByChain(chainId: string) {
  return db.select().from(menus).where(eq(menus.chainId, chainId)).all();
}

// チェーン店×目的でメニューを取得（スコア順）
export function getMenusByChainAndPurpose(
  chainId: string,
  purposeId: PurposeId,
  limit = 20
) {
  const purpose = purposes[purposeId];
  const scoreField = menus[purpose.scoreField];

  return db
    .select()
    .from(menus)
    .where(eq(menus.chainId, chainId))
    .orderBy(desc(scoreField))
    .limit(limit)
    .all();
}

// メニュー詳細を取得（チェーン店情報付き）
export function getMenuWithChain(menuId: string) {
  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(eq(menus.menuId, menuId))
    .get();
}

// 全メニューを取得
export function getAllMenus() {
  return db.select().from(menus).all();
}

// メニューIDで取得
export function getMenuById(menuId: string) {
  return db.select().from(menus).where(eq(menus.menuId, menuId)).get();
}

// 類似メニューを取得（同チェーン店、同価格帯）
export function getSimilarMenus(
  chainId: string,
  currentMenuId: string,
  limit = 5
) {
  return db
    .select()
    .from(menus)
    .where(and(eq(menus.chainId, chainId), sql`${menus.menuId} != ${currentMenuId}`))
    .orderBy(desc(menus.healthScore))
    .limit(limit)
    .all();
}

// 他チェーンの類似スコアメニューを取得
export function getSimilarMenusFromOtherChains(
  currentChainId: string,
  targetScore: number,
  scoreType: "muscleScore" | "dietScore" | "healthScore",
  limit = 5
) {
  const scoreField = menus[scoreType];
  const minScore = Math.max(0, targetScore - 15);
  const maxScore = Math.min(100, targetScore + 15);

  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(
      and(
        sql`${menus.chainId} != ${currentChainId}`,
        gte(scoreField, minScore),
        lte(scoreField, maxScore)
      )
    )
    .orderBy(desc(scoreField))
    .limit(limit)
    .all();
}

// ランキング取得（目的別）
export function getTopMenusByPurpose(purposeId: PurposeId, limit = 10) {
  const purpose = purposes[purposeId];
  const scoreField = menus[purpose.scoreField];

  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .orderBy(desc(scoreField))
    .limit(limit)
    .all();
}

// 静的生成用：全チェーン店×目的の組み合わせを取得
export function getAllChainPurposeCombinations() {
  const allChains = getAllChains();
  const allPurposes = Object.keys(purposes) as PurposeId[];

  const combinations: { chain: string; purpose: string }[] = [];

  for (const chain of allChains) {
    for (const purpose of allPurposes) {
      combinations.push({
        chain: chain.chainId,
        purpose: purpose,
      });
    }
  }

  return combinations;
}

// 静的生成用：全メニューIDを取得
export function getAllMenuIds() {
  return db
    .select({ menuId: menus.menuId })
    .from(menus)
    .all()
    .map((m) => m.menuId);
}

// ===== PFC検索関連 =====

import { presets, isValidPreset } from "@/lib/presets";
import type { PresetId, SortBy, SearchResultMenu } from "@/types/search";

/**
 * PFC類似度を計算してメニューを検索
 * ユークリッド距離で近いメニューを返す
 */
export function searchMenusByPFC(
  targetP: number,
  targetF: number,
  targetC: number,
  sortBy: SortBy = "pfcMatch",
  limit = 20,
  offset = 0,
  chainId?: string
): SearchResultMenu[] {
  // SQLiteでユークリッド距離を計算
  const pfcDeviation = sql<number>`
    (${menus.protein} - ${targetP}) * (${menus.protein} - ${targetP}) +
    (${menus.fat} - ${targetF}) * (${menus.fat} - ${targetF}) +
    (${menus.carb} - ${targetC}) * (${menus.carb} - ${targetC})
  `;

  // ソート条件を決定
  let orderByClause;
  switch (sortBy) {
    case "pfcMatch":
      orderByClause = asc(pfcDeviation);
      break;
    case "popularity":
      orderByClause = desc(menus.viewCount);
      break;
    case "costPerformance":
      // コスパ = タンパク質 / 価格（高いほど良い）
      orderByClause = desc(sql`CASE WHEN ${menus.price} > 0 THEN ${menus.protein} * 1.0 / ${menus.price} ELSE 0 END`);
      break;
    default:
      orderByClause = asc(pfcDeviation);
  }

  const query = db
    .select({
      menu: menus,
      chain: chains,
      pfcDeviationSq: pfcDeviation,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId));

  const results = (chainId
    ? query.where(eq(menus.chainId, chainId))
    : query
  )
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset)
    .all();

  // PFCマッチ率を計算して返す
  return results.map((r) => {
    const deviation = Math.sqrt(r.pfcDeviationSq);
    const maxDeviation = 100;
    const matchPercent = Math.max(0, Math.round(100 - (deviation / maxDeviation) * 100));
    const costPerProtein = r.menu.price && r.menu.price > 0 && r.menu.protein > 0
      ? Math.round(r.menu.price / r.menu.protein)
      : undefined;

    return {
      menu: r.menu,
      chain: r.chain,
      pfcDeviation: Math.round(deviation * 10) / 10,
      pfcMatchPercent: matchPercent,
      costPerProtein,
      popularityScore: r.menu.viewCount ?? 0,
    };
  });
}

/**
 * プリセット条件でメニューを検索（単一プリセット）
 */
export function searchMenusByPreset(
  presetId: PresetId,
  sortBy: SortBy = "popularity",
  limit = 20,
  offset = 0
): SearchResultMenu[] {
  return searchMenusByMultiplePresets([presetId], sortBy, limit, offset);
}

/**
 * 複数プリセット条件でメニューを検索（AND条件）
 */
export function searchMenusByMultiplePresets(
  presetIds: PresetId[],
  sortBy: SortBy = "popularity",
  limit = 20,
  offset = 0,
  chainId?: string
): SearchResultMenu[] {
  const validPresetIds = presetIds.filter(isValidPreset);
  if (validPresetIds.length === 0) {
    return [];
  }

  const conditions = [];

  // チェーン店フィルター
  if (chainId) {
    conditions.push(eq(menus.chainId, chainId));
  }

  // 各プリセットのフィルター条件を結合（AND条件）
  for (const presetId of validPresetIds) {
    const preset = presets[presetId];
    if (preset.filter) {
      if (preset.filter.minProtein !== undefined) {
        conditions.push(gte(menus.protein, preset.filter.minProtein));
      }
      if (preset.filter.maxProtein !== undefined) {
        conditions.push(lte(menus.protein, preset.filter.maxProtein));
      }
      if (preset.filter.minFat !== undefined) {
        conditions.push(gte(menus.fat, preset.filter.minFat));
      }
      if (preset.filter.maxFat !== undefined) {
        conditions.push(lte(menus.fat, preset.filter.maxFat));
      }
      if (preset.filter.minCarb !== undefined) {
        conditions.push(gte(menus.carb, preset.filter.minCarb));
      }
      if (preset.filter.maxCarb !== undefined) {
        conditions.push(lte(menus.carb, preset.filter.maxCarb));
      }
    }
  }

  // ソート条件を決定
  let orderByClause;
  switch (sortBy) {
    case "popularity":
      orderByClause = desc(menus.viewCount);
      break;
    case "costPerformance":
      orderByClause = desc(sql`CASE WHEN ${menus.price} > 0 THEN ${menus.protein} * 1.0 / ${menus.price} ELSE 0 END`);
      break;
    case "pfcMatch":
      // 複数プリセットの場合はhealthScoreでソート、単一の場合は特化ソート
      if (validPresetIds.length === 1) {
        const presetId = validPresetIds[0];
        if (presetId === "high_protein") {
          orderByClause = desc(menus.protein);
        } else if (presetId === "low_fat") {
          orderByClause = asc(menus.fat);
        } else if (presetId === "low_carb") {
          orderByClause = asc(menus.carb);
        } else {
          orderByClause = desc(menus.healthScore);
        }
      } else {
        orderByClause = desc(menus.healthScore);
      }
      break;
    default:
      orderByClause = desc(menus.healthScore);
  }

  const query = db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId));

  const results = (conditions.length > 0
    ? query.where(and(...conditions))
    : query
  )
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset)
    .all();

  return results.map((r) => {
    const costPerProtein = r.menu.price && r.menu.price > 0 && r.menu.protein > 0
      ? Math.round(r.menu.price / r.menu.protein)
      : undefined;

    return {
      menu: r.menu,
      chain: r.chain,
      costPerProtein,
      popularityScore: r.menu.viewCount ?? 0,
    };
  });
}

/**
 * 複数プリセット検索の総件数を取得
 */
export function countMenusByMultiplePresets(presetIds: PresetId[], chainId?: string): number {
  const validPresetIds = presetIds.filter(isValidPreset);
  if (validPresetIds.length === 0) {
    return 0;
  }

  const conditions = [];

  // チェーン店フィルター
  if (chainId) {
    conditions.push(eq(menus.chainId, chainId));
  }

  for (const presetId of validPresetIds) {
    const preset = presets[presetId];
    if (preset.filter) {
      if (preset.filter.minProtein !== undefined) {
        conditions.push(gte(menus.protein, preset.filter.minProtein));
      }
      if (preset.filter.maxProtein !== undefined) {
        conditions.push(lte(menus.protein, preset.filter.maxProtein));
      }
      if (preset.filter.minFat !== undefined) {
        conditions.push(gte(menus.fat, preset.filter.minFat));
      }
      if (preset.filter.maxFat !== undefined) {
        conditions.push(lte(menus.fat, preset.filter.maxFat));
      }
      if (preset.filter.minCarb !== undefined) {
        conditions.push(gte(menus.carb, preset.filter.minCarb));
      }
      if (preset.filter.maxCarb !== undefined) {
        conditions.push(lte(menus.carb, preset.filter.maxCarb));
      }
    }
  }

  const query = db
    .select({ count: sql<number>`count(*)` })
    .from(menus);

  const result = (conditions.length > 0
    ? query.where(and(...conditions))
    : query
  ).get();

  return result?.count ?? 0;
}

/**
 * プリセット検索の総件数を取得
 */
export function countMenusByPreset(presetId: PresetId): number {
  if (!isValidPreset(presetId)) {
    return 0;
  }

  const preset = presets[presetId];
  const conditions = [];

  if (preset.filter) {
    if (preset.filter.minProtein !== undefined) {
      conditions.push(gte(menus.protein, preset.filter.minProtein));
    }
    if (preset.filter.maxProtein !== undefined) {
      conditions.push(lte(menus.protein, preset.filter.maxProtein));
    }
    if (preset.filter.minFat !== undefined) {
      conditions.push(gte(menus.fat, preset.filter.minFat));
    }
    if (preset.filter.maxFat !== undefined) {
      conditions.push(lte(menus.fat, preset.filter.maxFat));
    }
    if (preset.filter.minCarb !== undefined) {
      conditions.push(gte(menus.carb, preset.filter.minCarb));
    }
    if (preset.filter.maxCarb !== undefined) {
      conditions.push(lte(menus.carb, preset.filter.maxCarb));
    }
  }

  const query = db
    .select({ count: sql<number>`count(*)` })
    .from(menus);

  const result = (conditions.length > 0
    ? query.where(and(...conditions))
    : query
  ).get();

  return result?.count ?? 0;
}

/**
 * 全メニュー数を取得
 */
export function countAllMenus(chainId?: string): number {
  const query = db
    .select({ count: sql<number>`count(*)` })
    .from(menus);

  const result = (chainId
    ? query.where(eq(menus.chainId, chainId))
    : query
  ).get();
  return result?.count ?? 0;
}

/**
 * メニューのビュー数をインクリメント
 */
export function incrementMenuViewCount(menuId: string): void {
  db.update(menus)
    .set({
      viewCount: sql`COALESCE(${menus.viewCount}, 0) + 1`,
    })
    .where(eq(menus.menuId, menuId))
    .run();
}

// ===== 新SEOフィルター用クエリ =====

import {
  nutritionFilters,
  priceFilters,
  timingFilters,
  purposes as seoFilterPurposes,
  type NutritionFilterId,
  type PriceFilterId,
  type TimingFilterId,
  type PurposeId as SeoPurposeId,
} from "@/lib/filters";

/**
 * 栄養フィルターでメニューを取得
 */
export function getMenusByNutritionFilter(
  chainId: string,
  filterId: NutritionFilterId,
  limit = 50
) {
  const filter = nutritionFilters[filterId];
  const conditions = [eq(menus.chainId, chainId)];

  if ("min" in filter) {
    // protein-over-XXg
    conditions.push(gte(menus[filter.type], filter.min));
  } else {
    // fat-under-XXg, carb-under-XXg
    conditions.push(lte(menus[filter.type], filter.max));
  }

  return db
    .select()
    .from(menus)
    .where(and(...conditions))
    .orderBy(
      "min" in filter ? desc(menus[filter.type]) : asc(menus[filter.type])
    )
    .limit(limit)
    .all();
}

/**
 * 栄養フィルターでメニュー数を取得（品質チェック用）
 */
export function countMenusByNutritionFilter(
  chainId: string,
  filterId: NutritionFilterId
): number {
  const filter = nutritionFilters[filterId];
  const conditions = [eq(menus.chainId, chainId)];

  if ("min" in filter) {
    conditions.push(gte(menus[filter.type], filter.min));
  } else {
    conditions.push(lte(menus[filter.type], filter.max));
  }

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(menus)
    .where(and(...conditions))
    .get();

  return result?.count ?? 0;
}

/**
 * 価格フィルターでメニューを取得
 */
export function getMenusByPriceFilter(
  chainId: string,
  filterId: PriceFilterId,
  limit = 50
) {
  const filter = priceFilters[filterId];

  return db
    .select()
    .from(menus)
    .where(and(eq(menus.chainId, chainId), lte(menus.price, filter.max)))
    .orderBy(asc(menus.price))
    .limit(limit)
    .all();
}

/**
 * 価格フィルターでメニュー数を取得（品質チェック用）
 */
export function countMenusByPriceFilter(
  chainId: string,
  filterId: PriceFilterId
): number {
  const filter = priceFilters[filterId];

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(menus)
    .where(and(eq(menus.chainId, chainId), lte(menus.price, filter.max)))
    .get();

  return result?.count ?? 0;
}

/**
 * 時間帯フィルターでメニューを取得
 */
export function getMenusByTiming(
  chainId: string,
  filterId: TimingFilterId,
  limit = 50
) {
  const filter = timingFilters[filterId];

  return db
    .select()
    .from(menus)
    .where(
      and(
        eq(menus.chainId, chainId),
        sql`(${menus.timing} = ${filter.value} OR ${menus.timing} = 'anytime')`
      )
    )
    .orderBy(desc(menus.healthScore))
    .limit(limit)
    .all();
}

/**
 * 時間帯フィルターでメニュー数を取得（品質チェック用）
 */
export function countMenusByTiming(
  chainId: string,
  filterId: TimingFilterId
): number {
  const filter = timingFilters[filterId];

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(menus)
    .where(
      and(
        eq(menus.chainId, chainId),
        sql`(${menus.timing} = ${filter.value} OR ${menus.timing} = 'anytime')`
      )
    )
    .get();

  return result?.count ?? 0;
}

/**
 * 目的（SEOフィルター版）でメニューを取得
 */
export function getMenusBySeoPurpose(
  chainId: string,
  purposeId: SeoPurposeId,
  limit = 50
) {
  const purpose = seoFilterPurposes[purposeId];
  const scoreField = menus[purpose.scoreField];

  return db
    .select()
    .from(menus)
    .where(eq(menus.chainId, chainId))
    .orderBy(desc(scoreField))
    .limit(limit)
    .all();
}

/**
 * チェーン店のメニュー数を取得（品質チェック用）
 */
export function countMenusByChain(chainId: string): number {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(menus)
    .where(eq(menus.chainId, chainId))
    .get();

  return result?.count ?? 0;
}

/**
 * メニュースラッグで取得（チェーン店情報付き）
 */
export function getMenuBySlug(chainId: string, slug: string) {
  // menuSlugがnullの場合はmenuIdで検索
  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(
      and(
        eq(menus.chainId, chainId),
        sql`(${menus.menuSlug} = ${slug} OR ${menus.menuId} = ${slug})`
      )
    )
    .get();
}

/**
 * 全メニュースラッグを取得（静的生成用）
 */
export function getAllMenuSlugs() {
  // menuSlugがあればそれを、なければmenuIdを使用
  return db
    .select({
      chainId: menus.chainId,
      menuSlug: sql<string>`COALESCE(${menus.menuSlug}, ${menus.menuId})`.as("menu_slug"),
    })
    .from(menus)
    .all();
}

/**
 * チェーン店のランキング取得（healthScore順）
 */
export function getChainMenuRanking(chainId: string, limit = 10) {
  return db
    .select()
    .from(menus)
    .where(eq(menus.chainId, chainId))
    .orderBy(desc(menus.healthScore))
    .limit(limit)
    .all();
}

/**
 * 全チェーンランキング取得（目的別）
 */
export function getGlobalRankingByPurpose(purposeId: SeoPurposeId, limit = 20) {
  const purpose = seoFilterPurposes[purposeId];
  const scoreField = menus[purpose.scoreField];

  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .orderBy(desc(scoreField))
    .limit(limit)
    .all();
}

/**
 * チェーン店別ランキング取得
 */
export function getChainRankingGlobal(chainId: string, limit = 20) {
  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(eq(menus.chainId, chainId))
    .orderBy(desc(menus.healthScore))
    .limit(limit)
    .all();
}
