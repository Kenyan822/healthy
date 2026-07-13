"use client";

/**
 * アフィリエイトリンクのクリックをGA4カスタムイベントとして送信するリンク。
 * イベント名: affiliate_click
 * パラメータ: offer_id(案件) / promo_context(減量・増量等) / placement(text/banner)
 *
 * gtagは同意済みユーザーにのみ存在する(CookieConsent経由)ため、存在チェックで送る。
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function AffiliateTrackedLink({
  href,
  offerId,
  promoContext,
  placement,
  className,
  children,
}: {
  href: string;
  offerId: string;
  promoContext: string;
  placement: "text" | "banner";
  className?: string;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    window.gtag?.("event", "affiliate_click", {
      offer_id: offerId,
      promo_context: promoContext,
      placement,
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      rel="nofollow sponsored"
      target="_blank"
      className={className}
    >
      {children}
    </a>
  );
}
