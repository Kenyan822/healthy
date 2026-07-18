import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getChainById,
  getMenusByChain,
  getAllChains,
  countMenusByChain,
} from "@/lib/db/queries";
import { getCategoryLabel, getCategoryColor, formatPrice } from "@/lib/utils";
import type { ChainCategory } from "@/types";
import { purposes, allPurposeIds } from "@/lib/filters";
import { FavoriteButton } from "@/components/menu/FavoriteButton";
import { NutritionFilters } from "@/components/store/NutritionFilters";

type Props = {
  params: Promise<{ store: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  const chains = await getAllChains();
  return chains.map((chain) => ({ store: chain.chainId }));
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store } = await params;
  const chain = await getChainById(store);

  if (!chain) {
    return { title: "チェーン店が見つかりません" };
  }

  const menuCount = await countMenusByChain(store);
  // 「〇〇 栄養成分」型クエリ対策で「栄養成分一覧」を明示(Search Console実測: いきなりステーキ 栄養成分 imp105/click0)
  const title = `${chain.chainName}の栄養成分一覧｜全${menuCount}メニューのカロリー・PFC・価格`;
  const description = `${chain.chainName}の全メニュー${menuCount}件の栄養成分(カロリー・タンパク質・脂質・炭水化物)と価格を一覧掲載。低脂質・高タンパクなど目的別に比較できます。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    robots: menuCount >= 3 ? { index: true, follow: true } : { index: false, follow: true },
    alternates: {
      canonical: `/${store}`,
    },
  };
}

export default async function StoreTopPage({ params }: Props) {
  const { store } = await params;
  const chain = await getChainById(store);

  if (!chain) {
    notFound();
  }

  const menus = await getMenusByChain(store);

  // 人気メニュー（タンパク質密度順上位5件）
  const calcProteinDensity = (m: typeof menus[0]) => m.protein / m.calories;
  const popularMenus = [...menus]
    .sort((a, b) => calcProteinDensity(b) - calcProteinDensity(a))
    .slice(0, 5);

  // 全メニュー（表示用：最大6件）
  const displayMenus = menus.slice(0, 6);
  const hasMoreMenus = menus.length > 6;

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
              <li className="text-foreground">{chain.chainName}</li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded mb-2 ${getCategoryColor(chain.category as ChainCategory)}`}
              >
                {getCategoryLabel(chain.category as ChainCategory)}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {chain.chainName}のメニュー一覧
              </h1>
              {chain.description && (
                <p className="text-lg text-foreground/70 mt-2">
                  {chain.description}
                </p>
              )}
            </div>
            <div className="flex gap-4 text-sm">
              {chain.storeCount && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {chain.storeCount.toLocaleString()}
                  </p>
                  <p className="text-foreground/60">店舗</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{menus.length}</p>
                <p className="text-foreground/60">メニュー</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 目的別リンク */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">目的別に探す</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allPurposeIds.map((purposeId) => {
              const purpose = purposes[purposeId];
              return (
                <Link
                  key={purposeId}
                  href={`/${store}/${purposeId}`}
                  className="bg-card-bg rounded-xl border border-border p-4 hover:border-primary transition-colors text-center"
                >
                  <p className="font-bold text-foreground">{purpose.name}</p>
                  <p className="text-xs text-foreground/60 mt-1">
                    {purpose.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 栄養成分で絞り込む */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold">絞り込み検索</h2>
            <Link
              href={`/${store}/menu`}
              className="text-primary hover:underline text-sm"
            >
              全メニューを見る →
            </Link>
          </div>
          <div className="bg-card-bg rounded-xl border border-border p-4">
            <NutritionFilters storeId={store} />
          </div>
        </section>

        {/* 人気メニュー */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">おすすめメニュー</h2>
            <Link
              href={`/${store}/ranking`}
              className="text-primary hover:underline text-sm"
            >
              ランキングを見る →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularMenus.map((menu, index) => (
              <div key={menu.menuId} className="relative">
                <Link
                  href={`/menu/${menu.menuId}`}
                  className="bg-card-bg rounded-xl border border-border p-4 hover:border-primary transition-colors flex gap-4 pr-12"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
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
                    {menu.price && (
                      <p className="text-sm text-primary font-bold mt-1">
                        {formatPrice(menu.price)}
                      </p>
                    )}
                  </div>
                </Link>
                <FavoriteButton
                  menuId={menu.menuId}
                  size="sm"
                  className="absolute top-3 right-3"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 全メニュー */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">全メニュー（{menus.length}件）</h2>
            {hasMoreMenus && (
              <Link
                href={`/${store}/menu`}
                className="text-primary hover:underline text-sm"
              >
                もっと見る →
              </Link>
            )}
          </div>
          <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {displayMenus.map((menu) => (
                <div key={menu.menuId} className="relative flex items-center">
                  <Link
                    href={`/menu/${menu.menuId}`}
                    className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors flex-1 pr-14"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{menu.menuName}</p>
                      <div className="flex gap-3 text-xs text-foreground/60 mt-1">
                        <span>{menu.calories}kcal</span>
                        <span>P{menu.protein}g</span>
                        <span>F{menu.fat}g</span>
                        <span>C{menu.carb}g</span>
                      </div>
                    </div>
                    {menu.price && (
                      <p className="text-sm text-primary font-bold">
                        {formatPrice(menu.price)}
                      </p>
                    )}
                  </Link>
                  <FavoriteButton
                    menuId={menu.menuId}
                    size="sm"
                    className="absolute right-3"
                  />
                </div>
              ))}
            </div>
          </div>
          {hasMoreMenus && (
            <div className="text-center mt-4">
              <Link
                href={`/${store}/menu`}
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
              >
                全{menus.length}件のメニューを見る
              </Link>
            </div>
          )}
        </section>

        {/* 公式サイトリンク */}
        {chain.officialUrl && (
          <div className="mt-8 p-6 bg-card-bg rounded-xl border border-border text-center">
            <p className="text-foreground/70 mb-4">
              栄養成分は{chain.chainName}公式サイトを参照しています。最新情報は公式サイトをご確認ください。
            </p>
            <a
              href={chain.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              {chain.chainName}公式サイト →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
