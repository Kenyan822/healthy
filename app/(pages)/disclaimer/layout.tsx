import { Metadata } from "next";

export const metadata: Metadata = {
  title: "免責事項",
  description:
    "チェンメシの免責事項。栄養成分・価格情報の正確性、医療的アドバイスの範囲外であること、外部リンクに関する責任範囲について説明します。",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
