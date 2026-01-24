"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PFCSearchForm } from "@/components/search/PFCSearchForm";
import { PresetButtons } from "@/components/search/PresetButtons";
import { SearchResults } from "@/components/search/SearchResults";
import type { SortBy, SearchResultMenu, SearchResponse } from "@/types/search";

type SearchTab = "custom" | "preset";

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 初期値をURLパラメータから取得
  const initialTab: SearchTab = searchParams.get("sortBy") && !searchParams.get("protein") ? "preset" : "custom";
  const initialSortBy = (searchParams.get("sortBy") as SortBy) || "proteinDensity";
  const initialProtein = parseFloat(searchParams.get("protein") || "") || undefined;
  const initialFat = parseFloat(searchParams.get("fat") || "") || undefined;
  const initialCarb = parseFloat(searchParams.get("carb") || "") || undefined;

  // State
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);
  const [presetSortBy, setPresetSortBy] = useState<SortBy>(initialSortBy);
  const [results, setResults] = useState<SearchResultMenu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState<URLSearchParams | null>(null);

  // 検索実行
  const executeSearch = useCallback(async (params: URLSearchParams, append = false) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/menus/search?${params.toString()}`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        if (append) {
          setResults((prev) => [...prev, ...data.data]);
        } else {
          setResults(data.data);
        }
        setTotalCount(data.pagination.totalCount);
        setHasMore(data.pagination.page < data.pagination.totalPages);
        setCurrentSearchParams(params);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // カスタムPFC検索
  const handlePFCSearch = useCallback(
    (params: { protein: number; fat: number; carb: number; sortBy: SortBy }) => {
      const urlParams = new URLSearchParams();
      if (params.protein > 0) urlParams.set("protein", params.protein.toString());
      if (params.fat > 0) urlParams.set("fat", params.fat.toString());
      if (params.carb > 0) urlParams.set("carb", params.carb.toString());
      urlParams.set("sortBy", params.sortBy);
      urlParams.set("page", "1");
      urlParams.set("limit", "20");

      // URLを更新
      router.push(`/search?${urlParams.toString()}`, { scroll: false });

      setCurrentPage(1);
      executeSearch(urlParams);
    },
    [router, executeSearch]
  );

  // 目的別検索（ソート順で全メニュー検索）
  const handlePresetSearch = useCallback(() => {
    const urlParams = new URLSearchParams();
    urlParams.set("sortBy", presetSortBy);
    urlParams.set("page", "1");
    urlParams.set("limit", "20");

    // URLを更新
    router.push(`/search?${urlParams.toString()}`, { scroll: false });

    setCurrentPage(1);
    executeSearch(urlParams);
  }, [presetSortBy, router, executeSearch]);

  // もっと見る
  const handleLoadMore = useCallback(() => {
    if (!currentSearchParams || isLoading) return;

    const newPage = currentPage + 1;
    const params = new URLSearchParams(currentSearchParams);
    params.set("page", newPage.toString());

    setCurrentPage(newPage);
    executeSearch(params, true);
  }, [currentSearchParams, currentPage, isLoading, executeSearch]);

  // 初回読み込み時に検索実行
  useEffect(() => {
    const hasSearchParams =
      searchParams.has("sortBy") ||
      searchParams.has("protein") ||
      searchParams.has("fat") ||
      searchParams.has("carb");

    if (hasSearchParams) {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.has("page")) params.set("page", "1");
      if (!params.has("limit")) params.set("limit", "20");

      executeSearch(params);
    }
  }, [searchParams, executeSearch]);

  return (
    <main className="min-h-screen bg-background">
      {/* ヘッダーセクション */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <nav className="mb-4 text-sm">
            <ol className="flex items-center gap-2 text-foreground/60">
              <li>
                <Link href="/" className="hover:text-primary">
                  ホーム
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">検索</li>
            </ol>
          </nav>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            メニュー検索
          </h1>
          <p className="text-foreground/70">
            PFC値や目的から、あなたにぴったりのメニューを探しましょう
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 検索フォーム */}
        <div className="bg-card-bg rounded-2xl border border-border p-6 mb-8">
          {/* タブ */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === "custom"
                  ? "text-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              カスタムPFC
              {activeTab === "custom" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("preset")}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === "preset"
                  ? "text-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              目的で探す
              {activeTab === "preset" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* タブコンテンツ */}
          {activeTab === "custom" ? (
            <PFCSearchForm
              onSearch={handlePFCSearch}
              isLoading={isLoading}
              initialValues={{
                protein: initialProtein,
                fat: initialFat,
                carb: initialCarb,
                sortBy: initialTab === "custom" ? initialSortBy : "proteinDensity",
              }}
            />
          ) : (
            <PresetButtons
              sortBy={presetSortBy}
              onSortByChange={setPresetSortBy}
              onSearch={handlePresetSearch}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* 検索結果 */}
        {(results.length > 0 || isLoading) && (
          <section>
            <h2 className="text-xl font-bold mb-4">検索結果</h2>
            <SearchResults
              results={results}
              isLoading={isLoading}
              totalCount={totalCount}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </section>
        )}

        {/* 初期状態の案内 */}
        {results.length === 0 && !isLoading && !currentSearchParams && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg text-foreground/70 mb-2">
              上の検索フォームからメニューを検索できます
            </p>
            <p className="text-sm text-foreground/50">
              PFC値を入力するか、目的を選択してください
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

// Suspense境界でラップ
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12 text-center">
            <div className="animate-pulse">読み込み中...</div>
          </div>
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
