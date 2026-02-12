import { db, chains, menus, stations, stationChains } from "./index";
import { eq, desc, asc, sql, and, gt, gte, lte, inArray, not, like } from "drizzle-orm";
import { ENABLED_CHAINS, isChainEnabled } from "@/lib/chain-config";

// 目的（purpose）の定義 - 事実ベースの指標
export const purposes = {
  "high-protein": {
    id: "high-protein",
    name: "高タンパク",
    description: "タンパク質が豊富なメニュー",
    sortField: "protein" as const,
    sortOrder: "desc" as const,
  },
  "protein-dense": {
    id: "protein-dense",
    name: "タンパク質効率",
    description: "カロリーあたりのタンパク質が多いメニュー",
    sortField: "proteinDensity" as const, // protein / calories * 100
    sortOrder: "desc" as const,
  },
  "low-calorie": {
    id: "low-calorie",
    name: "低カロリー",
    description: "カロリーを抑えたメニュー",
    sortField: "calories" as const,
    sortOrder: "asc" as const,
  },
  "low-carb": {
    id: "low-carb",
    name: "低糖質",
    description: "糖質比率が低いメニュー",
    sortField: "carbRatio" as const, // (carb * 4) / calories
    sortOrder: "asc" as const,
  },
  "low-fat": {
    id: "low-fat",
    name: "低脂質",
    description: "脂質比率が低いメニュー",
    sortField: "fatRatio" as const, // (fat * 9) / calories
    sortOrder: "asc" as const,
  },
  balanced: {
    id: "balanced",
    name: "バランス重視",
    description: "PFCバランスの良いメニュー",
    sortField: "pfcBalance" as const,
    sortOrder: "desc" as const,
  },
  "cost-performance": {
    id: "cost-performance",
    name: "タンパク質コスパ",
    description: "タンパク質1gあたりの価格が安いメニュー",
    sortField: "costPerformance" as const,
    sortOrder: "asc" as const,
  },
} as const;

export type PurposeId = keyof typeof purposes;

// 全チェーン店を取得（有効なチェーンのみ）
export async function getAllChains() {
  const enabledIds = [...ENABLED_CHAINS];
  return db.select().from(chains).where(inArray(chains.chainId, enabledIds)).all();
}

// チェーン店IDで取得（無効なチェーンはundefined）
export async function getChainById(chainId: string) {
  if (!isChainEnabled(chainId)) return undefined;
  return db.select().from(chains).where(eq(chains.chainId, chainId)).get();
}

// チェーン店のメニュー一覧を取得
export async function getMenusByChain(chainId: string) {
  return db.select().from(menus).where(and(eq(menus.chainId, chainId), eq(menus.isAvailable, true))).all();
}

// 事実ベース指標のSQL式を取得
function getSortExpression(sortField: string) {
  switch (sortField) {
    case "protein":
      return menus.protein;
    case "calories":
      return menus.calories;
    case "proteinDensity":
      // タンパク質密度: protein / calories * 100
      return sql`${menus.protein} * 100.0 / NULLIF(${menus.calories}, 0)`;
    case "carbRatio":
      // 糖質比率: (carb * 4) / calories
      return sql`(${menus.carb} * 4.0) / NULLIF(${menus.calories}, 0)`;
    case "fatRatio":
      // 脂質比率: (fat * 9) / calories
      return sql`(${menus.fat} * 9.0) / NULLIF(${menus.calories}, 0)`;
    case "pfcBalance":
      // PFCバランス: 理想比率(P:20%, F:25%, C:55%)との乖離度を計算
      // 乖離が少ないほど高スコア
      // PFCから算出したカロリー（totalCal = P*4 + F*9 + C*4）を使用
      return sql`
        100 - (
          ABS((${menus.protein} * 4.0 / NULLIF(${menus.protein} * 4.0 + ${menus.fat} * 9.0 + ${menus.carb} * 4.0, 0)) - 0.20) * 100 +
          ABS((${menus.fat} * 9.0 / NULLIF(${menus.protein} * 4.0 + ${menus.fat} * 9.0 + ${menus.carb} * 4.0, 0)) - 0.25) * 100 +
          ABS((${menus.carb} * 4.0 / NULLIF(${menus.protein} * 4.0 + ${menus.fat} * 9.0 + ${menus.carb} * 4.0, 0)) - 0.55) * 100
        )
      `;
    case "costPerformance":
      // タンパク質コスパ: price / protein（低いほど良い）
      // 価格がないメニューは除外されるようにNULLを返す
      return sql`CASE WHEN ${menus.price} > 0 AND ${menus.protein} > 0 THEN ${menus.price} * 1.0 / ${menus.protein} ELSE NULL END`;
    default:
      return menus.protein;
  }
}

