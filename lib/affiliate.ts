/**
 * アフィリエイト案件の設定。
 *
 * URLはページに表示される公開情報のためコードで管理する
 * （環境変数 NEXT_PUBLIC_AFFILIATE_DISABLED=1 で全枠を一括停止できる）。
 * 文言は商品仕様の事実のみ（薬機法: 効果効能・ビフォーアフター表現は書かない）。
 *
 * A8素材の選定根拠（2026-07-13時点の管理画面実測）:
 * - マッスルデリ default = 素材002（テキスト、EPC 35.98で全素材トップ）
 * - lean/maintain/gain = 素材004/005/006（プラン別LP。文脈一致でCVR向上を狙う）
 */

export type PromoContext = "diet" | "bulk" | "balanced" | "default";

interface Offer {
  id: string;
  name: string;
  banner?: {
    href: string;
    img: string;
    beacon: string;
    width: number;
    height: number;
  };
  // 文脈別のリンク先（なければdefaultにフォールバック）
  urls: Partial<Record<PromoContext, string>> & { default: string };
  menuDetailCopy: string;
  emptyResultsCopy: string;
  cta: string;
}

export const OFFERS: Offer[] = [
  {
    id: "muscledeli",
    name: "マッスルデリ",
    urls: {
      default: "https://px.a8.net/svt/ejp?a8mat=4B7ZH2+9IXPZU+4CPY+5YRHE",
      diet: "https://px.a8.net/svt/ejp?a8mat=4B7ZH2+9IXPZU+4CPY+5Z6WY", // LEAN(減量用)LP
      balanced: "https://px.a8.net/svt/ejp?a8mat=4B7ZH2+9IXPZU+4CPY+5ZEMQ", // MAINTAIN(維持用)LP
      bulk: "https://px.a8.net/svt/ejp?a8mat=4B7ZH2+9IXPZU+4CPY+5ZMCI", // GAIN(増量用)LP
    },
    // サイドバー用バナー(素材020: 300×250、EPC 23.65)。impビーコンはA8の表示計測用
    banner: {
      href: "https://px.a8.net/svt/ejp?a8mat=4B7ZH2+9IXPZU+4CPY+62MDD",
      img: "https://www27.a8.net/svt/bgt?aid=260713046576&wid=002&eno=01&mid=s00000020311001020000&mc=1",
      beacon: "https://www15.a8.net/0.gif?a8mat=4B7ZH2+9IXPZU+4CPY+62MDD",
      width: 300,
      height: 250,
    },
    menuDetailCopy:
      "外食が続く週は、1食だけ置き換える選択肢も。マッスルデリは管理栄養士が監修した高タンパクの冷凍宅配食で、減量用・維持用・増量用からPFC設計済みのメニューを選べます。",
    emptyResultsCopy:
      "条件が厳しい日は宅配食で補う手もあります。マッスルデリは管理栄養士が監修した高タンパクの冷凍宅配食で、減量用・維持用・増量用からPFC設計済みのメニューを選べます。",
    cta: "マッスルデリのメニューを見てみる",
  },
  // nosh承認後にここへ追加（単価がマッスルデリより高ければ先頭に置く）
];

export function getActiveOffer(): Offer | null {
  if (process.env.NEXT_PUBLIC_AFFILIATE_DISABLED === "1") return null;
  return OFFERS[0] ?? null;
}

/**
 * 条件ページのセグメントIDから宅配食LPの文脈を決める。
 * 減量系フィルタ → 減量用LP、タンパク質系 → 増量用LP。
 */
export function promoContextForSegment(segmentId: string): PromoContext {
  if (
    segmentId.startsWith("low-") ||
    segmentId.startsWith("fat-under") ||
    segmentId.startsWith("carb-under") ||
    segmentId.startsWith("calorie-under")
  ) {
    return "diet";
  }
  if (
    segmentId.startsWith("high-protein") ||
    segmentId.startsWith("protein-") ||
    segmentId === "cost-performance"
  ) {
    return "bulk";
  }
  if (segmentId === "balanced") return "balanced";
  return "default";
}
