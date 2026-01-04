import Link from "next/link";
import { ChainWithRank } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getCategoryLabel, getCategoryColor } from "@/lib/utils";

interface ChainRankingProps {
  chains: ChainWithRank[];
}

export function ChainRanking({ chains }: ChainRankingProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-300 to-amber-500 text-white shadow-amber-200";
      case 2:
        return "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-slate-200";
      case 3:
        return "bg-gradient-to-br from-orange-400 to-amber-700 text-white shadow-orange-200";
      default:
        return "bg-[#faf9f6] text-[#78716c] font-medium border border-[#e7e5e4]";
    }
  };

  return (
    <Card variant="default" className="h-full border-0 shadow-md">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl font-bold font-rounded text-foreground flex items-center gap-2">
          <span className="text-2xl">👑</span> 人気ランキング
        </h2>
        <Link
          href="/chains"
          className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          すべて見る
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="space-y-4">
        {chains.map((chain) => (
          <Link
            key={chain.chainId}
            href={`/${chain.chainNameEn}/高タンパク`}
            className="block group"
          >
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-orange-50/50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-orange-100">
              {/* Rank Badge */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${getRankStyle(
                  chain.rank
                )} ${chain.rank <= 3 ? "text-white" : ""}`}
              >
                {chain.rank}
              </div>

              {/* Chain Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                    {chain.chainName}
                  </span>
                  <Badge className={`text-[10px] px-1.5 py-0.5 ${getCategoryColor(chain.category)} border-0`}>
                    {getCategoryLabel(chain.category)}
                  </Badge>
                </div>
                {chain.popularMenuName && (
                  <p className="text-sm text-[#78716c] dark:text-[#a8a29e] truncate flex items-center gap-1">
                    <span className="text-xs bg-gray-100 dark:bg-zinc-800 px-1.5 rounded text-gray-500">人気</span>
                    {chain.popularMenuName}
                  </p>
                )}
              </div>

              {/* Protein Info */}
              <div className="flex-shrink-0 text-right">
                <div className="text-lg font-bold font-rounded text-primary">
                  {chain.averageProtein?.toFixed(0)}<span className="text-xs ml-0.5">g</span>
                </div>
                <div className="text-[10px] font-bold text-[#a8a29e]">平均P</div>
              </div>
            </div>
            {/* Divider */}
            {chain.rank !== chains.length && (
              <div className="h-px bg-[#e7e5e4] dark:bg-[#44403c] mx-3 mt-3 opacity-50" />
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
}
