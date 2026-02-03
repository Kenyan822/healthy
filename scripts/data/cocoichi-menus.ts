// CoCo壱番屋メニューデータ（2026年2月1日版PDFより）
// アレルゲン情報は公式PDFに記載がないため空配列

export interface CocoichiMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
  allergens: string[];
}

export const cocoichiMenuData: CocoichiMenuItem[] = [
  // ========== 数量限定 ==========
  { menu_id: "cocoichi-limited-001", menu_name: "厚切りベーコンとスモークチーズのスープカレー", category: "数量限定", calories: 775, protein: 18.7, fat: 35.3, carb: 97.4, sodium: 4.8, allergens: [] },
  { menu_id: "cocoichi-limited-002", menu_name: "グランド・マザー・カレー", category: "数量限定", calories: 898, protein: 17.4, fat: 33.1, carb: 136.6, sodium: 4.0, allergens: [] },

  // ========== 期間限定 ==========
  { menu_id: "cocoichi-seasonal-001", menu_name: "コンボA", category: "期間限定", calories: 1349, protein: 52.1, fat: 98.3, carb: 69.5, sodium: 6.4, allergens: [] },
  { menu_id: "cocoichi-seasonal-002", menu_name: "コンボB", category: "期間限定", calories: 1540, protein: 62.7, fat: 111.1, carb: 75.3, sodium: 7.4, allergens: [] },
  { menu_id: "cocoichi-seasonal-003", menu_name: "コンボC", category: "期間限定", calories: 1909, protein: 80.3, fat: 131.9, carb: 100.2, sodium: 9.5, allergens: [] },
  { menu_id: "cocoichi-seasonal-004", menu_name: "手仕込豚ヒレカツカレー", category: "期間限定", calories: 1148, protein: 35.8, fat: 47.0, carb: 151.0, sodium: 4.1, allergens: [] },
  { menu_id: "cocoichi-seasonal-005", menu_name: "ローストチキンスープカレー", category: "期間限定", calories: 845, protein: 28.4, fat: 37.4, carb: 99.6, sodium: 4.0, allergens: [] },
  { menu_id: "cocoichi-seasonal-006", menu_name: "ベーススープカレー", category: "期間限定", calories: 535, protein: 8.5, fat: 14.8, carb: 95.6, sodium: 2.8, allergens: [] },
  { menu_id: "cocoichi-seasonal-007", menu_name: "カキフライカレー", category: "期間限定", calories: 1069, protein: 21.1, fat: 41.8, carb: 158.0, sodium: 4.8, allergens: [] },

  // ========== カレーメニュー ==========
  { menu_id: "cocoichi-curry-001", menu_name: "ポークカレー", category: "カレーメニュー", calories: 701, protein: 11.0, fat: 18.3, carb: 126.9, sodium: 3.4, allergens: [] },
  { menu_id: "cocoichi-curry-002", menu_name: "甘口ポークカレー", category: "カレーメニュー", calories: 681, protein: 10.8, fat: 17.0, carb: 124.7, sodium: 2.5, allergens: [] },
  { menu_id: "cocoichi-curry-003", menu_name: "ビーフカレー", category: "カレーメニュー", calories: 823, protein: 17.3, fat: 29.6, carb: 125.8, sodium: 3.1, allergens: [] },
  { menu_id: "cocoichi-curry-004", menu_name: "ココイチベジカレー", category: "カレーメニュー", calories: 688, protein: 10.1, fat: 15.6, carb: 130.7, sodium: 3.8, allergens: [] },
  { menu_id: "cocoichi-curry-005", menu_name: "ハヤシライス", category: "カレーメニュー", calories: 845, protein: 16.4, fat: 30.1, carb: 132.4, sodium: 3.1, allergens: [] },
  { menu_id: "cocoichi-curry-006", menu_name: "チキンにこみカレー", category: "カレーメニュー", calories: 769, protein: 24.4, fat: 19.7, carb: 128.7, sodium: 4.3, allergens: [] },
  { menu_id: "cocoichi-curry-007", menu_name: "フライドチキン(5個)カレー", category: "カレーメニュー", calories: 1026, protein: 28.6, fat: 41.4, carb: 145.2, sodium: 4.7, allergens: [] },
  { menu_id: "cocoichi-curry-008", menu_name: "ハンバーグ(2個)カレー", category: "カレーメニュー", calories: 925, protein: 24.2, fat: 32.9, carb: 137.0, sodium: 4.7, allergens: [] },
  { menu_id: "cocoichi-curry-009", menu_name: "豚しゃぶカレー", category: "カレーメニュー", calories: 1052, protein: 23.6, fat: 51.5, carb: 128.8, sodium: 3.5, allergens: [] },
  { menu_id: "cocoichi-curry-010", menu_name: "メンチカツカレー", category: "カレーメニュー", calories: 1047, protein: 20.5, fat: 40.7, carb: 152.8, sodium: 4.5, allergens: [] },
  { menu_id: "cocoichi-curry-011", menu_name: "ソーセージ(4本)カレー", category: "カレーメニュー", calories: 980, protein: 21.2, fat: 41.5, carb: 132.0, sodium: 5.0, allergens: [] },
  { menu_id: "cocoichi-curry-012", menu_name: "チキンカツカレー", category: "カレーメニュー", calories: 1115, protein: 32.3, fat: 43.7, carb: 151.6, sodium: 4.8, allergens: [] },
  { menu_id: "cocoichi-curry-013", menu_name: "パリパリチキンカレー", category: "カレーメニュー", calories: 995, protein: 29.2, fat: 36.4, carb: 139.1, sodium: 4.8, allergens: [] },
  { menu_id: "cocoichi-curry-014", menu_name: "ロースカツカレー", category: "カレーメニュー", calories: 1116, protein: 27.1, fat: 48.7, carb: 149.3, sodium: 4.3, allergens: [] },
  { menu_id: "cocoichi-curry-015", menu_name: "手仕込とんかつカレー", category: "カレーメニュー", calories: 1272, protein: 34.2, fat: 63.4, carb: 146.4, sodium: 4.0, allergens: [] },
  { menu_id: "cocoichi-curry-016", menu_name: "牛すじ煮込みカレー", category: "カレーメニュー", calories: 846, protein: 25.0, fat: 25.3, carb: 136.9, sodium: 5.4, allergens: [] },
  { menu_id: "cocoichi-curry-017", menu_name: "なす(6個)カレー", category: "カレーメニュー", calories: 872, protein: 11.9, fat: 34.9, carb: 131.6, sodium: 3.4, allergens: [] },
  { menu_id: "cocoichi-curry-018", menu_name: "ほうれん草カレー", category: "カレーメニュー", calories: 712, protein: 12.5, fat: 18.5, carb: 128.6, sodium: 3.6, allergens: [] },
  { menu_id: "cocoichi-curry-019", menu_name: "やさいカレー", category: "カレーメニュー", calories: 783, protein: 12.8, fat: 20.1, carb: 142.4, sodium: 3.5, allergens: [] },
  { menu_id: "cocoichi-curry-020", menu_name: "スクランブルエッグカレー", category: "カレーメニュー", calories: 846, protein: 15.4, fat: 30.2, carb: 132.0, sodium: 4.0, allergens: [] },
  { menu_id: "cocoichi-curry-021", menu_name: "納豆カレー", category: "カレーメニュー", calories: 787, protein: 18.0, fat: 22.4, carb: 132.3, sodium: 3.4, allergens: [] },
  { menu_id: "cocoichi-curry-022", menu_name: "きのこカレー", category: "カレーメニュー", calories: 711, protein: 12.5, fat: 18.4, carb: 129.8, sodium: 3.9, allergens: [] },
  { menu_id: "cocoichi-curry-023", menu_name: "クリームコロッケ(カニ入り)(2個)カレー", category: "カレーメニュー", calories: 1085, protein: 16.6, fat: 45.5, carb: 156.1, sodium: 4.8, allergens: [] },
  { menu_id: "cocoichi-curry-024", menu_name: "チーズカレー", category: "カレーメニュー", calories: 896, protein: 23.9, fat: 34.1, carb: 128.3, sodium: 4.4, allergens: [] },
  { menu_id: "cocoichi-curry-025", menu_name: "フィッシュフライ(2本)カレー", category: "カレーメニュー", calories: 942, protein: 22.1, fat: 32.3, carb: 143.9, sodium: 4.4, allergens: [] },
  { menu_id: "cocoichi-curry-026", menu_name: "たっぷりあさりカレー", category: "カレーメニュー", calories: 769, protein: 23.2, fat: 19.6, carb: 130.1, sodium: 4.0, allergens: [] },
  { menu_id: "cocoichi-curry-027", menu_name: "イカカレー", category: "カレーメニュー", calories: 839, protein: 24.1, fat: 25.2, carb: 134.2, sodium: 4.3, allergens: [] },
  { menu_id: "cocoichi-curry-028", menu_name: "エビにこみカレー", category: "カレーメニュー", calories: 745, protein: 21.4, fat: 18.7, carb: 127.1, sodium: 4.2, allergens: [] },
  { menu_id: "cocoichi-curry-029", menu_name: "エビあさりカレー", category: "カレーメニュー", calories: 757, protein: 22.3, fat: 19.2, carb: 128.6, sodium: 4.1, allergens: [] },
  { menu_id: "cocoichi-curry-030", menu_name: "海の幸カレー", category: "カレーメニュー", calories: 826, protein: 28.8, fat: 22.7, carb: 132.2, sodium: 4.5, allergens: [] },

  // ========== その他のカレーメニュー ==========
  { menu_id: "cocoichi-other-001", menu_name: "低糖質カレー", category: "その他のカレーメニュー", calories: 255, protein: 8.0, fat: 15.4, carb: 25.1, sodium: 3.0, allergens: [] },
  { menu_id: "cocoichi-other-002", menu_name: "カレーうどん", category: "その他のカレーメニュー", calories: 702, protein: 18.3, fat: 30.8, carb: 85.5, sodium: 7.2, allergens: [] },
  { menu_id: "cocoichi-other-003", menu_name: "カレーうどん（マイルド）", category: "その他のカレーメニュー", calories: 688, protein: 18.1, fat: 29.8, carb: 84.0, sodium: 6.6, allergens: [] },
  { menu_id: "cocoichi-other-004", menu_name: "カレーらーめん", category: "その他のカレーメニュー", calories: 656, protein: 20.4, fat: 23.3, carb: 88.0, sodium: 9.4, allergens: [] },
  { menu_id: "cocoichi-other-005", menu_name: "チャーシューカレーらーめん", category: "その他のカレーメニュー", calories: 811, protein: 26.2, fat: 37.3, carb: 89.7, sodium: 10.1, allergens: [] },
  { menu_id: "cocoichi-other-006", menu_name: "なすとほうれん草のカレードリア", category: "その他のカレーメニュー", calories: 480, protein: 10.1, fat: 17.7, carb: 72.3, sodium: 2.2, allergens: [] },
  { menu_id: "cocoichi-other-007", menu_name: "ハンバーグカレードリア", category: "その他のカレーメニュー", calories: 543, protein: 15.7, fat: 20.9, carb: 74.8, sodium: 2.8, allergens: [] },
  { menu_id: "cocoichi-other-008", menu_name: "オムカレー", category: "その他のカレーメニュー", calories: 555, protein: 11.0, fat: 26.0, carb: 71.1, sodium: 2.7, allergens: [] },

  // ========== 特定原材料を使用していないカレー ==========
  { menu_id: "cocoichi-allergen-001", menu_name: "特定原材料を使用していないカレー（ライス200g）", category: "特定原材料を使用していないカレー", calories: 492, protein: 7.6, fat: 7.8, carb: 100.6, sodium: 1.9, allergens: [] },
  { menu_id: "cocoichi-allergen-002", menu_name: "特定原材料を使用していないカレー（ライス100g）", category: "特定原材料を使用していないカレー", calories: 246, protein: 3.8, fat: 3.9, carb: 50.3, sodium: 0.9, allergens: [] },

  // ========== お子さまメニュー ==========
  { menu_id: "cocoichi-kids-001", menu_name: "お子さまカレー ハンバーグ", category: "お子さまメニュー", calories: 404, protein: 11.0, fat: 14.4, carb: 59.6, sodium: 1.8, allergens: [] },
  { menu_id: "cocoichi-kids-002", menu_name: "お子さまカレー フライドチキン", category: "お子さまメニュー", calories: 423, protein: 11.5, fat: 16.3, carb: 61.9, sodium: 1.7, allergens: [] },
  { menu_id: "cocoichi-kids-003", menu_name: "お子さまカレー ハンバーグ＆フライドチキン", category: "お子さまメニュー", calories: 555, protein: 15.6, fat: 23.9, carb: 73.8, sodium: 2.1, allergens: [] },
  { menu_id: "cocoichi-kids-004", menu_name: "お子さまカレー クリームコロッケ（カニ入り）＆フライドチキン", category: "お子さまメニュー", calories: 635, protein: 11.8, fat: 30.2, carb: 83.4, sodium: 2.2, allergens: [] },
  { menu_id: "cocoichi-kids-005", menu_name: "ミニお子さまカレー", category: "お子さまメニュー", calories: 271, protein: 3.8, fat: 6.7, carb: 50.1, sodium: 1.0, allergens: [] },
  { menu_id: "cocoichi-kids-006", menu_name: "ミニお子さまナンカレー", category: "お子さまメニュー", calories: 185, protein: 4.3, fat: 4.8, carb: 31.9, sodium: 1.1, allergens: [] },
  { menu_id: "cocoichi-kids-007", menu_name: "1歳からのやさしい野菜カレー", category: "お子さまメニュー", calories: 112, protein: 2.0, fat: 1.1, carb: 24.4, sodium: 0.6, allergens: [] },

  // ========== サラダ ==========
  { menu_id: "cocoichi-salad-001", menu_name: "ヤサイサラダ", category: "サラダ", calories: 15, protein: 0.9, fat: 0.2, carb: 3.3, sodium: 0.0, allergens: [] },
  { menu_id: "cocoichi-salad-002", menu_name: "シーザーサラダ", category: "サラダ", calories: 102, protein: 2.2, fat: 7.2, carb: 7.8, sodium: 1.3, allergens: [] },
  { menu_id: "cocoichi-salad-003", menu_name: "タマゴサラダ", category: "サラダ", calories: 109, protein: 9.9, fat: 7.0, carb: 5.9, sodium: 0.8, allergens: [] },
  { menu_id: "cocoichi-salad-004", menu_name: "コーンサラダ", category: "サラダ", calories: 40, protein: 1.7, fat: 0.7, carb: 8.6, sodium: 0.2, allergens: [] },
  { menu_id: "cocoichi-salad-005", menu_name: "ツナサラダ", category: "サラダ", calories: 113, protein: 10.2, fat: 6.7, carb: 4.5, sodium: 0.5, allergens: [] },
  { menu_id: "cocoichi-salad-006", menu_name: "ポテトサラダ", category: "サラダ", calories: 84, protein: 1.9, fat: 3.3, carb: 12.6, sodium: 0.7, allergens: [] },
  { menu_id: "cocoichi-salad-007", menu_name: "イカサラダ", category: "サラダ", calories: 84, protein: 7.4, fat: 3.7, carb: 6.9, sodium: 0.5, allergens: [] },
  { menu_id: "cocoichi-salad-008", menu_name: "フライドチキン(3個)サラダ", category: "サラダ", calories: 210, protein: 11.5, fat: 14.1, carb: 14.3, sodium: 0.8, allergens: [] },
  { menu_id: "cocoichi-salad-009", menu_name: "ソーセージ(2本)サラダ", category: "サラダ", calories: 155, protein: 6.0, fat: 11.8, carb: 5.8, sodium: 0.8, allergens: [] },

  // ========== トッピング ==========
  { menu_id: "cocoichi-topping-001", menu_name: "チキンにこみ", category: "トッピング", calories: 68, protein: 13.4, fat: 1.4, carb: 1.8, sodium: 0.9, allergens: [] },
  { menu_id: "cocoichi-topping-002", menu_name: "フライドチキン(5個)", category: "トッピング", calories: 325, protein: 17.6, fat: 23.1, carb: 18.3, sodium: 1.3, allergens: [] },
  { menu_id: "cocoichi-topping-003", menu_name: "フライドチキン(3個)", category: "トッピング", calories: 195, protein: 10.6, fat: 13.9, carb: 11.0, sodium: 0.8, allergens: [] },
  { menu_id: "cocoichi-topping-004", menu_name: "ハンバーグ(2個)", category: "トッピング", calories: 224, protein: 13.2, fat: 14.6, carb: 10.1, sodium: 1.3, allergens: [] },
  { menu_id: "cocoichi-topping-005", menu_name: "ハンバーグ(1個)", category: "トッピング", calories: 112, protein: 6.6, fat: 7.3, carb: 5.0, sodium: 0.6, allergens: [] },
  { menu_id: "cocoichi-topping-006", menu_name: "豚しゃぶ", category: "トッピング", calories: 351, protein: 12.6, fat: 33.2, carb: 1.9, sodium: 0.1, allergens: [] },
  { menu_id: "cocoichi-topping-007", menu_name: "メンチカツ", category: "トッピング", calories: 346, protein: 9.5, fat: 22.4, carb: 25.9, sodium: 1.1, allergens: [] },
  { menu_id: "cocoichi-topping-008", menu_name: "ソーセージ(4本)", category: "トッピング", calories: 279, protein: 10.2, fat: 23.2, carb: 5.1, sodium: 1.5, allergens: [] },
  { menu_id: "cocoichi-topping-009", menu_name: "ソーセージ(2本)", category: "トッピング", calories: 140, protein: 5.1, fat: 11.6, carb: 2.5, sodium: 0.8, allergens: [] },
  { menu_id: "cocoichi-topping-010", menu_name: "チキンカツ", category: "トッピング", calories: 414, protein: 21.3, fat: 25.4, carb: 24.7, sodium: 1.4, allergens: [] },
  { menu_id: "cocoichi-topping-011", menu_name: "パリパリチキン", category: "トッピング", calories: 294, protein: 18.2, fat: 18.1, carb: 12.2, sodium: 1.4, allergens: [] },
  { menu_id: "cocoichi-topping-012", menu_name: "ロースカツ", category: "トッピング", calories: 415, protein: 16.1, fat: 30.4, carb: 22.4, sodium: 0.9, allergens: [] },
  { menu_id: "cocoichi-topping-013", menu_name: "手仕込とんかつ", category: "トッピング", calories: 571, protein: 23.2, fat: 45.1, carb: 19.5, sodium: 0.6, allergens: [] },
  { menu_id: "cocoichi-topping-014", menu_name: "牛すじ煮込み", category: "トッピング", calories: 145, protein: 14.0, fat: 7.0, carb: 10.0, sodium: 2.0, allergens: [] },
  { menu_id: "cocoichi-topping-015", menu_name: "なす(6個)", category: "トッピング", calories: 171, protein: 0.9, fat: 16.6, carb: 4.7, sodium: 0.0, allergens: [] },
  { menu_id: "cocoichi-topping-016", menu_name: "なす(3個)", category: "トッピング", calories: 85, protein: 0.4, fat: 8.3, carb: 2.3, sodium: 0.0, allergens: [] },
  { menu_id: "cocoichi-topping-017", menu_name: "ほうれん草", category: "トッピング", calories: 11, protein: 1.5, fat: 0.2, carb: 1.7, sodium: 0.2, allergens: [] },
  { menu_id: "cocoichi-topping-018", menu_name: "やさい", category: "トッピング", calories: 82, protein: 1.8, fat: 1.8, carb: 15.5, sodium: 0.1, allergens: [] },
  { menu_id: "cocoichi-topping-019", menu_name: "スクランブルエッグ", category: "トッピング", calories: 145, protein: 4.4, fat: 11.9, carb: 5.1, sodium: 0.6, allergens: [] },
  { menu_id: "cocoichi-topping-020", menu_name: "納豆", category: "トッピング", calories: 86, protein: 7.0, fat: 4.1, carb: 5.4, sodium: 0.0, allergens: [] },
  { menu_id: "cocoichi-topping-021", menu_name: "きのこ", category: "トッピング", calories: 10, protein: 1.5, fat: 0.1, carb: 2.9, sodium: 0.5, allergens: [] },
  { menu_id: "cocoichi-topping-022", menu_name: "クリームコロッケ(カニ入り)(2個)", category: "トッピング", calories: 384, protein: 5.6, fat: 27.2, carb: 29.2, sodium: 1.4, allergens: [] },
  { menu_id: "cocoichi-topping-023", menu_name: "クリームコロッケ(カニ入り)(1個)", category: "トッピング", calories: 192, protein: 2.8, fat: 13.6, carb: 14.6, sodium: 0.7, allergens: [] },
  { menu_id: "cocoichi-topping-024", menu_name: "チーズ", category: "トッピング", calories: 195, protein: 12.9, fat: 15.8, carb: 1.4, sodium: 1.0, allergens: [] },
  { menu_id: "cocoichi-topping-025", menu_name: "フィッシュフライ(2本)", category: "トッピング", calories: 241, protein: 11.1, fat: 14.0, carb: 17.0, sodium: 1.0, allergens: [] },
  { menu_id: "cocoichi-topping-026", menu_name: "フィッシュフライ(1本)", category: "トッピング", calories: 120, protein: 5.6, fat: 7.0, carb: 8.5, sodium: 0.5, allergens: [] },
  { menu_id: "cocoichi-topping-027", menu_name: "たっぷりあさり", category: "トッピング", calories: 68, protein: 12.2, fat: 1.3, carb: 3.2, sodium: 0.6, allergens: [] },
  { menu_id: "cocoichi-topping-028", menu_name: "イカ", category: "トッピング", calories: 138, protein: 13.1, fat: 6.9, carb: 7.3, sodium: 0.9, allergens: [] },
  { menu_id: "cocoichi-topping-029", menu_name: "エビにこみ", category: "トッピング", calories: 44, protein: 10.4, fat: 0.4, carb: 0.2, sodium: 0.7, allergens: [] },
  { menu_id: "cocoichi-topping-030", menu_name: "エビあさり", category: "トッピング", calories: 56, protein: 11.3, fat: 0.9, carb: 1.7, sodium: 0.7, allergens: [] },
  { menu_id: "cocoichi-topping-031", menu_name: "海の幸", category: "トッピング", calories: 125, protein: 17.8, fat: 4.4, carb: 5.3, sodium: 1.1, allergens: [] },
  { menu_id: "cocoichi-topping-032", menu_name: "クリーミータルタルソース", category: "トッピング", calories: 110, protein: 1.5, fat: 10.7, carb: 2.0, sodium: 0.6, allergens: [] },
  { menu_id: "cocoichi-topping-033", menu_name: "半熟タマゴ", category: "トッピング", calories: 67, protein: 5.4, fat: 5.0, carb: 0.2, sodium: 0.2, allergens: [] },
  { menu_id: "cocoichi-topping-034", menu_name: "ゆでタマゴ", category: "トッピング", calories: 94, protein: 9.0, fat: 6.8, carb: 2.6, sodium: 0.7, allergens: [] },
  { menu_id: "cocoichi-topping-035", menu_name: "コーン", category: "トッピング", calories: 25, protein: 0.8, fat: 0.5, carb: 5.3, sodium: 0.2, allergens: [] },
  { menu_id: "cocoichi-topping-036", menu_name: "ツナ", category: "トッピング", calories: 98, protein: 9.3, fat: 6.5, carb: 1.2, sodium: 0.4, allergens: [] },
  { menu_id: "cocoichi-topping-037", menu_name: "旨辛にんにく", category: "トッピング", calories: 115, protein: 2.4, fat: 7.6, carb: 9.4, sodium: 0.6, allergens: [] },
  { menu_id: "cocoichi-topping-038", menu_name: "とろ～りたまフライ", category: "トッピング", calories: 190, protein: 4.4, fat: 11.6, carb: 16.9, sodium: 0.6, allergens: [] },

  // ========== ドリンク・スープ ==========
  { menu_id: "cocoichi-drink-001", menu_name: "アイスミルク", category: "ドリンク・スープ", calories: 102, protein: 5.1, fat: 5.9, carb: 7.1, sodium: 0.2, allergens: [] },
  { menu_id: "cocoichi-drink-002", menu_name: "オレンジドリンク", category: "ドリンク・スープ", calories: 72, protein: 0.2, fat: 0.0, carb: 17.9, sodium: 0.0, allergens: [] },
  { menu_id: "cocoichi-drink-003", menu_name: "コカ・コーラ", category: "ドリンク・スープ", calories: 69, protein: 0.0, fat: 0.0, carb: 17.3, sodium: 0.0, allergens: [] },
  { menu_id: "cocoichi-drink-004", menu_name: "アイスカフェ・オ・レ", category: "ドリンク・スープ", calories: 37, protein: 1.8, fat: 2.0, carb: 2.9, sodium: 0.1, allergens: [] },
  { menu_id: "cocoichi-drink-005", menu_name: "アイスコーヒー", category: "ドリンク・スープ", calories: 4, protein: 0.2, fat: 0.0, carb: 0.8, sodium: 0.1, allergens: [] },
  { menu_id: "cocoichi-drink-006", menu_name: "ラッシー（プレーン）", category: "ドリンク・スープ", calories: 111, protein: 4.4, fat: 5.1, carb: 11.8, sodium: 0.3, allergens: [] },
  { menu_id: "cocoichi-drink-007", menu_name: "ビッグドリンク(コカ・コーラ)", category: "ドリンク・スープ", calories: 138, protein: 0.0, fat: 0.0, carb: 34.6, sodium: 0.0, allergens: [] },
  { menu_id: "cocoichi-drink-008", menu_name: "ビッグドリンク(アイスミルク)", category: "ドリンク・スープ", calories: 204, protein: 10.2, fat: 11.8, carb: 14.2, sodium: 0.3, allergens: [] },
  { menu_id: "cocoichi-drink-009", menu_name: "ビッグドリンク(オレンジドリンク)", category: "ドリンク・スープ", calories: 144, protein: 0.4, fat: 0.0, carb: 35.8, sodium: 0.1, allergens: [] },
  { menu_id: "cocoichi-drink-010", menu_name: "コーンスープ", category: "ドリンク・スープ", calories: 112, protein: 3.7, fat: 4.4, carb: 15.2, sodium: 1.0, allergens: [] },
  { menu_id: "cocoichi-drink-011", menu_name: "ホットコーヒー", category: "ドリンク・スープ", calories: 5, protein: 0.3, fat: 0.0, carb: 0.9, sodium: 0.0, allergens: [] },

  // ========== デザート ==========
  { menu_id: "cocoichi-dessert-001", menu_name: "濃厚バニラアイスクリーム", category: "デザート", calories: 182, protein: 3.3, fat: 12.5, carb: 14.0, sodium: 0.1, allergens: [] },

  // ========== その他 ==========
  { menu_id: "cocoichi-etc-001", menu_name: "フライドポテト", category: "その他", calories: 279, protein: 3.5, fat: 15.6, carb: 34.1, sodium: 0.7, allergens: [] },
  { menu_id: "cocoichi-etc-002", menu_name: "フライドポテト（大盛）", category: "その他", calories: 559, protein: 7.0, fat: 31.2, carb: 68.1, sodium: 1.3, allergens: [] },
  { menu_id: "cocoichi-etc-003", menu_name: "ココロッケ", category: "その他", calories: 254, protein: 4.7, fat: 15.2, carb: 24.2, sodium: 0.6, allergens: [] },
  { menu_id: "cocoichi-etc-004", menu_name: "ハリケーンポテト", category: "その他", calories: 95, protein: 1.6, fat: 3.6, carb: 14.0, sodium: 0.7, allergens: [] },
  { menu_id: "cocoichi-etc-005", menu_name: "ライス（150g）", category: "その他", calories: 234, protein: 3.8, fat: 0.5, carb: 55.7, sodium: 0.0, allergens: [] },
  { menu_id: "cocoichi-etc-006", menu_name: "生タマゴ", category: "その他", calories: 75, protein: 6.8, fat: 5.1, carb: 0.4, sodium: 0.2, allergens: [] },
  { menu_id: "cocoichi-etc-007", menu_name: "ナン", category: "その他", calories: 241, protein: 8.1, fat: 2.3, carb: 49.1, sodium: 1.3, allergens: [] },
  { menu_id: "cocoichi-etc-008", menu_name: "CoCo de チキン", category: "その他", calories: 356, protein: 15.0, fat: 23.7, carb: 21.4, sodium: 2.3, allergens: [] },
];
