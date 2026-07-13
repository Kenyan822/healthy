import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getTopMenusByNutritionFilterAllChains,
  getAllChains,
} from "@/lib/db/queries";
import {
  nutritionFilters,
  allNutritionFilterIds,
  isNutritionFilterId,
  type NutritionFilterId,
} from "@/lib/filters";
import { buildMenuItemListJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { MealKitPromo } from "@/components/affiliate/MealKitPromo";
import { promoContextForSegment } from "@/lib/affiliate";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ filterId: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  return allNutritionFilterIds.map((filterId) => ({ filterId }));
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { filterId } = await params;

  if (!isNutritionFilterId(filterId)) {
    return { title: "ページが見つかりません" };
  }

  const filter = nutritionFilters[filterId];
  const title = `${filter.label}の外食チェーンメニュー一覧｜全チェーン横断`;
  const description = `${filter.seoTitle}を松屋・すき家・マクドナルドなど人気チェーン横断で比較。栄養成分・価格つきで、外食でも${filter.label}を実現できるメニューが見つかります。`;

  const menus = await getTopMenusByNutritionFilterAllChains(filterId, 3);

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    robots:
      menus.length >= 3
        ? { index: true, follow: true }
        : { index: false, follow: true },
    alternates: { canonical: `/nutrition/${filterId}` },
  };
}

export default async function NutritionFilterPage({ params }: Props) {
  const { filterId } = await params;

  if (!isNutritionFilterId(filterId)) {
    notFound();
  }

  const filter = nutritionFilters[filterId as NutritionFilterId];
  const rankings = await getTopMenusByNutritionFilterAllChains(
    filterId as NutritionFilterId,
    50
  );
  const chains = await getAllChains();

  const isMinFilter = "min" in filter;

  const itemListJsonLd = buildMenuItemListJsonLd(
    `${filter.label}の外食チェーンメニュー`,
    rankings.map((r) => r.menu)
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "ホーム", path: "" },
    { name: filter.label },
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
          <nav className="mb-4 text-sm">
            <ol className="flex items-center gap-2 text-foreground/60">
              <li>
                <Link href="/" className="hover:text-primary">
                  ホーム
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{filter.label}</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-primary">{filter.label}</span>
            の外食チェーンメニュー
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            {filter.seoTitle}を全チェーン横断で掲載。
            {isMinFilter
              ? "数値の高い順に並んでいます。"
              : "条件を満たす中でタンパク質が多い順に並んでいます。"}
            外食でも数字で選べば、目的に合った一食が見つかります。
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* ランキングテーブル */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            該当メニュー（{rankings.length}件）
          </h2>
          <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                      メニュー名
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                      チェーン店
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
                  {rankings.map(({ menu, chain }, index) => (
                    <tr
                      key={menu.menuId}
                      className="hover:bg-background/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/menu/${menu.menuId}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {menu.menuName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/${chain.chainId}/${filterId}`}
                          className="hover:text-primary"
                        >
                          {chain.chainName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {menu.calories}kcal
                      </td>
                      <td className="px-4 py-3 text-right">{menu.protein}g</td>
                      <td className="px-4 py-3 text-right">{menu.fat}g</td>
                      <td className="px-4 py-3 text-right">{menu.carb}g</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {menu.price ? formatPrice(menu.price) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <MealKitPromo
          variant="menu-detail"
          context={promoContextForSegment(filterId)}
        />

        {/* チェーン店別で探す */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">チェーン店別で見る</h2>
          <div className="flex flex-wrap gap-3">
            {chains.map((chain) => (
              <Link
                key={chain.chainId}
                href={`/${chain.chainId}/${filterId}`}
                className="px-4 py-2 bg-card-bg border border-border rounded-lg hover:border-primary transition-colors text-sm"
              >
                {chain.chainName}
              </Link>
            ))}
          </div>
        </section>

        {/* 他の条件で探す */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">他の条件で探す</h2>
          <div className="flex flex-wrap gap-3">
            {allNutritionFilterIds
              .filter((id) => id !== filterId)
              .map((id) => (
                <Link
                  key={id}
                  href={`/nutrition/${id}`}
                  className="px-4 py-2 bg-card-bg border border-border rounded-lg hover:border-primary transition-colors text-sm"
                >
                  {nutritionFilters[id].label}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
