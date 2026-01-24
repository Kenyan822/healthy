import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getChainById,
  getAllChains,
  getMenusBySeoPurpose,
  getMenusByNutritionFilter,
  getMenusByPriceFilter,
  getMenusByTiming,
  countMenusByNutritionFilter,
  countMenusByPriceFilter,
  countMenusByTiming,
  countMenusByChain,
} from "@/lib/db/queries";
import type { MenuSelect } from "@/lib/db/schema";
import {
  purposes,
  nutritionFilters,
  priceFilters,
  timingFilters,
  allPurposeIds,
  allNutritionFilterIds,
  allPriceFilterIds,
  allTimingFilterIds,
} from "@/lib/filters";
import { resolveSegment, generateSegmentMetadata } from "@/lib/segment-resolver";
import { formatPrice } from "@/lib/utils";
import { FavoriteButton } from "@/components/menu/FavoriteButton";

type Props = {
  params: Promise<{ store: string; segment: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  const chains = getAllChains();
  const params: { store: string; segment: string }[] = [];

  for (const chain of chains) {
    const menuCount = countMenusByChain(chain.chainId);
    if (menuCount < 3) continue;

    // 目的
    for (const purposeId of allPurposeIds) {
      params.push({ store: chain.chainId, segment: purposeId });
    }

    // 栄養フィルター（3件以上のみ）
    for (const filterId of allNutritionFilterIds) {
      const count = countMenusByNutritionFilter(chain.chainId, filterId);
      if (count >= 3) {
        params.push({ store: chain.chainId, segment: filterId });
      }
    }

    // 価格フィルター（3件以上のみ）
    for (const filterId of allPriceFilterIds) {
      const count = countMenusByPriceFilter(chain.chainId, filterId);
      if (count >= 3) {
        params.push({ store: chain.chainId, segment: filterId });
      }
    }

    // 時間帯フィルター（3件以上のみ）
    for (const filterId of allTimingFilterIds) {
      const count = countMenusByTiming(chain.chainId, filterId);
      if (count >= 3) {
        params.push({ store: chain.chainId, segment: filterId });
      }
    }
  }

  return params;
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store, segment } = await params;
  const chain = getChainById(store);

  if (!chain) {
    return { title: "ページが見つかりません" };
  }

  const resolved = resolveSegment(segment);

  if (resolved.type === "notfound") {
    return { title: "ページが見つかりません" };
  }

  const { title, description } = generateSegmentMetadata(chain.chainName, resolved);

  // 品質チェック（3件未満はnoindex）
  let menuCount = 0;
  if (resolved.type === "purpose") {
    menuCount = countMenusByChain(store);
  } else if (resolved.type === "nutrition") {
    menuCount = countMenusByNutritionFilter(store, segment as keyof typeof nutritionFilters);
  } else if (resolved.type === "price") {
    menuCount = countMenusByPriceFilter(store, segment as keyof typeof priceFilters);
  } else if (resolved.type === "timing") {
    menuCount = countMenusByTiming(store, segment as keyof typeof timingFilters);
  } else if (resolved.type === "menu") {
    menuCount = 1;
  }

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    robots: menuCount >= 3 || resolved.type === "menu"
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function StoreSegmentPage({ params }: Props) {
  const { store, segment } = await params;
  const chain = getChainById(store);

  if (!chain) {
    notFound();
  }

  const resolved = resolveSegment(segment);

  if (resolved.type === "notfound") {
    notFound();
  }

  // セグメントタイプに応じてコンテンツをレンダリング
  switch (resolved.type) {
    case "purpose":
      return <PurposeView store={store} chain={chain} purpose={resolved.data} />;
    case "nutrition":
      return <NutritionView store={store} chain={chain} filter={resolved.data} filterId={segment as keyof typeof nutritionFilters} />;
    case "price":
      return <PriceView store={store} chain={chain} filter={resolved.data} filterId={segment as keyof typeof priceFilters} />;
    case "timing":
      return <TimingView store={store} chain={chain} filter={resolved.data} filterId={segment as keyof typeof timingFilters} />;
    default:
      notFound();
  }
}

// ============================
// 目的別ビュー
// ============================
function PurposeView({
  store,
  chain,
  purpose,
}: {
  store: string;
  chain: { chainId: string; chainName: string };
  purpose: (typeof purposes)[keyof typeof purposes];
}) {
  const menus = getMenusBySeoPurpose(store, purpose.id as keyof typeof purposes);

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb store={store} chainName={chain.chainName} current={purpose.name} />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {chain.chainName}の{purpose.name}メニュー
          </h1>
          <p className="text-lg text-foreground/70 mt-2">{purpose.description}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <PageIntroSection chainName={chain.chainName} purposeId={purpose.id} menuCount={menus.length} />
        <MenuTable menus={menus} />
        <RelatedLinks store={store} currentSegment={purpose.id} />
      </div>
    </main>
  );
}

