import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllChains,
  getChainById,
  getGlobalRankingByPurpose,
  getChainRankingGlobal,
} from "@/lib/db/queries";
import {
  purposes,
  allPurposeIds,
  isPurposeId,
  type PurposeId,
} from "@/lib/filters";
import { formatPrice } from "@/lib/utils";
import { FavoriteButton } from "@/components/menu/FavoriteButton";
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
    case "costPerformance": {
      if (menu.price && menu.price > 0 && menu.protein > 0) {
        const costPerProtein = (menu.price / menu.protein).toFixed(1);
        return { value: `${costPerProtein}円/gP`, label: "コスパ" };
      }
      return { value: "-", label: "コスパ" };
    }
    default:
      return { value: `${menu.protein}g`, label: "タンパク質" };
  }
}

type Props = {
  params: Promise<{ type: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  const chains = getAllChains();
  const params: { type: string }[] = [];

  // 目的別ランキング
  for (const purposeId of allPurposeIds) {
    params.push({ type: purposeId });
  }

  // チェーン店別ランキング
  for (const chain of chains) {
    params.push({ type: chain.chainId });
  }

  return params;
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;

  // 目的別ランキング
  if (isPurposeId(type)) {
    const purpose = purposes[type];
    const title = `${purpose.name}メニューランキング｜外食チェーンおすすめ`;
    const description = `外食チェーン店の${purpose.name}メニューをランキング。${purpose.description}`;
    return {
      title,
      description,
      openGraph: { title, description, type: "website" },
    };
  }

  // チェーン店別ランキング
  const chain = getChainById(type);
  if (chain) {
    const title = `${chain.chainName}メニューランキング｜おすすめヘルシーメニュー`;
    const description = `${chain.chainName}のメニューをヘルシー度でランキング。おすすめメニューが一目でわかります。`;
    return {
      title,
      description,
      openGraph: { title, description, type: "website" },
    };
  }

  return { title: "ランキング" };
}

export default async function RankingTypePage({ params }: Props) {
  const { type } = await params;

  // 目的別ランキング
  if (isPurposeId(type)) {
    return <PurposeRankingView purposeId={type} />;
  }

  // チェーン店別ランキング
  const chain = getChainById(type);
  if (chain) {
    return <ChainRankingView chainId={type} chainName={chain.chainName} />;
  }

  notFound();
}

// ============================
// 目的別ランキングビュー
// ============================
function PurposeRankingView({ purposeId }: { purposeId: PurposeId }) {
  const purpose = purposes[purposeId];
  const menus = getGlobalRankingByPurpose(purposeId, 50);

  return (
    <main className="min-h-screen bg-background">
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
              <li>
                <Link href="/ranking" className="hover:text-primary">
                  ランキング
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{purpose.name}</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {purpose.name}メニューランキング
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            {purpose.description}｜外食チェーン全店から厳選
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* イントロダクション */}
        <section className="mb-8 p-4 bg-card-bg/50 rounded-lg border border-border">
          <p className="text-foreground/80 leading-relaxed">
            {getRankingIntroText(purposeId)}
            <span className="block mt-2 text-sm text-foreground/60">
              外食チェーン全店から厳選した{menus.length}件を掲載中
            </span>
          </p>
        </section>

        {/* ランキング一覧 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-6">ランキング（{menus.length}件）</h2>
          <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {menus.map(({ menu, chain }, index) => {
                const displayValue = getDisplayValue(menu, purpose.sortField);
                return (
                <div key={menu.menuId} className="relative flex items-center">
                  <Link
                    href={`/menu/${menu.menuId}`}
                    className="flex items-center gap-4 p-4 hover:bg-background/30 transition-colors flex-1 pr-14"
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
                      <p className="text-xs text-foreground/60">{chain.chainName}</p>
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
                        {displayValue.value}
                      </p>
                      <p className="text-xs text-foreground/60">{displayValue.label}</p>
                    </div>
                    {menu.price && (
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(menu.price)}</p>
                      </div>
                    )}
                  </Link>
                  <FavoriteButton
                    menuId={menu.menuId}
                    size="sm"
                    className="absolute right-4"
                  />
                </div>
              );})}
            </div>
          </div>
        </section>

        {/* 他の目的別ランキング */}
        <section className="mt-8 pt-8 border-t border-border">
          <h2 className="text-xl font-bold mb-4">他の目的で探す</h2>
          <div className="flex flex-wrap gap-2">
            {allPurposeIds
              .filter((id) => id !== purposeId)
              .map((id) => (
                <Link
                  key={id}
                  href={`/ranking/${id}`}
                  className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
                >
                  {purposes[id].name}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

// ============================
// チェーン店別ランキングビュー
// ============================
function ChainRankingView({
  chainId,
  chainName,
}: {
  chainId: string;
  chainName: string;
}) {
  const menus = getChainRankingGlobal(chainId, 50);

  return (
    <main className="min-h-screen bg-background">
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
              <li>
                <Link href="/ranking" className="hover:text-primary">
                  ランキング
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{chainName}</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {chainName}メニューランキング
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            ヘルシー度でランキング｜おすすめメニュー{menus.length}件
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* ランキング一覧 */}
        <section className="mb-8">
          <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {menus.map(({ menu }, index) => (
                <div key={menu.menuId} className="relative flex items-center">
                  <Link
                    href={`/menu/${menu.menuId}`}
                    className="flex items-center gap-4 p-4 hover:bg-background/30 transition-colors flex-1 pr-14"
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
                        {((menu.protein / menu.calories) * 100).toFixed(1)}
                      </p>
                      <p className="text-xs text-foreground/60">P密度</p>
                    </div>
                    {menu.price && (
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(menu.price)}</p>
                      </div>
                    )}
                  </Link>
                  <FavoriteButton
                    menuId={menu.menuId}
                    size="sm"
                    className="absolute right-4"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 関連リンク */}
        <section className="mt-8 pt-8 border-t border-border">
          <h2 className="text-xl font-bold mb-4">関連ページ</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${chainId}`}
              className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
            >
              {chainName}トップ
            </Link>
            <Link
              href={`/${chainId}/menu`}
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

// ============================
// ヘルパー関数
// ============================
function getRankingIntroText(purposeId: PurposeId): string {
  const introText: Record<PurposeId, string> = {
    "high-protein": "外食でも高タンパクな食事を摂りたい方へ。筋トレやボディメイク中の方におすすめのメニューを、タンパク質量でランキングしました。",
    "protein-dense": "カロリーあたりのタンパク質量を重視する方へ。効率的にタンパク質を摂取できるメニューをランキング形式で紹介します。",
    "low-calorie": "外食でもダイエットを続けたい方へ。カロリーを抑えたメニューをランキング形式で紹介します。",
    "low-carb": "外食でも糖質制限を続けたい方へ。炭水化物を抑えたメニューを、糖質比率でランキングしました。",
    "low-fat": "外食でも脂質を抑えた食事をしたい方へ。ローファットダイエット中でも安心して選べるメニューをランキング形式で紹介します。",
    "balanced": "外食でも健康的な食事を心がけたい方へ。PFCバランスの良いメニューをランキングしました。",
    "cost-performance": "外食でもコスパ良くタンパク質を摂りたい方へ。1円あたりのタンパク質量でランキングしました。",
  };

  return introText[purposeId];
}
