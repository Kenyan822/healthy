import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PFC検索｜栄養成分でメニューを探す",
  description:
    "タンパク質・脂質・炭水化物の目標値を入力して、チェーン店のメニューを検索。高タンパク・低糖質など、目的に合ったメニューが見つかります。",
  alternates: { canonical: "/search" },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
