"use client";

import { presets, presetIds } from "@/lib/presets";
import type { PresetId, SortBy } from "@/types/search";
import { LOCATION_FEATURE_ENABLED } from "@/lib/location";

interface PresetButtonsProps {
  selectedPreset: PresetId | null;
  sortBy: SortBy;
  onPresetSelect: (presetId: PresetId) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export function PresetButtons({
  selectedPreset,
  sortBy,
  onPresetSelect,
  onSortByChange,
  onSearch,
  isLoading = false,
}: PresetButtonsProps) {
  const sortOptions: { value: SortBy; label: string; disabled?: boolean }[] = [
    { value: "popularity", label: "人気度" },
    { value: "pfcMatch", label: "おすすめ順" },
    { value: "costPerformance", label: "コスパ" },
    { value: "distance", label: "近い順", disabled: !LOCATION_FEATURE_ENABLED },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground/70 mb-3">
          プリセットを選択
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presetIds.map((presetId) => {
            const preset = presets[presetId];
            const isSelected = selectedPreset === presetId;

            return (
              <button
                key={presetId}
                type="button"
                onClick={() => onPresetSelect(presetId)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:border-primary/50 hover:bg-background/50"
                }`}
              >
                <span className="text-3xl">{preset.icon}</span>
                <span className="font-medium text-foreground">{preset.name}</span>
                <span className="text-xs text-foreground/60">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/70 mb-3">
          表示順
        </label>
        <div className="flex flex-wrap gap-3">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                sortBy === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              } ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name="presetSortBy"
                value={option.value}
                checked={sortBy === option.value}
                onChange={(e) => onSortByChange(e.target.value as SortBy)}
                disabled={option.disabled}
                className="sr-only"
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onSearch}
        disabled={isLoading || !selectedPreset}
        className="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "検索中..." : "検索する"}
      </button>
    </div>
  );
}
