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
  { menu_id: "ringerhut-chanpon-1", menu_name: "長崎ちゃんぽん", category: "ちゃんぽん", price: 860, calories: 611, protein: 24.3, fat: 24.7, carb: 81.8, sodium: 7400, allergens: [] },
  { menu_id: "ringerhut-chanpon-2", menu_name: "減塩ちゃんぽん", category: "ちゃんぽん", price: 910, calories: 589, protein: 23.1, fat: 22.8, carb: 81.6, sodium: 4600, allergens: [] },
  { menu_id: "ringerhut-chanpon-3", menu_name: "野菜たっぷりちゃんぽん", category: "ちゃんぽん", price: 1030, calories: 759, protein: 28.4, fat: 35.7, carb: 92.0, sodium: 9300, allergens: [] },
  { menu_id: "ringerhut-chanpon-4", menu_name: "ピリカラちゃんぽん", category: "ちゃんぽん", price: 960, calories: 656, protein: 25.4, fat: 28.0, carb: 83.4, sodium: 7700, allergens: [] },
  { menu_id: "ringerhut-chanpon-5", menu_name: "みそちゃんぽん", category: "ちゃんぽん", price: 960, calories: 655, protein: 26.6, fat: 25.5, carb: 88.8, sodium: 8000, allergens: [] },
  { menu_id: "ringerhut-chanpon-6", menu_name: "海鮮ちゃんぽん（あさりスープ）", category: "ちゃんぽん", price: 1000, calories: 509, protein: 25.5, fat: 12.5, carb: 82.0, sodium: 7500, allergens: [] },
  { menu_id: "ringerhut-chanpon-8", menu_name: "しょうゆちゃんぽん", category: "ちゃんぽん", price: 960, calories: 637, protein: 24.4, fat: 26.1, carb: 85.1, sodium: 7800, allergens: [] },
  { menu_id: "ringerhut-chanpon-9", menu_name: "鶏白湯長崎ちゃんぽん", category: "ちゃんぽん", price: 960, calories: 730, protein: 32.2, fat: 33.1, carb: 84.7, sodium: 6400, allergens: [] },
  { menu_id: "ringerhut-chanpon-10", menu_name: "プレミアム長崎ちゃんぽん", category: "ちゃんぽん", price: 1360, calories: 640, protein: 32.6, fat: 23.9, carb: 82.7, sodium: 8500, allergens: [] },
  { menu_id: "ringerhut-chanpon-11", menu_name: "野菜たっぷり食べるスープ", category: "ちゃんぽん", price: 950, calories: 437, protein: 20.5, fat: 28.3, carb: 30.6, sodium: 7100, allergens: [] },

  // 【季節・地域限定ちゃんぽん】
  { menu_id: "ringerhut-seasonal-3", menu_name: "牛もつちゃんぽん（麺200g）", category: "地域限定ちゃんぽん", price: 1390, calories: 883, protein: 32.5, fat: 45.4, carb: 89.9, sodium: 9300, allergens: [] },
  { menu_id: "ringerhut-seasonal-4", menu_name: "九条ネギのあんかけしょうゆちゃんぽん（麺200g）", category: "地域限定ちゃんぽん", price: 1380, calories: 715, protein: 24.5, fat: 22.5, carb: 112.8, sodium: 14200, allergens: [] },

  // 【つけ麺】
  { menu_id: "ringerhut-tsukemen-1", menu_name: "鶏白湯つけ麺炭火焼き鴨肉入り", category: "つけ麺", price: 690, calories: 597, protein: 21.6, fat: 27.4, carb: 71.0, sodium: 6500, allergens: [] },
  { menu_id: "ringerhut-tsukemen-2", menu_name: "和風醤油つけ麺炭火焼き鴨肉入り", category: "つけ麺", price: 690, calories: 502, protein: 19.1, fat: 14.3, carb: 79.1, sodium: 7700, allergens: [] },
  { menu_id: "ringerhut-tsukemen-3", menu_name: "海老つけ麺炭火焼き鴨肉入り", category: "つけ麺", price: 790, calories: 638, protein: 22.9, fat: 31.5, carb: 70.5, sodium: 6700, allergens: [] },

  // 【まぜめん・その他麺】
  { menu_id: "ringerhut-other-1", menu_name: "肉味噌釜玉ちゃんぽん", category: "その他麺", price: 690, calories: 839, protein: 28.0, fat: 29.4, carb: 127.3, sodium: 6900, allergens: [] },
  { menu_id: "ringerhut-other-2", menu_name: "肉みそまぜめん", category: "その他麺", price: 690, calories: 687, protein: 29.6, fat: 12.3, carb: 123.6, sodium: 5100, allergens: [] },
  { menu_id: "ringerhut-other-3", menu_name: "呉冷麺", category: "地域限定麺", price: 890, calories: 687, protein: 29.6, fat: 12.3, carb: 123.6, sodium: 5100, allergens: [] },
  { menu_id: "ringerhut-other-4", menu_name: "リンガーハットの焼きそば（麺300g）", category: "その他麺", price: 840, calories: 926, protein: 24.2, fat: 41.8, carb: 123.5, sodium: 11600, allergens: [] },
  { menu_id: "ringerhut-other-5", menu_name: "ちゃルボナーラ（麺300g）", category: "その他麺", price: 1200, calories: 805, protein: 36.6, fat: 30.3, carb: 105.2, sodium: 5500, allergens: [] },
  { menu_id: "ringerhut-other-6", menu_name: "広島お好み焼き風皿うどん", category: "地域限定麺", price: 1030, calories: 926, protein: 24.2, fat: 41.8, carb: 123.5, sodium: 11600, allergens: [] },

  // 【皿うどん類】
  { menu_id: "ringerhut-saraudon-1", menu_name: "長崎皿うどん", category: "皿うどん", price: 900, calories: 728, protein: 18.2, fat: 37.3, carb: 83.6, sodium: 7500, allergens: [] },
  { menu_id: "ringerhut-saraudon-2", menu_name: "野菜たっぷり皿うどん", category: "皿うどん", price: 1030, calories: 773, protein: 19.3, fat: 40.7, carb: 85.1, sodium: 7800, allergens: [] },
  { menu_id: "ringerhut-saraudon-3", menu_name: "ピリカラ皿うどん", category: "皿うどん", price: 1000, calories: 773, protein: 19.3, fat: 40.7, carb: 85.1, sodium: 7800, allergens: [] },
  { menu_id: "ringerhut-saraudon-4", menu_name: "焼き太めん皿うどん", category: "皿うどん", price: 1020, calories: 774, protein: 23.6, fat: 28.8, carb: 105.5, sodium: 8600, allergens: [] },
  { menu_id: "ringerhut-saraudon-5", menu_name: "やわらか太めん皿うどん", category: "皿うどん", price: 1020, calories: 694, protein: 24.0, fat: 19.3, carb: 106.2, sodium: 9500, allergens: [] },
  { menu_id: "ringerhut-saraudon-6", menu_name: "減塩皿うどん", category: "皿うどん", price: 950, calories: 527, protein: 15.3, fat: 27.8, carb: 57.3, sodium: 4500, allergens: [] },

  // 【ぎょうざ】
  { menu_id: "ringerhut-gyoza-1", menu_name: "ぎょうざ（3個）", category: "ぎょうざ", price: 200, calories: 119, protein: 2.8, fat: 8.5, carb: 7.9, sodium: 400, allergens: [] },
  { menu_id: "ringerhut-gyoza-2", menu_name: "ぎょうざ（5個）", category: "ぎょうざ", price: 310, calories: 199, protein: 4.7, fat: 14.1, carb: 13.1, sodium: 700, allergens: [] },
  { menu_id: "ringerhut-gyoza-3", menu_name: "ぎょうざ7個定食", category: "ぎょうざ", price: 590, calories: 592, protein: 11.8, fat: 20.5, carb: 87.3, sodium: 3000, allergens: [] },
  { menu_id: "ringerhut-gyoza-4", menu_name: "ぎょうざ10個定食", category: "ぎょうざ", price: 780, calories: 712, protein: 14.7, fat: 28.9, carb: 95.2, sodium: 3400, allergens: [] },
  { menu_id: "ringerhut-gyoza-5", menu_name: "ぎょうざ15個定食", category: "ぎょうざ", price: 1080, calories: 911, protein: 19.4, fat: 43.1, carb: 108.3, sodium: 4100, allergens: [] },
  { menu_id: "ringerhut-gyoza-6", menu_name: "ぎょうざ7個定食（半チャーハン）", category: "ぎょうざ", price: 730, calories: 613, protein: 13.7, fat: 31.5, carb: 66.2, sodium: 5000, allergens: [] },

  // 【モグベジコッペ】
  { menu_id: "ringerhut-coppe-1", menu_name: "ちゃんぽんこっぺ", category: "モグベジコッペ", price: 300, calories: 318, protein: 7.3, fat: 17.1, carb: 35.0, sodium: 1600, allergens: [] },
  { menu_id: "ringerhut-coppe-2", menu_name: "焼きそばこっぺ", category: "モグベジコッペ", price: 350, calories: 352, protein: 8.7, fat: 12.2, carb: 51.6, sodium: 3200, allergens: [] },
  { menu_id: "ringerhut-coppe-3", menu_name: "たまごサラダこっぺ", category: "モグベジコッペ", price: 300, calories: 312, protein: 8.2, fat: 19.0, carb: 26.9, sodium: 1300, allergens: [] },
  { menu_id: "ringerhut-coppe-4", menu_name: "あまおうホイップこっぺ", category: "モグベジコッペ", price: 300, calories: 194, protein: 4.2, fat: 5.1, carb: 32.7, sodium: 500, allergens: [] },

  // 【おこさま】
  { menu_id: "ringerhut-kids-5", menu_name: "ちびっこちゃんぽん（ぎょうざ+プリン）", category: "おこさま", price: 590, calories: 451, protein: 16.4, fat: 20.7, carb: 54.6, sodium: 5000, allergens: [] },
  { menu_id: "ringerhut-kids-6", menu_name: "ちびっこさらうどん（ぎょうざ+プリン）", category: "おこさま", price: 590, calories: 558, protein: 13.2, fat: 26.9, carb: 67.9, sodium: 7400, allergens: [] },
  { menu_id: "ringerhut-kids-7", menu_name: "ちびっこチャーハン（ぎょうざ+プリン）", category: "おこさま", price: 590, calories: 610, protein: 12.4, fat: 24.5, carb: 82.3, sodium: 3300, allergens: [] },

  // 【ご飯類】
  { menu_id: "ringerhut-rice-1", menu_name: "半チャーハン", category: "ご飯類", price: 350, calories: 323, protein: 6.4, fat: 11.6, carb: 45.7, sodium: 2000, allergens: [] },
  { menu_id: "ringerhut-rice-2", menu_name: "ごはん（100gあたり）", category: "ご飯類", price: 220, calories: 156, protein: 2.5, fat: 0.3, carb: 37.1, sodium: 0, allergens: [] },

  // 【デザート】
  { menu_id: "ringerhut-dessert-1", menu_name: "杏仁豆腐", category: "デザート", price: 250, calories: 119, protein: 3.4, fat: 6.0, carb: 12.9, sodium: 100, allergens: [] },
  { menu_id: "ringerhut-dessert-2", menu_name: "ミルクセーキ（小）", category: "デザート", price: 250, calories: 89, protein: 1.9, fat: 3.9, carb: 11.7, sodium: 100, allergens: [] },
];
