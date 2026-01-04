import { HeroSection } from "@/components/home/HeroSection";
import { ChainRanking } from "@/components/home/ChainRanking";
import { PopularKeywords } from "@/components/home/PopularKeywords";
import { LatestMenus } from "@/components/home/LatestMenus";
import { QuickAccessGrid } from "@/components/home/QuickAccessGrid";
import {
  mockChainRanking,
  mockPopularKeywords,
  mockLatestMenus,
  mockSiteStats,
} from "@/data/mock";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Search */}
      <HeroSection stats={mockSiteStats} />

      {/* Main Content Area */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chain Ranking */}
          <div className="lg:col-span-1">
            <ChainRanking chains={mockChainRanking} />
          </div>

          {/* Right Column - Keywords & Quick Access */}
          <div className="lg:col-span-2 space-y-6">
            <PopularKeywords keywords={mockPopularKeywords} />
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
          <LatestMenus menus={mockLatestMenus} />
        </div>
      </section>
    </div>
  );
}
