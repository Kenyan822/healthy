"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "基本機能を無料で",
    features: [
      { text: "メニュー検索", included: true },
      { text: "栄養成分表示", included: true },
      { text: "チェーン店一覧", included: true },
      { text: "お気に入り（5件まで）", included: true },
      { text: "現在地検索", included: false },
      { text: "高度なフィルター", included: false },
      { text: "広告非表示", included: false },
    ],
    cta: "現在のプラン",
    highlighted: false,
  },
  {
    name: "Plus",
    price: "480",
    description: "すべての機能を制限なく",
    features: [
      { text: "メニュー検索", included: true },
      { text: "栄養成分表示", included: true },
      { text: "チェーン店一覧", included: true },
      { text: "お気に入り無制限", included: true },
      { text: "現在地検索", included: true },
      { text: "高度なフィルター", included: true },
      { text: "広告非表示", included: true },
    ],
    cta: "Plus会員になる",
    highlighted: true,
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const userPlan = (session?.user as { plan?: string })?.plan || "free";
  const isPlus = userPlan === "plus";

  const handleSubscribe = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/pricing")}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            プランを選ぶ
          </h1>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Plus会員になると、すべての機能を制限なく利用できます。
            いつでもキャンセル可能です。
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 md:p-8 ${
                plan.highlighted
                  ? "bg-primary text-white border-2 border-primary shadow-lg shadow-primary/20"
                  : "bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700"
              }`}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full">
                  おすすめ
                </div>
              )}

              {/* Plan Name */}
              <h3
                className={`text-xl font-bold mb-2 ${
                  plan.highlighted ? "text-white" : "text-foreground"
                }`}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span
                  className={`text-4xl font-bold ${
                    plan.highlighted ? "text-white" : "text-foreground"
                  }`}
                >
                  ¥{plan.price}
                </span>
                <span
                  className={`text-sm ${
                    plan.highlighted ? "text-white/80" : "text-foreground/60"
                  }`}
                >
                  /月
                </span>
              </div>

              {/* Description */}
              <p
                className={`text-sm mb-6 ${
                  plan.highlighted ? "text-white/80" : "text-foreground/60"
                }`}
              >
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.highlighted ? "text-white" : "text-primary"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.highlighted ? "text-white/40" : "text-foreground/30"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? plan.highlighted
                            ? "text-white"
                            : "text-foreground"
                          : plan.highlighted
                          ? "text-white/40"
                          : "text-foreground/40"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.name === "Free" ? (
                <div
                  className={`w-full py-3 rounded-xl text-center font-medium ${
                    plan.highlighted
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 dark:bg-zinc-700 text-foreground/60"
                  }`}
                >
                  {isPlus ? "以前のプラン" : plan.cta}
                </div>
              ) : isPlus ? (
                <div className="w-full py-3 bg-white/20 rounded-xl text-center text-white font-medium">
                  現在のプラン
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading || status === "loading"}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-white hover:bg-primary-dark"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      処理中...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            よくある質問
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-stone-200 dark:border-zinc-700">
              <h3 className="font-bold text-foreground mb-2">
                いつでもキャンセルできますか？
              </h3>
              <p className="text-sm text-foreground/60">
                はい、いつでもキャンセル可能です。キャンセル後も契約期間終了まではPlus会員の特典をご利用いただけます。
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-stone-200 dark:border-zinc-700">
              <h3 className="font-bold text-foreground mb-2">
                支払い方法は何がありますか？
              </h3>
              <p className="text-sm text-foreground/60">
                クレジットカード（Visa, Mastercard, American
                Express）でお支払いいただけます。
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-stone-200 dark:border-zinc-700">
              <h3 className="font-bold text-foreground mb-2">
                無料プランに戻せますか？
              </h3>
              <p className="text-sm text-foreground/60">
                サブスクリプションをキャンセルすると、契約期間終了後に自動的に無料プランに戻ります。お気に入りは5件まで保持されます。
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            トップに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
