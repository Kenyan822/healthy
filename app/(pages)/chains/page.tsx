import { Metadata } from "next";
import Link from "next/link";
import { getAllChains, purposes } from "@/lib/db/queries";
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
            {chains.length}
            社のチェーン店から、目的に合ったヘルシーメニューを探せます。
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* チェーン店グリッド */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chains.map((chain) => (
            <div
              key={chain.chainId}
              className="bg-card-bg rounded-xl border border-border p-6 hover:border-primary transition-colors"
            >
              {/* チェーン店名とカテゴリ */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {chain.chainName}
                  </h2>
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded ${getCategoryColor(chain.category as "teishoku" | "gyudon" | "fastfood" | "cafe" | "famires" | "ramen" | "curry" | "udon" | "other")}`}
                  >
                    {getCategoryLabel(chain.category as "teishoku" | "gyudon" | "fastfood" | "cafe" | "famires" | "ramen" | "curry" | "udon" | "other")}
                  </span>
                </div>
                {chain.storeCount && (
                  <span className="text-sm text-foreground/50">
                    {chain.storeCount.toLocaleString()}店舗
                  </span>
                )}
              </div>

              {/* 説明 */}
              {chain.description && (
                <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                  {chain.description}
                </p>
              )}

              {/* 目的別リンク */}
              <div className="space-y-2">
                <p className="text-xs text-foreground/50 font-medium">
                  目的別で探す
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(purposes).map((purpose) => (
                    <Link
                      key={purpose.id}
                      href={`/${chain.chainId}/${purpose.id}`}
                      className="text-xs px-3 py-1.5 bg-background/50 border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                    >
                      {purpose.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 公式サイトリンク */}
              {chain.officialUrl && (
                <a
                  href={chain.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-xs text-primary hover:underline"
                >
                  公式サイト →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* 目的別クイックリンク */}
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">目的別で探す</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.values(purposes).map((purpose) => (
              <div
                key={purpose.id}
                className="bg-card-bg rounded-xl border border-border p-4"
              >
                <h3 className="font-bold text-foreground mb-2">
                  {purpose.name}
                </h3>
                <p className="text-xs text-foreground/60 mb-3">
                  {purpose.description}
                </p>
                <div className="space-y-1">
                  {chains.slice(0, 3).map((chain) => (
                    <Link
                      key={chain.chainId}
                      href={`/${chain.chainId}/${purpose.id}`}
                      className="block text-xs text-primary hover:underline"
                    >
                      {chain.chainName}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
