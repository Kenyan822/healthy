import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getChainById,
  getAllChains,
  getMenusByChain,
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
  isNutritionFilterId,
} from "@/lib/filters";
import { resolveSegment, generateSegmentMetadata } from "@/lib/segment-resolver";
import { buildMenuItemListJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { formatPrice } from "@/lib/utils";
import { FavoriteButton } from "@/components/menu/FavoriteButton";
import { MealKitPromo } from "@/components/affiliate/MealKitPromo";
import { promoContextForSegment } from "@/lib/affiliate";

type Props = {
  params: Promise<{ store: string; segment: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  const chains = await getAllChains();
  const params: { store: string; segment: string }[] = [];

  for (const chain of chains) {
    const menuCount = await countMenusByChain(chain.chainId);
    if (menuCount < 3) continue;

    // 目的
    for (const purposeId of allPurposeIds) {
      params.push({ store: chain.chainId, segment: purposeId });
    }

    // 栄養フィルター（3件以上のみ）
    for (const filterId of allNutritionFilterIds) {
      const count = await countMenusByNutritionFilter(chain.chainId, filterId);
      if (count >= 3) {
        params.push({ store: chain.chainId, segment: filterId });
      }
    }

    // 価格フィルター（3件以上のみ）
    for (const filterId of allPriceFilterIds) {
      const count = await countMenusByPriceFilter(chain.chainId, filterId);
      if (count >= 3) {
        params.push({ store: chain.chainId, segment: filterId });
      }
    }

    // 時間帯フィルター（3件以上のみ）
    for (const filterId of allTimingFilterIds) {
      const count = await countMenusByTiming(chain.chainId, filterId);
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
  const chain = await getChainById(store);

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
    menuCount = await countMenusByChain(store);
  } else if (resolved.type === "nutrition") {
    menuCount = await countMenusByNutritionFilter(store, segment as keyof typeof nutritionFilters);
  } else if (resolved.type === "price") {
    menuCount = await countMenusByPriceFilter(store, segment as keyof typeof priceFilters);
  } else if (resolved.type === "timing") {
    menuCount = await countMenusByTiming(store, segment as keyof typeof timingFilters);
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
    alternates: { canonical: `/${store}/${segment}` },
  };
}

export default async function StoreSegmentPage({ params }: Props) {
  const { store, segment } = await params;
  const chain = await getChainById(store);

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
async function PurposeView({
  store,
  chain,
  purpose,
}: {
  store: string;
  chain: { chainId: string; chainName: string };
  purpose: (typeof purposes)[keyof typeof purposes];
}) {
  const menus = await getMenusBySeoPurpose(store, purpose.id as keyof typeof purposes);

  return (
    <main className="min-h-screen bg-background">
      <SegmentJsonLd
        store={store}
        chainName={chain.chainName}
        pageName={purpose.name}
        listName={`${chain.chainName}の${purpose.name}メニュー`}
        menus={menus}
      />
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
        {menus.length < 5 && (
          <MealKitPromo
            variant="empty-results"
            context={promoContextForSegment(purpose.id)}
          />
        )}
        <RelatedLinks store={store} currentSegment={purpose.id} />
      </div>
    </main>
  );
}

// ============================
// 栄養フィルタービュー
// ============================
async function NutritionView({
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
  const menus = await getMenusByNutritionFilter(store, filterId);

  return (
    <main className="min-h-screen bg-background">
      <SegmentJsonLd
        store={store}
        chainName={chain.chainName}
        pageName={filter.label}
        listName={`${chain.chainName}の${filter.label}メニュー`}
        menus={menus}
      />
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
        {menus.length < 5 && (
          <MealKitPromo
            variant="empty-results"
            context={promoContextForSegment(filterId)}
          />
        )}
        <RelatedLinks store={store} currentSegment={filterId} />
      </div>
    </main>
  );
}

// ============================
// 価格フィルタービュー
// ============================
async function PriceView({
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
  const menus = await getMenusByPriceFilter(store, filterId);

  return (
    <main className="min-h-screen bg-background">
      <SegmentJsonLd
        store={store}
        chainName={chain.chainName}
        pageName={filter.label}
        listName={`${chain.chainName}の${filter.label}メニュー`}
        menus={menus}
      />
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb store={store} chainName={chain.chainName} current={filter.label} />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {chain.chainName}の{filter.label}メニュー
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            お得なメニューを比較｜{menus.length}件
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <MenuTable menus={menus} highlightField="price" />
        {menus.length < 5 && (
          <MealKitPromo
            variant="empty-results"
            context={promoContextForSegment(filterId)}
          />
        )}
        <RelatedLinks store={store} currentSegment={filterId} />
      </div>
    </main>
  );
}

// ============================
// 時間帯フィルタービュー
// ============================
async function TimingView({
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
  const menus = await getMenusByTiming(store, filterId);

  return (
    <main className="min-h-screen bg-background">
      <SegmentJsonLd
        store={store}
        chainName={chain.chainName}
        pageName={filter.label}
        listName={`${chain.chainName}の${filter.label}`}
        menus={menus}
      />
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
        {menus.length < 5 && (
          <MealKitPromo
            variant="empty-results"
            context={promoContextForSegment(filterId)}
          />
        )}
        <RelatedLinks store={store} currentSegment={filterId} />
      </div>
    </main>
  );
}

// ============================
// 共通コンポーネント
// ============================
function SegmentJsonLd({
  store,
  chainName,
  pageName,
  listName,
  menus,
}: {
  store: string;
  chainName: string;
  pageName: string;
  listName: string;
  menus: MenuSelect[];
}) {
  const itemListJsonLd = buildMenuItemListJsonLd(listName, menus);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "ホーム", path: "" },
    { name: chainName, path: `/${store}` },
    { name: pageName },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}

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
    "high-protein": `${chainName}で高タンパクなメニューをお探しの方へ。タンパク質が豊富なメニューを栄養成分付きでまとめました。`,
    "diet": `${chainName}でカロリーを抑えたメニューをお探しの方へ。カロリーや脂質を抑えたメニューを、PFCバランスで比較できます。`,
    "health": `${chainName}でPFCバランスの良いメニューをお探しの方へ。バランスの取れたメニューを栄養成分付きでまとめました。`,
    "low-carb": `${chainName}で糖質を抑えたメニューをお探しの方へ。炭水化物を抑えたメニューを、糖質量とともに一覧で確認できます。`,
    "low-fat": `${chainName}で脂質を抑えたメニューをお探しの方へ。脂質が控えめなメニューを栄養成分付きでまとめました。`,
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
    "breakfast": `${chainName}の朝食メニューをお探しの方へ。モーニングタイムに注文できるメニューを栄養成分付きでまとめました。`,
    "lunch": `${chainName}のランチメニューをお探しの方へ。ランチにおすすめのメニューを栄養成分付きでまとめました。`,
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
  highlightField?: "protein" | "fat" | "carb" | "calories" | "price";
}) {
  const getHighlightValue = (menu: MenuSelect) => {
    switch (highlightField) {
      case "protein": return { value: `${menu.protein}g`, label: "タンパク質" };
      case "fat": return { value: `${menu.fat}g`, label: "脂質" };
      case "carb": return { value: `${menu.carb}g`, label: "炭水化物" };
      case "calories": return { value: `${menu.calories}kcal`, label: "カロリー" };
      case "price": return { value: menu.price ? formatPrice(menu.price) : "-", label: "価格" };
      default: return null;
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">メニュー一覧（{menus.length}件）</h2>

      {/* モバイル: カードリスト */}
      <div className="md:hidden bg-card-bg rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {menus.map((menu) => {
            const highlight = getHighlightValue(menu);
            return (
              <div key={menu.menuId} className="relative">
                <Link
                  href={`/menu/${menu.menuId}`}
                  className="flex items-start gap-3 p-3 hover:bg-background/30 transition-colors pr-12"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary line-clamp-2">{menu.menuName}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex flex-wrap gap-x-3 gap-y-0 text-xs text-foreground/60">
                        <span>{menu.calories}kcal</span>
                        <span>P{menu.protein}g</span>
                        <span>F{menu.fat}g</span>
                        <span>C{menu.carb}g</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        {highlight && (
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary leading-tight">{highlight.value}</p>
                            <p className="text-[10px] text-foreground/60">{highlight.label}</p>
                          </div>
                        )}
                        <p className="font-bold text-sm w-16 text-right">{menu.price ? formatPrice(menu.price) : "-"}</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <FavoriteButton
                  menuId={menu.menuId}
                  size="sm"
                  className="absolute top-3 right-3"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* デスクトップ: テーブル */}
      <div className="hidden md:block bg-card-bg rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-background/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">メニュー名</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">カロリー</th>
              <th className={`px-4 py-3 text-right text-sm font-medium ${highlightField === "protein" ? "text-primary" : "text-foreground/70"}`}>P</th>
              <th className={`px-4 py-3 text-right text-sm font-medium ${highlightField === "fat" ? "text-primary" : "text-foreground/70"}`}>F</th>
              <th className={`px-4 py-3 text-right text-sm font-medium ${highlightField === "carb" ? "text-primary" : "text-foreground/70"}`}>C</th>
              <th className={`px-4 py-3 text-right text-sm font-medium ${highlightField === "price" ? "text-primary" : "text-foreground/70"}`}>価格</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {menus.map((menu) => (
              <tr key={menu.menuId} className="hover:bg-background/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/menu/${menu.menuId}`} className="text-primary hover:underline font-medium">{menu.menuName}</Link>
                </td>
                <td className="px-4 py-3 text-right">{menu.calories}kcal</td>
                <td className={`px-4 py-3 text-right ${highlightField === "protein" ? "font-bold text-primary" : ""}`}>{menu.protein}g</td>
                <td className={`px-4 py-3 text-right ${highlightField === "fat" ? "font-bold text-primary" : ""}`}>{menu.fat}g</td>
                <td className={`px-4 py-3 text-right ${highlightField === "carb" ? "font-bold text-primary" : ""}`}>{menu.carb}g</td>
                <td className={`px-4 py-3 text-right ${highlightField === "price" ? "font-bold text-primary" : ""}`}>{menu.price ? formatPrice(menu.price) : "-"}</td>
                <td className="px-4 py-3 text-center"><FavoriteButton menuId={menu.menuId} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

async function RelatedLinks({
  store,
  currentSegment,
}: {
  store: string;
  currentSegment: string;
}) {
  // チェーンの全メニューを1クエリで取得し、3件以上該当するフィルターだけリンクする
  // （リンク先がnoindex（3件未満）になる組み合わせを内部リンクから除外するため）
  const menus = await getMenusByChain(store);

  const qualifiedNutrition = allNutritionFilterIds.filter((id) => {
    const filter = nutritionFilters[id];
    const count = menus.filter((menu) =>
      "min" in filter
        ? menu[filter.type] >= filter.min
        : menu[filter.type] <= filter.max
    ).length;
    return count >= 3;
  });

  const qualifiedPrice = allPriceFilterIds.filter((id) => {
    const filter = priceFilters[id];
    const count = menus.filter(
      (menu) => menu.price != null && menu.price <= filter.max
    ).length;
    return count >= 3;
  });

  const qualifiedTiming = allTimingFilterIds.filter((id) => {
    const filter = timingFilters[id];
    const count = menus.filter(
      (menu) => menu.timing === filter.value || menu.timing === "anytime"
    ).length;
    return count >= 3;
  });

  const linkGroups = [
    {
      heading: "目的から探す",
      links: allPurposeIds
        .filter((id) => id !== currentSegment)
        .map((id) => ({ href: `/${store}/${id}`, label: purposes[id].name })),
    },
    {
      heading: "栄養成分から探す",
      links: qualifiedNutrition
        .filter((id) => id !== currentSegment)
        .map((id) => ({
          href: `/${store}/${id}`,
          label: nutritionFilters[id].label,
        })),
    },
    {
      heading: "価格から探す",
      links: qualifiedPrice
        .filter((id) => id !== currentSegment)
        .map((id) => ({
          href: `/${store}/${id}`,
          label: priceFilters[id].label,
        })),
    },
    {
      heading: "時間帯から探す",
      links: qualifiedTiming
        .filter((id) => id !== currentSegment)
        .map((id) => ({
          href: `/${store}/${id}`,
          label: timingFilters[id].label,
        })),
    },
  ].filter((group) => group.links.length > 0);

  return (
    <section className="mt-8 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-4">関連ページ</h2>
      <div className="flex flex-wrap gap-2 mb-6">
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
        {isNutritionFilterId(currentSegment) && (
          <Link
            href={`/nutrition/${currentSegment}`}
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/30 hover:border-primary transition-colors text-sm font-medium"
          >
            全チェーンの{nutritionFilters[currentSegment].label}を見る
          </Link>
        )}
      </div>
      {linkGroups.map((group) => (
        <div key={group.heading} className="mb-4">
          <h3 className="text-sm font-medium text-foreground/60 mb-2">
            {group.heading}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
