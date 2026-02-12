import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getChainById,
  getMenusByChain,
  getAllChains,
} from "@/lib/db/queries";
import { getCategoryLabel, getCategoryColor, formatPrice } from "@/lib/utils";
import { ChainSearchBox } from "@/components/chain/ChainSearchBox";

type Props = {
  params: Promise<{ chainId: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  const chains = getAllChains();
  return chains.map((chain) => ({ chainId: chain.chainId }));
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chainId } = await params;
  const chain = getChainById(chainId);

  if (!chain) {
    return { title: "チェーン店が見つかりません" };
  }

  const title = `${chain.chainName}のメニュー栄養成分一覧`;
  const description = `${chain.chainName}のメニューを栄養成分・PFCで比較。カロリー・タンパク質・価格など目的別にメニューをランキング。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: { canonical: `/chains/${chainId}` },
  };
}

export default async function ChainDetailPage({ params }: Props) {
  const { chainId } = await params;
  const chain = getChainById(chainId);

  if (!chain) {
    notFound();
  }

  const menus = getMenusByChain(chainId);

  // 人気メニュー（タンパク質密度順上位5件）
  const calcProteinDensity = (m: typeof menus[0]) => m.protein / m.calories;
  const popularMenus = [...menus]
    .sort((a, b) => calcProteinDensity(b) - calcProteinDensity(a))
    .slice(0, 5);

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
                <Link href="/chains" className="hover:text-primary">
                  チェーン店一覧
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{chain.chainName}</li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded mb-2 ${getCategoryColor(chain.category as "teishoku" | "gyudon" | "fastfood" | "cafe" | "famires" | "ramen" | "curry" | "udon" | "other")}`}
              >
                {getCategoryLabel(chain.category as "teishoku" | "gyudon" | "fastfood" | "cafe" | "famires" | "ramen" | "curry" | "udon" | "other")}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {chain.chainName}
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
        {/* メニュー検索 */}
        <section className="mb-12">
          <ChainSearchBox chainId={chainId} chainName={chain.chainName} />
        </section>

        {/* 人気メニュー */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">人気メニュー</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularMenus.map((menu, index) => (
              <Link
                key={menu.menuId}
                href={`/menu/${menu.menuId}`}
                className="bg-card-bg rounded-xl border border-border p-4 hover:border-primary transition-colors flex gap-4"
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
            ))}
          </div>
        </section>

        {/* 全メニュー一覧 */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            全メニュー（{menus.length}件）
          </h2>
          <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-fixed">
                <colgroup>
                  <col />
                  <col className="w-[120px]" />
                  <col className="w-[90px]" />
                  <col className="w-[90px]" />
                  <col className="w-[90px]" />
                  <col className="w-[120px]" />
                </colgroup>
                <thead className="bg-background/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                      メニュー名
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                      カロリー
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                      P
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                      F
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                      C
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                      価格
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {menus.map((menu) => (
                    <tr
                      key={menu.menuId}
                      className="hover:bg-background/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/menu/${menu.menuId}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {menu.menuName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {menu.calories}kcal
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{menu.protein}g</td>
                      <td className="px-4 py-3 text-right tabular-nums">{menu.fat}g</td>
                      <td className="px-4 py-3 text-right tabular-nums">{menu.carb}g</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {menu.price ? formatPrice(menu.price) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 公式サイトリンク */}
        {chain.officialUrl && (
          <div className="mt-8 text-center">
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
