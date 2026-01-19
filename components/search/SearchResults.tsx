"use client";

import { MenuResultCard } from "./MenuResultCard";
import type { SearchResultMenu } from "@/types/search";

interface SearchResultsProps {
  results: SearchResultMenu[];
  isLoading: boolean;
  totalCount: number;
  showPFCMatch?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function SearchResults({
  results,
  isLoading,
  totalCount,
  showPFCMatch = false,
  onLoadMore,
  hasMore = false,
}: SearchResultsProps) {
  if (isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4" />
        <p className="text-foreground/60">検索中...</p>
      </div>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-foreground/60">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg font-medium">該当するメニューがありません</p>
        <p className="text-sm mt-1">検索条件を変更してお試しください</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-foreground/60">
          {totalCount.toLocaleString()}件のメニューが見つかりました
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <MenuResultCard
            key={result.menu.menuId}
            result={result}
            showPFCMatch={showPFCMatch}
          />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-background border border-border rounded-lg hover:border-primary transition-colors disabled:opacity-50"
          >
            {isLoading ? "読み込み中..." : "もっと見る"}
          </button>
        </div>
      )}
    </div>
  );
}
