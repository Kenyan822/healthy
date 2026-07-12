import Link from "next/link";

/**
 * 宅配弁当（nosh等）のアフィリエイト枠。
 *
 * NEXT_PUBLIC_AFFILIATE_NOSH_URL が未設定の間は何も描画しない
 * （ASP提携承認後にVercelの環境変数を設定するだけで有効化できる）。
 * 景表法ステマ規制対応のためPR表記を必ず表示する。
 */

const AFFILIATE_URL = process.env.NEXT_PUBLIC_AFFILIATE_NOSH_URL;

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
  if (!AFFILIATE_URL) return null;

  const isHighCalorie = variant === "menu-detail";

  return (
    <aside className="my-8 p-5 bg-accent/5 rounded-xl border border-accent/20">
      <p className="text-[10px] text-foreground/50 mb-2">PR</p>
      {isHighCalorie ? (
        <>
          <h3 className="font-bold text-foreground mb-2">
            外食が続く週は、1食だけ置き換える選択肢も
          </h3>
          <p className="text-sm text-foreground/70 leading-relaxed mb-3">
            {calories != null && fat != null
              ? `このメニューは${calories}kcal・脂質${fat}g。`
              : ""}
            冷凍宅配弁当のnosh（ナッシュ）は全メニュー糖質30g以下・塩分2.5g以下で設計されていて、
            「今日は外食、明日は置き換え」の使い分けがしやすい選択肢です。
          </p>
        </>
      ) : (
        <>
          <h3 className="font-bold text-foreground mb-2">
            この条件だと外食メニューは少なめです
          </h3>
          <p className="text-sm text-foreground/70 leading-relaxed mb-3">
            条件が厳しい日は、糖質30g以下・塩分2.5g以下で設計された冷凍宅配弁当の
            nosh（ナッシュ）で置き換えるのも一手です。
          </p>
        </>
      )}
      <Link
        href={AFFILIATE_URL}
        rel="nofollow sponsored"
        target="_blank"
        className="inline-block px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        noshのメニューを見てみる
      </Link>
    </aside>
  );
}
