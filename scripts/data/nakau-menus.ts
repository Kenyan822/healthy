/**
 * なか卯メニューデータ
 * 出典: menudata/nakau.pdf (更新日 2026年1月21日)
 * 並盛/並サイズを基本として記載
 */

export interface NakauMenuItem {
  menu_id: string;
  menu_name: string;
  price: number | null;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
  allergens: string[];
}

export const nakauMenuData: NakauMenuItem[] = [
  // 【親子丼】
  { menu_id: "nakau-oyako-1", menu_name: "親子丼（並盛）", price: 450, category: "親子丼", calories: 673, protein: 31.5, fat: 17.8, carb: 99.7, sodium: 3100, allergens: [] },
  { menu_id: "nakau-oyako-2", menu_name: "とろたま親子丼（並盛）", price: 540, category: "親子丼", calories: 767, protein: 39.2, fat: 24.2, carb: 99.9, sodium: 3300, allergens: [] },
  { menu_id: "nakau-oyako-3", menu_name: "チーズ親子丼（並盛）", price: 610, category: "親子丼", calories: 795, protein: 39.7, fat: 27.4, carb: 100.7, sodium: 3700, allergens: [] },
  { menu_id: "nakau-oyako-4", menu_name: "とろたまねぎラー親子丼（並盛）", price: 700, category: "親子丼", calories: 972, protein: 41.7, fat: 41.3, carb: 110.7, sodium: 4000, allergens: [] },
  { menu_id: "nakau-oyako-5", menu_name: "ねぎラー親子丼（並盛）", price: 610, category: "親子丼", calories: 878, protein: 34.0, fat: 34.8, carb: 110.5, sodium: 3800, allergens: [] },
  { menu_id: "nakau-oyako-6", menu_name: "牛あいがけ親子丼（並盛）", price: 780, category: "親子丼", calories: 851, protein: 38.0, fat: 29.4, carb: 109.9, sodium: 5000, allergens: [] },
  { menu_id: "nakau-oyako-7", menu_name: "絶品親子重（並盛）", price: 690, category: "親子丼", calories: 705, protein: 32.3, fat: 19.7, carb: 103.1, sodium: 3400, allergens: [] },
  { menu_id: "nakau-oyako-8", menu_name: "温たま絶品親子重（並盛）", price: 800, category: "親子丼", calories: 791, protein: 39.6, fat: 26.7, carb: 103.2, sodium: 3600, allergens: [] },

  // 【牛すき丼】
  { menu_id: "nakau-gyusuki-1", menu_name: "牛すき丼（並盛）", price: 650, category: "牛すき丼", calories: 630, protein: 15.7, fat: 17.2, carb: 105.7, sodium: 2900, allergens: [] },
  { menu_id: "nakau-gyusuki-2", menu_name: "とろたま牛すき丼（並盛）", price: 740, category: "牛すき丼", calories: 725, protein: 23.4, fat: 23.6, carb: 105.8, sodium: 3100, allergens: [] },
  { menu_id: "nakau-gyusuki-3", menu_name: "温たま牛すき丼（並盛）", price: 760, category: "牛すき丼", calories: 721, protein: 23.4, fat: 24.5, carb: 105.8, sodium: 3100, allergens: [] },

  // 【海鮮丼】
  { menu_id: "nakau-kaisen-1", menu_name: "まぐろのたたき丼（並盛）", price: 790, category: "海鮮丼", calories: 592, protein: 27.1, fat: 9.0, carb: 99.8, sodium: 1800, allergens: [] },
  { menu_id: "nakau-kaisen-2", menu_name: "まぐろユッケ丼（並盛）", price: 920, category: "海鮮丼", calories: 753, protein: 38.5, fat: 19.1, carb: 104.1, sodium: 3000, allergens: [] },
  { menu_id: "nakau-kaisen-3", menu_name: "天然本まぐろ丼（並盛）", price: null, category: "海鮮丼", calories: 548, protein: 23.3, fat: 8.2, carb: 94.9, sodium: 700, allergens: [] },
  { menu_id: "nakau-kaisen-4", menu_name: "山かけ天然本まぐろ丼（並盛）", price: null, category: "海鮮丼", calories: 596, protein: 24.7, fat: 8.2, carb: 105.5, sodium: 800, allergens: [] },

  // 【カツ丼】
  { menu_id: "nakau-katsu-1", menu_name: "カツ丼（並盛）", price: 650, category: "カツ丼", calories: 991, protein: 32.8, fat: 40.9, carb: 123.8, sodium: 3700, allergens: [] },
  { menu_id: "nakau-katsu-2", menu_name: "牛とじ丼（並盛）", price: 720, category: "カツ丼", calories: 795, protein: 27.4, fat: 26.2, carb: 113.1, sodium: 4700, allergens: [] },
  { menu_id: "nakau-katsu-3", menu_name: "チーズ牛とじ丼（並盛）", price: 880, category: "カツ丼", calories: 917, protein: 35.6, fat: 35.8, carb: 113.9, sodium: 5300, allergens: [] },
  { menu_id: "nakau-katsu-4", menu_name: "チーズカツ丼（並盛）", price: 810, category: "カツ丼", calories: 1113, protein: 41.0, fat: 50.6, carb: 124.7, sodium: 4300, allergens: [] },
  { menu_id: "nakau-katsu-5", menu_name: "牛あいがけカツ丼（並盛）", price: 980, category: "カツ丼", calories: 1169, protein: 39.3, fat: 52.6, carb: 134.0, sodium: 6300, allergens: [] },
  { menu_id: "nakau-katsu-6", menu_name: "牡蠣とじ丼（並盛）", price: 790, category: "カツ丼", calories: 823, protein: 26.1, fat: 23.7, carb: 124.3, sodium: 2900, allergens: [] },
  { menu_id: "nakau-katsu-7", menu_name: "とろたま牡蠣とじ丼（並盛）", price: 880, category: "カツ丼", calories: 904, protein: 32.7, fat: 29.2, carb: 124.4, sodium: 3100, allergens: [] },
  { menu_id: "nakau-katsu-8", menu_name: "チーズ牡蠣とじ丼（並盛）", price: 950, category: "カツ丼", calories: 945, protein: 34.2, fat: 33.3, carb: 125.2, sodium: 3500, allergens: [] },

  // 【鶏から丼】
  { menu_id: "nakau-torikara-1", menu_name: "鶏から丼（並盛）", price: 650, category: "鶏から丼", calories: 971, protein: 32.8, fat: 36.2, carb: 130.1, sodium: 4000, allergens: [] },
  { menu_id: "nakau-torikara-2", menu_name: "ねぎラー鶏から丼（並盛）", price: 810, category: "鶏から丼", calories: 1176, protein: 35.3, fat: 53.3, carb: 140.9, sodium: 4600, allergens: [] },
  { menu_id: "nakau-torikara-3", menu_name: "食べラー鶏から丼（並盛）", price: 740, category: "鶏から丼", calories: 1170, protein: 32.8, fat: 36.2, carb: 139.5, sodium: 4600, allergens: [] },
  { menu_id: "nakau-torikara-4", menu_name: "とろたま鶏から丼（並盛）", price: 740, category: "鶏から丼", calories: 1065, protein: 40.5, fat: 42.7, carb: 130.3, sodium: 4200, allergens: [] },
  { menu_id: "nakau-torikara-5", menu_name: "マヨ鶏から丼（並盛）", price: 700, category: "鶏から丼", calories: 1039, protein: 33.1, fat: 43.7, carb: 130.2, sodium: 4200, allergens: [] },

  // 【カレー】
  { menu_id: "nakau-curry-1", menu_name: "和風カレー（並盛）", price: 540, category: "カレー", calories: 572, protein: 11.7, fat: 12.6, carb: 107.4, sodium: 3900, allergens: [] },
  { menu_id: "nakau-curry-2", menu_name: "和風カツカレー（並盛）", price: 760, category: "カレー", calories: 1003, protein: 25.6, fat: 43.1, carb: 130.4, sodium: 4900, allergens: [] },
  { menu_id: "nakau-curry-3", menu_name: "和風チーズカレー（並盛）", price: 700, category: "カレー", calories: 693, protein: 19.9, fat: 22.2, carb: 108.3, sodium: 4500, allergens: [] },
  { menu_id: "nakau-curry-4", menu_name: "和風こだわり卵カレー（並盛）", price: 630, category: "カレー", calories: 666, protein: 19.4, fat: 19.0, carb: 107.6, sodium: 4900, allergens: [] },
  { menu_id: "nakau-curry-5", menu_name: "和風牛あいがけカレー（並盛）", price: 870, category: "カレー", calories: 750, protein: 18.2, fat: 24.2, carb: 117.5, sodium: 5800, allergens: [] },

  // 【雑炊】
  { menu_id: "nakau-zosui-1", menu_name: "親子雑炊", price: null, category: "雑炊", calories: 471, protein: 28.4, fat: 17.7, carb: 48.8, sodium: 3800, allergens: [] },
  { menu_id: "nakau-zosui-2", menu_name: "鮭親子雑炊", price: null, category: "雑炊", calories: 515, protein: 33.0, fat: 20.5, carb: 48.9, sodium: 4900, allergens: [] },
  { menu_id: "nakau-zosui-3", menu_name: "明太子親子雑炊", price: null, category: "雑炊", calories: 499, protein: 32.4, fat: 18.4, carb: 50.2, sodium: 4900, allergens: [] },

  // 【天丼】
  { menu_id: "nakau-tendon-1", menu_name: "海老天丼（並盛）", price: null, category: "天丼", calories: 817, protein: 17.2, fat: 25.6, carb: 130.7, sodium: 1900, allergens: [] },
  { menu_id: "nakau-tendon-2", menu_name: "上海老天丼（並盛）", price: null, category: "天丼", calories: 1012, protein: 25.0, fat: 35.2, carb: 149.4, sodium: 2500, allergens: [] },

  // 【カルビ丼】
  { menu_id: "nakau-karubi-1", menu_name: "牛カルビ焼肉丼（並盛）", price: null, category: "カルビ丼", calories: 738, protein: 18.3, fat: 22.8, carb: 113.5, sodium: 3200, allergens: [] },
  { menu_id: "nakau-karubi-2", menu_name: "温たま牛カルビ焼肉丼（並盛）", price: null, category: "カルビ丼", calories: 824, protein: 25.6, fat: 29.8, carb: 113.6, sodium: 3300, allergens: [] },
  { menu_id: "nakau-karubi-3", menu_name: "とろたま牛カルビ焼肉丼（並盛）", price: null, category: "カルビ丼", calories: 819, protein: 24.9, fat: 28.4, carb: 113.6, sodium: 3400, allergens: [] },

  // 【冷うどん】
  { menu_id: "nakau-hiyaudon-1", menu_name: "海老天ざるうどん（3種盛）（並）", price: null, category: "冷うどん", calories: 540, protein: 16.0, fat: 17.9, carb: 77.5, sodium: 4100, allergens: [] },
  { menu_id: "nakau-hiyaudon-2", menu_name: "海老天ざるうどん（5種盛）（並）", price: null, category: "冷うどん", calories: 630, protein: 16.7, fat: 25.0, carb: 83.4, sodium: 4100, allergens: [] },
  { menu_id: "nakau-hiyaudon-3", menu_name: "冷やしはいからうどん（並）", price: 350, category: "冷うどん", calories: 359, protein: 8.8, fat: 6.9, carb: 68.0, sodium: 2700, allergens: [] },
  { menu_id: "nakau-hiyaudon-4", menu_name: "ざるうどん（並）", price: 450, category: "冷うどん", calories: 213, protein: 5.5, fat: 0.8, carb: 43.9, sodium: 600, allergens: [] },

  // 【温うどん】
  { menu_id: "nakau-udon-1", menu_name: "はいからうどん（並）", price: 350, category: "温うどん", calories: 322, protein: 7.2, fat: 6.4, carb: 59.0, sodium: 4600, allergens: [] },
  { menu_id: "nakau-udon-2", menu_name: "月見うどん（並）", price: 440, category: "温うどん", calories: 417, protein: 14.8, fat: 12.8, carb: 59.2, sodium: 4900, allergens: [] },
  { menu_id: "nakau-udon-3", menu_name: "きつねうどん（並）", price: 480, category: "温うどん", calories: 483, protein: 18.0, fat: 17.2, carb: 64.0, sodium: 5600, allergens: [] },
  { menu_id: "nakau-udon-4", menu_name: "和風カレーうどん（並）", price: 570, category: "温うどん", calories: 478, protein: 11.2, fat: 17.6, carb: 68.4, sodium: 4200, allergens: [] },
  { menu_id: "nakau-udon-5", menu_name: "担々うどん（並）", price: 550, category: "温うどん", calories: 515, protein: 18.3, fat: 18.3, carb: 67.6, sodium: 6400, allergens: [] },
  { menu_id: "nakau-udon-6", menu_name: "温たま担々うどん（並）", price: 660, category: "温うどん", calories: 601, protein: 25.6, fat: 25.3, carb: 67.7, sodium: 6600, allergens: [] },
  { menu_id: "nakau-udon-7", menu_name: "たっぷり野菜の担々うどん（並）", price: 690, category: "温うどん", calories: 595, protein: 21.7, fat: 20.9, carb: 79.9, sodium: 7100, allergens: [] },
  { menu_id: "nakau-udon-8", menu_name: "海老天ぷらうどん（3種盛）（並）", price: null, category: "温うどん", calories: 576, protein: 20.3, fat: 18.3, carb: 83.1, sodium: 4700, allergens: [] },
  { menu_id: "nakau-udon-9", menu_name: "海老天ぷらうどん（5種盛）（並）", price: null, category: "温うどん", calories: 666, protein: 21.1, fat: 25.5, carb: 89.0, sodium: 4700, allergens: [] },
  { menu_id: "nakau-udon-10", menu_name: "鴨うどん（並）", price: 640, category: "温うどん", calories: 546, protein: 28.2, fat: 20.8, carb: 61.5, sodium: 6600, allergens: [] },

  // 【冷そば】
  { menu_id: "nakau-hiyasoba-1", menu_name: "海老天ざるそば（3種盛）（並）", price: null, category: "冷そば", calories: 601, protein: 23.4, fat: 20.0, carb: 82.7, sodium: 3500, allergens: [] },
  { menu_id: "nakau-hiyasoba-2", menu_name: "海老天ざるそば（5種盛）（並）", price: null, category: "冷そば", calories: 690, protein: 24.1, fat: 27.2, carb: 88.7, sodium: 3500, allergens: [] },
  { menu_id: "nakau-hiyasoba-3", menu_name: "冷やしはいからそば（並）", price: 470, category: "冷そば", calories: 367, protein: 11.1, fat: 7.2, carb: 64.5, sodium: 2100, allergens: [] },
  { menu_id: "nakau-hiyasoba-4", menu_name: "ざるそば（並）", price: 570, category: "冷そば", calories: 273, protein: 12.9, fat: 3.0, carb: 48.9, sodium: 0, allergens: [] },

  // 【温そば】
  { menu_id: "nakau-soba-1", menu_name: "はいからそば（並）", price: 470, category: "温そば", calories: 393, protein: 12.8, fat: 7.1, carb: 69.3, sodium: 6100, allergens: [] },
  { menu_id: "nakau-soba-2", menu_name: "月見そば（並）", price: 560, category: "温そば", calories: 488, protein: 20.5, fat: 13.5, carb: 69.5, sodium: 6400, allergens: [] },
  { menu_id: "nakau-soba-3", menu_name: "きつねそば（並）", price: 600, category: "温そば", calories: 440, protein: 18.0, fat: 9.7, carb: 69.9, sodium: 6600, allergens: [] },
  { menu_id: "nakau-soba-4", menu_name: "担々そば（並）", price: 670, category: "温そば", calories: 567, protein: 26.0, fat: 20.3, carb: 68.2, sodium: 6200, allergens: [] },
  { menu_id: "nakau-soba-5", menu_name: "温たま担々そば（並）", price: 780, category: "温そば", calories: 653, protein: 33.4, fat: 27.3, carb: 68.3, sodium: 6400, allergens: [] },
  { menu_id: "nakau-soba-6", menu_name: "たっぷり野菜の担々そば（並）", price: 810, category: "温そば", calories: 646, protein: 29.5, fat: 22.9, carb: 80.5, sodium: 6900, allergens: [] },
  { menu_id: "nakau-soba-7", menu_name: "海老天ぷらそば（3種盛）（並）", price: null, category: "温そば", calories: 643, protein: 28.8, fat: 20.3, carb: 86.8, sodium: 6100, allergens: [] },
  { menu_id: "nakau-soba-8", menu_name: "海老天ぷらそば（5種盛）（並）", price: null, category: "温そば", calories: 733, protein: 29.5, fat: 27.5, carb: 92.7, sodium: 6100, allergens: [] },
  { menu_id: "nakau-soba-9", menu_name: "鴨そば（並）", price: 760, category: "温そば", calories: 598, protein: 35.9, fat: 22.8, carb: 62.2, sodium: 6400, allergens: [] },

  // 【定食】
  { menu_id: "nakau-teishoku-1", menu_name: "牛カルビ定食（並盛）", price: null, category: "定食", calories: 1015, protein: 27.6, fat: 42.5, carb: 128.7, sodium: 5600, allergens: [] },
  { menu_id: "nakau-teishoku-2", menu_name: "牛カルビ定食W（並盛）", price: null, category: "定食", calories: 1451, protein: 42.1, fat: 74.0, carb: 148.6, sodium: 7900, allergens: [] },
  { menu_id: "nakau-teishoku-3", menu_name: "豚しょうが焼き定食（並盛）", price: null, category: "定食", calories: 941, protein: 42.2, fat: 31.5, carb: 123.5, sodium: 6600, allergens: [] },
  { menu_id: "nakau-teishoku-4", menu_name: "豚しょうが焼き定食W（並盛）", price: null, category: "定食", calories: 1302, protein: 71.3, fat: 52.0, carb: 138.2, sodium: 10000, allergens: [] },

  // 【朝食】
  { menu_id: "nakau-morning-1", menu_name: "こだわり卵朝食（並盛）", price: 320, category: "朝食", calories: 545, protein: 19.0, fat: 9.9, carb: 99.4, sodium: 3600, allergens: [] },
  { menu_id: "nakau-morning-2", menu_name: "目玉焼き朝食（並盛）", price: 320, category: "朝食", calories: 548, protein: 18.5, fat: 10.9, carb: 98.3, sodium: 2800, allergens: [] },
  { menu_id: "nakau-morning-3", menu_name: "目玉焼きベーコン朝食（並盛）", price: 420, category: "朝食", calories: 631, protein: 22.7, fat: 18.2, carb: 98.3, sodium: 3400, allergens: [] },
  { menu_id: "nakau-morning-4", menu_name: "銀鮭朝食（並盛）", price: 470, category: "朝食", calories: 578, protein: 22.9, fat: 12.2, carb: 99.8, sodium: 4300, allergens: [] },

  // 【おかず】
  { menu_id: "nakau-okazu-1", menu_name: "つけもの", price: 70, category: "おかず", calories: 6, protein: 0.5, fat: 0.0, carb: 1.1, sodium: 700, allergens: [] },
  { menu_id: "nakau-okazu-2", menu_name: "牛小鉢（単品）", price: 280, category: "おかず", calories: 178, protein: 6.5, fat: 11.7, carb: 10.2, sodium: 1900, allergens: [] },
  { menu_id: "nakau-okazu-3", menu_name: "鶏小鉢（単品）", price: 160, category: "おかず", calories: 132, protein: 13.3, fat: 7.4, carb: 3.1, sodium: 2000, allergens: [] },
  { menu_id: "nakau-okazu-4", menu_name: "ベーコン（単品）", price: 150, category: "おかず", calories: 83, protein: 4.2, fat: 7.4, carb: 0.0, sodium: 600, allergens: [] },
  { menu_id: "nakau-okazu-5", menu_name: "ライス（並盛）", price: 190, category: "おかず", calories: 380, protein: 6.6, fat: 1.3, carb: 89.9, sodium: 0, allergens: [] },
  { menu_id: "nakau-okazu-6", menu_name: "こだわり卵", price: 100, category: "おかず", calories: 94, protein: 7.7, fat: 6.4, carb: 0.2, sodium: 300, allergens: [] },
  { menu_id: "nakau-okazu-7", menu_name: "こだわり温たま", price: 120, category: "おかず", calories: 86, protein: 7.3, fat: 7.0, carb: 0.1, sodium: 200, allergens: [] },
  { menu_id: "nakau-okazu-8", menu_name: "みそ汁", price: 120, category: "おかず", calories: 61, protein: 3.3, fat: 2.0, carb: 7.3, sodium: 2500, allergens: [] },
  { menu_id: "nakau-okazu-9", menu_name: "具だくさんとん汁", price: 290, category: "おかず", calories: 167, protein: 10.1, fat: 5.4, carb: 19.7, sodium: 3600, allergens: [] },
  { menu_id: "nakau-okazu-10", menu_name: "彩り野菜サラダ", price: 200, category: "おかず", calories: 19, protein: 0.9, fat: 0.2, carb: 3.8, sodium: 100, allergens: [] },
  { menu_id: "nakau-okazu-11", menu_name: "鶏から（1個）", price: 120, category: "おかず", calories: 151, protein: 6.1, fat: 9.5, carb: 9.5, sodium: 600, allergens: [] },
  { menu_id: "nakau-okazu-12", menu_name: "とり天（1個）", price: null, category: "おかず", calories: 120, protein: 7.6, fat: 2.7, carb: 16.7, sodium: 500, allergens: [] },
  { menu_id: "nakau-okazu-13", menu_name: "海老天ぷら盛り合わせ（3種）", price: null, category: "おかず", calories: 320, protein: 10.7, fat: 17.1, carb: 31.5, sodium: 2400, allergens: [] },
  { menu_id: "nakau-okazu-14", menu_name: "海老天ぷら盛り合わせ（5種）", price: null, category: "おかず", calories: 410, protein: 11.4, fat: 24.3, carb: 37.4, sodium: 2400, allergens: [] },
  { menu_id: "nakau-okazu-15", menu_name: "肉すい", price: null, category: "おかず", calories: 205, protein: 7.7, fat: 12.2, carb: 14.4, sodium: 5700, allergens: [] },
  { menu_id: "nakau-okazu-16", menu_name: "目玉焼き（単品）", price: 120, category: "おかず", calories: 103, protein: 7.7, fat: 7.4, carb: 0.2, sodium: 300, allergens: [] },
  { menu_id: "nakau-okazu-17", menu_name: "牛カルビ（単品）", price: null, category: "おかず", calories: 533, protein: 16.5, fat: 38.9, carb: 27.0, sodium: 2300, allergens: [] },
  { menu_id: "nakau-okazu-18", menu_name: "豚しょうが焼き（単品）", price: null, category: "おかず", calories: 554, protein: 18.6, fat: 45.4, carb: 19.5, sodium: 3400, allergens: [] },
  { menu_id: "nakau-okazu-19", menu_name: "とろろ（単品）", price: 150, category: "おかず", calories: 48, protein: 1.4, fat: 0.0, carb: 10.6, sodium: 100, allergens: [] },
  { menu_id: "nakau-okazu-20", menu_name: "納豆（単品）", price: 70, category: "おかず", calories: 82, protein: 6.7, fat: 4.0, carb: 6.4, sodium: 500, allergens: [] },
  { menu_id: "nakau-okazu-21", menu_name: "銀鮭（単品）", price: 220, category: "おかず", calories: 127, protein: 11.6, fat: 8.8, carb: 0.6, sodium: 1100, allergens: [] },
  { menu_id: "nakau-okazu-22", menu_name: "のり（単品）", price: 50, category: "おかず", calories: 4, protein: 0.8, fat: 0.1, carb: 0.9, sodium: 100, allergens: [] },
  { menu_id: "nakau-okazu-23", menu_name: "牛すき皿", price: 550, category: "おかず", calories: 250, protein: 9.0, fat: 15.8, carb: 15.7, sodium: 2900, allergens: [] },
  { menu_id: "nakau-okazu-24", menu_name: "親子皿", price: 350, category: "おかず", calories: 293, protein: 24.8, fat: 16.4, carb: 9.8, sodium: 3100, allergens: [] },
  { menu_id: "nakau-okazu-25", menu_name: "カツとじ皿", price: 550, category: "おかず", calories: 611, protein: 26.2, fat: 39.5, carb: 33.9, sodium: 3700, allergens: [] },
  { menu_id: "nakau-okazu-26", menu_name: "牛とじ皿", price: 620, category: "おかず", calories: 415, protein: 20.8, fat: 24.8, carb: 23.1, sodium: 4700, allergens: [] },
  { menu_id: "nakau-okazu-27", menu_name: "うな皿（並盛）", price: 880, category: "おかず", calories: 261, protein: 15.8, fat: 17.9, carb: 8.9, sodium: 1400, allergens: [] },
  { menu_id: "nakau-okazu-28", menu_name: "きつねあげ（単品）", price: null, category: "おかず", calories: 114, protein: 5.7, fat: 8.2, carb: 4.5, sodium: 500, allergens: [] },
  { menu_id: "nakau-okazu-29", menu_name: "食べるラー油", price: 90, category: "おかず", calories: 199, protein: 2.2, fat: 17.0, carb: 9.4, sodium: 700, allergens: [] },
  { menu_id: "nakau-okazu-30", menu_name: "追加青ネギ", price: 70, category: "おかず", calories: 6, protein: 0.3, fat: 0.1, carb: 1.4, sodium: 0, allergens: [] },
  { menu_id: "nakau-okazu-31", menu_name: "追加チーズ", price: null, category: "おかず", calories: 122, protein: 8.1, fat: 9.6, carb: 0.9, sodium: 600, allergens: [] },
  { menu_id: "nakau-okazu-32", menu_name: "いちご葛アイス", price: null, category: "おかず", calories: 97, protein: 1.5, fat: 2.3, carb: 18.1, sodium: 0, allergens: [] },
  { menu_id: "nakau-okazu-33", menu_name: "こだわり卵のプリン（カスタード）", price: 160, category: "おかず", calories: 174, protein: 3.3, fat: 11.0, carb: 15.3, sodium: 100, allergens: [] },

  // 【お子様メニュー】
  { menu_id: "nakau-kids-1", menu_name: "お子様きつねうどん", price: 200, category: "お子様メニュー", calories: 244, protein: 9.0, fat: 8.6, carb: 32.5, sodium: 3500, allergens: [] },
  { menu_id: "nakau-kids-2", menu_name: "お子様冷やしきつねうどん", price: null, category: "お子様メニュー", calories: 269, protein: 10.1, fat: 8.9, carb: 38.5, sodium: 2800, allergens: [] },
  { menu_id: "nakau-kids-3", menu_name: "お子様わかめうどん", price: 200, category: "お子様メニュー", calories: 132, protein: 3.6, fat: 0.5, carb: 28.7, sodium: 3200, allergens: [] },
  { menu_id: "nakau-kids-4", menu_name: "お子様冷やしわかめうどん", price: null, category: "お子様メニュー", calories: 157, protein: 4.7, fat: 0.8, carb: 34.7, sodium: 2600, allergens: [] },
  { menu_id: "nakau-kids-5", menu_name: "お子様カレー丼ぶり", price: 230, category: "お子様メニュー", calories: 319, protein: 6.4, fat: 5.4, carb: 64.4, sodium: 2000, allergens: [] },
  { menu_id: "nakau-kids-6", menu_name: "お子様親子丼ぶり", price: 230, category: "お子様メニュー", calories: 500, protein: 28.3, fat: 17.1, carb: 59.7, sodium: 3500, allergens: [] },
  { menu_id: "nakau-kids-7", menu_name: "お子様きつねうどんセット", price: 450, category: "お子様メニュー", calories: 512, protein: 12.5, fat: 20.0, carb: 70.7, sodium: 3600, allergens: [] },
  { menu_id: "nakau-kids-8", menu_name: "お子様冷やしきつねうどんセット", price: null, category: "お子様メニュー", calories: 538, protein: 13.6, fat: 20.3, carb: 76.6, sodium: 2900, allergens: [] },
  { menu_id: "nakau-kids-9", menu_name: "お子様わかめうどんセット", price: 450, category: "お子様メニュー", calories: 400, protein: 7.1, fat: 11.9, carb: 66.8, sodium: 3400, allergens: [] },
  { menu_id: "nakau-kids-10", menu_name: "お子様冷やしわかめうどんセット", price: null, category: "お子様メニュー", calories: 426, protein: 8.2, fat: 12.2, carb: 72.8, sodium: 2700, allergens: [] },
  { menu_id: "nakau-kids-11", menu_name: "お子様カレー丼ぶりセット", price: 480, category: "お子様メニュー", calories: 587, protein: 9.9, fat: 16.8, carb: 102.6, sodium: 2200, allergens: [] },
  { menu_id: "nakau-kids-12", menu_name: "お子様親子丼ぶりセット", price: 480, category: "お子様メニュー", calories: 768, protein: 31.9, fat: 28.5, carb: 97.8, sodium: 3600, allergens: [] },
  { menu_id: "nakau-kids-13", menu_name: "お子様ジュース", price: null, category: "お子様メニュー", calories: 94, protein: 0.2, fat: 0.4, carb: 22.8, sodium: 0, allergens: [] },

  // 【ドリンク】
  { menu_id: "nakau-drink-1", menu_name: "ホットコーヒー", price: null, category: "ドリンク", calories: 1, protein: 0.0, fat: 0.0, carb: 0.1, sodium: 0, allergens: [] },
  { menu_id: "nakau-drink-2", menu_name: "アイスコーヒー", price: null, category: "ドリンク", calories: 1, protein: 0.0, fat: 0.0, carb: 0.1, sodium: 0, allergens: [] },
  { menu_id: "nakau-drink-3", menu_name: "カフェオレ", price: null, category: "ドリンク", calories: 49, protein: 0.4, fat: 3.0, carb: 5.2, sodium: 100, allergens: [] },
  { menu_id: "nakau-drink-4", menu_name: "アイスカフェオレ", price: null, category: "ドリンク", calories: 109, protein: 0.9, fat: 6.6, carb: 11.4, sodium: 200, allergens: [] },
  { menu_id: "nakau-drink-5", menu_name: "ホットココア", price: null, category: "ドリンク", calories: 104, protein: 1.0, fat: 2.5, carb: 19.2, sodium: 300, allergens: [] },
  { menu_id: "nakau-drink-6", menu_name: "アイスココア", price: null, category: "ドリンク", calories: 216, protein: 2.2, fat: 5.3, carb: 40.0, sodium: 600, allergens: [] },
  { menu_id: "nakau-drink-7", menu_name: "スティックシュガー", price: null, category: "ドリンク", calories: 12, protein: 0.0, fat: 0.0, carb: 3.0, sodium: 0, allergens: [] },
  { menu_id: "nakau-drink-8", menu_name: "ガムシロップ", price: null, category: "ドリンク", calories: 22, protein: 0.0, fat: 0.0, carb: 5.6, sodium: 0, allergens: [] },
  { menu_id: "nakau-drink-9", menu_name: "コーヒーフレッシュ", price: null, category: "ドリンク", calories: 12, protein: 0.2, fat: 1.1, carb: 0.2, sodium: 0, allergens: [] },
  { menu_id: "nakau-drink-10", menu_name: "黒烏龍茶", price: 120, category: "ドリンク", calories: 5, protein: 0.5, fat: 0.0, carb: 0.5, sodium: 0, allergens: [] },
  { menu_id: "nakau-drink-11", menu_name: "白玉抹茶ラテ", price: 320, category: "ドリンク", calories: 195, protein: 3.9, fat: 3.4, carb: 37.2, sodium: 200, allergens: [] },
  { menu_id: "nakau-drink-12", menu_name: "黒糖ゼリー紅茶ラテ", price: 320, category: "ドリンク", calories: 210, protein: 3.5, fat: 7.1, carb: 33.5, sodium: 300, allergens: [] },
];
