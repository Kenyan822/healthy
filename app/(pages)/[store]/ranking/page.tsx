import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getChainById,
  getAllChains,
  getChainMenuRanking,
  getMenusBySeoPurpose,
  countMenusByChain,
} from "@/lib/db/queries";
import { purposes, allPurposeIds } from "@/lib/filters";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ store: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  const chains = getAllChains();
  return chains.map((chain) => ({ store: chain.chainId }));
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store } = await params;
  const chain = getChainById(store);

  if (!chain) {
    return { title: "チェーン店が見つかりません" };
  }

  const title = `${chain.chainName}メニューランキング｜おすすめヘルシーメニュー`;
  const description = `${chain.chainName}のメニューをヘルシー度・タンパク質量・ダイエット向けなど目的別にランキング。おすすめメニューが一目でわかります。`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function StoreRankingPage({ params }: Props) {
  const { store } = await params;
  const chain = getChainById(store);

  if (!chain) {
    notFound();
  }

  // 総合ランキング（healthScore順）
  const overallRanking = getChainMenuRanking(store, 10);

  // 目的別ランキング
  const purposeRankings = allPurposeIds.map((purposeId) => ({
    purpose: purposes[purposeId],
    menus: getMenusBySeoPurpose(store, purposeId, 5),
  }));

  return (
    <main className="min-h-screen bg-background">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          {/* パンくずリスト */}
          <nav className="mb-4 text-sm">
            <ol className="flex items-center gap-2 text-foreground/60">
              <li>
                <Link href="/" className="hover:text-primary">
                  ホーム
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/${store}`} className="hover:text-primary">
                  {chain.chainName}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">ランキング</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {chain.chainName}メニューランキング
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            目的別におすすめメニューをランキング
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 総合ランキング */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">総合ヘルシーランキング</h2>
          <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {overallRanking.map((menu, index) => (
                <Link
                  key={menu.menuId}
                  href={`/${store}/${menu.menuSlug || menu.menuId}`}
                  className="flex items-center gap-4 p-4 hover:bg-background/30 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? "bg-yellow-500 text-white"
                        : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                            ? "bg-amber-600 text-white"
                            : "bg-primary/10 text-primary"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{menu.menuName}</p>
                    <div className="flex gap-3 text-xs text-foreground/60 mt-1">
                      <span>{menu.calories}kcal</span>
                      <span>P{menu.protein}g</span>
                      <span>F{menu.fat}g</span>
                      <span>C{menu.carb}g</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {menu.healthScore?.toFixed(1)}
                    </p>
                    <p className="text-xs text-foreground/60">スコア</p>
                  </div>
                  {menu.price && (
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(menu.price)}</p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 目的別ランキング */}
        {purposeRankings.map(({ purpose, menus }) => (
          <section key={purpose.id} className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{purpose.name}ランキング</h2>
                <p className="text-sm text-foreground/60 mt-1">
                  {purpose.description}
                </p>
              </div>
              <Link
                href={`/${store}/${purpose.id}`}
                className="text-primary hover:underline text-sm"
              >
                もっと見る →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menus.slice(0, 3).map((menu, index) => (
                <Link
                  key={menu.menuId}
                  href={`/${store}/${menu.menuSlug || menu.menuId}`}
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
                      <p className="font-bold text-foreground">{menu.menuName}</p>
                      <div className="flex gap-2 text-xs text-foreground/60 mt-1">
                        <span>{menu.calories}kcal</span>
                        <span>P{menu.protein}g</span>
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

        {/* 関連リンク */}
        <section className="mt-8 pt-8 border-t border-border">
          <h2 className="text-xl font-bold mb-4">関連ページ</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${store}`}
              className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
            >
              {chain.chainName}トップ
            </Link>
            <Link
              href={`/${store}/menu`}
              className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
            >
              全メニュー
            </Link>
            <Link
              href="/ranking"
              className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
            >
              全チェーンランキング
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
