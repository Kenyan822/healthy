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
