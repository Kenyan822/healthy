import { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description:
    "チェンメシの特定商取引法に基づく表記。販売業者情報、料金、支払方法、解約ポリシーについて。",
  alternates: { canonical: "/legal/tokushoho" },
};

export default function TokushohoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
