import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getChainById,
  getMenusByChainAndPurpose,
  getAllChainPurposeCombinations,
  purposes,
  type PurposeId,
} from "@/lib/db/queries";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ chain: string; purpose: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  const combinations = getAllChainPurposeCombinations();
  return combinations;
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chain: chainId, purpose: purposeId } = await params;
  const chain = getChainById(chainId);
  const purpose = purposes[purposeId as PurposeId];

  if (!chain || !purpose) {
    return { title: "ページが見つかりません" };
  }

  const title = `${chain.chainName}の${purpose.name}メニュー | ヘルシー検索`;
  const description = `${chain.chainName}で${purpose.name}に最適なメニューをランキング形式でご紹介。カロリー・タンパク質・脂質・炭水化物の栄養成分も掲載。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

// スコアに応じた色を返す
function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-100";
  if (score >= 60) return "text-lime-600 bg-lime-100";
  if (score >= 40) return "text-yellow-600 bg-yellow-100";
  return "text-orange-600 bg-orange-100";
}

// スコアに応じたラベル
function getScoreLabel(score: number): string {
  if (score >= 80) return "最適";
  if (score >= 60) return "おすすめ";
  if (score >= 40) return "普通";
  return "控えめ";
}

export default async function ChainPurposePage({ params }: Props) {
  const { chain: chainId, purpose: purposeId } = await params;
  const chain = getChainById(chainId);
  const purpose = purposes[purposeId as PurposeId];

  if (!chain || !purpose) {
    notFound();
  }

  const menus = getMenusByChainAndPurpose(chainId, purposeId as PurposeId, 20);
  const top3 = menus.slice(0, 3);

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
                <Link
                  href={`/${chain.chainId}/health`}
                  className="hover:text-primary"
                >
                  {chain.chainName}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{purpose.name}</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {chain.chainName}の
            <span className="text-primary">{purpose.name}</span>
            メニュー
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            {purpose.description}。{chain.chainName}
            のメニューを栄養成分とスコアでランキング。
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* TOP3セクション */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-accent">TOP3</span>おすすめメニュー
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {top3.map((menu, index) => {
              const score =
                menu[purpose.scoreField as keyof typeof menu] as number;
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

                  <h3 className="text-lg font-bold mb-2 mt-2">
                    {menu.menuName}
                  </h3>

                  {/* スコアバッジ */}
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getScoreColor(score)}`}
                  >
                    {purpose.name}スコア: {Math.round(score)}点
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
                    <div className="bg-background/50 rounded p-2">
                      <span className="text-foreground/60">脂質</span>
                      <span className="block font-bold">{menu.fat}g</span>
                    </div>
                    <div className="bg-background/50 rounded p-2">
                      <span className="text-foreground/60">炭水化物</span>
                      <span className="block font-bold">{menu.carb}g</span>
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

        {/* 全メニューテーブル */}
        <section>
          <h2 className="text-2xl font-bold mb-6">全メニューランキング</h2>
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
                  {menus.map((menu, index) => {
                    const score =
                      menu[purpose.scoreField as keyof typeof menu] as number;
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
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(score)}`}
                          >
                            {Math.round(score)}
                          </span>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 関連リンク */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">他の目的で探す</h2>
          <div className="flex flex-wrap gap-3">
            {Object.values(purposes)
              .filter((p) => p.id !== purposeId)
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/${chainId}/${p.id}`}
                  className="px-4 py-2 bg-card-bg border border-border rounded-lg hover:border-primary transition-colors"
                >
                  {chain.chainName}の{p.name}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
