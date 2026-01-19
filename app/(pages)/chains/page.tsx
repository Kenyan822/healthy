import { Metadata } from "next";
import Link from "next/link";
import { getAllChains } from "@/lib/db/queries";
import { getCategoryLabel, getCategoryColor } from "@/lib/utils";

export const metadata: Metadata = {
  title: "チェーン店一覧 | ヘルシー検索",
  description:
    "大戸屋、やよい軒、すき家、松屋、吉野家など、人気チェーン店のヘルシーメニューを栄養成分・PFCバランスで比較検索。",
};

export default function ChainsPage() {
  const chains = getAllChains();

  return (
    <main className="min-h-screen bg-background">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            チェーン店一覧
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            {chains.length}社のチェーン店から、目的に合ったヘルシーメニューを探せます。
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* チェーン店グリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {chains.map((chain) => (
            <Link
              key={chain.chainId}
              href={`/${chain.chainId}`}
              className="bg-card-bg rounded-xl border border-border p-4 hover:border-primary hover:shadow-md transition-all group"
            >
              <h2 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {chain.chainName}
              </h2>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded ${getCategoryColor(chain.category as "teishoku" | "gyudon" | "fastfood" | "cafe" | "famires" | "ramen" | "curry" | "udon" | "other")}`}
              >
                {getCategoryLabel(chain.category as "teishoku" | "gyudon" | "fastfood" | "cafe" | "famires" | "ramen" | "curry" | "udon" | "other")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
