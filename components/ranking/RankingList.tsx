"use client";

import { useState } from "react";

const ITEMS_PER_PAGE = 50;

interface RankingListProps {
  children: React.ReactNode[];
  totalCount: number;
}

export function RankingList({ children, totalCount }: RankingListProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visibleItems = children.slice(0, visibleCount);
  const hasMore = visibleCount < totalCount;

  return (
    <>
      <div className="divide-y divide-border">
        {visibleItems}
      </div>
      {hasMore && (
        <div className="p-4 text-center border-t border-border">
          <button
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="px-8 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg transition-colors"
          >
            もっと見る
          </button>
        </div>
      )}
    </>
  );
}