// チェーン店×目的でメニューを取得（事実ベース指標順）
export async function getMenusByChainAndPurpose(
  chainId: string,
  purposeId: PurposeId,
  limit = 20
) {
  const purpose = purposes[purposeId];
  const sortExpr = getSortExpression(purpose.sortField);
  const orderFn = purpose.sortOrder === "desc" ? desc : asc;

  const conditions = [eq(menus.chainId, chainId), eq(menus.isAvailable, true), gt(menus.calories, 0)];
  if (purpose.sortField === "costPerformance") {
    conditions.push(gt(menus.price, 0));
    conditions.push(gt(menus.protein, 0));
  }
  if (purpose.sortField === "fatRatio") {
    conditions.push(gt(menus.fat, 0));
  }
  if (purpose.sortField === "carbRatio") {
    conditions.push(gt(menus.carb, 0));
  }
  if (purpose.sortField === "calories") {
    conditions.push(gte(menus.calories, 100));
    conditions.push(not(like(menus.category, "%ドリンク%")));
  }

  return db
    .select()
    .from(menus)
    .where(and(...conditions))
    .orderBy(orderFn(sortExpr))
    .limit(limit)
    .all();
}

// メニュー詳細を取得（チェーン店情報付き）
export async function getMenuWithChain(menuId: string) {
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

// 全メニューを取得（有効なチェーンのみ）
export async function getAllMenus() {
  const enabledIds = [...ENABLED_CHAINS];
  return db.select().from(menus).where(and(inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true))).all();
}

// メニューIDで取得
export async function getMenuById(menuId: string) {
  return db.select().from(menus).where(eq(menus.menuId, menuId)).get();
}

// 類似メニューを取得（同チェーン店、タンパク質効率順）
export async function getSimilarMenus(
  chainId: string,
  currentMenuId: string,
  limit = 5
) {
  const proteinDensity = sql`${menus.protein} * 100.0 / NULLIF(${menus.calories}, 0)`;
  return db
    .select()
    .from(menus)
    .where(and(eq(menus.chainId, chainId), sql`${menus.menuId} != ${currentMenuId}`, eq(menus.isAvailable, true)))
    .orderBy(desc(proteinDensity))
    .limit(limit)
    .all();
}

// 他チェーンの類似栄養素メニューを取得
export async function getSimilarMenusFromOtherChains(
  currentChainId: string,
  targetProtein: number,
  targetCalories: number,
  limit = 5
) {
  // タンパク質とカロリーが近いメニューを取得
  const minProtein = Math.max(0, targetProtein - 10);
  const maxProtein = targetProtein + 10;
  const minCalories = Math.max(0, targetCalories - 150);
  const maxCalories = targetCalories + 150;
  const enabledIds = [...ENABLED_CHAINS];

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
        inArray(menus.chainId, enabledIds),
        eq(menus.isAvailable, true),
        gte(menus.protein, minProtein),
        lte(menus.protein, maxProtein),
        gte(menus.calories, minCalories),
        lte(menus.calories, maxCalories)
      )
    )
    .orderBy(desc(menus.protein))
    .limit(limit)
    .all();
}

// ランキング取得（目的別・事実ベース指標）
export async function getTopMenusByPurpose(purposeId: PurposeId, limit = 10) {
  const purpose = purposes[purposeId];
  const sortExpr = getSortExpression(purpose.sortField);
  const orderFn = purpose.sortOrder === "desc" ? desc : asc;
  const enabledIds = [...ENABLED_CHAINS];

  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(and(inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true)))
    .orderBy(orderFn(sortExpr))
    .limit(limit)
    .all();
}

// 静的生成用：全チェーン店×目的の組み合わせを取得
export async function getAllChainPurposeCombinations() {
  const allChains = await getAllChains();
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

// 静的生成用：全メニューIDを取得（有効なチェーンのみ）
export async function getAllMenuIds() {
  const enabledIds = [...ENABLED_CHAINS];
  const results = await db
    .select({ menuId: menus.menuId })
    .from(menus)
    .where(and(inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true)))
    .all();
  return results.map((m) => m.menuId);
}

// ===== PFC検索関連 =====

