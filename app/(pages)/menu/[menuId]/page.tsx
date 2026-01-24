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
import { FavoriteButton } from "@/components/menu/FavoriteButton";

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

// おすすめポイント生成（事実ベース指標）
function getRecommendations(menu: {
  protein: number;
  calories: number;
  carb: number;
  fat: number;
}): string[] {
  const recommendations: string[] = [];

  // タンパク質密度（高効率）
  const proteinDensity = (menu.protein / menu.calories) * 100;
  if (proteinDensity >= 5) {
    recommendations.push("タンパク質効率が高く、効率的にタンパク質を摂取可能");
  }

  // 高タンパク
  if (menu.protein >= 30) {
    recommendations.push("1食で30g以上のタンパク質を摂取可能");
  }

  // 低カロリー
  if (menu.calories <= 500) {
    recommendations.push("500kcal以下でカロリーコントロールに最適");
  }

  // 低糖質
  if (menu.carb <= 50) {
    recommendations.push("糖質控えめで低糖質ダイエットに最適");
  }

  // 低脂質
  if (menu.fat <= 15) {
    recommendations.push("脂質が控えめでローファットダイエットに最適");
  }

  // PFCバランス
  const totalCal = menu.protein * 4 + menu.fat * 9 + menu.carb * 4;
  if (totalCal > 0) {
    const pRatio = (menu.protein * 4) / totalCal;
    const fRatio = (menu.fat * 9) / totalCal;
    const cRatio = (menu.carb * 4) / totalCal;
    if (pRatio >= 0.15 && pRatio <= 0.25 && fRatio >= 0.2 && fRatio <= 0.3 && cRatio >= 0.45 && cRatio <= 0.65) {
      recommendations.push("PFCバランスが良く栄養バランスに優れている");
    }
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
    menu.protein,
    menu.calories,
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
              <div className="flex items-start gap-3 mb-4">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground">
                  {menu.menuName}
                </h1>
                <FavoriteButton menuId={menu.menuId} size="lg" />
              </div>
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

            {/* 栄養指標 */}
            <section>
              <h2 className="text-xl font-bold mb-4">栄養指標</h2>
              {(() => {
                // 各指標を計算
                const proteinDensity = (menu.protein / menu.calories) * 100;
                const carbRatio = ((menu.carb * 4) / menu.calories) * 100;
                const fatRatio = ((menu.fat * 9) / menu.calories) * 100;
                const proteinRatio = ((menu.protein * 4) / menu.calories) * 100;
                // PFCバランス: 理想比率(P:20%, F:25%, C:55%)との乖離（各指標を正規化）
                const pDev = Math.abs(proteinRatio - 20) / 20;
                const fDev = Math.abs(fatRatio - 25) / 25;
                const cDev = Math.abs(carbRatio - 55) / 55;
                const pfcBalance = Math.max(0, Math.round(100 * (1 - (pDev + fDev + cDev) / 3)));
                const costPerProtein = menu.price && menu.protein > 0
                  ? Math.round(menu.price / menu.protein)
                  : null;

                // 色分け判定
                const getProteinDensityColor = (val: number) => {
                  if (val >= 5) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                  if (val >= 3) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                };
                const getCaloriesColor = (val: number) => {
                  if (val <= 500) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                  if (val <= 700) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                };
                const getCarbRatioColor = (val: number) => {
                  if (val <= 40) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                  if (val <= 55) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                };
                const getFatRatioColor = (val: number) => {
                  if (val <= 25) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                  if (val <= 35) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                };
                const getPfcBalanceColor = (val: number) => {
                  if (val >= 70) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                  if (val >= 40) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                };
                const getCostPerProteinColor = (val: number | null) => {
                  if (val === null) return "bg-card-bg border-border";
                  if (val <= 30) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                  if (val <= 50) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                };

                const baseCardStyle = "rounded-xl border p-4";

                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`${baseCardStyle} ${getProteinDensityColor(proteinDensity)}`}>
                      <div className="text-sm text-foreground/60 mb-1">タンパク質密度</div>
                      <div className="text-3xl font-bold text-foreground">
                        {proteinDensity.toFixed(1)}
                      </div>
                      <div className="text-xs text-foreground/50 mt-1">g/100kcal</div>
                    </div>

                    <div className={`${baseCardStyle} ${getCaloriesColor(menu.calories)}`}>
                      <div className="text-sm text-foreground/60 mb-1">カロリー</div>
                      <div className="text-3xl font-bold text-foreground">
                        {menu.calories}
                      </div>
                      <div className="text-xs text-foreground/50 mt-1">kcal</div>
                    </div>

                    <div className={`${baseCardStyle} ${getCarbRatioColor(carbRatio)}`}>
                      <div className="text-sm text-foreground/60 mb-1">糖質比率</div>
                      <div className="text-3xl font-bold text-foreground">
                        {carbRatio.toFixed(1)}%
                      </div>
                      <div className="text-xs text-foreground/50 mt-1">低いほど低糖質</div>
                    </div>

                    <div className={`${baseCardStyle} ${getFatRatioColor(fatRatio)}`}>
                      <div className="text-sm text-foreground/60 mb-1">脂質比率</div>
                      <div className="text-3xl font-bold text-foreground">
                        {fatRatio.toFixed(1)}%
                      </div>
                      <div className="text-xs text-foreground/50 mt-1">低いほど低脂質</div>
                    </div>

                    <div className={`${baseCardStyle} ${getPfcBalanceColor(pfcBalance)}`}>
                      <div className="text-sm text-foreground/60 mb-1">PFCバランス</div>
                      <div className="text-3xl font-bold text-foreground">
                        {pfcBalance}
                      </div>
                      <div className="text-xs text-foreground/50 mt-1">理想比率との近さ</div>
                    </div>

                    <div className={`${baseCardStyle} ${getCostPerProteinColor(costPerProtein)}`}>
                      <div className="text-sm text-foreground/60 mb-1">タンパク質コスパ</div>
                      <div className="text-3xl font-bold text-foreground">
                        {costPerProtein !== null ? costPerProtein : "-"}
                      </div>
                      <div className="text-xs text-foreground/50 mt-1">円/gP</div>
                    </div>
                  </div>
                );
              })()}
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
