import { Metadata } from "next";

export const metadata: Metadata = {
  title: "クッキーポリシー",
  description:
    "チェンメシのクッキー（Cookie）ポリシー。使用するCookieの種類、目的、管理方法について説明します。",
  alternates: { canonical: "/cookie-policy" },
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
