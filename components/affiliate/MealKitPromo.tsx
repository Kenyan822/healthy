import Link from "next/link";

/**
 * 宅配食アフィリエイト枠。
 *
 * 環境変数にURLが設定された案件だけが表示候補になる
 * （未設定なら何も描画しない = ASP承認前でも安全にデプロイ可能）。
 * 景表法ステマ規制対応のためPR表記を必ず表示する。
 * 文言は事実(商品仕様)のみ。効果効能(痩せる等)は薬機法上書かない。
 */

interface Offer {
  id: string;
  url: string | undefined;
  name: string;
  // 高カロリーメニュー詳細向け(置き換え訴求)
  menuDetailCopy: string;
  // 該当メニューが少ない条件ページ向け
  emptyResultsCopy: string;
  cta: string;
}

const OFFERS: Offer[] = [
  {
    id: "muscledeli",
    url: process.env.NEXT_PUBLIC_AFFILIATE_MUSCLEDELI_URL,
    name: "マッスルデリ",
    menuDetailCopy:
      "外食が続く週は、1食だけ置き換える選択肢も。マッスルデリは管理栄養士が監修した高タンパクの冷凍宅配食で、減量・維持・増量の目的別にPFC設計済みのメニューを選べます。",
    emptyResultsCopy:
      "条件が厳しい日は宅配食で補う手もあります。マッスルデリは高タンパクの冷凍宅配食で、減量・維持・増量の目的別にPFC設計済みのメニューを選べます。",
    cta: "マッスルデリのメニューを見てみる",
  },
  {
    id: "nosh",
    url: process.env.NEXT_PUBLIC_AFFILIATE_NOSH_URL,
    name: "nosh",
    menuDetailCopy:
      "外食が続く週は、1食だけ置き換える選択肢も。冷凍宅配弁当のnosh（ナッシュ）は全メニュー糖質30g以下・塩分2.5g以下で設計されています。",
    emptyResultsCopy:
      "条件が厳しい日は、糖質30g以下・塩分2.5g以下で設計された冷凍宅配弁当のnosh（ナッシュ）で置き換えるのも一手です。",
    cta: "noshのメニューを見てみる",
  },
];

type Variant = "menu-detail" | "empty-results";

export function MealKitPromo({
  variant,
  calories,
  fat,
}: {
  variant: Variant;
  calories?: number;
  fat?: number;
}) {
  const offer = OFFERS.find((o) => o.url);
  if (!offer) return null;

  const isMenuDetail = variant === "menu-detail";
  const lead =
    isMenuDetail && calories != null && fat != null
      ? `このメニューは${calories}kcal・脂質${fat}g。`
      : "";

  return (
    <aside className="my-8 p-5 bg-accent/5 rounded-xl border border-accent/20">
      <p className="text-[10px] text-foreground/50 mb-2">PR</p>
      <h3 className="font-bold text-foreground mb-2">
        {isMenuDetail
          ? "外食が続く週は、1食だけ置き換える選択肢も"
          : "この条件だと外食メニューは少なめです"}
      </h3>
      <p className="text-sm text-foreground/70 leading-relaxed mb-3">
        {lead}
        {isMenuDetail ? offer.menuDetailCopy : offer.emptyResultsCopy}
      </p>
      <Link
        href={offer.url!}
        rel="nofollow sponsored"
        target="_blank"
        className="inline-block px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {offer.cta}
      </Link>
    </aside>
  );
}
