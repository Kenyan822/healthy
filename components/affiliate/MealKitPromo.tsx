import Link from "next/link";
import {
  getActiveOffer,
  type PromoContext,
} from "@/lib/affiliate";

/**
 * 宅配食アフィリエイト枠。
 *
 * 案件・リンク先・文言は lib/affiliate.ts で管理。
 * context によってプラン別LP（減量用/維持用/増量用）に出し分ける。
 * 景表法ステマ規制対応のためPR表記を必ず表示する。
 */

type Variant = "menu-detail" | "empty-results";

export function MealKitPromo({
  variant,
  context = "default",
  calories,
  fat,
}: {
  variant: Variant;
  context?: PromoContext;
  calories?: number;
  fat?: number;
}) {
  const offer = getActiveOffer();
  if (!offer) return null;

  const url = offer.urls[context] ?? offer.urls.default;
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
        href={url}
        rel="nofollow sponsored"
        target="_blank"
        className="inline-block px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {offer.cta}
      </Link>
    </aside>
  );
}
