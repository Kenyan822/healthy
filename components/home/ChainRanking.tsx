import Link from "next/link";
import { ChainWithRank } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getCategoryLabel, getCategoryColor } from "@/lib/utils";

interface ChainRankingProps {
  chains: ChainWithRank[];
}

export function ChainRanking({ chains }: ChainRankingProps) {
  // 1位から3位までと、それ以降を分ける
  const topThree = chains.slice(0, 3);
  const others = chains.slice(3);

  return (
    <Card variant="default" className="h-full border-0 shadow-none bg-transparent">
      <div className="flex items-center justify-between mb-6 px-1 relative z-10">
        <h2 className="text-xl font-bold font-rounded text-foreground flex items-center gap-2">
          <span className="text-2xl transform rotate-[-10deg]">👑</span> 
          <span className="relative">
            人気ランキング
            <span className="absolute -bottom-1 left-0 w-full h-2 bg-yellow-200/50 -z-10 skew-x-12" />
          </span>
        </h2>
        <Link
          href="/chains"
          className="text-xs font-bold text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 border-b border-dashed border-zinc-300 hover:border-primary"
        >
          すべて見る
        </Link>
      </div>

      <div className="space-y-6">
        {/* Top 3 Ranking */}
        <div className="space-y-3">
          {topThree.map((chain, index) => {
            const isFirst = index === 0;
            return (
              <Link
                key={chain.chainId}
                href={`/chains/${chain.chainId}`}
                className="block group relative"
              >
                <div 
                  className={`
                    relative p-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1
                    ${isFirst 
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg shadow-yellow-100/50" 
                      : "bg-white border border-zinc-100 shadow-sm"
                    }
                    dark:bg-zinc-800 dark:border-zinc-700 dark:shadow-none
                  `}
                >
                  {/* Rank Badge - 手書き風の配置 */}
                  <div className={`
                    absolute -top-3 -left-2 w-10 h-10 flex items-center justify-center font-bold text-lg text-white rounded-full shadow-md transform -rotate-12 group-hover:rotate-0 transition-transform
                    ${index === 0 ? "bg-yellow-500 ring-4 ring-yellow-100 dark:ring-yellow-900" : ""}
                    ${index === 1 ? "bg-zinc-400 ring-4 ring-zinc-100 dark:ring-zinc-700" : ""}
                    ${index === 2 ? "bg-orange-700 ring-4 ring-orange-100 dark:ring-orange-900" : ""}
                  `}
                  >
                    {chain.rank}
                  </div>

                  {/* Crown for 1st place */}
                  {isFirst && (
                    <div className="absolute -top-6 right-4 text-4xl animate-bounce duration-[2000ms]">
                      👑
                    </div>
                  )}

                  <div className="ml-6 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${isFirst ? "text-xl" : "text-lg"} text-foreground group-hover:text-primary transition-colors`}>
                          {chain.chainName}
                        </span>
                        <Badge className={`text-[10px] px-1.5 py-0.5 rounded-md ${getCategoryColor(chain.category)} border-0`}>
                          {getCategoryLabel(chain.category)}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-500 font-medium">
                        平均タンパク質: <span className="text-foreground font-bold text-base ml-1">{chain.averageProtein?.toFixed(1)}g</span>
                      </div>
                    </div>
                    <div className="text-2xl opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      👉
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 4th and below - Simple List */}
        <div className="bg-white/50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-700/50">
          {others.map((chain) => (
            <Link
              key={chain.chainId}
              href={`/chains/${chain.chainId}`}
              className="flex items-center gap-3 py-3 border-b border-dashed border-zinc-200 dark:border-zinc-700 last:border-0 hover:bg-white/80 dark:hover:bg-zinc-700/50 -mx-2 px-2 rounded-lg transition-colors group"
            >
              <span className="font-bold text-zinc-400 w-6 text-center group-hover:text-primary">{chain.rank}</span>
              <span className="flex-1 font-medium text-foreground text-sm">{chain.chainName}</span>
              <span className="text-xs font-bold text-zinc-400">{chain.averageProtein?.toFixed(0)}g</span>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}
