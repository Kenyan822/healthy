import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getChainById,
  getMenusByChain,
  getAllChains,
  countMenusByChain,
} from "@/lib/db/queries";
import { buildMenuItemListJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { formatPrice, sortCategoriesByPriority } from "@/lib/utils";
import { FavoriteButton } from "@/components/menu/FavoriteButton";

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
  const title = `${chain.chainName}のメニュー一覧｜全${menuCount}件の栄養成分`;
  const description = `${chain.chainName}の全メニュー${menuCount}件を栄養成分・カロリー・価格付きで一覧表示。PFCバランスで比較できます。`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    robots: menuCount >= 3 ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: `/${store}/menu` },
  };
}

export default async function StoreMenuListPage({ params }: Props) {
  const { store } = await params;
  const chain = await getChainById(store);

  if (!chain) {
    notFound();
  }

  const menus = await getMenusByChain(store);

  // カテゴリ別にグループ化
  const menusByCategory = menus.reduce(
    (acc, menu) => {
      const category = menu.category || "その他";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(menu);
      return acc;
    },
    {} as Record<string, typeof menus>
  );

  const categories = sortCategoriesByPriority(store, Object.keys(menusByCategory));

  const itemListJsonLd = buildMenuItemListJsonLd(
    `${chain.chainName}のメニュー一覧`,
    menus
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "ホーム", path: "" },
    { name: chain.chainName, path: `/${store}` },
    { name: "メニュー一覧" },
  ]);

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
              <li className="text-foreground">メニュー一覧</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {chain.chainName}のメニュー一覧
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            全{menus.length}件のメニューを栄養成分付きで掲載
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* カテゴリ別目次 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">カテゴリ</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <a
                key={category}
                href={`#${category}`}
                className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
              >
                {category}（{menusByCategory[category].length}件）
              </a>
            ))}
          </div>
        </section>

        {/* カテゴリ別メニュー一覧 */}
        {categories.map((category) => (
          <section key={category} id={category} className="mb-12 scroll-mt-4">
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            {/* モバイル: カードリスト */}
            <div className="md:hidden bg-card-bg rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {menusByCategory[category].map((menu) => (
                  <div key={menu.menuId} className="relative">
                    <Link
                      href={`/menu/${menu.menuId}`}
                      className="flex items-start gap-3 p-3 hover:bg-background/30 transition-colors pr-12"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary line-clamp-2">{menu.menuName}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex flex-wrap gap-x-3 gap-y-0 text-xs text-foreground/60">
                            <span>{menu.calories}kcal</span>
                            <span>P{menu.protein}g</span>
                            <span>F{menu.fat}g</span>
                            <span>C{menu.carb}g</span>
                          </div>
                          <p className="font-bold text-sm w-16 text-right shrink-0 ml-2">{menu.price ? formatPrice(menu.price) : "-"}</p>
                        </div>
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
            </div>

            {/* デスクトップ: テーブル */}
            <div className="hidden md:block bg-card-bg rounded-xl border border-border overflow-hidden">
              <table className="w-full table-fixed">
                <colgroup>
                  <col />
                  <col className="w-[120px]" />
                  <col className="w-[90px]" />
                  <col className="w-[90px]" />
                  <col className="w-[90px]" />
                  <col className="w-[120px]" />
                  <col className="w-[50px]" />
                </colgroup>
                <thead className="bg-background/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">メニュー名</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">カロリー</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">P</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">F</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">C</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">価格</th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {menusByCategory[category].map((menu) => (
                    <tr key={menu.menuId} className="hover:bg-background/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/menu/${menu.menuId}`} className="text-primary hover:underline font-medium">{menu.menuName}</Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{menu.calories}kcal</td>
                      <td className="px-4 py-3 text-right tabular-nums">{menu.protein}g</td>
                      <td className="px-4 py-3 text-right tabular-nums">{menu.fat}g</td>
                      <td className="px-4 py-3 text-right tabular-nums">{menu.carb}g</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{menu.price ? formatPrice(menu.price) : "-"}</td>
                      <td className="px-2 py-3"><FavoriteButton menuId={menu.menuId} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              href={`/${store}/ranking`}
              className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
            >
              ランキング
            </Link>
            <Link
              href={`/${store}/high-protein`}
              className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
            >
              高タンパク
            </Link>
            <Link
              href={`/${store}/low-calorie`}
              className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
            >
              低カロリー
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
