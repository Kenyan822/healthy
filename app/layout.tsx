import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Maru_Gothic } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "チェーン店ヘルシー検索 | PFCで見つける健康メニュー",
  description:
    "チェーン店のメニューをPFC（タンパク質・脂質・炭水化物）で検索。高タンパク、低糖質、ダイエット向けメニューが簡単に見つかります。",
  keywords: [
    "チェーン店",
    "PFC",
    "高タンパク",
    "低糖質",
    "ダイエット",
    "ヘルシー",
    "栄養成分",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${notoSansJP.variable} ${zenMaruGothic.variable} antialiased bg-[#faf9f6] text-[#433422]`}
      >
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
