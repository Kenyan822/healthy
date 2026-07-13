import { getActiveOffer } from "@/lib/affiliate";

/**
 * サイドバー用のバナー広告（デスクトップのみ表示）。
 * モバイル(訪問の約9割)ではテキスト型のMealKitPromoが主役のため出さない。
 * A8の素材画像・計測ビーコンをそのまま使う（規約上、素材の改変は不可）。
 */
export function SidebarBanner() {
  const offer = getActiveOffer();
  if (!offer?.banner) return null;

  const { href, img, beacon, width, height } = offer.banner;

  return (
    <div className="hidden lg:block bg-card-bg rounded-xl border border-border p-4">
      <p className="text-[10px] text-foreground/50 mb-2">PR</p>
      <a
        href={href}
        rel="nofollow sponsored"
        target="_blank"
        className="block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- A8提供素材のためnext/image最適化の対象外 */}
        <img
          src={img}
          width={width}
          height={height}
          alt={`${offer.name}の広告`}
          className="w-full h-auto rounded-lg"
          loading="lazy"
        />
      </a>
      {/* eslint-disable-next-line @next/next/no-img-element -- A8のインプレッション計測ビーコン */}
      <img src={beacon} width={1} height={1} alt="" className="absolute" />
    </div>
  );
}
