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
    steak: "ステーキ",
    other: "その他",
  };
  return labels[category] || category;
}

/**
 * チェーン別カテゴリ表示順（メインメニューから順）
 */
const CHAIN_CATEGORY_ORDER: Record<string, string[]> = {
  sukiya: [
    "牛丼", "牛皿", "牛丼ライト", "こだわり丼", "うな丼",
    "カレー", "定食", "一品", "朝食", "お子様メニュー",
  ],
  matsuya: [
    "牛めし", "定食", "丼", "カレー", "セットメニュー",
    "ロカボ", "朝食", "サイドメニュー",
  ],
  yoshinoya: [
    "丼", "皿", "定食", "W定食", "カレー", "ハヤシ",
    "から揚げ", "鍋", "朝定食", "サイドメニュー",
    "お子様", "C&C限定", "地域限定",
  ],
  ootoya: [
    "定食", "おかず", "黒酢あん", "麺セット",
    "ごはんのおとも", "小鉢", "キッズメニュー",
    "デザート", "朝食", "期間限定",
  ],
  yayoiken: [
    "定食", "丼・麵・お子様メニュー", "朝食", "サイドメニュー",
  ],
  nakau: [
    "親子丼", "カツ丼", "鶏から丼", "牛すき丼", "カルビ丼",
    "海鮮丼", "天丼", "カレー", "定食", "おかず",
    "温うどん", "冷うどん", "温そば", "冷そば", "雑炊",
    "朝食", "ドリンク", "お子様メニュー",
  ],
  cocoichi: [
    "カレーメニュー", "その他のカレーメニュー", "トッピング",
    "サラダ", "ドリンク・スープ", "デザート", "お子さまメニュー",
    "特定原材料を使用していないカレー", "期間限定", "数量限定", "その他",
  ],
  mos: [
    "ハンバーガー", "新とびきりバーガー", "モスライスバーガー",
    "ホットドッグ", "サイドメニュー", "スープ",
    "朝モス", "夜モス", "デザート", "ドリンク",
    "ソース・ドレッシング", "モスバーガー&カフェ",
    "ワイワイセット", "低アレルゲンセット",
    "店舗限定", "金曜日限定",
  ],
  marugame: [
    "うどん", "天ぷら", "ご飯もの", "薬味・トッピング", "うどーなつ",
  ],
  subway: [
    "サンドイッチ", "サラダ", "パン", "サイドメニュー",
    "トッピング", "ドレッシング・ソース",
    "モーニングメニュー", "キッズメニュー",
    "スイーツサンド", "クッキー", "焼き菓子",
    "ホットドリンク", "コールドドリンク", "フロートドリンク",
    "期間限定メニュー",
  ],
  ikinari: [
    "メインメニュー", "メインメニュー（フードコート）",
    "サイドメニュー", "トッピング", "キャンペーンメニュー",
    "ドリンク", "調味料",
  ],
  ringerhut: [
    "ちゃんぽん", "季節限定ちゃんぽん", "地域限定ちゃんぽん",
    "皿うどん", "つけ麺", "その他麺", "地域限定麺",
    "定食", "ぎょうざ", "ご飯類",
    "モグベジコッペ", "モグベジパスタ", "トッピング",
    "デザート", "ドリンク", "おこさま",
  ],
};

/**
 * 汎用カテゴリ優先度（キーワードベース）
 * チェーン固有の定義がない場合のフォールバック
 */
function getGenericCategoryPriority(category: string): number {
  if (/メインメニュー|牛丼|牛めし|ハンバーガー|サンドイッチ|ちゃんぽん/.test(category)) return 0;
  if (/定食|丼|皿|カレー|弁当/.test(category)) return 10;
  if (/から揚げ|鍋|ハヤシ|グリル|ステーキ|ピザ|ドリア|煮込み|麺|パスタ|うどん|そば/.test(category)) return 20;
  if (/サイドメニュー|一品|おかず|サラダ|天ぷら|惣菜|ホットスナック|ぎょうざ/.test(category)) return 30;
  if (/トッピング|薬味/.test(category)) return 35;
  if (/セット/.test(category)) return 37;
  if (/朝食|朝定食|モーニング|朝モス/.test(category)) return 40;
  if (/お子様|キッズ|おこさま/.test(category)) return 50;
  if (/ドリンク|スープ/.test(category)) return 60;
  if (/デザート|スイーツ/.test(category)) return 70;
  if (/ソース|ドレッシング|調味料/.test(category)) return 80;
  if (/期間限定|数量限定|季節限定|地域限定|店舗限定|キャンペーン|限定/.test(category)) return 90;
  if (/その他/.test(category)) return 100;
  return 50;
}

/**
 * チェーンのカテゴリをメインメニュー優先で並び替え
 */
export function sortCategoriesByPriority(chainId: string, categories: string[]): string[] {
  const chainOrder = CHAIN_CATEGORY_ORDER[chainId];

  if (chainOrder) {
    return [...categories].sort((a, b) => {
      const indexA = chainOrder.indexOf(a);
      const indexB = chainOrder.indexOf(b);
      const priorityA = indexA >= 0 ? indexA : chainOrder.length + getGenericCategoryPriority(a);
      const priorityB = indexB >= 0 ? indexB : chainOrder.length + getGenericCategoryPriority(b);
      return priorityA - priorityB;
    });
  }

  return [...categories].sort((a, b) => {
    return getGenericCategoryPriority(a) - getGenericCategoryPriority(b);
  });
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
    steak: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };
  return colors[category] || colors.other;
}