// ============================
// 栄養フィルタービュー
// ============================
function NutritionView({
  store,
  chain,
  filter,
  filterId,
}: {
  store: string;
  chain: { chainId: string; chainName: string };
  filter: (typeof nutritionFilters)[keyof typeof nutritionFilters];
  filterId: keyof typeof nutritionFilters;
}) {
  const menus = getMenusByNutritionFilter(store, filterId);

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb store={store} chainName={chain.chainName} current={filter.label} />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {chain.chainName}の{filter.label}メニュー
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            {filter.seoTitle}を{menus.length}件掲載
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <MenuTable menus={menus} highlightField={filter.type} />
        <RelatedLinks store={store} currentSegment={filterId} />
      </div>
    </main>
  );
}

// ============================
// 価格フィルタービュー
// ============================
function PriceView({
  store,
  chain,
  filter,
  filterId,
}: {
  store: string;
  chain: { chainId: string; chainName: string };
  filter: (typeof priceFilters)[keyof typeof priceFilters];
  filterId: keyof typeof priceFilters;
}) {
  const menus = getMenusByPriceFilter(store, filterId);

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb store={store} chainName={chain.chainName} current={filter.label} />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {chain.chainName}の{filter.label}メニュー
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            お得にヘルシーな食事を｜{menus.length}件
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <MenuTable menus={menus} highlightField="price" />
        <RelatedLinks store={store} currentSegment={filterId} />
      </div>
    </main>
  );
}

// ============================
// 時間帯フィルタービュー
// ============================
function TimingView({
  store,
  chain,
  filter,
  filterId,
}: {
  store: string;
  chain: { chainId: string; chainName: string };
  filter: (typeof timingFilters)[keyof typeof timingFilters];
  filterId: keyof typeof timingFilters;
}) {
  const menus = getMenusByTiming(store, filterId);

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb store={store} chainName={chain.chainName} current={filter.label} />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {chain.chainName}の{filter.label}
          </h1>
          <p className="text-lg text-foreground/70 mt-2">{filter.seoTitle}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <TimingIntroSection chainName={chain.chainName} timingId={filterId} menuCount={menus.length} />
        <MenuTable menus={menus} />
        <RelatedLinks store={store} currentSegment={filterId} />
      </div>
    </main>
  );
}

// ============================
// 共通コンポーネント
// ============================
function Breadcrumb({
  store,
  chainName,
  current,
}: {
  store: string;
  chainName: string;
  current: string;
}) {
  return (
    <nav className="mb-4 text-sm">
      <ol className="flex items-center gap-2 text-foreground/60 flex-wrap">
        <li>
          <Link href="/" className="hover:text-primary">ホーム</Link>
        </li>
        <li>/</li>
        <li>
          <Link href={`/${store}`} className="hover:text-primary">{chainName}</Link>
        </li>
        <li>/</li>
        <li className="text-foreground">{current}</li>
      </ol>
    </nav>
  );
}

