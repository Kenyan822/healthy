import { Metadata } from "next";

export const metadata: Metadata = {
  title: "料金プラン",
  description:
    "チェンメシの料金プラン。無料プランとPlusプランの機能比較。お気に入り無制限・現在地検索など便利な機能をご利用いただけます。",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
