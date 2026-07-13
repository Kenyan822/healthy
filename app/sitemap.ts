import { MetadataRoute } from "next";
import { getAllChains, getAllMenus } from "@/lib/db/queries";
import type { MenuSelect } from "@/lib/db/schema";
import {
  nutritionFilters,
  priceFilters,
  timingFilters,
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

// フィルタ該当判定（DBのcount系クエリと同じ条件をJSで評価する。
// チェーン×フィルタごとに逐次クエリするとVercelの60秒制限を超えるため、
// 全メニューを一括取得してメモリ上で集計する）
function matchesNutrition(
  menu: MenuSelect,
  filterId: (typeof allNutritionFilterIds)[number]
): boolean {
  const filter = nutritionFilters[filterId];
  return "min" in filter
    ? menu[filter.type] >= filter.min
    : menu[filter.type] <= filter.max;
}

function matchesPrice(
  menu: MenuSelect,
  filterId: (typeof allPriceFilterIds)[number]
): boolean {
  const filter = priceFilters[filterId];
  return menu.price != null && menu.price <= filter.max;
}

function matchesTiming(
  menu: MenuSelect,
  filterId: (typeof allTimingFilterIds)[number]
): boolean {
  const filter = timingFilters[filterId];
  return menu.timing === filter.value || menu.timing === "anytime";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // クエリは2回だけ（チェーン一覧・全メニュー）
  const chains = await getAllChains();
  const allMenus = await getAllMenus();
  const now = new Date().toISOString();

  const menusByChain = new Map<string, MenuSelect[]>();
  for (const menu of allMenus) {
    const list = menusByChain.get(menu.chainId) ?? [];
    list.push(menu);
    menusByChain.set(menu.chainId, list);
  }

  const qualifiedChains = chains.filter(
    (chain) => (menusByChain.get(chain.chainId)?.length ?? 0) >= MIN_MENU_COUNT
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
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookie-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/tokushoho`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // ============================
  // 店トップ / メニュー一覧 / ランキング
  // ============================
  const storeTopPages: MetadataRoute.Sitemap = qualifiedChains.map((chain) => ({
    url: `${BASE_URL}/${chain.chainId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const storeMenuPages: MetadataRoute.Sitemap = qualifiedChains.map((chain) => ({
    url: `${BASE_URL}/${chain.chainId}/menu`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const storeRankingPages: MetadataRoute.Sitemap = qualifiedChains.map((chain) => ({
    url: `${BASE_URL}/${chain.chainId}/ranking`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ============================
  // 店×目的 / 店×フィルタ（JS集計で3件以上のみ）
  // ============================
  const storePurposePages: MetadataRoute.Sitemap = qualifiedChains.flatMap((chain) =>
    allPurposeIds.map((purposeId) => ({
      url: `${BASE_URL}/${chain.chainId}/${purposeId}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  const storeFilterPages: MetadataRoute.Sitemap = [];
  for (const chain of chains) {
    const menus = menusByChain.get(chain.chainId) ?? [];

    for (const filterId of allNutritionFilterIds) {
      if (menus.filter((m) => matchesNutrition(m, filterId)).length >= MIN_MENU_COUNT) {
        storeFilterPages.push({
          url: `${BASE_URL}/${chain.chainId}/${filterId}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }

    for (const filterId of allPriceFilterIds) {
      if (menus.filter((m) => matchesPrice(m, filterId)).length >= MIN_MENU_COUNT) {
        storeFilterPages.push({
          url: `${BASE_URL}/${chain.chainId}/${filterId}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }

    for (const filterId of allTimingFilterIds) {
      if (menus.filter((m) => matchesTiming(m, filterId)).length >= MIN_MENU_COUNT) {
        storeFilterPages.push({
          url: `${BASE_URL}/${chain.chainId}/${filterId}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      }
    }
  }

  // ============================
  // 栄養フィルター横断ページ (/nutrition/[filterId])
  // ============================
  const nutritionCrossPages: MetadataRoute.Sitemap = allNutritionFilterIds.map(
    (filterId) => ({
      url: `${BASE_URL}/nutrition/${filterId}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })
  );

  // ============================
  // 目的別ランキング / チェーン別ランキング
  // ============================
  const purposeRankingPages: MetadataRoute.Sitemap = allPurposeIds.map(
    (purposeId) => ({
      url: `${BASE_URL}/ranking/${purposeId}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })
  );

  const chainRankingPages: MetadataRoute.Sitemap = qualifiedChains.map((chain) => ({
    url: `${BASE_URL}/ranking/${chain.chainId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  // ============================
  // メニュー詳細 (/[store]/[menuSlug]) — 全メニューから導出
  // ============================
  const menuDetailPages: MetadataRoute.Sitemap = allMenus
    .filter((m) => m.menuSlug)
    .map((m) => ({
      url: `${BASE_URL}/${m.chainId}/${m.menuSlug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // ============================
  // 駅ページ (/area/[station])
  // ============================
  const stationPages: MetadataRoute.Sitemap = stationIds.map((stationId) => ({
    url: `${BASE_URL}/area/${stationId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...storeTopPages,
    ...storeMenuPages,
    ...storeRankingPages,
    ...storePurposePages,
    ...storeFilterPages,
    ...nutritionCrossPages,
    ...purposeRankingPages,
    ...chainRankingPages,
    ...menuDetailPages,
    ...stationPages,
  ];
}
