/**
 * リンガーハットメニューデータ
 * 出典: menudata/ringerhut.pdf (更新日 2026年1月27日)
 * 麺200g/レギュラーサイズを基本として記載
 */

export interface RingerhutMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number | null;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
  allergens: string[];
}

export const ringerhutMenuData: RingerhutMenuItem[] = [
  // 【ちゃんぽん類】
  { menu_id: "ringerhut-chanpon-1", menu_name: "長崎ちゃんぽん", category: "ちゃんぽん", price: 820, calories: 611, protein: 24.3, fat: 24.7, carb: 81.8, sodium: 7400, allergens: [] },
  { menu_id: "ringerhut-chanpon-2", menu_name: "減塩ちゃんぽん", category: "ちゃんぽん", price: 870, calories: 589, protein: 23.1, fat: 22.8, carb: 81.6, sodium: 4600, allergens: [] },
  { menu_id: "ringerhut-chanpon-3", menu_name: "野菜たっぷりちゃんぽん", category: "ちゃんぽん", price: 990, calories: 759, protein: 28.4, fat: 35.7, carb: 92.0, sodium: 9300, allergens: [] },
  { menu_id: "ringerhut-chanpon-4", menu_name: "ピリカラちゃんぽん", category: "ちゃんぽん", price: 920, calories: 656, protein: 25.4, fat: 28.0, carb: 83.4, sodium: 7700, allergens: [] },
  { menu_id: "ringerhut-chanpon-5", menu_name: "みそちゃんぽん", category: "ちゃんぽん", price: 920, calories: 655, protein: 26.6, fat: 25.5, carb: 88.8, sodium: 8000, allergens: [] },
  { menu_id: "ringerhut-chanpon-6", menu_name: "海鮮ちゃんぽん（あさりスープ）", category: "ちゃんぽん", price: 1000, calories: 509, protein: 25.5, fat: 12.5, carb: 82.0, sodium: 7500, allergens: [] },
  { menu_id: "ringerhut-chanpon-7", menu_name: "海鮮ちゃんぽん海老スープ", category: "ちゃんぽん", price: null, calories: 761, protein: 32.4, fat: 36.3, carb: 84.8, sodium: 8300, allergens: [] },
  { menu_id: "ringerhut-chanpon-8", menu_name: "しょうゆちゃんぽん", category: "ちゃんぽん", price: 920, calories: 637, protein: 24.4, fat: 26.1, carb: 85.1, sodium: 7800, allergens: [] },
  { menu_id: "ringerhut-chanpon-9", menu_name: "鶏白湯長崎ちゃんぽん", category: "ちゃんぽん", price: 920, calories: 730, protein: 32.2, fat: 33.1, carb: 84.7, sodium: 6400, allergens: [] },
  { menu_id: "ringerhut-chanpon-10", menu_name: "プレミアム長崎ちゃんぽん", category: "ちゃんぽん", price: 1320, calories: 640, protein: 32.6, fat: 23.9, carb: 82.7, sodium: 8500, allergens: [] },
  { menu_id: "ringerhut-chanpon-11", menu_name: "野菜たっぷり食べるスープ", category: "ちゃんぽん", price: 910, calories: 437, protein: 20.5, fat: 28.3, carb: 30.6, sodium: 7100, allergens: [] },

  // 【季節・地域限定ちゃんぽん】
  { menu_id: "ringerhut-seasonal-1", menu_name: "ゆず香る白菜クリームちゃんぽん（麺200g）", category: "季節限定ちゃんぽん", price: null, calories: 743, protein: 23.3, fat: 38.5, carb: 86.6, sodium: 9100, allergens: [] },
  { menu_id: "ringerhut-seasonal-2", menu_name: "きのこバターみそちゃんぽん（麺200g）", category: "季節限定ちゃんぽん", price: null, calories: 726, protein: 25.2, fat: 33.2, carb: 91.2, sodium: 8100, allergens: [] },
  { menu_id: "ringerhut-seasonal-3", menu_name: "牛もつちゃんぽん（麺200g）", category: "地域限定ちゃんぽん", price: 1390, calories: 883, protein: 32.5, fat: 45.4, carb: 89.9, sodium: 9300, allergens: [] },
  { menu_id: "ringerhut-seasonal-4", menu_name: "九条ネギのあんかけしょうゆちゃんぽん（麺200g）", category: "地域限定ちゃんぽん", price: 1380, calories: 715, protein: 24.5, fat: 22.5, carb: 112.8, sodium: 14200, allergens: [] },

  // 【つけ麺】
  { menu_id: "ringerhut-tsukemen-1", menu_name: "鶏白湯つけ麺炭火焼き鴨肉入り", category: "つけ麺", price: 690, calories: 597, protein: 21.6, fat: 27.4, carb: 71.0, sodium: 6500, allergens: [] },
  { menu_id: "ringerhut-tsukemen-2", menu_name: "和風醤油つけ麺炭火焼き鴨肉入り", category: "つけ麺", price: null, calories: 502, protein: 19.1, fat: 14.3, carb: 79.1, sodium: 7700, allergens: [] },
  { menu_id: "ringerhut-tsukemen-3", menu_name: "海老つけ麺炭火焼き鴨肉入り", category: "つけ麺", price: 790, calories: 638, protein: 22.9, fat: 31.5, carb: 70.5, sodium: 6700, allergens: [] },

  // 【まぜめん・その他麺】
  { menu_id: "ringerhut-other-1", menu_name: "肉味噌釜玉ちゃんぽん", category: "その他麺", price: 690, calories: 839, protein: 28.0, fat: 29.4, carb: 127.3, sodium: 6900, allergens: [] },
  { menu_id: "ringerhut-other-2", menu_name: "肉みそまぜめん", category: "その他麺", price: null, calories: 687, protein: 29.6, fat: 12.3, carb: 123.6, sodium: 5100, allergens: [] },
  { menu_id: "ringerhut-other-3", menu_name: "呉冷麺", category: "地域限定麺", price: 850, calories: 687, protein: 29.6, fat: 12.3, carb: 123.6, sodium: 5100, allergens: [] },
  { menu_id: "ringerhut-other-4", menu_name: "リンガーハットの焼きそば（麺300g）", category: "その他麺", price: 800, calories: 926, protein: 24.2, fat: 41.8, carb: 123.5, sodium: 11600, allergens: [] },
  { menu_id: "ringerhut-other-5", menu_name: "ちゃルボナーラ（麺300g）", category: "その他麺", price: 1200, calories: 805, protein: 36.6, fat: 30.3, carb: 105.2, sodium: 5500, allergens: [] },
  { menu_id: "ringerhut-other-6", menu_name: "広島お好み焼き風皿うどん", category: "地域限定麺", price: 990, calories: 926, protein: 24.2, fat: 41.8, carb: 123.5, sodium: 11600, allergens: [] },

  // 【皿うどん類】
  { menu_id: "ringerhut-saraudon-1", menu_name: "長崎皿うどん", category: "皿うどん", price: 860, calories: 728, protein: 18.2, fat: 37.3, carb: 83.6, sodium: 7500, allergens: [] },
  { menu_id: "ringerhut-saraudon-2", menu_name: "野菜たっぷり皿うどん", category: "皿うどん", price: 990, calories: 773, protein: 19.3, fat: 40.7, carb: 85.1, sodium: 7800, allergens: [] },
  { menu_id: "ringerhut-saraudon-3", menu_name: "ピリカラ皿うどん", category: "皿うどん", price: 960, calories: 773, protein: 19.3, fat: 40.7, carb: 85.1, sodium: 7800, allergens: [] },
  { menu_id: "ringerhut-saraudon-4", menu_name: "焼き太めん皿うどん", category: "皿うどん", price: 980, calories: 774, protein: 23.6, fat: 28.8, carb: 105.5, sodium: 8600, allergens: [] },
  { menu_id: "ringerhut-saraudon-5", menu_name: "やわらか太めん皿うどん", category: "皿うどん", price: 980, calories: 694, protein: 24.0, fat: 19.3, carb: 106.2, sodium: 9500, allergens: [] },
  { menu_id: "ringerhut-saraudon-6", menu_name: "減塩皿うどん", category: "皿うどん", price: 910, calories: 527, protein: 15.3, fat: 27.8, carb: 57.3, sodium: 4500, allergens: [] },
  { menu_id: "ringerhut-saraudon-7", menu_name: "TOお手軽皿うどん", category: "皿うどん", price: null, calories: 658, protein: 16.0, fat: 32.5, carb: 77.6, sodium: 7400, allergens: [] },

  // 【ぎょうざ】
  { menu_id: "ringerhut-gyoza-1", menu_name: "ぎょうざ（3個）", category: "ぎょうざ", price: 600, calories: 119, protein: 2.8, fat: 8.5, carb: 7.9, sodium: 400, allergens: [] },
  { menu_id: "ringerhut-gyoza-2", menu_name: "ぎょうざ（5個）", category: "ぎょうざ", price: 300, calories: 199, protein: 4.7, fat: 14.1, carb: 13.1, sodium: 700, allergens: [] },
  { menu_id: "ringerhut-gyoza-3", menu_name: "ぎょうざ7個定食", category: "ぎょうざ", price: null, calories: 592, protein: 11.8, fat: 20.5, carb: 87.3, sodium: 3000, allergens: [] },
  { menu_id: "ringerhut-gyoza-4", menu_name: "ぎょうざ10個定食", category: "ぎょうざ", price: null, calories: 712, protein: 14.7, fat: 28.9, carb: 95.2, sodium: 3400, allergens: [] },
  { menu_id: "ringerhut-gyoza-5", menu_name: "ぎょうざ15個定食", category: "ぎょうざ", price: null, calories: 911, protein: 19.4, fat: 43.1, carb: 108.3, sodium: 4100, allergens: [] },
  { menu_id: "ringerhut-gyoza-6", menu_name: "ぎょうざ7個定食（半チャーハン）", category: "ぎょうざ", price: 720, calories: 613, protein: 13.7, fat: 31.5, carb: 66.2, sodium: 5000, allergens: [] },
  { menu_id: "ringerhut-gyoza-7", menu_name: "にんにく竹炭ぎょうざ(3個)", category: "ぎょうざ", price: null, calories: 170, protein: 3.2, fat: 13.0, carb: 9.5, sodium: 400, allergens: [] },
  { menu_id: "ringerhut-gyoza-8", menu_name: "にんにく竹炭ぎょうざ(5個)", category: "ぎょうざ", price: null, calories: 284, protein: 5.4, fat: 21.7, carb: 15.9, sodium: 700, allergens: [] },
  { menu_id: "ringerhut-gyoza-9", menu_name: "にんにく竹炭ぎょうざ7個定食", category: "ぎょうざ", price: null, calories: 711, protein: 12.7, fat: 31.0, carb: 91.2, sodium: 3100, allergens: [] },
  { menu_id: "ringerhut-gyoza-10", menu_name: "にんにく竹炭ぎょうざ10個定食", category: "ぎょうざ", price: null, calories: 881, protein: 16.0, fat: 44.0, carb: 100.7, sodium: 3500, allergens: [] },
  { menu_id: "ringerhut-gyoza-11", menu_name: "にんにく竹炭ぎょうざ15個定食", category: "ぎょうざ", price: null, calories: 1164, protein: 21.3, fat: 65.6, carb: 116.5, sodium: 4300, allergens: [] },
  { menu_id: "ringerhut-gyoza-12", menu_name: "にんにく竹炭ぎょうざ7個定食（半チャーハン）", category: "ぎょうざ", price: null, calories: 731, protein: 14.6, fat: 42.0, carb: 70.1, sodium: 5000, allergens: [] },
  { menu_id: "ringerhut-gyoza-13", menu_name: "焼き焼売（1個）", category: "ぎょうざ", price: null, calories: 86, protein: 3.9, fat: 5.4, carb: 5.6, sodium: 500, allergens: [] },

  // 【モグベジコッペ】
  { menu_id: "ringerhut-coppe-1", menu_name: "ちゃんぽんこっぺ", category: "モグベジコッペ", price: null, calories: 318, protein: 7.3, fat: 17.1, carb: 35.0, sodium: 1600, allergens: [] },
  { menu_id: "ringerhut-coppe-2", menu_name: "焼きそばこっぺ", category: "モグベジコッペ", price: null, calories: 352, protein: 8.7, fat: 12.2, carb: 51.6, sodium: 3200, allergens: [] },
  { menu_id: "ringerhut-coppe-3", menu_name: "たまごサラダこっぺ", category: "モグベジコッペ", price: null, calories: 312, protein: 8.2, fat: 19.0, carb: 26.9, sodium: 1300, allergens: [] },
  { menu_id: "ringerhut-coppe-4", menu_name: "あまおうホイップこっぺ", category: "モグベジコッペ", price: null, calories: 194, protein: 4.2, fat: 5.1, carb: 32.7, sodium: 500, allergens: [] },
  { menu_id: "ringerhut-coppe-5", menu_name: "ナポリタン（レギュラー）コッペパン", category: "モグベジコッペ", price: null, calories: 848, protein: 27.6, fat: 20.7, carb: 145.1, sodium: 7000, allergens: [] },
  { menu_id: "ringerhut-coppe-6", menu_name: "コッペパン", category: "モグベジコッペ", price: null, calories: 152, protein: 4.0, fat: 4.0, carb: 25.0, sodium: 500, allergens: [] },

  // 【モグベジパスタ】
  { menu_id: "ringerhut-pasta-1", menu_name: "モグベジパスタカルボナーラ風(麺300g)", category: "モグベジパスタ", price: null, calories: 775, protein: 25.7, fat: 29.5, carb: 110.0, sodium: 5300, allergens: [] },
  { menu_id: "ringerhut-pasta-2", menu_name: "モグベジパスタナポリタン(麺300g)", category: "モグベジパスタ", price: null, calories: 788, protein: 24.3, fat: 24.8, carb: 125.7, sodium: 6200, allergens: [] },
  { menu_id: "ringerhut-pasta-3", menu_name: "モグベジパスタペペロンチーノ(麺300g)", category: "モグベジパスタ", price: null, calories: 682, protein: 21.5, fat: 21.9, carb: 108.1, sodium: 6000, allergens: [] },

  // 【おこさま】
  { menu_id: "ringerhut-kids-1", menu_name: "ちびっこちゃんぽん（単品）", category: "おこさま", price: null, calories: 317, protein: 13.3, fat: 12.9, carb: 41.6, sodium: 4600, allergens: [] },
  { menu_id: "ringerhut-kids-2", menu_name: "ちびっこさらうどん（単品）", category: "おこさま", price: null, calories: 425, protein: 10.2, fat: 19.1, carb: 54.9, sodium: 7000, allergens: [] },
  { menu_id: "ringerhut-kids-3", menu_name: "ちびっこチャーハン（単品）", category: "おこさま", price: null, calories: 462, protein: 9.6, fat: 15.0, carb: 68.4, sodium: 2900, allergens: [] },
  { menu_id: "ringerhut-kids-4", menu_name: "リンガーハットのプリン", category: "おこさま", price: null, calories: 54, protein: 1.2, fat: 2.2, carb: 7.8, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-kids-5", menu_name: "ちびっこちゃんぽん（ぎょうざ+プリン）", category: "おこさま", price: 620, calories: 451, protein: 16.4, fat: 20.7, carb: 54.6, sodium: 5000, allergens: [] },
  { menu_id: "ringerhut-kids-6", menu_name: "ちびっこさらうどん（ぎょうざ+プリン）", category: "おこさま", price: 620, calories: 558, protein: 13.2, fat: 26.9, carb: 67.9, sodium: 7400, allergens: [] },
  { menu_id: "ringerhut-kids-7", menu_name: "ちびっこチャーハン（ぎょうざ+プリン）", category: "おこさま", price: 620, calories: 610, protein: 12.4, fat: 24.5, carb: 82.3, sodium: 3300, allergens: [] },

  // 【ご飯類】
  { menu_id: "ringerhut-rice-1", menu_name: "半チャーハン", category: "ご飯類", price: 350, calories: 323, protein: 6.4, fat: 11.6, carb: 45.7, sodium: 2000, allergens: [] },
  { menu_id: "ringerhut-rice-2", menu_name: "ごはん（100gあたり）", category: "ご飯類", price: null, calories: 156, protein: 2.5, fat: 0.3, carb: 37.1, sodium: 0, allergens: [] },

  // 【デザート】
  { menu_id: "ringerhut-dessert-1", menu_name: "杏仁豆腐", category: "デザート", price: 250, calories: 119, protein: 3.4, fat: 6.0, carb: 12.9, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-dessert-2", menu_name: "ミルクセーキ（小）", category: "デザート", price: 250, calories: 89, protein: 1.9, fat: 3.9, carb: 11.7, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-dessert-3", menu_name: "ソフトクリーム（イオン鳥取）", category: "デザート", price: null, calories: 173, protein: 5.6, fat: 6.3, carb: 23.6, sodium: 200, allergens: [] },
  { menu_id: "ringerhut-dessert-4", menu_name: "アイスクリーム（抹茶）", category: "デザート", price: null, calories: 147, protein: 2.8, fat: 6.7, carb: 18.9, sodium: 200, allergens: [] },
  { menu_id: "ringerhut-dessert-5", menu_name: "アイスクリーム（ラムレーズン）", category: "デザート", price: null, calories: 151, protein: 2.7, fat: 5.7, carb: 22.4, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-dessert-6", menu_name: "アイスクリーム（ストロベリー）", category: "デザート", price: null, calories: 134, protein: 2.3, fat: 5.7, carb: 18.2, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-dessert-7", menu_name: "アイスクリーム（バナナ）", category: "デザート", price: null, calories: 111, protein: 2.0, fat: 3.9, carb: 20.1, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-dessert-8", menu_name: "アイスクリーム（カプチーノ）", category: "デザート", price: null, calories: 136, protein: 2.8, fat: 5.8, carb: 18.1, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-dessert-9", menu_name: "アイスクリーム（紅茶）", category: "デザート", price: null, calories: 136, protein: 2.3, fat: 6.2, carb: 17.9, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-dessert-10", menu_name: "アイスクリーム（チョコ）", category: "デザート", price: null, calories: 144, protein: 3.0, fat: 6.8, carb: 19.3, sodium: 200, allergens: [] },
  { menu_id: "ringerhut-dessert-11", menu_name: "アイスクリーム（バニラ）", category: "デザート", price: null, calories: 148, protein: 2.3, fat: 6.8, carb: 19.5, sodium: 200, allergens: [] },
  { menu_id: "ringerhut-dessert-12", menu_name: "アイスクリーム（ピスタチオ）", category: "デザート", price: null, calories: 167, protein: 3.0, fat: 9.1, carb: 18.2, sodium: 200, allergens: [] },
  { menu_id: "ringerhut-dessert-13", menu_name: "マンゴーシャーベット", category: "デザート", price: null, calories: 81, protein: 0.4, fat: 0.1, carb: 19.6, sodium: 0, allergens: [] },
  { menu_id: "ringerhut-dessert-14", menu_name: "ラ・フランスシャーベット", category: "デザート", price: null, calories: 88, protein: 0.2, fat: 0.2, carb: 21.3, sodium: 0, allergens: [] },

  // 【ドリンク】
  { menu_id: "ringerhut-drink-1", menu_name: "コカコーラ180mlあたり", category: "ドリンク", price: null, calories: 78, protein: 0.0, fat: 0.0, carb: 19.4, sodium: 0, allergens: [] },
  { menu_id: "ringerhut-drink-2", menu_name: "メロンソーダ180mlあたり", category: "ドリンク", price: null, calories: 86, protein: 0.0, fat: 0.0, carb: 21.6, sodium: 0, allergens: [] },
  { menu_id: "ringerhut-drink-3", menu_name: "Qooオレンジ180mlあたり", category: "ドリンク", price: null, calories: 79, protein: 0.2, fat: 0.0, carb: 19.6, sodium: 0, allergens: [] },
  { menu_id: "ringerhut-drink-4", menu_name: "カルピス180mlあたり", category: "ドリンク", price: null, calories: 97, protein: 0.4, fat: 0.2, carb: 23.4, sodium: 0, allergens: [] },
  { menu_id: "ringerhut-drink-5", menu_name: "カルピスソーダ180mlあたり", category: "ドリンク", price: null, calories: 97, protein: 0.4, fat: 0.2, carb: 23.4, sodium: 0, allergens: [] },
  { menu_id: "ringerhut-drink-6", menu_name: "カルピスメロンソーダ180mlあたり", category: "ドリンク", price: null, calories: 92, protein: 0.2, fat: 0.1, carb: 22.5, sodium: 0, allergens: [] },
  { menu_id: "ringerhut-drink-7", menu_name: "爽健美茶180mlあたり", category: "ドリンク", price: null, calories: 1, protein: 0.0, fat: 0.0, carb: 0.4, sodium: 0, allergens: [] },
  { menu_id: "ringerhut-drink-8", menu_name: "アイスコーヒー180mlあたり", category: "ドリンク", price: null, calories: 17, protein: 0.4, fat: 0.0, carb: 3.4, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-drink-9", menu_name: "野菜生活100ml（やさいとりんご）", category: "ドリンク", price: null, calories: 36, protein: 0.3, fat: 0.0, carb: 8.7, sodium: 0, allergens: [] },
  { menu_id: "ringerhut-drink-10", menu_name: "アップルジュース1本あたり", category: "ドリンク", price: null, calories: 32, protein: 0.4, fat: 0.0, carb: 7.7, sodium: 100, allergens: [] },

  // 【定食・リンガーハット食堂限定】
  { menu_id: "ringerhut-teishoku-1", menu_name: "豚丼（レギュラー）", category: "定食", price: null, calories: 935, protein: 20.2, fat: 50.8, carb: 85.7, sodium: 2100, allergens: [] },
  { menu_id: "ringerhut-teishoku-2", menu_name: "豚丼セット", category: "定食", price: null, calories: 936, protein: 26.4, fat: 47.5, carb: 93.9, sodium: 6900, allergens: [] },
  { menu_id: "ringerhut-teishoku-3", menu_name: "牛丼（レギュラー）", category: "定食", price: null, calories: 758, protein: 20.9, fat: 33.5, carb: 85.7, sodium: 2500, allergens: [] },
  { menu_id: "ringerhut-teishoku-4", menu_name: "玉子丼", category: "定食", price: null, calories: 456, protein: 12.7, fat: 6.4, carb: 81.5, sodium: 1400, allergens: [] },
  { menu_id: "ringerhut-teishoku-5", menu_name: "親子丼", category: "定食", price: null, calories: 614, protein: 29.3, fat: 14.7, carb: 83.8, sodium: 2200, allergens: [] },
  { menu_id: "ringerhut-teishoku-6", menu_name: "かつ丼", category: "定食", price: null, calories: 955, protein: 37.7, fat: 43.3, carb: 93.0, sodium: 2800, allergens: [] },
  { menu_id: "ringerhut-teishoku-7", menu_name: "ロースかつ（定食）", category: "定食", price: null, calories: 443, protein: 18.3, fat: 34.3, carb: 11.7, sodium: 300, allergens: [] },
  { menu_id: "ringerhut-teishoku-8", menu_name: "チキンかつ（定食）", category: "定食", price: null, calories: 421, protein: 24.1, fat: 26.5, carb: 19.4, sodium: 400, allergens: [] },
  { menu_id: "ringerhut-teishoku-9", menu_name: "ミックスかつ（定食）", category: "定食", price: null, calories: 511, protein: 15.2, fat: 40.2, carb: 15.6, sodium: 2200, allergens: [] },
  { menu_id: "ringerhut-teishoku-10", menu_name: "豚しょうが焼き（定食）", category: "定食", price: null, calories: 466, protein: 26.1, fat: 30.4, carb: 16.9, sodium: 1600, allergens: [] },
  { menu_id: "ringerhut-teishoku-11", menu_name: "唐揚げ（定食）", category: "定食", price: null, calories: 693, protein: 35.4, fat: 36.2, carb: 49.1, sodium: 5500, allergens: [] },
  { menu_id: "ringerhut-teishoku-12", menu_name: "鶏肉の黒酢あんかけ（定食）", category: "定食", price: null, calories: 853, protein: 23.8, fat: 68.7, carb: 28.6, sodium: 900, allergens: [] },
  { menu_id: "ringerhut-teishoku-13", menu_name: "チーズ入りミンチかつ（定食）", category: "定食", price: null, calories: 636, protein: 24.8, fat: 47.2, carb: 23.8, sodium: 600, allergens: [] },
  { menu_id: "ringerhut-teishoku-14", menu_name: "チキン南蛮（定食）", category: "定食", price: null, calories: 659, protein: 37.9, fat: 37.9, carb: 37.4, sodium: 2700, allergens: [] },
  { menu_id: "ringerhut-teishoku-15", menu_name: "朝定食（鮭）", category: "定食", price: null, calories: 492, protein: 24.6, fat: 8.1, carb: 77.5, sodium: 3800, allergens: [] },
  { menu_id: "ringerhut-teishoku-16", menu_name: "朝定食（鯖）", category: "定食", price: null, calories: 544, protein: 18.4, fat: 13.4, carb: 84.7, sodium: 3200, allergens: [] },
  { menu_id: "ringerhut-teishoku-17", menu_name: "焼きさば（定食）", category: "定食", price: null, calories: 213, protein: 44.3, fat: 13.4, carb: 1.8, sodium: 2000, allergens: [] },
  { menu_id: "ringerhut-teishoku-18", menu_name: "ロースかつカレー", category: "定食", price: null, calories: 921, protein: 25.4, fat: 43.5, carb: 99.8, sodium: 3200, allergens: [] },
  { menu_id: "ringerhut-teishoku-19", menu_name: "唐揚げカレー", category: "定食", price: null, calories: 921, protein: 32.9, fat: 39.3, carb: 99.9, sodium: 4500, allergens: [] },

  // 【トッピング・調味料】
  { menu_id: "ringerhut-topping-1", menu_name: "温度卵トッピング", category: "トッピング", price: null, calories: 78, protein: 6.6, fat: 6.3, carb: 0.1, sodium: 200, allergens: [] },
  { menu_id: "ringerhut-topping-2", menu_name: "オニオンスープ", category: "トッピング", price: null, calories: 6, protein: 0.2, fat: 0.0, carb: 1.2, sodium: 1400, allergens: [] },
  { menu_id: "ringerhut-topping-3", menu_name: "みそ汁（具なし）", category: "トッピング", price: null, calories: 22, protein: 1.3, fat: 0.4, carb: 3.2, sodium: 1600, allergens: [] },
];
