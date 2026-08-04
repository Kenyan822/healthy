"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

const CONSENT_KEY = "chenmeshi_cookie_consent";
const DEV_KEY = "chenmeshi_dev";

/**
 * Google AdSense のローダースクリプト（同意後・運営者以外にのみ読み込む）。
 * GA（CookieConsent.tsx）と同じ同意/開発者除外の条件で発火する。
 *
 * NEXT_PUBLIC_ADSENSE_CLIENT（例: ca-pub-1234567890123456）が未設定なら
 * 何も読み込まない no-op。審査通過後にこの環境変数を入れれば全広告枠が有効化される。
 */
export function AdSenseScript() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isDev = localStorage.getItem(DEV_KEY) === "1";
    const consent = localStorage.getItem(CONSENT_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(consent === "granted" && !isDev);
  }, []);

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client || !enabled) return null;

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}
