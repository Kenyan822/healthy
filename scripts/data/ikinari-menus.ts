// いきなりステーキメニューデータ（2026年1月20日版PDFより）
// アレルゲン情報は公式PDFに記載がないため空配列

export interface IkinariMenuItem {
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

export const ikinariMenuData: IkinariMenuItem[] = [
  // ========== キャンペーンメニュー（期間限定） ==========
  { menu_id: "ikinari-campaign-001", menu_name: "カイノミステーキ 150g", category: "キャンペーンメニュー", price: null, calories: 380.9, protein: 32.7, fat: 20.2, carb: 15.5, sodium: 2.8, allergens: [] },
  { menu_id: "ikinari-campaign-002", menu_name: "カイノミステーキ 200g", category: "キャンペーンメニュー", price: null, calories: 493.3, protein: 42.7, fat: 27.7, carb: 16.0, sodium: 3.3, allergens: [] },
  { menu_id: "ikinari-campaign-003", menu_name: "カイノミステーキ 300g", category: "キャンペーンメニュー", price: null, calories: 715.9, protein: 63.4, fat: 39.9, carb: 21.9, sodium: 5.4, allergens: [] },

  // ========== メインメニュー（路面・ロードサイド・商業施設内） ==========
  { menu_id: "ikinari-main-001", menu_name: "赤身！肩ロースステーキ 150g", category: "メインメニュー", price: 1450, calories: 365.9, protein: 32.2, fat: 21.9, carb: 7.1, sodium: 1.6, allergens: [] },
  { menu_id: "ikinari-main-002", menu_name: "赤身！肩ロースステーキ 200g", category: "メインメニュー", price: 1860, calories: 484.8, protein: 42.4, fat: 29.9, carb: 7.4, sodium: 2.2, allergens: [] },
  { menu_id: "ikinari-main-003", menu_name: "赤身！肩ロースステーキ 300g", category: "メインメニュー", price: 2470, calories: 695.8, protein: 62.7, fat: 43.2, carb: 7.6, sodium: 3.1, allergens: [] },
  { menu_id: "ikinari-main-004", menu_name: "赤身！肩ロースステーキ 450g", category: "メインメニュー", price: 3300, calories: 1012.2, protein: 93.2, fat: 63.2, carb: 8.0, sodium: 4.5, allergens: [] },
  { menu_id: "ikinari-main-005", menu_name: "ワイルドステーキ 150g", category: "メインメニュー", price: 1710, calories: 448.4, protein: 28.4, fat: 34.3, carb: 7.1, sodium: 1.6, allergens: [] },
  { menu_id: "ikinari-main-006", menu_name: "ワイルドステーキ 200g", category: "メインメニュー", price: 2190, calories: 594.8, protein: 37.4, fat: 46.5, carb: 7.4, sodium: 2.1, allergens: [] },
  { menu_id: "ikinari-main-007", menu_name: "ワイルドステーキ 300g", category: "メインメニュー", price: 2920, calories: 860.8, protein: 55.2, fat: 68.1, carb: 7.6, sodium: 3.0, allergens: [] },
  { menu_id: "ikinari-main-008", menu_name: "ワイルドステーキ 450g", category: "メインメニュー", price: 3890, calories: 1259.7, protein: 81.9, fat: 100.5, carb: 8.0, sodium: 4.3, allergens: [] },
  { menu_id: "ikinari-main-009", menu_name: "リブロースステーキ 150g", category: "メインメニュー", price: 2200, calories: 393.1, protein: 32.8, fat: 22.6, carb: 11.7, sodium: 1.6, allergens: [] },
  { menu_id: "ikinari-main-010", menu_name: "リブロースステーキ 200g", category: "メインメニュー", price: 2940, calories: 514.0, protein: 42.9, fat: 30.8, carb: 12.0, sodium: 2.1, allergens: [] },
  { menu_id: "ikinari-main-011", menu_name: "リブロースステーキ 300g", category: "メインメニュー", price: 4410, calories: 729.0, protein: 63.2, fat: 44.6, carb: 12.2, sodium: 3.0, allergens: [] },
  { menu_id: "ikinari-main-012", menu_name: "リブロースステーキ 400g", category: "メインメニュー", price: 5880, calories: 943.9, protein: 83.4, fat: 58.3, carb: 12.5, sodium: 3.9, allergens: [] },
  { menu_id: "ikinari-main-013", menu_name: "特選ヒレステーキ 150g", category: "メインメニュー", price: 2830, calories: 316.6, protein: 34.0, fat: 14.0, carb: 11.7, sodium: 1.6, allergens: [] },
  { menu_id: "ikinari-main-014", menu_name: "特選ヒレステーキ 200g", category: "メインメニュー", price: 3770, calories: 412.0, protein: 44.5, fat: 19.4, carb: 12.0, sodium: 2.1, allergens: [] },
  { menu_id: "ikinari-main-015", menu_name: "特選ヒレステーキ 250g", category: "メインメニュー", price: 4710, calories: 494.0, protein: 55.1, fat: 23.5, carb: 12.1, sodium: 2.6, allergens: [] },
  { menu_id: "ikinari-main-016", menu_name: "特選ヒレステーキ 300g", category: "メインメニュー", price: 5650, calories: 576.0, protein: 65.6, fat: 27.5, carb: 12.2, sodium: 3.0, allergens: [] },
  { menu_id: "ikinari-main-017", menu_name: "ヒレカットステーキ 100g", category: "メインメニュー", price: 1770, calories: 234.6, protein: 23.5, fat: 10.0, carb: 11.6, sodium: 1.2, allergens: [] },
  { menu_id: "ikinari-main-018", menu_name: "ヒレカットステーキ 150g", category: "メインメニュー", price: 2660, calories: 316.6, protein: 34.0, fat: 14.0, carb: 11.7, sodium: 1.6, allergens: [] },
  { menu_id: "ikinari-main-019", menu_name: "ワイルドハンバーグ 150g", category: "メインメニュー", price: 1220, calories: 503.9, protein: 22.3, fat: 39.6, carb: 15.1, sodium: 1.9, allergens: [] },
  { menu_id: "ikinari-main-020", menu_name: "ワイルドハンバーグ 200g", category: "メインメニュー", price: 1350, calories: 668.8, protein: 29.2, fat: 53.5, carb: 18.0, sodium: 2.5, allergens: [] },
  { menu_id: "ikinari-main-021", menu_name: "ワイルドハンバーグ 300g", category: "メインメニュー", price: 1600, calories: 971.8, protein: 42.9, fat: 78.6, carb: 23.5, sodium: 3.6, allergens: [] },
  { menu_id: "ikinari-main-022", menu_name: "ワイルドコンボ 180g（ランチのみ）", category: "メインメニュー", price: null, calories: 578.6, protein: 29.7, fat: 45.7, carb: 12.6, sodium: 2.1, allergens: [] },
  { menu_id: "ikinari-main-023", menu_name: "ワイルドコンボ 250g", category: "メインメニュー", price: 1830, calories: 783.3, protein: 40.1, fat: 62.6, carb: 15.5, sodium: 2.8, allergens: [] },
  { menu_id: "ikinari-main-024", menu_name: "ワイルドコンボ 300g", category: "メインメニュー", price: 2250, calories: 916.3, protein: 49.0, fat: 73.4, carb: 15.6, sodium: 3.3, allergens: [] },
  { menu_id: "ikinari-main-025", menu_name: "ワイルドコンボ 450g", category: "メインメニュー", price: 3090, calories: 1328.6, protein: 75.8, fat: 107.2, carb: 16.1, sodium: 4.7, allergens: [] },
  { menu_id: "ikinari-main-026", menu_name: "乱切りカットステーキ 120g", category: "メインメニュー", price: 1830, calories: 327.4, protein: 26.3, fat: 19.0, carb: 11.7, sodium: 1.3, allergens: [] },
  { menu_id: "ikinari-main-027", menu_name: "乱切りカットステーキ 160g", category: "メインメニュー", price: 2250, calories: 413.0, protein: 34.2, fat: 24.7, carb: 11.8, sodium: 1.7, allergens: [] },
  { menu_id: "ikinari-main-028", menu_name: "乱切りカットステーキ 200g", category: "メインメニュー", price: 2680, calories: 512.0, protein: 42.2, fat: 31.7, carb: 12.0, sodium: 2.1, allergens: [] },
  { menu_id: "ikinari-main-029", menu_name: "乱切りカットステーキ 240g", category: "メインメニュー", price: 3110, calories: 597.6, protein: 50.1, fat: 37.4, carb: 12.1, sodium: 2.5, allergens: [] },
  { menu_id: "ikinari-main-030", menu_name: "グリルチキンステーキ 220g", category: "メインメニュー", price: 1170, calories: 397.2, protein: 36.5, fat: 22.7, carb: 12.3, sodium: 4.0, allergens: [] },
  { menu_id: "ikinari-main-031", menu_name: "グリルチキンステーキ 440g", category: "メインメニュー", price: 1840, calories: 758.3, protein: 71.4, fat: 44.9, carb: 18.0, sodium: 7.8, allergens: [] },
  { menu_id: "ikinari-main-032", menu_name: "ステーキ重", category: "メインメニュー", price: 1740, calories: 780.6, protein: 34.0, fat: 33.6, carb: 88.6, sodium: 2.7, allergens: [] },
  { menu_id: "ikinari-main-033", menu_name: "ヒレステーキ重", category: "メインメニュー", price: 2040, calories: 544.3, protein: 28.2, fat: 9.2, carb: 88.2, sodium: 2.2, allergens: [] },

  // ========== メインメニュー（フードコート） ==========
  { menu_id: "ikinari-fc-001", menu_name: "赤身！肩ロースステーキ 130g（FC）", category: "メインメニュー（フードコート）", price: 1300, calories: 323.7, protein: 28.1, fat: 19.2, carb: 7.1, sodium: 1.5, allergens: [] },
  { menu_id: "ikinari-fc-002", menu_name: "赤身！肩ロースステーキ 180g（FC）", category: "メインメニュー（フードコート）", price: 1660, calories: 429.2, protein: 38.3, fat: 25.8, carb: 7.2, sodium: 1.9, allergens: [] },
  { menu_id: "ikinari-fc-003", menu_name: "赤身！肩ロースステーキ 230g（FC）", category: "メインメニュー（フードコート）", price: 2000, calories: 548.1, protein: 48.5, fat: 33.9, carb: 7.5, sodium: 2.4, allergens: [] },
  { menu_id: "ikinari-fc-004", menu_name: "赤身！肩ロースステーキ 280g（FC）", category: "メインメニュー（フードコート）", price: 2240, calories: 653.6, protein: 58.6, fat: 40.6, carb: 7.6, sodium: 2.9, allergens: [] },
  { menu_id: "ikinari-fc-005", menu_name: "赤身！肩ロースステーキ 430g（FC）", category: "メインメニュー（フードコート）", price: 2950, calories: 970.0, protein: 89.1, fat: 60.5, carb: 7.9, sodium: 4.3, allergens: [] },
  { menu_id: "ikinari-fc-006", menu_name: "ワイルドステーキ 130g（FC）", category: "メインメニュー（フードコート）", price: 1470, calories: 395.2, protein: 24.8, fat: 30.0, carb: 7.1, sodium: 1.4, allergens: [] },
  { menu_id: "ikinari-fc-007", menu_name: "ワイルドステーキ 180g（FC）", category: "メインメニュー（フードコート）", price: 1900, calories: 528.2, protein: 33.8, fat: 40.8, carb: 7.2, sodium: 1.9, allergens: [] },
  { menu_id: "ikinari-fc-008", menu_name: "ワイルドステーキ 230g（FC）", category: "メインメニュー（フードコート）", price: 2280, calories: 674.6, protein: 42.7, fat: 53.0, carb: 7.5, sodium: 2.3, allergens: [] },
  { menu_id: "ikinari-fc-009", menu_name: "ワイルドステーキ 280g（FC）", category: "メインメニュー（フードコート）", price: 2570, calories: 794.2, protein: 51.6, fat: 62.4, carb: 7.4, sodium: 2.7, allergens: [] },
  { menu_id: "ikinari-fc-010", menu_name: "ワイルドステーキ 430g（FC）", category: "メインメニュー（フードコート）", price: 3470, calories: 1206.5, protein: 78.4, fat: 96.2, carb: 7.9, sodium: 4.1, allergens: [] },
  { menu_id: "ikinari-fc-011", menu_name: "リブロースステーキ 100g（FC）", category: "メインメニュー（フードコート）", price: 1360, calories: 285.6, protein: 22.7, fat: 15.7, carb: 11.6, sodium: 1.1, allergens: [] },
  { menu_id: "ikinari-fc-012", menu_name: "リブロースステーキ 150g（FC）", category: "メインメニュー（フードコート）", price: 2040, calories: 393.1, protein: 32.8, fat: 22.6, carb: 11.7, sodium: 1.6, allergens: [] },
  { menu_id: "ikinari-fc-013", menu_name: "リブロースステーキ 200g（FC）", category: "メインメニュー（フードコート）", price: 2720, calories: 514.0, protein: 42.9, fat: 30.8, carb: 12.0, sodium: 2.1, allergens: [] },
  { menu_id: "ikinari-fc-014", menu_name: "特選ヒレステーキ 100g（FC）", category: "メインメニュー（フードコート）", price: 1890, calories: 234.6, protein: 23.5, fat: 10.0, carb: 11.6, sodium: 1.2, allergens: [] },
  { menu_id: "ikinari-fc-015", menu_name: "特選ヒレステーキ 150g（FC）", category: "メインメニュー（フードコート）", price: 2830, calories: 316.6, protein: 34.0, fat: 14.0, carb: 11.7, sodium: 1.6, allergens: [] },
  { menu_id: "ikinari-fc-016", menu_name: "ヒレカットステーキ 100g（FC）", category: "メインメニュー（フードコート）", price: 1770, calories: 234.6, protein: 23.5, fat: 10.0, carb: 11.6, sodium: 1.2, allergens: [] },
  { menu_id: "ikinari-fc-017", menu_name: "ヒレカットステーキ 150g（FC）", category: "メインメニュー（フードコート）", price: 2660, calories: 316.6, protein: 34.0, fat: 14.0, carb: 11.7, sodium: 1.6, allergens: [] },
  { menu_id: "ikinari-fc-018", menu_name: "ワイルドハンバーグ 150g（FC）", category: "メインメニュー（フードコート）", price: 1220, calories: 503.9, protein: 22.3, fat: 39.6, carb: 15.1, sodium: 1.9, allergens: [] },
  { menu_id: "ikinari-fc-019", menu_name: "ワイルドハンバーグ 200g（FC）", category: "メインメニュー（フードコート）", price: 1350, calories: 668.8, protein: 29.2, fat: 53.5, carb: 18.0, sodium: 2.5, allergens: [] },
  { menu_id: "ikinari-fc-020", menu_name: "ワイルドハンバーグ 300g（FC）", category: "メインメニュー（フードコート）", price: 1600, calories: 971.8, protein: 42.9, fat: 78.6, carb: 23.5, sodium: 3.6, allergens: [] },
  { menu_id: "ikinari-fc-021", menu_name: "ワイルドコンボ 160g（FC）", category: "メインメニュー（フードコート）", price: 1350, calories: 525.4, protein: 26.1, fat: 41.4, carb: 12.6, sodium: 1.9, allergens: [] },
  { menu_id: "ikinari-fc-022", menu_name: "ワイルドコンボ 230g（FC）", category: "メインメニュー（フードコート）", price: 1720, calories: 730.1, protein: 36.6, fat: 58.2, carb: 15.4, sodium: 2.7, allergens: [] },
  { menu_id: "ikinari-fc-023", menu_name: "ワイルドコンボ 250g（FC）", category: "メインメニュー（フードコート）", price: 1830, calories: 783.3, protein: 40.1, fat: 62.6, carb: 15.5, sodium: 2.8, allergens: [] },
  { menu_id: "ikinari-fc-024", menu_name: "乱切りカットステーキ 120g（FC）", category: "メインメニュー（フードコート）", price: 1830, calories: 327.4, protein: 26.3, fat: 19.0, carb: 11.7, sodium: 1.3, allergens: [] },
  { menu_id: "ikinari-fc-025", menu_name: "乱切りカットステーキ 160g（FC）", category: "メインメニュー（フードコート）", price: 2250, calories: 413.0, protein: 34.2, fat: 24.7, carb: 11.8, sodium: 1.7, allergens: [] },
  { menu_id: "ikinari-fc-026", menu_name: "グリルチキンステーキ 220g（FC）", category: "メインメニュー（フードコート）", price: 1170, calories: 397.2, protein: 36.5, fat: 22.7, carb: 12.3, sodium: 4.0, allergens: [] },
  { menu_id: "ikinari-fc-027", menu_name: "グリルチキンステーキ 440g（FC）", category: "メインメニュー（フードコート）", price: 1840, calories: 758.3, protein: 71.4, fat: 44.9, carb: 18.0, sodium: 7.8, allergens: [] },
  { menu_id: "ikinari-fc-028", menu_name: "ステーキ重（FC）", category: "メインメニュー（フードコート）", price: 1740, calories: 780.6, protein: 34.0, fat: 33.6, carb: 88.6, sodium: 2.7, allergens: [] },
  { menu_id: "ikinari-fc-029", menu_name: "ヒレステーキ重（FC）", category: "メインメニュー（フードコート）", price: 2040, calories: 544.3, protein: 28.2, fat: 9.2, carb: 88.2, sodium: 2.2, allergens: [] },

  // ========== サイドメニュー ==========
  { menu_id: "ikinari-side-001", menu_name: "ミニカレーライスセット", category: "サイドメニュー", price: 760, calories: 549.0, protein: 10.2, fat: 11.1, carb: 106.0, sodium: 2.8, allergens: [] },
  { menu_id: "ikinari-side-002", menu_name: "いきなりセット（ライス・サラダ・スープ）", category: "サイドメニュー", price: 520, calories: 413.8, protein: 7.6, fat: 1.6, carb: 96.0, sodium: 1.2, allergens: [] },
  { menu_id: "ikinari-side-003", menu_name: "ライス・サラダセット", category: "サイドメニュー", price: 510, calories: 397.3, protein: 6.6, fat: 0.8, carb: 94.6, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-side-004", menu_name: "ライス・スープセット", category: "サイドメニュー", price: 510, calories: 406.5, protein: 7.3, fat: 1.6, carb: 94.1, sodium: 1.2, allergens: [] },
  { menu_id: "ikinari-side-005", menu_name: "ライス（少なめ）", category: "サイドメニュー", price: null, calories: 109.2, protein: 1.8, fat: 0.2, carb: 26.0, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-side-006", menu_name: "ライス（普通盛）", category: "サイドメニュー", price: 330, calories: 249.6, protein: 4.0, fat: 0.5, carb: 59.4, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-side-007", menu_name: "ライス（大盛）", category: "サイドメニュー", price: null, calories: 390.0, protein: 6.3, fat: 0.8, carb: 92.8, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-side-008", menu_name: "サラダ", category: "サイドメニュー", price: 260, calories: 7.3, protein: 0.3, fat: 0.1, carb: 1.9, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-side-009", menu_name: "特製スープ", category: "サイドメニュー", price: 230, calories: 16.5, protein: 1.0, fat: 0.8, carb: 1.3, sodium: 1.2, allergens: [] },

  // ========== トッピング ==========
  { menu_id: "ikinari-topping-001", menu_name: "ハンバーグ 100g", category: "トッピング", price: 480, calories: 316.4, protein: 13.8, fat: 26.5, carb: 5.7, sodium: 1.1, allergens: [] },
  { menu_id: "ikinari-topping-002", menu_name: "ハンバーグ 150g", category: "トッピング", price: 710, calories: 467.9, protein: 20.6, fat: 39.1, carb: 8.5, sodium: 1.7, allergens: [] },
  { menu_id: "ikinari-topping-003", menu_name: "ブロッコリー", category: "トッピング", price: 150, calories: 18.0, protein: 2.3, fat: 0.2, carb: 3.1, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-topping-004", menu_name: "オニオンスライス", category: "トッピング", price: 150, calories: 19.8, protein: 0.6, fat: 0.1, carb: 5.0, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-topping-005", menu_name: "キャロット", category: "トッピング", price: 150, calories: 31.2, protein: 0.6, fat: 0.0, carb: 6.0, sodium: 0.1, allergens: [] },
  { menu_id: "ikinari-topping-006", menu_name: "コーン", category: "トッピング", price: 150, calories: 49.7, protein: 1.5, fat: 0.8, carb: 9.1, sodium: 0.4, allergens: [] },
  { menu_id: "ikinari-topping-007", menu_name: "マッシュポテト", category: "トッピング", price: 180, calories: 56.5, protein: 0.8, fat: 1.8, carb: 9.4, sodium: 0.3, allergens: [] },
  { menu_id: "ikinari-topping-008", menu_name: "オニオンソース", category: "トッピング", price: 150, calories: 36.8, protein: 1.0, fat: 0.0, carb: 7.7, sodium: 1.7, allergens: [] },
  { menu_id: "ikinari-topping-009", menu_name: "和風おろしポン酢ソース", category: "トッピング", price: 150, calories: 26.5, protein: 1.0, fat: 0.1, carb: 6.8, sodium: 1.5, allergens: [] },
  { menu_id: "ikinari-topping-010", menu_name: "チーズソース", category: "トッピング", price: 180, calories: 112.4, protein: 5.2, fat: 9.9, carb: 0.7, sodium: 1.1, allergens: [] },
  { menu_id: "ikinari-topping-011", menu_name: "カレールー", category: "トッピング", price: 270, calories: 135.2, protein: 2.6, fat: 9.4, carb: 10.0, sodium: 1.6, allergens: [] },

  // ========== 調味料 ==========
  { menu_id: "ikinari-sauce-001", menu_name: "オリジナルステーキソース 30cc", category: "調味料", price: null, calories: 24.0, protein: 1.9, fat: 0.0, carb: 3.4, sodium: 2.1, allergens: [] },
  { menu_id: "ikinari-sauce-002", menu_name: "いきなりソース 30cc", category: "調味料", price: null, calories: 39.3, protein: 1.4, fat: 0.2, carb: 7.9, sodium: 2.1, allergens: [] },
  { menu_id: "ikinari-sauce-003", menu_name: "ゆず醤油ソース 30g", category: "調味料", price: null, calories: 26.4, protein: 0.8, fat: 0.2, carb: 5.1, sodium: 1.3, allergens: [] },
  { menu_id: "ikinari-sauce-004", menu_name: "いきなり！スパイス 10g", category: "調味料", price: null, calories: 14.6, protein: 1.2, fat: 0.2, carb: 2.1, sodium: 5.9, allergens: [] },
  { menu_id: "ikinari-sauce-005", menu_name: "玉ねぎドレッシング 10cc", category: "調味料", price: null, calories: 24.2, protein: 0.0, fat: 1.8, carb: 1.9, sodium: 0.4, allergens: [] },
  { menu_id: "ikinari-sauce-006", menu_name: "和風ドレッシング 10cc", category: "調味料", price: null, calories: 14.5, protein: 0.3, fat: 1.3, carb: 0.5, sodium: 0.4, allergens: [] },
  { menu_id: "ikinari-sauce-007", menu_name: "おろしニンニク 10g", category: "調味料", price: null, calories: 9.2, protein: 0.4, fat: 0.0, carb: 1.9, sodium: 0.2, allergens: [] },
  { menu_id: "ikinari-sauce-008", menu_name: "わさび 10g", category: "調味料", price: null, calories: 14.2, protein: 0.5, fat: 0.1, carb: 2.9, sodium: 0.4, allergens: [] },
  { menu_id: "ikinari-sauce-009", menu_name: "マスタード 10g", category: "調味料", price: null, calories: 14.6, protein: 0.5, fat: 0.5, carb: 2.1, sodium: 0.3, allergens: [] },
  { menu_id: "ikinari-sauce-010", menu_name: "タバスコ 10cc", category: "調味料", price: null, calories: 1.6, protein: 0.1, fat: 0.1, carb: 0.2, sodium: 0.2, allergens: [] },
  { menu_id: "ikinari-sauce-011", menu_name: "醤油 10cc", category: "調味料", price: null, calories: 7.2, protein: 0.8, fat: 0.0, carb: 0.9, sodium: 1.4, allergens: [] },
  { menu_id: "ikinari-sauce-012", menu_name: "ペッパーペースト 5g", category: "調味料", price: null, calories: 26.8, protein: 0.1, fat: 2.8, carb: 0.3, sodium: 0.1, allergens: [] },

  // ========== ドリンク ==========
  { menu_id: "ikinari-drink-001", menu_name: "コカ・コーラ", category: "ドリンク", price: 190, calories: 112.5, protein: 0.0, fat: 0.0, carb: 28.3, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-drink-002", menu_name: "オレンジドリンク", category: "ドリンク", price: 240, calories: 66.0, protein: 0.0, fat: 0.0, carb: 17.4, sodium: 0.1, allergens: [] },
  { menu_id: "ikinari-drink-003", menu_name: "カルピスウォーター", category: "ドリンク", price: 300, calories: 138.0, protein: 0.9, fat: 0.0, carb: 33.0, sodium: 0.1, allergens: [] },
  { menu_id: "ikinari-drink-004", menu_name: "いきなりブランド黒烏龍茶", category: "ドリンク", price: 430, calories: 10.0, protein: 1.0, fat: 0.5, carb: 3.0, sodium: 0.1, allergens: [] },
  { menu_id: "ikinari-drink-005", menu_name: "サントリー黒烏龍茶", category: "ドリンク", price: 430, calories: 0.0, protein: 0.0, fat: 0.0, carb: 0.0, sodium: 0.1, allergens: [] },
  { menu_id: "ikinari-drink-006", menu_name: "レッドブル", category: "ドリンク", price: 430, calories: 117.5, protein: 0.0, fat: 0.0, carb: 27.0, sodium: 0.5, allergens: [] },
  { menu_id: "ikinari-drink-007", menu_name: "ジンジャーエール（FC）", category: "ドリンク", price: 190, calories: 70.0, protein: 0.0, fat: 0.0, carb: 17.2, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-drink-008", menu_name: "カルピスソーダ（FC）", category: "ドリンク", price: 190, calories: 72.0, protein: 0.4, fat: 0.0, carb: 17.4, sodium: 0.1, allergens: [] },
  { menu_id: "ikinari-drink-009", menu_name: "アイスティー（FC）", category: "ドリンク", price: 190, calories: 14.0, protein: 0.4, fat: 0.0, carb: 3.2, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-drink-010", menu_name: "アイスコーヒー（FC）", category: "ドリンク", price: 190, calories: 18.0, protein: 0.8, fat: 0.0, carb: 3.8, sodium: 0.1, allergens: [] },
  { menu_id: "ikinari-drink-011", menu_name: "生ビール（小）", category: "ドリンク", price: 460, calories: 72.0, protein: 0.5, fat: 0.0, carb: 5.4, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-drink-012", menu_name: "生ビール（中）", category: "ドリンク", price: 690, calories: 128.0, protein: 1.0, fat: 0.0, carb: 9.6, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-drink-013", menu_name: "ハイボール", category: "ドリンク", price: 540, calories: 75.0, protein: 0.0, fat: 0.0, carb: 0.0, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-drink-014", menu_name: "ノンアルコールビール", category: "ドリンク", price: 500, calories: 40.1, protein: 0.3, fat: 0.0, carb: 10.0, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-drink-015", menu_name: "グラスワイン", category: "ドリンク", price: 500, calories: 88.4, protein: 0.3, fat: 0.0, carb: 2.0, sodium: 0.0, allergens: [] },
  { menu_id: "ikinari-drink-016", menu_name: "ボトルワイン", category: "ドリンク", price: 2350, calories: 510.0, protein: 1.5, fat: 0.0, carb: 11.3, sodium: 0.0, allergens: [] },
];
