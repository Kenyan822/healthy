"use client";

import type { SortBy } from "@/types/search";

interface PresetButtonsProps {
  sortBy: SortBy;
  onSortByChange: (sortBy: SortBy) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

// 6項目の栄養指標
const nutritionIndicators: { value: SortBy; label: string; description: string }[] = [
  { value: "proteinDensity", label: "タンパク質密度", description: "100kcalあたりのタンパク質量で並び替え" },
  { value: "calories", label: "カロリー", description: "カロリーが低い順に並び替え" },
  { value: "carbRatio", label: "糖質比率", description: "糖質比率が低い順に並び替え" },
  { value: "fatRatio", label: "脂質比率", description: "脂質比率が低い順に並び替え" },
  { value: "pfcBalance", label: "PFCバランス", description: "理想的なPFC比率に近い順に並び替え" },
  { value: "costPerformance", label: "タンパク質コスパ", description: "タンパク質1gあたりの価格が安い順に並び替え" },
];

export function PresetButtons({
  sortBy,
  onSortByChange,
  onSearch,
  isLoading = false,
}: PresetButtonsProps) {
  const selectedIndicator = nutritionIndicators.find((i) => i.value === sortBy);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground/70 mb-3">
          目的を選択
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortBy)}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        >
          {nutritionIndicators.map((indicator) => (
            <option key={indicator.value} value={indicator.value}>
              {indicator.label}
            </option>
          ))}
        </select>
        {selectedIndicator && (
          <p className="mt-2 text-sm text-foreground/60">
            {selectedIndicator.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onSearch}
        disabled={isLoading}
        className="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "検索中..." : "検索する"}
      </button>
    </div>
  );
}
