"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";

const CONSENT_KEY = "chenmeshi_cookie_consent";
const DEV_KEY = "chenmeshi_dev";

// "loading"=SSR/初回描画（バナー非表示）、null=未回答（バナー表示）
type ConsentStatus = "granted" | "denied" | "loading" | null;

export function CookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("loading");
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // 開発者除外: ?dev=1 を一度開いたデバイスは以後GAを読み込まない(?dev=0で解除)。
    // IPが変動する回線や外出先からのアクセスでも運営者の閲覧を計測から外すための仕組み
    const dev = new URLSearchParams(window.location.search).get("dev");
    if (dev === "1") localStorage.setItem(DEV_KEY, "1");
    if (dev === "0") localStorage.removeItem(DEV_KEY);
    setIsDev(localStorage.getItem(DEV_KEY) === "1");

    // localStorageはSSRで読めないため、マウント後の1回だけ同期する必要がある
    // (初期レンダは"loading"でバナー非表示のまま。再レンダは1回のみ)
    const stored = localStorage.getItem(CONSENT_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsentStatus(
      stored === "granted" || stored === "denied" ? stored : null
    );
  }, []);

  const isVisible = consentStatus === null;

  const handleAcceptAll = () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    setConsentStatus("granted");
  };

  const handleDenyNonEssential = () => {
    localStorage.setItem(CONSENT_KEY, "denied");
    setConsentStatus("denied");
  };

  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      {consentStatus === "granted" && !isDev && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {isVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          role="dialog"
          aria-label="Cookie同意バナー"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-[#433422]/10 p-5 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#433422] mb-1">
                  Cookieの使用について
                </p>
                <p className="text-xs text-[#433422]/70 leading-relaxed">
                  当サイトはサービス改善のためGoogle
                  Analytics（分析Cookie）を使用しています。「すべて許可」を選択するとCookieの使用に同意したものとみなされます。詳細は
                  <Link
                    href="/cookie-policy"
                    className="text-[#90be6d] hover:underline mx-0.5"
                  >
                    クッキーポリシー
                  </Link>
                  をご確認ください。
                </p>
              </div>

              <div className="flex gap-3 shrink-0">
                <button
                  onClick={handleDenyNonEssential}
                  className="px-4 py-2 text-sm text-[#433422]/70 border border-[#433422]/20 rounded-lg hover:bg-[#433422]/5 transition-colors whitespace-nowrap"
                >
                  必要なCookieのみ
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm bg-[#90be6d] text-white rounded-lg hover:bg-[#90be6d]/90 transition-colors whitespace-nowrap font-medium"
                >
                  すべて許可
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
