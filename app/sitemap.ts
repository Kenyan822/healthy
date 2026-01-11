import { MetadataRoute } from "next";
import {
  getAllChains,
  getAllMenuIds,
  purposes,
  type PurposeId,
} from "@/lib/db/queries";

// サイトのベースURL（本番環境では環境変数から取得）
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://healthy-chain.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const chains = getAllChains();
  const menuIds = getAllMenuIds();
  const purposeIds = Object.keys(purposes) as PurposeId[];

  const now = new Date().toISOString();

  // トップページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/chains`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // チェーン店詳細ページ（5ページ）
  const chainDetailPages: MetadataRoute.Sitemap = chains.map((chain) => ({
    url: `${BASE_URL}/chains/${chain.chainId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // 目的別一覧ページ（5ページ）
  const purposePages: MetadataRoute.Sitemap = purposeIds.map((purposeId) => ({
    url: `${BASE_URL}/purpose/${purposeId}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // チェーン店×目的ページ（5チェーン × 5目的 = 25ページ）
  const chainPurposePages: MetadataRoute.Sitemap = chains.flatMap((chain) =>
    purposeIds.map((purposeId) => ({
      url: `${BASE_URL}/${chain.chainId}/${purposeId}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  // メニュー詳細ページ（約25ページ）
  const menuPages: MetadataRoute.Sitemap = menuIds.map((menuId) => ({
    url: `${BASE_URL}/menu/${menuId}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...chainDetailPages,
    ...purposePages,
    ...chainPurposePages,
    ...menuPages,
  ];
}
