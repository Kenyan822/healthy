import { Metadata } from "next";
import Link from "next/link";
import { getAllChains, getGlobalRankingByPurpose } from "@/lib/db/queries";
import { purposes, allPurposeIds } from "@/lib/filters";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "外食チェーン メニューランキング｜栄養成分で比較",
  description:
    "外食チェーン店のメニューを栄養成分でランキング。高タンパク・低カロリー・低糖質など、目的に合ったメニューが見つかります。",
  openGraph: {
    title: "外食チェーン メニューランキング",
    description: "栄養成分で外食メニューをランキング形式で比較",
    type: "website",
  },
  alternates: {
    canonical: "/ranking",
  },
};

export default function RankingTopPage() {
  const chains = getAllChains();

  // 各目的の上位3件を取得
  const topRankings = allPurposeIds.map((purposeId) => ({
    purpose: purposes[purposeId],
    menus: getGlobalRankingByPurpose(purposeId, 3),
  }));

  return (
    <main className="min-h-screen bg-background">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <nav className="mb-4 text-sm">
            <ol className="flex items-center gap-2 text-foreground/60">
              <li>
                <Link href="/" className="hover:text-primary">
                  ホーム
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">ランキング</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            外食チェーン メニューランキング
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            目的別・チェーン店別におすすめメニューをランキング
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 目的別ランキングリンク */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">目的別ランキング</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPurposeIds.map((purposeId) => {
              const purpose = purposes[purposeId];
              return (
                <Link
                  key={purposeId}
                  href={`/ranking/${purposeId}`}
                  className="bg-card-bg rounded-xl border border-border p-6 hover:border-primary transition-colors"
                >
                  <h3 className="text-xl font-bold text-foreground">
                    {purpose.name}ランキング
                  </h3>
                  <p className="text-sm text-foreground/60 mt-2">
                    {purpose.description}
                  </p>
                  <p className="text-primary text-sm mt-4">
                    ランキングを見る →
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 目的別プレビュー */}
        {topRankings.map(({ purpose, menus }) => (
          <section key={purpose.id} className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{purpose.name}ランキング</h2>
              <Link
                href={`/ranking/${purpose.id}`}
                className="text-primary hover:underline text-sm"
              >
                もっと見る →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {menus.map(({ menu, chain }, index) => (
                <Link
                  key={menu.menuId}
                  href={`/menu/${menu.menuId}`}
                  className="bg-card-bg rounded-xl border border-border p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-500 text-white"
                          : index === 1
                            ? "bg-gray-400 text-white"
                            : "bg-amber-600 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-foreground/60">{chain.chainName}</p>
                      <p className="font-bold text-foreground">{menu.menuName}</p>
                      <div className="flex gap-2 text-xs text-foreground/60 mt-1">
                        <span>{menu.calories}kcal</span>
                        <span>P{menu.protein}g</span>
                        <span>F{menu.fat}g</span>
                        <span>C{menu.carb}g</span>
                      </div>
                      {menu.price && (
                        <p className="text-sm text-primary font-bold mt-1">
                          {formatPrice(menu.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* チェーン店別ランキングリンク */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">チェーン店別ランキング</h2>
          <div className="flex flex-wrap gap-2">
            {chains.map((chain) => (
              <Link
                key={chain.chainId}
                href={`/${chain.chainId}/ranking`}
                className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
              >
                {chain.chainName}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
