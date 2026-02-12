import Link from "next/link";
import { cn } from "@/lib/utils";

interface Keyword {
  id: string;
  displayText: string;
  url: string;
  purposeId: string;
}

interface PopularKeywordsProps {
  keywords: Keyword[];
}

const purposeStyles: Record<string, string> = {
  "high-protein": "bg-[#dcfce7] text-green-800 hover:bg-[#bbf7d0]",
  "protein-dense": "bg-[#dcfce7] text-green-800 hover:bg-[#bbf7d0]",
  "cost-performance": "bg-[#dcfce7] text-green-800 hover:bg-[#bbf7d0]",
  "low-calorie": "bg-[#ffedd5] text-orange-800 hover:bg-[#fed7aa]",
  "low-carb": "bg-[#f3e8ff] text-purple-800 hover:bg-[#e9d5ff]",
  "low-fat": "bg-[#dbeafe] text-blue-800 hover:bg-[#bfdbfe]",
  "balanced": "bg-[#f5f5f4] text-stone-800 hover:bg-[#e7e5e4]",
};

export function PopularKeywords({ keywords }: PopularKeywordsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold font-rounded text-foreground">
          注目のキーワード
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white/40 dark:bg-zinc-800/40 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
        {keywords.map((keyword) => (
          <Link
            key={keyword.id}
            href={keyword.url}
            className={cn(
              "flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md hover:scale-105 text-center",
              purposeStyles[keyword.purposeId] ?? "bg-[#f5f5f4] text-stone-800 hover:bg-[#e7e5e4]"
            )}
          >
            <span className="mr-1 opacity-50">#</span>
            {keyword.displayText}
          </Link>
        ))}
      </div>
    </div>
  );
}