import { presets, isValidPreset } from "@/lib/presets";
import type { PresetId, SortBy, SearchResultMenu } from "@/types/search";

/**
 * PFC類似度を計算してメニューを検索
 * ユークリッド距離で近いメニューを返す（入力PFC値に近い順）
 * 未入力(0)の項目は距離計算に含めない
 */
export async function searchMenusByPFC(
  targetP: number,
  targetF: number,
  targetC: number,
  _sortBy: SortBy = "proteinDensity", // 互換性のため残すが使用しない
  limit = 20,
  offset = 0,
  chainId?: string
): Promise<SearchResultMenu[]> {
  // 入力された項目のみで距離を計算（未入力=0の項目は除外）
  const deviationTerms: ReturnType<typeof sql>[] = [];
  if (targetP > 0) {
    deviationTerms.push(sql`(${menus.protein} - ${targetP}) * (${menus.protein} - ${targetP})`);
  }
  if (targetF > 0) {
    deviationTerms.push(sql`(${menus.fat} - ${targetF}) * (${menus.fat} - ${targetF})`);
  }
  if (targetC > 0) {
    deviationTerms.push(sql`(${menus.carb} - ${targetC}) * (${menus.carb} - ${targetC})`);
  }

  // 距離計算式を組み立て
  let pfcDeviation;
  if (deviationTerms.length === 1) {
    pfcDeviation = deviationTerms[0];
  } else if (deviationTerms.length === 2) {
    pfcDeviation = sql<number>`${deviationTerms[0]} + ${deviationTerms[1]}`;
  } else {
    pfcDeviation = sql<number>`${deviationTerms[0]} + ${deviationTerms[1]} + ${deviationTerms[2]}`;
  }

  // 各指標の計算式
  const proteinDensityExpr = sql`${menus.protein} * 100.0 / NULLIF(${menus.calories}, 0)`;
  const carbRatioExpr = sql`(${menus.carb} * 4.0) / NULLIF(${menus.calories}, 0) * 100`;
  const fatRatioExpr = sql`(${menus.fat} * 9.0) / NULLIF(${menus.calories}, 0) * 100`;

  const query = db
    .select({
      menu: menus,
      chain: chains,
      pfcDeviationSq: pfcDeviation,
      proteinDensity: proteinDensityExpr,
      carbRatio: carbRatioExpr,
      fatRatio: fatRatioExpr,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId));

  // PFC入力値との距離が近い順にソート
  const enabledIds = [...ENABLED_CHAINS];
  const results = await (chainId
    ? query.where(and(eq(menus.chainId, chainId), inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true)))
    : query.where(and(inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true)))
  )
    .orderBy(asc(pfcDeviation))
    .limit(limit)
    .offset(offset)
    .all();

  // 事実ベース指標を計算して返す
  return results.map((r) => {
    const costPerProtein = r.menu.price && r.menu.price > 0 && r.menu.protein > 0
      ? Math.round(r.menu.price / r.menu.protein)
      : undefined;

    // PFCバランス計算（理想比率P:20%, F:25%, C:55%との乖離）
    const proteinRatio = (r.menu.protein * 4 / r.menu.calories) * 100;
    const pDev = Math.abs(proteinRatio - 20) / 20;
    const fDev = Math.abs((r.fatRatio as number) - 25) / 25;
    const cDev = Math.abs((r.carbRatio as number) - 55) / 55;
    const pfcBalance = Math.max(0, Math.round(100 * (1 - (pDev + fDev + cDev) / 3)));

    return {
      menu: r.menu,
      chain: r.chain,
      proteinDensity: r.proteinDensity as number,
      carbRatio: r.carbRatio as number,
      fatRatio: r.fatRatio as number,
      pfcBalanceScore: pfcBalance,
      costPerProtein,
    };
  });
}

/**
 * プリセット条件でメニューを検索（単一プリセット）
 */
export async function searchMenusByPreset(
  presetId: PresetId,
  sortBy: SortBy = "proteinDensity",
  limit = 20,
  offset = 0
): Promise<SearchResultMenu[]> {
  return searchMenusByMultiplePresets([presetId], sortBy, limit, offset);
}

/**
 * 複数プリセット条件でメニューを検索（AND条件）
 */
