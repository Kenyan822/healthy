"use client";

import { useState } from "react";
import type { SortBy } from "@/types/search";
import { LOCATION_FEATURE_ENABLED } from "@/lib/location";

interface PFCSearchFormProps {
  onSearch: (params: {
    protein: number;
    fat: number;
    carb: number;
    sortBy: SortBy;
  }) => void;
  isLoading?: boolean;
  initialValues?: {
    protein?: number;
    fat?: number;
    carb?: number;
    sortBy?: SortBy;
  };
}

export function PFCSearchForm({
  onSearch,
  isLoading = false,
  initialValues,
}: PFCSearchFormProps) {
  const [protein, setProtein] = useState(initialValues?.protein?.toString() || "");
  const [fat, setFat] = useState(initialValues?.fat?.toString() || "");
  const [carb, setCarb] = useState(initialValues?.carb?.toString() || "");
  const [sortBy, setSortBy] = useState<SortBy>(initialValues?.sortBy || "pfcMatch");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const p = parseFloat(protein) || 0;
    const f = parseFloat(fat) || 0;
    const c = parseFloat(carb) || 0;

    if (p === 0 && f === 0 && c === 0) {
      return;
    }

    onSearch({ protein: p, fat: f, carb: c, sortBy });
  };

  const sortOptions: { value: SortBy; label: string; disabled?: boolean }[] = [
    { value: "pfcMatch", label: "PFCマッチ度" },
    { value: "popularity", label: "人気度" },
    { value: "costPerformance", label: "コスパ" },
    { value: "distance", label: "近い順", disabled: !LOCATION_FEATURE_ENABLED },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            タンパク質 (P)
          </label>
          <div className="relative">
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="30"
              min="0"
              max="200"
              step="0.1"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50">
              g
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            脂質 (F)
          </label>
          <div className="relative">
            <input
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="20"
              min="0"
              max="200"
              step="0.1"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50">
              g
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            炭水化物 (C)
          </label>
          <div className="relative">
            <input
              type="number"
              value={carb}
              onChange={(e) => setCarb(e.target.value)}
              placeholder="50"
              min="0"
              max="500"
              step="0.1"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50">
              g
            </span>
          </div>
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
                name="sortBy"
                value={option.value}
                checked={sortBy === option.value}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                disabled={option.disabled}
                className="sr-only"
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || (protein === "" && fat === "" && carb === "")}
        className="w-full py-3 px-6 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "検索中..." : "検索する"}
      </button>
    </form>
  );
}
