import { Metadata } from "next";
import Link from "next/link";
import { getAllChains } from "@/lib/db/queries";
import { getCategoryLabel, getCategoryColor } from "@/lib/utils";
import type { ChainCategory } from "@/types";

export const metadata: Metadata = {
  title: "チェーン店一覧",
  description:
    "大戸屋、やよい軒、すき家、松屋、吉野家など、人気チェーン店のメニューを栄養成分・PFCで比較。",
  alternates: {
    canonical: "/chains",
  },
};

export default async function ChainsPage() {
  const chains = await getAllChains();

  return (
    <main className="min-h-screen bg-background">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            チェーン店一覧
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            {chains.length}社のチェーン店のメニューを栄養成分・価格で比較できます。
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
                className={`inline-block text-xs px-2 py-0.5 rounded ${getCategoryColor(chain.category as ChainCategory)}`}
              >
                {getCategoryLabel(chain.category as ChainCategory)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
