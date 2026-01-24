"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { presets } from "@/lib/presets";
import { formatPrice } from "@/lib/utils";
import type { PresetId, SortBy, SearchResultMenu, SearchResponse } from "@/types/search";

interface ChainSearchBoxProps {
  chainId: string;
  chainName: string;
}

export function ChainSearchBox({ chainId, chainName }: ChainSearchBoxProps) {
  const [selectedPresets, setSelectedPresets] = useState<PresetId[]>([]);
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carb, setCarb] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("proteinDensity");
  const [results, setResults] = useState<SearchResultMenu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const executeSearch = useCallback(async (params: URLSearchParams) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      // チェーン店IDでフィルタリング
      params.set("chainId", chainId);
      const response = await fetch(`/api/menus/search?${params.toString()}`);
      const data: SearchResponse = await response.json();
      if (data.success) {
        // チェーン店でフィルタ（API側で対応していない場合のフォールバック）
        const filteredData = data.data.filter(r => r.chain.chainId === chainId);
        setResults(filteredData.slice(0, 6));
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chainId]);

  const handlePresetClick = (presetId: PresetId) => {
    const newSelectedPresets = selectedPresets.includes(presetId)
      ? selectedPresets.filter(id => id !== presetId)
      : [...selectedPresets, presetId];

    setSelectedPresets(newSelectedPresets);

    if (newSelectedPresets.length > 0) {
      const params = new URLSearchParams();
      params.set("preset", newSelectedPresets.join(","));
      params.set("sortBy", sortBy);
      params.set("limit", "20");
      executeSearch(params);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  };

  const handlePFCSearch = () => {
    const p = parseFloat(protein) || 0;
    const f = parseFloat(fat) || 0;
    const c = parseFloat(carb) || 0;
    if (p === 0 && f === 0 && c === 0) return;

    setSelectedPresets([]);
    const params = new URLSearchParams();
    if (p > 0) params.set("protein", p.toString());
    if (f > 0) params.set("fat", f.toString());
    if (c > 0) params.set("carb", c.toString());
    params.set("sortBy", sortBy);
    params.set("limit", "20");
    executeSearch(params);
  };

  const presetCards = [
    { id: "high_protein" as PresetId, icon: "🍗", label: "高タンパク", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-800 dark:text-orange-200", hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30" },
    { id: "low_fat" as PresetId, icon: "🥗", label: "低脂質", bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200", hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/30" },
    { id: "low_carb" as PresetId, icon: "⚖️", label: "低糖質", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-800 dark:text-blue-200", hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30" },
    { id: "balanced" as PresetId, icon: "🎯", label: "バランス", bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-800 dark:text-green-200", hover: "hover:bg-green-100 dark:hover:bg-green-900/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 border border-zinc-100 dark:border-zinc-700">
        <h3 className="text-lg font-bold text-foreground mb-4">
          {chainName}のメニューを検索
        </h3>

        {/* Preset Buttons */}
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground/70 mb-2">プリセットで絞り込み</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {presetCards.map((preset) => {
              const isSelected = selectedPresets.includes(preset.id);
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-sm ${preset.bg} ${preset.hover} ${
                    isSelected
                      ? "border-primary shadow-md"
                      : "border-transparent"
                  }`}
                >
                  <span className="text-lg">{preset.icon}</span>
                  <span className={`font-bold ${preset.text}`}>{preset.label}</span>
                  {isSelected && (
                    <span className="ml-auto text-primary text-xs">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs text-zinc-400">または</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* PFC Input */}
        <div>
          <p className="text-sm font-medium text-foreground/70 mb-2">PFC値で検索</p>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-foreground/50 mb-1">タンパク質</label>
                <div className="relative">
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-foreground/50 mb-1">脂質</label>
                <div className="relative">
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="20"
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-foreground/50 mb-1">炭水化物</label>
                <div className="relative">
                  <input
                    type="number"
                    value={carb}
                    onChange={(e) => setCarb(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
                </div>
              </div>
            </div>
            <button
              onClick={handlePFCSearch}
              disabled={isLoading || (!protein && !fat && !carb)}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? "検索中..." : "検索"}
            </button>
          </div>
        </div>

        {/* Sort Options - 一時的にコメントアウト
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-foreground/50">並び替え:</span>
            {[
              { value: "proteinDensity", label: "タンパク質密度" },
              { value: "protein", label: "タンパク質量" },
              { value: "costPerformance", label: "コスパ" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value as SortBy);
                  // 既に検索済みの場合は再検索
                  if (selectedPresets.length > 0) {
                    const params = new URLSearchParams();
                    params.set("preset", selectedPresets.join(","));
                    params.set("sortBy", option.value);
                    params.set("limit", "20");
                    executeSearch(params);
                  } else if (protein || fat || carb) {
                    const params = new URLSearchParams();
                    if (protein) params.set("protein", protein);
                    if (fat) params.set("fat", fat);
                    if (carb) params.set("carb", carb);
                    params.set("sortBy", option.value);
                    params.set("limit", "20");
                    executeSearch(params);
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  sortBy === option.value
                    ? "bg-primary text-white"
                    : "bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        */}
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">
              {selectedPresets.length > 0
                ? selectedPresets.map(id => presets[id].name).join(" + ")
                : "PFC検索"}の結果（{results.length}件）
            </h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result, index) => (
              <Link
                key={result.menu.menuId}
                href={`/menu/${result.menu.menuId}`}
                className={`bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 hover:border-primary transition-all hover:shadow-md relative ${
                  index < 3 ? "ring-2 ring-offset-2 " + (
                    index === 0 ? "ring-yellow-400" :
                    index === 1 ? "ring-gray-400" :
                    "ring-amber-600"
                  ) : ""
                }`}
              >
                {index < 3 && (
                  <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                    index === 0 ? "bg-yellow-400 text-yellow-900" :
                    index === 1 ? "bg-gray-300 text-gray-700" :
                    "bg-amber-600 text-white"
                  }`}>
                    {index + 1}
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground truncate">{result.menu.menuName}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground/60">
                  <span>P {result.menu.protein}g</span>
                  <span>F {result.menu.fat}g</span>
                  <span>C {result.menu.carb}g</span>
                  <span className="ml-auto">{result.menu.calories}kcal</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className="flex items-center gap-3 text-foreground/50">
                    {result.costPerProtein && (
                      <span>{result.costPerProtein}円/gP</span>
                    )}
                    {result.proteinDensity !== undefined && (
                      <span>{result.proteinDensity.toFixed(1)}g/100kcal</span>
                    )}
                  </div>
                  {result.menu.price && (
                    <span className="font-bold text-primary">{formatPrice(result.menu.price)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <div className="text-center py-8 text-foreground/60">
          該当するメニューがありません
        </div>
      )}
    </div>
  );
}
