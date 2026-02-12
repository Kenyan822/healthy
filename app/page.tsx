import { HeroSection } from "@/components/home/HeroSection";
import { MenuRanking } from "@/components/home/MenuRanking";
import { PopularKeywords } from "@/components/home/PopularKeywords";
import { LatestMenus } from "@/components/home/LatestMenus";
import { QuickAccessGrid } from "@/components/home/QuickAccessGrid";
import {
  mockSiteStats,
} from "@/data/mock";
import { getGlobalFavoriteRanking, getLatestUpdatedMenus, getPopularKeywords } from "@/lib/db/queries";

export default async function Home() {
  // DBからお気に入り登録数が多い人気メニュー上位6件を取得
  const dbRanking = await getGlobalFavoriteRanking(6);
  const menuRanking = dbRanking.map(({ menu, chain, favoriteCount }, index) => ({
    menuId: menu.menuId,
    chainId: menu.chainId,
    chainName: chain.chainName,
    menuName: menu.menuName,
    price: menu.price ?? undefined,
    nutrition: {
      calories: menu.calories,
      protein: menu.protein,
      fat: menu.fat,
      carb: menu.carb,
    },
    category: menu.category ?? undefined,
    isSeasonal: menu.isSeasonal ?? false,
    isLimited: menu.isLimited ?? false,
    updatedAt: menu.updatedAt,
    rank: index + 1,
    favoriteCount: favoriteCount ?? 0,
  }));

  // DBから最新更新メニューを取得
  const dbLatest = await getLatestUpdatedMenus(6);
  const latestMenus = dbLatest.map(({ menu, chain }) => ({
    menuId: menu.menuId,
    chainId: menu.chainId,
    chainName: chain.chainName,
    menuName: menu.menuName,
    price: menu.price,
    calories: menu.calories,
    protein: menu.protein,
    fat: menu.fat,
    carb: menu.carb,
  }));

  return (
    <div className="flex flex-col">
      {/* Hero Section with Search */}
      <HeroSection stats={mockSiteStats} />

      {/* Main Content Area */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Menu Ranking */}
          <div className="lg:col-span-1">
            <MenuRanking menus={menuRanking} />
          </div>

          {/* Right Column - Keywords & Quick Access */}
          <div className="lg:col-span-2 space-y-6">
            <PopularKeywords keywords={await getPopularKeywords(8)} />
            <QuickAccessGrid />
          </div>
        </div>
      </section>

      {/* Latest Menus - Full Width Scroll */}
      <section className="py-8 bg-zinc-100 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
            最新更新メニュー
          </h2>
          <LatestMenus menus={latestMenus} />
        </div>
      </section>
    </div>
  );
}
