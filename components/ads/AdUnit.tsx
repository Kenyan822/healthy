"use client";

import { useEffect, useRef } from "react";

/**
 * AdSense のレスポンシブ広告枠。
 *
 * NEXT_PUBLIC_ADSENSE_CLIENT が未設定なら何も描画しない no-op。
 * 各ページには slot（AdSense管理画面で発行する広告ユニットID）を渡す。
 * ラベル「広告」を上に出し、コンテンツと誤認させない（AdSenseポリシー遵守）。
 */
export function AdUnit({
  slot,
  className = "",
}: {
  slot: string;
  className?: string;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || pushed.current) return;
    // 同意後にスクリプトが読み込まれていれば push、まだなら黙って諦める
    // (次回描画時に再試行される)
    try {
      // @ts-expect-error adsbygoogle はスクリプトが注入するグローバル
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // スクリプト未ロード時は無視
    }
  }, [client]);

  if (!client) return null;

  return (
    <div className={`my-6 ${className}`}>
      <p className="text-[10px] text-foreground/40 mb-1 text-center">広告</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