export async function searchMenusByMultiplePresets(
  presetIds: PresetId[],
  sortBy: SortBy = "proteinDensity",
  limit = 20,
  offset = 0,
  chainId?: string
): Promise<SearchResultMenu[]> {
  const validPresetIds = presetIds.filter(isValidPreset);
  if (validPresetIds.length === 0) {
    return [];
  }

  const conditions = [];

  // 有効チェーンフィルター
  const enabledIds = [...ENABLED_CHAINS];
  conditions.push(inArray(menus.chainId, enabledIds));
  conditions.push(eq(menus.isAvailable, true));

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

  // タンパク質密度計算
  const proteinDensityExpr = sql`${menus.protein} * 100.0 / NULLIF(${menus.calories}, 0)`;

  // ソート条件を決定
  let orderByClause;
  switch (sortBy) {
    case "protein":
      orderByClause = desc(menus.protein);
      break;
    case "calories":
      orderByClause = asc(menus.calories);
      break;
    case "proteinDensity":
      orderByClause = desc(proteinDensityExpr);
      break;
    case "carbRatio":
      orderByClause = asc(getSortExpression("carbRatio"));
      break;
    case "fatRatio":
      orderByClause = asc(getSortExpression("fatRatio"));
      break;
    case "pfcBalance":
      orderByClause = desc(getSortExpression("pfcBalance"));
      break;
    case "costPerformance":
      orderByClause = desc(sql`CASE WHEN ${menus.price} > 0 THEN ${menus.protein} * 1.0 / ${menus.price} ELSE 0 END`);
      break;
    default:
      orderByClause = desc(proteinDensityExpr);
  }

  const query = db
    .select({
      menu: menus,
      chain: chains,
      proteinDensity: proteinDensityExpr,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId));

  const results = await (conditions.length > 0
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
      proteinDensity: r.proteinDensity as number,
      costPerProtein,
    };
  });
}

/**
 * 複数プリセット検索の総件数を取得
 */
export async function countMenusByMultiplePresets(presetIds: PresetId[], chainId?: string): Promise<number> {
  const validPresetIds = presetIds.filter(isValidPreset);
  if (validPresetIds.length === 0) {
    return 0;
  }

  const conditions = [];

  // 有効チェーンフィルター
  const enabledIds = [...ENABLED_CHAINS];
  conditions.push(inArray(menus.chainId, enabledIds));
  conditions.push(eq(menus.isAvailable, true));

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

  const result = await (conditions.length > 0
    ? query.where(and(...conditions))
    : query
  ).get();

  return result?.count ?? 0;
}

/**
 * プリセット検索の総件数を取得
 */
export async function countMenusByPreset(presetId: PresetId): Promise<number> {
  if (!isValidPreset(presetId)) {
    return 0;
  }

  const preset = presets[presetId];
  const conditions = [eq(menus.isAvailable, true)];

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

  const result = await (conditions.length > 0
    ? query.where(and(...conditions))
    : query
  ).get();

  return result?.count ?? 0;
}

/**
 * 全メニュー数を取得
 */
export async function countAllMenus(chainId?: string): Promise<number> {
  const enabledIds = [...ENABLED_CHAINS];
  const query = db
    .select({ count: sql<number>`count(*)` })
    .from(menus);

  const result = await (chainId
    ? query.where(and(eq(menus.chainId, chainId), inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true)))
    : query.where(and(inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true)))
  ).get();
  return result?.count ?? 0;
}

/**
 * 全メニューを指定のソート順で検索（目的別検索用）
 */
