"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { FavoriteButton } from "@/components/menu/FavoriteButton";

type SortKey = "score" | "calories" | "protein" | "fat" | "carb" | "costCalories" | "costProtein" | "costFat" | "costCarb";
type SortOrder = "asc" | "desc";

interface MenuItem {
  menuId: string;
  menuName: string;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  price: number | null;
  [key: string]: unknown;
}

interface SortableMenuTableProps {
  menus: MenuItem[];
  scoreField: string;
}

// テーブルヘッダのソートボタン（render中の再定義を避けるためトップレベルに定義）
function SortButton({
  label,
  sortKeyValue,
  defaultOrder = "desc",
  activeKey,
  activeOrder,
  onSort,
}: {
  label: string;
  sortKeyValue: SortKey;
  defaultOrder?: SortOrder;
  activeKey: SortKey;
  activeOrder: SortOrder;
  onSort: (key: SortKey, defaultOrder: SortOrder) => void;
}) {
  return (
    <button
      onClick={() => onSort(sortKeyValue, defaultOrder)}
      className={`flex items-center gap-1 hover:text-primary transition-colors ${activeKey === sortKeyValue ? "text-primary font-bold" : ""}`}
    >
      {label}
      {activeKey === sortKeyValue && (
        <span className="text-xs">{activeOrder === "desc" ? "▼" : "▲"}</span>
      )}
    </button>
  );
}

// スコアに応じた色を返す
function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-100";
  if (score >= 60) return "text-lime-600 bg-lime-100";
  if (score >= 40) return "text-yellow-600 bg-yellow-100";
  return "text-orange-600 bg-orange-100";
}

export function SortableMenuTable({ menus, scoreField }: SortableMenuTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedMenus = useMemo(() => {
    return [...menus].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      switch (sortKey) {
        case "score":
          aVal = a[scoreField] as number;
          bVal = b[scoreField] as number;
          break;
        case "calories":
          aVal = a.calories;
          bVal = b.calories;
          break;
        case "protein":
          aVal = a.protein;
          bVal = b.protein;
          break;
        case "fat":
          aVal = a.fat;
          bVal = b.fat;
          break;
        case "carb":
          aVal = a.carb;
          bVal = b.carb;
          break;
        case "costCalories":
          // カロリー/円 (高いほどコスパ良い)
          aVal = a.price ? a.calories / a.price : 0;
          bVal = b.price ? b.calories / b.price : 0;
          break;
        case "costProtein":
          // タンパク質/円 (高いほどコスパ良い)
          aVal = a.price ? a.protein / a.price : 0;
          bVal = b.price ? b.protein / b.price : 0;
          break;
        case "costFat":
          // 脂質/円 (低いほどコスパ良い = 脂質少なくて安い)
          aVal = a.price ? a.fat / a.price : 0;
          bVal = b.price ? b.fat / b.price : 0;
          break;
        case "costCarb":
          // 炭水化物/円 (低いほどコスパ良い = 糖質少なくて安い)
          aVal = a.price ? a.carb / a.price : 0;
          bVal = b.price ? b.carb / b.price : 0;
          break;
        default:
          aVal = 0;
          bVal = 0;
      }

      if (sortOrder === "asc") {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
  }, [menus, sortKey, sortOrder, scoreField]);

  const handleSort = (key: SortKey, defaultOrder: SortOrder = "desc") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder(defaultOrder);
    }
  };

  const sortOptions: { key: SortKey; label: string; desc: string }[] = [
    { key: "score", label: "スコア順", desc: "高い順" },
    { key: "calories", label: "カロリー", desc: "低い順" },
    { key: "protein", label: "P順", desc: "高い順" },
    { key: "fat", label: "F順", desc: "低い順" },
    { key: "carb", label: "C順", desc: "低い順" },
    { key: "costProtein", label: "Pコスパ", desc: "高い順" },
    { key: "costCalories", label: "カロリーコスパ", desc: "高い順" },
  ];

  return (
    <div>
      {/* ソートオプション */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-foreground/60">並び替え:</span>
        {sortOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => handleSort(option.key, option.key === "calories" || option.key === "fat" || option.key === "carb" ? "asc" : "desc")}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              sortKey === option.key
                ? "bg-primary text-white"
                : "bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            }`}
          >
            {option.label}
            {sortKey === option.key && (
              <span className="ml-1">{sortOrder === "desc" ? "↓" : "↑"}</span>
            )}
          </button>
        ))}
      </div>

      {/* テーブル */}
      <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/70">
                  メニュー名
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground/70">
                  <SortButton activeKey={sortKey} activeOrder={sortOrder} onSort={handleSort} label="スコア" sortKeyValue="score" />
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                  <SortButton activeKey={sortKey} activeOrder={sortOrder} onSort={handleSort} label="カロリー" sortKeyValue="calories" defaultOrder="asc" />
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                  <SortButton activeKey={sortKey} activeOrder={sortOrder} onSort={handleSort} label="P" sortKeyValue="protein" />
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                  <SortButton activeKey={sortKey} activeOrder={sortOrder} onSort={handleSort} label="F" sortKeyValue="fat" defaultOrder="asc" />
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                  <SortButton activeKey={sortKey} activeOrder={sortOrder} onSort={handleSort} label="C" sortKeyValue="carb" defaultOrder="asc" />
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                  価格
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground/70">
                  <SortButton activeKey={sortKey} activeOrder={sortOrder} onSort={handleSort} label="P/¥" sortKeyValue="costProtein" />
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-foreground/70 w-12">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedMenus.map((menu, index) => {
                const score = menu[scoreField] as number;
                const costProtein = menu.price ? (menu.protein / menu.price * 100).toFixed(2) : "-";
                return (
                  <tr
                    key={menu.menuId}
                    className="hover:bg-background/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground/50">{index + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/menu/${menu.menuId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {menu.menuName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(score)}`}
                      >
                        {Math.round(score)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {menu.calories}kcal
                    </td>
                    <td className="px-4 py-3 text-right">{menu.protein}g</td>
                    <td className="px-4 py-3 text-right">{menu.fat}g</td>
                    <td className="px-4 py-3 text-right">{menu.carb}g</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {menu.price ? formatPrice(menu.price) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-foreground/60">
                      {costProtein !== "-" ? `${costProtein}g/100円` : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <FavoriteButton menuId={menu.menuId} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
