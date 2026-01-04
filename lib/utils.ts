import { ChainCategory } from "@/types";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ja-JP").format(num);
}

export function formatPrice(price: number): string {
  return `¥${formatNumber(price)}`;
}

export function getCategoryLabel(category: ChainCategory): string {
  const labels: Record<ChainCategory, string> = {
    teishoku: "定食",
    gyudon: "牛丼",
    fastfood: "ファストフード",
    cafe: "カフェ",
    famires: "ファミレス",
    ramen: "ラーメン",
    curry: "カレー",
    udon: "うどん・そば",
    other: "その他",
  };
  return labels[category] || category;
}

export function getCategoryColor(category: ChainCategory): string {
  const colors: Record<ChainCategory, string> = {
    teishoku: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    gyudon: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    fastfood: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    cafe: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    famires: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ramen: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    curry: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    udon: "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-200",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };
  return colors[category] || colors.other;
}