export async function searchAllMenus(
  sortBy: SortBy = "proteinDensity",
  limit = 20,
  offset = 0,
  chainId?: string
): Promise<SearchResultMenu[]> {
  // 各指標の計算式
  const proteinDensityExpr = sql`${menus.protein} * 100.0 / NULLIF(${menus.calories}, 0)`;
  const carbRatioExpr = sql`(${menus.carb} * 4.0) / NULLIF(${menus.calories}, 0) * 100`;
  const fatRatioExpr = sql`(${menus.fat} * 9.0) / NULLIF(${menus.calories}, 0) * 100`;

  // ソート条件を決定
  let orderByClause;
  switch (sortBy) {
    case "protein":
      orderByClause = desc(menus.protein);
      break;
    case "calories":
      orderByClause = asc(menus.calories);
      break;
    case "proteinDensity":
      orderByClause = desc(proteinDensityExpr);
      break;
    case "carbRatio":
      orderByClause = asc(getSortExpression("carbRatio"));
      break;
    case "fatRatio":
      orderByClause = asc(getSortExpression("fatRatio"));
      break;
    case "pfcBalance":
      orderByClause = desc(getSortExpression("pfcBalance"));
      break;
    case "costPerformance":
      orderByClause = asc(sql`CASE WHEN ${menus.price} > 0 AND ${menus.protein} > 0 THEN ${menus.price} * 1.0 / ${menus.protein} ELSE 999999 END`);
      break;
    default:
      orderByClause = desc(proteinDensityExpr);
  }

  const query = db
    .select({
      menu: menus,
      chain: chains,
      proteinDensity: proteinDensityExpr,
      carbRatio: carbRatioExpr,
      fatRatio: fatRatioExpr,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId));

  const enabledIds = [...ENABLED_CHAINS];
  const conditions = chainId
    ? [eq(menus.chainId, chainId), inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true), gt(menus.calories, 0)]
    : [inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true), gt(menus.calories, 0)];
  if (sortBy === "costPerformance") {
    conditions.push(gt(menus.price, 0));
    conditions.push(gt(menus.protein, 0));
  }
  if (sortBy === "fatRatio") {
    conditions.push(gt(menus.fat, 0));
  }
  if (sortBy === "carbRatio") {
    conditions.push(gt(menus.carb, 0));
  }
  if (sortBy === "calories") {
    conditions.push(gte(menus.calories, 100));
    conditions.push(not(like(menus.category, "%ドリンク%")));
  }
  const results = await query
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset)
    .all();

  // 事実ベース指標を計算して返す
  return results.map((r) => {
    const costPerProtein = r.menu.price && r.menu.price > 0 && r.menu.protein > 0
      ? Math.round(r.menu.price / r.menu.protein)
      : undefined;

    // PFCバランス計算（理想比率P:20%, F:25%, C:55%との乖離）
    const proteinRatio = (r.menu.protein * 4 / r.menu.calories) * 100;
    const pDev = Math.abs(proteinRatio - 20) / 20;
    const fDev = Math.abs((r.fatRatio as number) - 25) / 25;
    const cDev = Math.abs((r.carbRatio as number) - 55) / 55;
    const pfcBalance = Math.max(0, Math.round(100 * (1 - (pDev + fDev + cDev) / 3)));

    return {
      menu: r.menu,
      chain: r.chain,
      proteinDensity: r.proteinDensity as number,
      carbRatio: r.carbRatio as number,
      fatRatio: r.fatRatio as number,
      pfcBalanceScore: pfcBalance,
      costPerProtein,
    };
  });
}

/**
 * メニューのビュー数をインクリメント
 */
