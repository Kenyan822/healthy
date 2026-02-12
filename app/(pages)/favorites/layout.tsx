import { Metadata } from "next";

export const metadata: Metadata = {
  title: "お気に入り",
  robots: { index: false, follow: true },
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
