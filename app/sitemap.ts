import { MetadataRoute } from "next";
import {
  getAllChains,
  getAllMenuSlugs,
  countMenusByChain,
  countMenusByNutritionFilter,
  countMenusByPriceFilter,
  countMenusByTiming,
} from "@/lib/db/queries";
import {
  allPurposeIds,
  allNutritionFilterIds,
  allPriceFilterIds,
  allTimingFilterIds,
} from "@/lib/filters";
import { stationIds } from "@/lib/db/stations-data";

// サイトのベースURL
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://chenmeshi.com";

// 最低メニュー数（品質管理）
const MIN_MENU_COUNT = 3;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const chains = await getAllChains();
  const menuSlugs = await getAllMenuSlugs();
  const now = new Date().toISOString();

  // チェーンごとのメニュー数を事前に取得
  const chainMenuCounts = new Map<string, number>();
  for (const chain of chains) {
    const count = await countMenusByChain(chain.chainId);
    chainMenuCounts.set(chain.chainId, count);
  }

  // メニュー数が基準を満たすチェーンをフィルタ
  const qualifiedChains = chains.filter(
    (chain) => (chainMenuCounts.get(chain.chainId) ?? 0) >= MIN_MENU_COUNT
  );

  // ============================
  // 静的ページ
  // ============================
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/ranking`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // ============================
  // 店トップページ (/[store])
  // ============================
  const storeTopPages: MetadataRoute.Sitemap = qualifiedChains.map((chain) => ({
    url: `${BASE_URL}/${chain.chainId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ============================
  // 店メニュー一覧 (/[store]/menu)
  // ============================
  const storeMenuPages: MetadataRoute.Sitemap = qualifiedChains.map((chain) => ({
    url: `${BASE_URL}/${chain.chainId}/menu`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ============================
  // 店ランキング (/[store]/ranking)
  // ============================
  const storeRankingPages: MetadataRoute.Sitemap = qualifiedChains.map((chain) => ({
    url: `${BASE_URL}/${chain.chainId}/ranking`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ============================
  // 店×目的 (/[store]/[purpose])
  // ============================
  const storePurposePages: MetadataRoute.Sitemap = qualifiedChains.flatMap((chain) =>
    allPurposeIds.map((purposeId) => ({
      url: `${BASE_URL}/${chain.chainId}/${purposeId}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  // ============================
  // 店×栄養フィルター (/[store]/protein-over-30g など)
  // ============================
  const storeNutritionPages: MetadataRoute.Sitemap = [];
  for (const chain of chains) {
    for (const filterId of allNutritionFilterIds) {
      const count = await countMenusByNutritionFilter(chain.chainId, filterId);
      if (count >= MIN_MENU_COUNT) {
        storeNutritionPages.push({
          url: `${BASE_URL}/${chain.chainId}/${filterId}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }
  }

  // ============================
  // 店×価格フィルター (/[store]/under-500yen など)
  // ============================
  const storePricePages: MetadataRoute.Sitemap = [];
  for (const chain of chains) {
    for (const filterId of allPriceFilterIds) {
      const count = await countMenusByPriceFilter(chain.chainId, filterId);
      if (count >= MIN_MENU_COUNT) {
        storePricePages.push({
          url: `${BASE_URL}/${chain.chainId}/${filterId}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }
  }

  // ============================
  // 店×時間帯 (/[store]/breakfast など)
  // ============================
  const storeTimingPages: MetadataRoute.Sitemap = [];
  for (const chain of chains) {
    for (const filterId of allTimingFilterIds) {
      const count = await countMenusByTiming(chain.chainId, filterId);
      if (count >= MIN_MENU_COUNT) {
        storeTimingPages.push({
          url: `${BASE_URL}/${chain.chainId}/${filterId}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }
  }

  // ============================
  // 目的別ランキング (/ranking/[purpose])
  // ============================
  const purposeRankingPages: MetadataRoute.Sitemap = allPurposeIds.map(
    (purposeId) => ({
      url: `${BASE_URL}/ranking/${purposeId}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })
  );

  // ============================
  // チェーン別ランキング (/ranking/[chainId])
  // ============================
  const chainRankingPages: MetadataRoute.Sitemap = qualifiedChains.map((chain) => ({
    url: `${BASE_URL}/ranking/${chain.chainId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  // ============================
  // メニュー詳細 (/[store]/[menuSlug])
  // ============================
  const menuDetailPages: MetadataRoute.Sitemap = menuSlugs
    .filter((m) => m.menuSlug)
    .map((m) => ({
      url: `${BASE_URL}/${m.chainId}/${m.menuSlug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // ============================
  // 駅ページ (/area/[station]) - Phase 3基盤
  // ============================
  const stationPages: MetadataRoute.Sitemap = stationIds.map((stationId) => ({
    url: `${BASE_URL}/area/${stationId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5, // 準備中のため低め
  }));

  return [
    ...staticPages,
    ...storeTopPages,
    ...storeMenuPages,
    ...storeRankingPages,
    ...storePurposePages,
    ...storeNutritionPages,
    ...storePricePages,
    ...storeTimingPages,
    ...purposeRankingPages,
    ...chainRankingPages,
    ...menuDetailPages,
    ...stationPages,
  ];
}