export async function incrementMenuViewCount(menuId: string): Promise<void> {
  await db.update(menus)
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
export async function getMenusByNutritionFilter(
  chainId: string,
  filterId: NutritionFilterId,
  limit = 50
) {
  const filter = nutritionFilters[filterId];
  const conditions = [eq(menus.chainId, chainId), eq(menus.isAvailable, true)];

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
export async function countMenusByNutritionFilter(
  chainId: string,
  filterId: NutritionFilterId
): Promise<number> {
  const filter = nutritionFilters[filterId];
  const conditions = [eq(menus.chainId, chainId), eq(menus.isAvailable, true)];

  if ("min" in filter) {
    conditions.push(gte(menus[filter.type], filter.min));
  } else {
    conditions.push(lte(menus[filter.type], filter.max));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(menus)
    .where(and(...conditions))
    .get();

  return result?.count ?? 0;
}

/**
 * 価格フィルターでメニューを取得
 */
export async function getMenusByPriceFilter(
  chainId: string,
  filterId: PriceFilterId,
  limit = 50
) {
  const filter = priceFilters[filterId];

  return db
    .select()
    .from(menus)
    .where(and(eq(menus.chainId, chainId), eq(menus.isAvailable, true), lte(menus.price, filter.max)))
    .orderBy(asc(menus.price))
    .limit(limit)
    .all();
}

/**
 * 価格フィルターでメニュー数を取得（品質チェック用）
 */
export async function countMenusByPriceFilter(
  chainId: string,
  filterId: PriceFilterId
): Promise<number> {
  const filter = priceFilters[filterId];

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(menus)
    .where(and(eq(menus.chainId, chainId), eq(menus.isAvailable, true), lte(menus.price, filter.max)))
    .get();

  return result?.count ?? 0;
}

/**
 * 時間帯フィルターでメニューを取得
 */
export async function getMenusByTiming(
  chainId: string,
  filterId: TimingFilterId,
  limit = 50
) {
  const filter = timingFilters[filterId];

  const proteinDensity = getSortExpression("proteinDensity");
  return db
    .select()
    .from(menus)
    .where(
      and(
        eq(menus.chainId, chainId),
        eq(menus.isAvailable, true),
        sql`(${menus.timing} = ${filter.value} OR ${menus.timing} = 'anytime')`
      )
    )
    .orderBy(desc(proteinDensity))
    .limit(limit)
    .all();
}

/**
 * 時間帯フィルターでメニュー数を取得（品質チェック用）
 */
export async function countMenusByTiming(
  chainId: string,
  filterId: TimingFilterId
): Promise<number> {
  const filter = timingFilters[filterId];

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(menus)
    .where(
      and(
        eq(menus.chainId, chainId),
        eq(menus.isAvailable, true),
        sql`(${menus.timing} = ${filter.value} OR ${menus.timing} = 'anytime')`
      )
    )
    .get();

  return result?.count ?? 0;
}

/**
 * 目的（SEOフィルター版）でメニューを取得
 */
export async function getMenusBySeoPurpose(
  chainId: string,
  purposeId: SeoPurposeId,
  limit = 50
) {
  const purpose = seoFilterPurposes[purposeId];
  const sortExpr = getSortExpression(purpose.sortField);
  const orderFn = purpose.sortOrder === "desc" ? desc : asc;

  const conditions = [eq(menus.chainId, chainId), eq(menus.isAvailable, true), gt(menus.calories, 0)];
  if (purpose.sortField === "costPerformance") {
    conditions.push(gt(menus.price, 0));
    conditions.push(gt(menus.protein, 0));
  }
  if (purpose.sortField === "fatRatio") {
    conditions.push(gt(menus.fat, 0));
  }
  if (purpose.sortField === "carbRatio") {
    conditions.push(gt(menus.carb, 0));
  }
  if (purpose.sortField === "calories") {
    conditions.push(gte(menus.calories, 100));
    conditions.push(not(like(menus.category, "%ドリンク%")));
  }

  return db
    .select()
    .from(menus)
    .where(and(...conditions))
    .orderBy(orderFn(sortExpr))
    .limit(limit)
    .all();
}

/**
 * チェーン店のメニュー数を取得（品質チェック用）
 */
export async function countMenusByChain(chainId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(menus)
    .where(and(eq(menus.chainId, chainId), eq(menus.isAvailable, true)))
    .get();

  return result?.count ?? 0;
}

/**
 * メニュースラッグで取得（チェーン店情報付き）
 */
export async function getMenuBySlug(chainId: string, slug: string) {
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
export async function getAllMenuSlugs() {
  // menuSlugがあればそれを、なければmenuIdを使用
  const enabledIds = [...ENABLED_CHAINS];
  return db
    .select({
      chainId: menus.chainId,
      menuSlug: sql<string>`COALESCE(${menus.menuSlug}, ${menus.menuId})`.as("menu_slug"),
    })
    .from(menus)
    .where(and(inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true)))
    .all();
}

/**
 * チェーン店のランキング取得（タンパク質効率順）
 */
export async function getChainMenuRanking(chainId: string, limit = 10) {
  const proteinDensity = getSortExpression("proteinDensity");
  return db
    .select()
    .from(menus)
    .where(and(eq(menus.chainId, chainId), eq(menus.isAvailable, true)))
    .orderBy(desc(proteinDensity))
    .limit(limit)
    .all();
}

/**
 * 全チェーンランキング取得（目的別）
 */
export async function getGlobalRankingByPurpose(purposeId: SeoPurposeId, limit = 20) {
  const purpose = seoFilterPurposes[purposeId];
  const sortExpr = getSortExpression(purpose.sortField);
  const orderFn = purpose.sortOrder === "desc" ? desc : asc;
  const enabledIds = [...ENABLED_CHAINS];

  const conditions = [inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true), gt(menus.calories, 0)];
  if (purpose.sortField === "costPerformance") {
    conditions.push(gt(menus.price, 0));
    conditions.push(gt(menus.protein, 0));
  }
  if (purpose.sortField === "fatRatio") {
    conditions.push(gt(menus.fat, 0));
  }
  if (purpose.sortField === "carbRatio") {
    conditions.push(gt(menus.carb, 0));
  }
  if (purpose.sortField === "calories") {
    conditions.push(gte(menus.calories, 100));
    conditions.push(not(like(menus.category, "%ドリンク%")));
  }

  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(and(...conditions))
    .orderBy(orderFn(sortExpr))
    .limit(limit)
    .all();
}

/**
 * チェーン店別ランキング取得（タンパク質効率順）
 */
export async function getChainRankingGlobal(chainId: string, limit = 20) {
  const proteinDensity = getSortExpression("proteinDensity");
  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(and(eq(menus.chainId, chainId), eq(menus.isAvailable, true)))
    .orderBy(desc(proteinDensity))
    .limit(limit)
    .all();
}

// ===== 駅関連クエリ =====

/**
 * 駅IDで駅情報を取得
 */
export async function getStationById(stationId: string) {
  return db.select().from(stations).where(eq(stations.stationId, stationId)).get();
}

/**
 * 全駅を取得（乗降客数順）
 */
export async function getAllStations(limit = 200) {
  return db
    .select()
    .from(stations)
    .orderBy(asc(stations.passengerRank))
    .limit(limit)
    .all();
}

/**
 * 都道府県で駅を検索
 */
export async function getStationsByPrefecture(prefecture: string) {
  return db
    .select()
    .from(stations)
    .where(eq(stations.prefecture, prefecture))
    .orderBy(asc(stations.passengerRank))
    .all();
}

/**
 * 駅周辺のチェーン店を取得
 */
export async function getChainsByStation(stationId: string) {
  return db
    .select({
      stationChain: stationChains,
      chain: chains,
    })
    .from(stationChains)
    .innerJoin(chains, eq(stationChains.chainId, chains.chainId))
    .where(and(
      eq(stationChains.stationId, stationId),
      inArray(chains.chainId, [...ENABLED_CHAINS])
    ))
    .orderBy(asc(stationChains.distanceMeters))
    .all();
}

/**
 * チェーン店がある駅一覧を取得
 */
export async function getStationsByChain(chainId: string) {
  return db
    .select({
      stationChain: stationChains,
      station: stations,
    })
    .from(stationChains)
    .innerJoin(stations, eq(stationChains.stationId, stations.stationId))
    .where(eq(stationChains.chainId, chainId))
    .orderBy(asc(stations.passengerRank))
    .all();
}

/**
 * 静的生成用：全駅IDを取得
 */
export async function getAllStationIds() {
  const results = await db
    .select({ stationId: stations.stationId })
    .from(stations)
    .all();
  return results.map((s) => s.stationId);
}

/**
 * 駅×チェーン店の詳細情報を取得
 */
export async function getStationChainDetail(stationId: string, chainId: string) {
  return db
    .select({
      stationChain: stationChains,
      station: stations,
      chain: chains,
    })
    .from(stationChains)
    .innerJoin(stations, eq(stationChains.stationId, stations.stationId))
    .innerJoin(chains, eq(stationChains.chainId, chains.chainId))
    .where(
      and(
        eq(stationChains.stationId, stationId),
        eq(stationChains.chainId, chainId)
      )
    )
    .get();
}

/**
 * 駅の統計情報を取得
 */
export async function getStationStats(stationId: string) {
  const enabledIds = [...ENABLED_CHAINS];
  const result = await db
    .select({
      totalChains: sql<number>`count(*)`,
      avgDistance: sql<number>`avg(${stationChains.distanceMeters})`,
      minDistance: sql<number>`min(${stationChains.distanceMeters})`,
      maxDistance: sql<number>`max(${stationChains.distanceMeters})`,
    })
    .from(stationChains)
    .innerJoin(chains, eq(stationChains.chainId, chains.chainId))
    .where(and(
      eq(stationChains.stationId, stationId),
      inArray(chains.chainId, enabledIds)
    ))
    .get();

  return {
    totalChains: result?.totalChains ?? 0,
    avgDistance: result?.avgDistance ? Math.round(result.avgDistance) : 0,
    minDistance: result?.minDistance ?? 0,
    maxDistance: result?.maxDistance ?? 0,
  };
}

/**
 * 駅名で検索（部分一致）
 */
export async function searchStationsByName(query: string, limit = 20) {
  return db
    .select()
    .from(stations)
    .where(sql`${stations.stationName} LIKE ${'%' + query + '%'}`)
    .orderBy(asc(stations.passengerRank))
    .limit(limit)
    .all();
}

/**
 * 駅周辺のチェーン店メニューを取得（目的別・事実ベース指標）
 */
export async function getStationMenusByPurpose(
  stationId: string,
  purposeId: PurposeId,
  limit = 20
) {
  const purpose = purposes[purposeId];
  const sortExpr = getSortExpression(purpose.sortField);
  const orderFn = purpose.sortOrder === "desc" ? desc : asc;

  // まず駅周辺のチェーン店IDを取得
  const stationChainResults = await db
    .select({ chainId: stationChains.chainId })
    .from(stationChains)
    .where(eq(stationChains.stationId, stationId))
    .all();
  const stationChainIds = stationChainResults.map((sc) => sc.chainId);

  if (stationChainIds.length === 0) {
    return [];
  }

  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(and(inArray(menus.chainId, stationChainIds), eq(menus.isAvailable, true)))
    .orderBy(orderFn(sortExpr))
    .limit(limit)
    .all();
}

/**
 * 全都道府県リストを取得
 */
export async function getAllPrefectures() {
  const results = await db
    .selectDistinct({ prefecture: stations.prefecture })
    .from(stations)
    .orderBy(asc(stations.prefCode))
    .all();
  return results.map((p) => p.prefecture);
}

/**
 * 全駅の統計情報を一括取得（店舗数、最短距離）
 */
export async function getAllStationStats() {
  const results = await db
    .select({
      stationId: stationChains.stationId,
      totalChains: sql<number>`count(*)`,
      minDistance: sql<number>`min(${stationChains.distanceMeters})`,
    })
    .from(stationChains)
    .groupBy(stationChains.stationId)
    .all();

  // Map形式で返す
  const statsMap: Record<string, { totalChains: number; minDistance: number }> = {};
  for (const row of results) {
    statsMap[row.stationId] = {
      totalChains: row.totalChains ?? 0,
      minDistance: row.minDistance ?? 0,
    };
  }
  return statsMap;
}

/**
 * チェーン店のお気に入り数ランキングを取得
 */
export async function getChainFavoriteRanking(chainId: string, limit = 10) {
  return db
    .select({
      menu: menus,
      favoriteCount: menus.favoriteCount,
    })
    .from(menus)
    .where(and(eq(menus.chainId, chainId), eq(menus.isAvailable, true)))
    .orderBy(desc(menus.favoriteCount))
    .limit(limit)
    .all();
}

/**
 * 最新更新メニューを取得
 */
export async function getLatestUpdatedMenus(limit = 6) {
  const enabledIds = [...ENABLED_CHAINS];
  return db
    .select({
      menu: menus,
      chain: chains,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(and(inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true)))
    .orderBy(desc(menus.updatedAt))
    .limit(limit)
    .all();
}

/**
 * 全チェーンのお気に入り数ランキングを取得（人気メニュー用）
 */
export async function getGlobalFavoriteRanking(limit = 6) {
  const enabledIds = [...ENABLED_CHAINS];
  return db
    .select({
      menu: menus,
      chain: chains,
      favoriteCount: menus.favoriteCount,
    })
    .from(menus)
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(and(inArray(menus.chainId, enabledIds), eq(menus.isAvailable, true)))
    .orderBy(desc(menus.favoriteCount), desc(menus.viewCount))
    .limit(limit)
    .all();
}

/**
 * 注目のキーワードを自動生成（チェーン×目的、メニュー件数ベース）
 */
export async function getPopularKeywords(limit = 8) {
  const allChainData = await getAllChains();
  const purposeList = Object.values(purposes);

  // 各チェーンのメニュー数を取得してソート
  const chainWithCounts = await Promise.all(
    allChainData.map(async (chain) => ({
      chain,
      menuCount: await countMenusByChain(chain.chainId),
    }))
  );
  const sorted = chainWithCounts
    .filter((c) => c.menuCount >= 3)
    .sort((a, b) => b.menuCount - a.menuCount);

  const keywords: {
    id: string;
    displayText: string;
    url: string;
    purposeId: string;
  }[] = [];

  // 上位チェーンから目的をラウンドロビンで割り当て（同チェーン連続を避ける）
  let round = 0;
  while (keywords.length < limit && round < purposeList.length) {
    for (const { chain } of sorted) {
      if (keywords.length >= limit) break;
      const purpose = purposeList[round % purposeList.length];
      const id = `${chain.chainId}-${purpose.id}`;
      if (keywords.some((k) => k.id === id)) continue;
      keywords.push({
        id,
        displayText: `${chain.chainName} ${purpose.name}`,
        url: `/${chain.chainId}/${purpose.id}`,
        purposeId: purpose.id,
      });
    }
    round++;
  }

  return keywords.slice(0, limit);
}
