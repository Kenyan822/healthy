import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getTopMenusByPurpose,
  getAllChains,
  purposes,
  type PurposeId,
} from "@/lib/db/queries";
import { formatPrice } from "@/lib/utils";
import type { MenuSelect } from "@/lib/db/schema";

// 事実ベース指標の表示値を計算
function getDisplayValue(menu: MenuSelect, sortField: string): { value: string; label: string } {
  switch (sortField) {
    case "protein":
      return { value: `${menu.protein}g`, label: "タンパク質" };
    case "calories":
      return { value: `${menu.calories}kcal`, label: "カロリー" };
    case "proteinDensity":
      return { value: ((menu.protein / menu.calories) * 100).toFixed(1), label: "P密度" };
    case "carbRatio":
      return { value: `${(((menu.carb * 4) / menu.calories) * 100).toFixed(1)}%`, label: "糖質比率" };
    case "fatRatio":
      return { value: `${(((menu.fat * 9) / menu.calories) * 100).toFixed(1)}%`, label: "脂質比率" };
    case "pfcBalance": {
      const totalCal = menu.protein * 4 + menu.fat * 9 + menu.carb * 4;
      const pRatio = (menu.protein * 4) / totalCal;
      const fRatio = (menu.fat * 9) / totalCal;
      const cRatio = (menu.carb * 4) / totalCal;
      const deviation = Math.abs(pRatio - 0.2) + Math.abs(fRatio - 0.25) + Math.abs(cRatio - 0.55);
      const score = Math.max(0, 100 - deviation * 100);
      return { value: score.toFixed(0), label: "バランス" };
    }
    default:
      return { value: `${menu.protein}g`, label: "タンパク質" };
  }
}

type Props = {
  params: Promise<{ purposeId: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  return Object.keys(purposes).map((purposeId) => ({ purposeId }));
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { purposeId } = await params;
  const purpose = purposes[purposeId as PurposeId];

  if (!purpose) {
    return { title: "ページが見つかりません" };
  }

  const title = `${purpose.name}メニューランキング｜全チェーン店`;
  const description = `${purpose.description}。大戸屋、すき家、やよい軒など人気チェーン店の${purpose.name}メニューをスコア順にランキング。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: { canonical: `/purpose/${purposeId}` },
  };
}

// スコアに応じた色を返す
function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-100";
  if (score >= 60) return "text-lime-600 bg-lime-100";
  if (score >= 40) return "text-yellow-600 bg-yellow-100";
  return "text-orange-600 bg-orange-100";
}

export default async function PurposeDetailPage({ params }: Props) {
  const { purposeId } = await params;
  const purpose = purposes[purposeId as PurposeId];

  if (!purpose) {
    notFound();
  }

  const rankings = await getTopMenusByPurpose(purposeId as PurposeId, 50);
  const chains = await getAllChains();
  const top3 = rankings.slice(0, 3);

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
              <li className="text-foreground">{purpose.name}</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            <span className="text-primary">{purpose.name}</span>
            メニューランキング
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            {purpose.description}
            。全{chains.length}チェーン店のメニューをランキング。
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* TOP3 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-accent">TOP3</span>おすすめメニュー
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {top3.map(({ menu, chain }, index) => {
              const displayValue = getDisplayValue(menu, purpose.sortField);
              return (
                <Link
                  key={menu.menuId}
                  href={`/menu/${menu.menuId}`}
                  className="block bg-card-bg rounded-xl p-6 border border-border hover:border-primary transition-colors relative"
                >
                  {/* 順位バッジ */}
                  <div
                    className={`absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                          ? "bg-gray-400"
                          : "bg-amber-700"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <p className="text-xs text-primary mb-1">{chain.chainName}</p>
                  <h3 className="text-lg font-bold mb-2 mt-2">
                    {menu.menuName}
                  </h3>

                  {/* 指標バッジ */}
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 bg-primary/10 text-primary">
                    {displayValue.label}: {displayValue.value}
                  </div>

                  {/* 栄養成分 */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-background/50 rounded p-2">
                      <span className="text-foreground/60">カロリー</span>
                      <span className="block font-bold">
                        {menu.calories}kcal
                      </span>
                    </div>
                    <div className="bg-background/50 rounded p-2">
                      <span className="text-foreground/60">タンパク質</span>
                      <span className="block font-bold">{menu.protein}g</span>
                    </div>
                  </div>

                  {menu.price && (
                    <p className="mt-4 text-right text-lg font-bold text-primary">
                      {formatPrice(menu.price)}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* チェーン店別で探す */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">チェーン店別で探す</h2>
          <div className="flex flex-wrap gap-3">
            {chains.map((chain) => (
              <Link
                key={chain.chainId}
                href={`/${chain.chainId}/${purposeId}`}
                className="px-4 py-2 bg-card-bg border border-border rounded-lg hover:border-primary transition-colors text-sm"
              >
                {chain.chainName}
              </Link>
            ))}
          </div>
        </section>

        {/* 全ランキング */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            全ランキング（{rankings.length}件）
          </h2>
          <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                      順位
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                      メニュー名
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                      チェーン店
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-foreground/70">
                      スコア
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                      カロリー
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                      P
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                      価格
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rankings.map(({ menu, chain }, index) => {
                    const displayValue = getDisplayValue(menu, purpose.sortField);
                    return (
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
                            href={`/chains/${chain.chainId}`}
                            className="hover:text-primary"
                          >
                            {chain.chainName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {displayValue.value}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {menu.calories}kcal
                        </td>
                        <td className="px-4 py-3 text-right">{menu.protein}g</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {menu.price ? formatPrice(menu.price) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 他の目的 */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">他の目的で探す</h2>
          <div className="flex flex-wrap gap-3">
            {Object.values(purposes)
              .filter((p) => p.id !== purposeId)
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/purpose/${p.id}`}
                  className="px-4 py-2 bg-card-bg border border-border rounded-lg hover:border-primary transition-colors"
                >
                  {p.name}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
