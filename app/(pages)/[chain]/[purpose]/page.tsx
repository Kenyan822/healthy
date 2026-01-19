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
import { SortableMenuTable } from "@/components/menu/SortableMenuTable";

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

  // 目的別のアイコンとカラー
  const purposeStyles: Record<string, { icon: string; gradient: string; accent: string }> = {
    high_protein: { icon: "💪", gradient: "from-orange-500/20 via-red-500/10 to-yellow-500/20", accent: "text-orange-500" },
    low_fat: { icon: "🥗", gradient: "from-green-500/20 via-emerald-500/10 to-lime-500/20", accent: "text-green-500" },
    low_carb: { icon: "⚡", gradient: "from-blue-500/20 via-indigo-500/10 to-cyan-500/20", accent: "text-blue-500" },
    balanced: { icon: "🎯", gradient: "from-purple-500/20 via-pink-500/10 to-violet-500/20", accent: "text-purple-500" },
    low_calorie: { icon: "🔥", gradient: "from-rose-500/20 via-pink-500/10 to-red-500/20", accent: "text-rose-500" },
  };

  const style = purposeStyles[purposeId] || { icon: "🍽️", gradient: "from-primary/20 to-accent/20", accent: "text-primary" };

  return (
    <main className="min-h-screen bg-background">
      {/* ヒーローセクション */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${style.gradient} py-8 md:py-10`}>
        {/* 装飾背景 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-white/30 dark:bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[200px] h-[200px] bg-white/20 dark:bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* 浮遊するアイコン */}
        <div className="absolute top-6 right-[10%] text-4xl opacity-15 animate-bounce" style={{ animationDuration: '3s' }}>
          {style.icon}
        </div>

        <div className="container relative mx-auto px-4 z-10">
          {/* パンくずリスト */}
          <nav className="mb-4 text-sm">
            <ol className="flex items-center gap-2 text-foreground/60">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  ホーム
                </Link>
              </li>
              <li className="text-foreground/40">/</li>
              <li>
                <Link
                  href={`/chains/${chain.chainId}`}
                  className="hover:text-primary transition-colors"
                >
                  {chain.chainName}
                </Link>
              </li>
              <li className="text-foreground/40">/</li>
              <li className="text-foreground font-medium">{purpose.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {/* バッジ */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full shadow-sm text-sm">
                  <span className="text-lg">{style.icon}</span>
                  <span className={`font-bold ${style.accent}`}>{purpose.name}</span>
                </div>
                <span className="text-sm text-foreground/50">{menus.length}件</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
                <span className="text-foreground/80">{chain.chainName}の</span>
                <span className={`${style.accent}`}>{purpose.name}</span>
                <span className="text-foreground/80">メニュー</span>
              </h1>

              <p className="text-sm text-foreground/70 max-w-2xl">
                {purpose.description}。栄養成分とスコアでランキング。
              </p>
            </div>
          </div>
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
          <h2 className="text-2xl font-bold mb-6">全メニュー一覧</h2>
          <SortableMenuTable
            menus={menus}
            scoreField={purpose.scoreField}
            purposeName={purpose.name}
          />
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
