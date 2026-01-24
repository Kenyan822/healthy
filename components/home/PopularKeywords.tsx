import Link from "next/link";
import { PopularKeyword } from "@/types";
import { cn } from "@/lib/utils";

interface PopularKeywordsProps {
  keywords: PopularKeyword[];
}

export function PopularKeywords({ keywords }: PopularKeywordsProps) {
  const getCategoryStyle = (category: PopularKeyword["category"], index: number) => {
    // ランダムな傾きと色味で付箋感を出す
    const rotations = ["rotate-1", "-rotate-1", "rotate-2", "-rotate-2", "rotate-0"];
    const rotation = rotations[index % rotations.length];
    
    switch (category) {
      case "chain_purpose":
        return `bg-[#dcfce7] text-green-800 hover:bg-[#bbf7d0] ${rotation}`;
      case "station":
        return `bg-[#dbeafe] text-blue-800 hover:bg-[#bfdbfe] ${rotation}`;
      case "nutrient":
        return `bg-[#f3e8ff] text-purple-800 hover:bg-[#e9d5ff] ${rotation}`;
      case "diet_goal":
        return `bg-[#ffedd5] text-orange-800 hover:bg-[#fed7aa] ${rotation}`;
      default:
        return `bg-[#f5f5f4] text-stone-800 hover:bg-[#e7e5e4] ${rotation}`;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold font-rounded text-foreground">
          注目のキーワード
        </h2>
        <span className="text-xs text-zinc-400 font-medium bg-white px-2 py-1 rounded-full border border-zinc-100">Hot!</span>
      </div>

      <div className="flex flex-wrap gap-3 p-4 bg-white/40 dark:bg-zinc-800/40 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
        {keywords.map((keyword, index) => (
          <Link
            key={keyword.id}
            href={keyword.relatedUrl}
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md hover:scale-105",
              getCategoryStyle(keyword.category, index)
            )}
          >
            <span className="mr-1 opacity-50">#</span>
            {keyword.displayText}
            {keyword.trend === "up" && (
              <span className="ml-1.5 flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </Link>
        ))}
        
        {/* ダミーの空タグでバランスを取る（あえて崩す） */}
        <div className="w-4" />
      </div>
    </div>
  );
}
