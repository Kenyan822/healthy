import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getMenuWithChain,
  getAllMenuIds,
  getSimilarMenus,
  getSimilarMenusFromOtherChains,
  purposes,
} from "@/lib/db/queries";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: Promise<{ menuId: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  const menuIds = getAllMenuIds();
  return menuIds.map((menuId) => ({ menuId }));
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { menuId } = await params;
  const result = getMenuWithChain(menuId);

  if (!result) {
    return { title: "メニューが見つかりません" };
  }

  const { menu, chain } = result;
  const title = `${menu.menuName}の栄養成分・カロリー | ${chain.chainName} | ヘルシー検索`;
  const description = `${chain.chainName}の${menu.menuName}の栄養成分。カロリー${menu.calories}kcal、タンパク質${menu.protein}g、脂質${menu.fat}g、炭水化物${menu.carb}g。ダイエット・筋トレ向けスコアも掲載。`;

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

// スコアに応じた色
function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-lime-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-orange-500";
}

// スコアバーコンポーネント
function ScoreBar({
  label,
  score,
  description,
}: {
  label: string;
  score: number;
  description: string;
}) {
  return (
    <div className="bg-card-bg rounded-lg p-4 border border-border">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-2xl font-bold">{Math.round(score)}</span>
      </div>
      <div className="w-full bg-background/50 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-sm text-foreground/60">{description}</p>
    </div>
  );
}

// おすすめポイント生成
function getRecommendations(menu: {
  muscleScore: number | null;
  dietScore: number | null;
  healthScore: number | null;
  protein: number;
  calories: number;
  carb: number;
}): string[] {
  const recommendations: string[] = [];

  if (menu.muscleScore && menu.muscleScore >= 70) {
    recommendations.push("筋トレ・バルクアップに最適な高タンパクメニュー");
  }
  if (menu.dietScore && menu.dietScore >= 70) {
    recommendations.push("ダイエット中の方におすすめの低カロリーメニュー");
  }
  if (menu.healthScore && menu.healthScore >= 70) {
    recommendations.push("栄養バランスが良く健康維持に最適");
  }
  if (menu.protein >= 30) {
    recommendations.push("1食で30g以上のタンパク質を摂取可能");
  }
  if (menu.calories <= 500) {
    recommendations.push("500kcal以下でカロリーコントロールに最適");
  }
  if (menu.carb <= 50) {
    recommendations.push("糖質控えめで低糖質ダイエットに対応");
  }

  return recommendations.length > 0
    ? recommendations
    : ["バランスの取れた一品です"];
}