function PageIntroSection({
  chainName,
  purposeId,
  menuCount,
}: {
  chainName: string;
  purposeId: string;
  menuCount: number;
}) {
  const introText: Record<string, string> = {
    "high-protein": `${chainName}で高タンパクな食事をお探しの方へ。筋トレやボディメイク中でも外食を楽しめるよう、タンパク質が豊富なメニューを栄養成分付きでまとめました。`,
    "diet": `${chainName}でダイエット中の食事をお探しの方へ。カロリーや脂質を抑えながらも満足感のあるメニューを、PFCバランスで比較できます。`,
    "health": `${chainName}で栄養バランスの良い食事をお探しの方へ。健康的な食生活を続けたい方向けに、バランスの取れたメニューをまとめました。`,
    "low-carb": `${chainName}で糖質制限中の食事をお探しの方へ。炭水化物を抑えたメニューを、糖質量とともに一覧で確認できます。`,
    "low-fat": `${chainName}で脂質を抑えた食事をお探しの方へ。ローファットダイエット中でも安心して選べるメニューをまとめました。`,
  };

  const text = introText[purposeId] || `${chainName}のメニューを栄養成分付きで紹介しています。`;

  return (
    <section className="mb-8 p-4 bg-card-bg/50 rounded-lg border border-border">
      <p className="text-foreground/80 leading-relaxed">
        {text}
        <span className="block mt-2 text-sm text-foreground/60">
          該当メニュー {menuCount}件を掲載中
        </span>
      </p>
    </section>
  );
}

function TimingIntroSection({
  chainName,
  timingId,
  menuCount,
}: {
  chainName: string;
  timingId: string;
  menuCount: number;
}) {
  const introText: Record<string, string> = {
    "breakfast": `${chainName}の朝食メニューをお探しの方へ。朝から栄養バランスを整えたい方向けに、モーニングタイムに注文できるメニューを栄養成分付きでまとめました。`,
    "lunch": `${chainName}のランチメニューをお探しの方へ。忙しい昼休みでも栄養バランスを意識した食事ができるよう、ランチにおすすめのメニューをまとめました。`,
  };

  const text = introText[timingId] || `${chainName}のメニューを栄養成分付きで紹介しています。`;

  return (
    <section className="mb-8 p-4 bg-card-bg/50 rounded-lg border border-border">
      <p className="text-foreground/80 leading-relaxed">
        {text}
        <span className="block mt-2 text-sm text-foreground/60">
          該当メニュー {menuCount}件を掲載中
        </span>
      </p>
    </section>
  );
}

function MenuTable({
  menus,
  highlightField,
}: {
  menus: MenuSelect[];
  highlightField?: "protein" | "fat" | "carb" | "price";
}) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">メニュー一覧（{menus.length}件）</h2>
      <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                  メニュー名
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                  カロリー
                </th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${highlightField === "protein" ? "text-primary" : "text-foreground/70"}`}>
                  P
                </th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${highlightField === "fat" ? "text-primary" : "text-foreground/70"}`}>
                  F
                </th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${highlightField === "carb" ? "text-primary" : "text-foreground/70"}`}>
                  C
                </th>
                <th className={`px-4 py-3 text-right text-sm font-medium ${highlightField === "price" ? "text-primary" : "text-foreground/70"}`}>
                  価格
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground/70 w-12">
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
                  <td className="px-4 py-3 text-right">{menu.calories}kcal</td>
                  <td className={`px-4 py-3 text-right ${highlightField === "protein" ? "font-bold text-primary" : ""}`}>
                    {menu.protein}g
                  </td>
                  <td className={`px-4 py-3 text-right ${highlightField === "fat" ? "font-bold text-primary" : ""}`}>
                    {menu.fat}g
                  </td>
                  <td className={`px-4 py-3 text-right ${highlightField === "carb" ? "font-bold text-primary" : ""}`}>
                    {menu.carb}g
                  </td>
                  <td className={`px-4 py-3 text-right ${highlightField === "price" ? "font-bold text-primary" : ""}`}>
                    {menu.price ? formatPrice(menu.price) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FavoriteButton menuId={menu.menuId} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function RelatedLinks({
  store,
  currentSegment,
}: {
  store: string;
  currentSegment: string;
}) {
  const relatedPurposes = allPurposeIds.filter((id) => id !== currentSegment).slice(0, 3);

  return (
    <section className="mt-8 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-4">関連ページ</h2>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${store}`}
          className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
        >
          トップに戻る
        </Link>
        <Link
          href={`/${store}/menu`}
          className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
        >
          全メニュー
        </Link>
        <Link
          href={`/${store}/ranking`}
          className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
        >
          ランキング
        </Link>
        {relatedPurposes.map((purposeId) => (
          <Link
            key={purposeId}
            href={`/${store}/${purposeId}`}
            className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
          >
            {purposes[purposeId].name}
          </Link>
        ))}
      </div>
    </section>
  );
}
