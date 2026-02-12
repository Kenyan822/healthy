"use client";

// TODO: Plus会員の決済機能が準備できたら、以下のコメントアウトを解除して復元する
// import { useState } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import Link from "next/link";

const freePlan = {
  name: "Free",
  price: "0",
  description: "基本機能を無料で",
  features: [
    { text: "メニュー検索", included: true },
    { text: "栄養成分表示", included: true },
    { text: "チェーン店一覧", included: true },
    { text: "お気に入り（2件まで）", included: true },
  ],
};

const plusPlan = {
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
};

export default function PricingPage() {
  // TODO: Plus会員の決済機能が準備できたら復元
  // const { data: session, status } = useSession();
  // const router = useRouter();
  // const [isLoading, setIsLoading] = useState(false);
  // const userPlan = (session?.user as { plan?: string })?.plan || "free";
  // const isPlus = userPlan === "plus";
  //
  // const handleSubscribe = async () => {
  //   if (!session) {
  //     router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/pricing")}`);
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const response = await fetch("/api/stripe/checkout", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //     const data = await response.json();
  //     if (data.url) {
  //       window.location.href = data.url;
  //     } else {
  //       console.error("No checkout URL returned");
  //     }
  //   } catch (error) {
  //     console.error("Checkout error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            プランを選ぶ
          </h1>
          <p className="text-foreground/60 max-w-xl mx-auto">
            現在は無料プランのみご利用いただけます。
            Plus会員は準備中です。
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="relative rounded-2xl p-6 md:p-8 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700">
            <h3 className="text-xl font-bold mb-2 text-foreground">
              {freePlan.name}
            </h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-foreground">
                ¥{freePlan.price}
              </span>
              <span className="text-sm text-foreground/60">/月</span>
            </div>
            <p className="text-sm mb-6 text-foreground/60">
              {freePlan.description}
            </p>
            <ul className="space-y-3 mb-8">
              {freePlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 text-primary"
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
                  <span className="text-sm text-foreground">{feature.text}</span>
                </li>
              ))}
            </ul>
            <div className="w-full py-3 rounded-xl text-center font-medium bg-stone-100 dark:bg-zinc-700 text-foreground/60">
              現在のプラン
            </div>
          </div>

          {/* Plus Plan - Coming Soon */}
          <div className="relative rounded-2xl p-6 md:p-8 bg-primary/80 text-white border-2 border-primary/60 shadow-lg shadow-primary/10 opacity-75">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-zinc-500 text-white text-xs font-bold rounded-full">
              Coming Soon
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              {plusPlan.name}
            </h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">
                ¥{plusPlan.price}
              </span>
              <span className="text-sm text-white/80">/月</span>
            </div>
            <p className="text-sm mb-6 text-white/80">
              {plusPlan.description}
            </p>
            <ul className="space-y-3 mb-8">
              {plusPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 text-white/60"
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
                  <span className="text-sm text-white/60">{feature.text}</span>
                </li>
              ))}
            </ul>
            <div className="w-full py-3 bg-white/20 rounded-xl text-center text-white/80 font-medium cursor-not-allowed">
              準備中
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