export default async function MenuDetailPage({ params }: Props) {
  const { menuId } = await params;
  const result = getMenuWithChain(menuId);

  if (!result) {
    notFound();
  }

  const { menu, chain } = result;

  // 類似メニューを取得
  const similarMenus = getSimilarMenus(chain.chainId, menuId, 4);
  const otherChainMenus = getSimilarMenusFromOtherChains(
    chain.chainId,
    menu.healthScore || 50,
    "healthScore",
    4
  );

  const recommendations = getRecommendations(menu);

  return (
    <main className="min-h-screen bg-background">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* パンくずリスト */}
          <nav className="mb-4 text-sm">
            <ol className="flex items-center gap-2 text-foreground/60 flex-wrap">
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
              <li className="text-foreground">{menu.menuName}</li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <p className="text-primary font-medium mb-2">{chain.chainName}</p>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                {menu.menuName}
              </h1>
              {menu.category && (
                <span className="inline-block px-3 py-1 bg-background/50 rounded-full text-sm">
                  {menu.category}
                </span>
              )}
            </div>
            {menu.price && (
              <div className="text-right">
                <p className="text-sm text-foreground/60">価格（税込）</p>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(menu.price)}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-8">
            {/* 栄養成分 */}
            <section>
              <h2 className="text-xl font-bold mb-4">栄養成分</h2>
              <div className="bg-card-bg rounded-xl border border-border p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <p className="text-sm text-foreground/60 mb-1">カロリー</p>
                    <p className="text-2xl font-bold text-accent">
                      {menu.calories}
                    </p>
                    <p className="text-sm text-foreground/60">kcal</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <p className="text-sm text-foreground/60 mb-1">タンパク質</p>
                    <p className="text-2xl font-bold text-red-500">
                      {menu.protein}
                    </p>
                    <p className="text-sm text-foreground/60">g</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <p className="text-sm text-foreground/60 mb-1">脂質</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {menu.fat}
                    </p>
                    <p className="text-sm text-foreground/60">g</p>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <p className="text-sm text-foreground/60 mb-1">炭水化物</p>
                    <p className="text-2xl font-bold text-blue-500">
                      {menu.carb}
                    </p>
                    <p className="text-sm text-foreground/60">g</p>
                  </div>
                </div>

                {/* 追加の栄養成分 */}
                {(menu.fiber || menu.sodium || menu.sugar) && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {menu.fiber && (
                        <div>
                          <span className="text-foreground/60">食物繊維:</span>{" "}
                          <span className="font-medium">{menu.fiber}g</span>
                        </div>
                      )}
                      {menu.sodium && (
                        <div>
                          <span className="text-foreground/60">塩分:</span>{" "}
                          <span className="font-medium">{menu.sodium}g</span>
                        </div>
                      )}
                      {menu.sugar && (
                        <div>
                          <span className="text-foreground/60">糖質:</span>{" "}
                          <span className="font-medium">{menu.sugar}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* スコア */}
            <section>
              <h2 className="text-xl font-bold mb-4">目的別スコア</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <ScoreBar
                  label="筋トレスコア"
                  score={menu.muscleScore || 0}
                  description="タンパク質効率を評価"
                />
                <ScoreBar
                  label="ダイエットスコア"
                  score={menu.dietScore || 0}
                  description="低カロリー・低糖質を評価"
                />
                <ScoreBar
                  label="ヘルシースコア"
                  score={menu.healthScore || 0}
                  description="栄養バランスを総合評価"
                />
              </div>
            </section>

            {/* こんな人におすすめ */}
            <section>
              <h2 className="text-xl font-bold mb-4">こんな人におすすめ</h2>
              <div className="bg-card-bg rounded-xl border border-border p-6">
                <ul className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-primary text-xl">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 同チェーン店の類似メニュー */}
            {similarMenus.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">
                  {chain.chainName}の他のメニュー
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {similarMenus.map((item) => (
                    <Link
                      key={item.menuId}
                      href={`/menu/${item.menuId}`}
                      className="bg-card-bg rounded-lg border border-border p-4 hover:border-primary transition-colors"
                    >
                      <p className="font-medium text-sm mb-2 line-clamp-2">
                        {item.menuName}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {item.calories}kcal / P{item.protein}g
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            {/* チェーン店情報 */}
            <div className="bg-card-bg rounded-xl border border-border p-6">
              <h3 className="font-bold mb-4">{chain.chainName}</h3>
              {chain.description && (
                <p className="text-sm text-foreground/70 mb-4">
                  {chain.description}
                </p>
              )}
              <div className="space-y-2">
                {Object.values(purposes).map((purpose) => (
                  <Link
                    key={purpose.id}
                    href={`/${chain.chainId}/${purpose.id}`}
                    className="block px-4 py-2 bg-background/50 rounded-lg hover:bg-primary/10 transition-colors text-sm"
                  >
                    {purpose.name}メニューを見る
                  </Link>
                ))}
              </div>
              {chain.officialUrl && (
                <a
                  href={chain.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 text-center text-sm text-primary hover:underline"
                >
                  公式サイトを見る →
                </a>
              )}
            </div>

            {/* 他チェーンの類似メニュー */}
            {otherChainMenus.length > 0 && (
              <div className="bg-card-bg rounded-xl border border-border p-6">
                <h3 className="font-bold mb-4">他チェーンの類似メニュー</h3>
                <div className="space-y-3">
                  {otherChainMenus.map(({ menu: item, chain: itemChain }) => (
                    <Link
                      key={item.menuId}
                      href={`/menu/${item.menuId}`}
                      className="block p-3 bg-background/50 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <p className="text-xs text-primary mb-1">
                        {itemChain.chainName}
                      </p>
                      <p className="font-medium text-sm line-clamp-1">
                        {item.menuName}
                      </p>
                      <p className="text-xs text-foreground/60 mt-1">
                        {item.calories}kcal / P{item.protein}g
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
