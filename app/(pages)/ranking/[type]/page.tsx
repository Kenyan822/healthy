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
              {menus.map(({ menu, chain }, index) => (
                <Link
                  key={menu.menuId}
                  href={`/${chain.chainId}/${menu.menuSlug || menu.menuId}`}
                  className="flex items-center gap-4 p-4 hover:bg-background/30 transition-colors"
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
                      {menu[purpose.scoreField]?.toFixed(1)}
                    </p>
                    <p className="text-xs text-foreground/60">スコア</p>
                  </div>
                  {menu.price && (
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(menu.price)}</p>
                    </div>
                  )}
                </Link>
              ))}
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
                <Link
                  key={menu.menuId}
                  href={`/${chainId}/${menu.menuSlug || menu.menuId}`}
                  className="flex items-center gap-4 p-4 hover:bg-background/30 transition-colors"
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
                      {menu.healthScore?.toFixed(1)}
                    </p>
                    <p className="text-xs text-foreground/60">スコア</p>
                  </div>
                  {menu.price && (
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(menu.price)}</p>
                    </div>
                  )}
                </Link>
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
    "high-protein": "外食でも高タンパクな食事を摂りたい方へ。筋トレやボディメイク中の方におすすめのメニューを、タンパク質量とPFCバランスでランキングしました。",
    "diet": "外食でもダイエットを続けたい方へ。カロリーと栄養バランスを考慮した、ダイエット中におすすめのメニューをランキング形式で紹介します。",
    "health": "外食でも健康的な食事を心がけたい方へ。栄養バランスの良いメニューを、健康スコアでランキングしました。",
    "low-carb": "外食でも糖質制限を続けたい方へ。炭水化物を抑えたメニューを、糖質量と栄養バランスでランキングしました。",
    "low-fat": "外食でも脂質を抑えた食事をしたい方へ。ローファットダイエット中でも安心して選べるメニューをランキング形式で紹介します。",
  };

  return introText[purposeId];
}
