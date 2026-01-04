import Link from "next/link";
import { PopularKeyword } from "@/types";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface PopularKeywordsProps {
  keywords: PopularKeyword[];
}

export function PopularKeywords({ keywords }: PopularKeywordsProps) {
  const getCategoryStyle = (category: PopularKeyword["category"]) => {
    switch (category) {
      case "chain_purpose":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "station":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "nutrient":
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      case "diet_goal":
        return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
    }
  };

  const getTrendIcon = (trend: PopularKeyword["trend"]) => {
    switch (trend) {
      case "up":
        return (
          <span className="flex items-center text-xs font-bold text-red-500 bg-red-50 rounded px-1 ml-1">
            UP
          </span>
        );
      case "down":
        return null;
      default:
        return null;
    }
  };

  return (
    <Card variant="default" className="border-0 shadow-md">
      <h2 className="text-lg font-bold font-rounded text-foreground mb-4 flex items-center gap-2">
        <span className="text-xl">🔍</span> 注目のキーワード
      </h2>

      <div className="flex flex-wrap gap-3">
        {keywords.map((keyword) => (
          <Link
            key={keyword.id}
            href={keyword.relatedUrl}
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:-translate-y-0.5 border shadow-sm",
              getCategoryStyle(keyword.category)
            )}
          >
            <span># {keyword.displayText}</span>
            {getTrendIcon(keyword.trend)}
          </Link>
        ))}
      </div>
    </Card>
  );
}
