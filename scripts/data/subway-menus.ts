// サブウェイメニューデータ（2026年1月30日更新版PDFより）
// アレルゲン情報は公式PDFに記載がないため空配列

export interface SubwayMenuItem {
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

export const subwayMenuData: SubwayMenuItem[] = [
  // ========== 期間限定メニュー（サンドイッチ） ==========
  { menu_id: "subway-limited-001", menu_name: "カリとろチーズバジルチキン", category: "期間限定メニュー", calories: 337, protein: 23.0, fat: 10.9, carb: 38.0, sodium: 2.6, allergens: [] },
  { menu_id: "subway-limited-002", menu_name: "カリとろチーズガリトマチキン", category: "期間限定メニュー", calories: 329, protein: 23.2, fat: 8.6, carb: 41.1, sodium: 3.4, allergens: [] },
  { menu_id: "subway-limited-003", menu_name: "カリとろチーズBLT", category: "期間限定メニュー", calories: 349, protein: 13.3, fat: 16.6, carb: 37.9, sodium: 2.3, allergens: [] },
  { menu_id: "subway-limited-004", menu_name: "恵方サブ", category: "期間限定メニュー", calories: 631, protein: 29.4, fat: 22.3, carb: 79.7, sodium: 4.6, allergens: [] },

  // ========== サンドイッチ ==========
  { menu_id: "subway-sandwich-001", menu_name: "ツナ", category: "サンドイッチ", calories: 350, protein: 14.6, fat: 15.7, carb: 38.9, sodium: 1.9, allergens: [] },
  { menu_id: "subway-sandwich-002", menu_name: "生ハム＆マスカルポーネ", category: "サンドイッチ", calories: 326, protein: 15.5, fat: 11.2, carb: 42.3, sodium: 2.5, allergens: [] },
  { menu_id: "subway-sandwich-003", menu_name: "えびアボカド", category: "サンドイッチ", calories: 319, protein: 11.9, fat: 12.2, carb: 41.1, sodium: 1.7, allergens: [] },
  { menu_id: "subway-sandwich-004", menu_name: "BLT", category: "サンドイッチ", calories: 335, protein: 11.3, fat: 14.2, carb: 41.9, sodium: 1.9, allergens: [] },
  { menu_id: "subway-sandwich-005", menu_name: "ローストビーフ", category: "サンドイッチ", calories: 309, protein: 16.2, fat: 9.5, carb: 40.0, sodium: 2.4, allergens: [] },
  { menu_id: "subway-sandwich-006", menu_name: "てり焼きチキン～焦がし醬油仕立て～", category: "サンドイッチ", calories: 346, protein: 19.7, fat: 9.9, carb: 45.5, sodium: 2.7, allergens: [] },
  { menu_id: "subway-sandwich-007", menu_name: "たまご", category: "サンドイッチ", calories: 318, protein: 11.7, fat: 13.0, carb: 39.6, sodium: 2.5, allergens: [] },
  { menu_id: "subway-sandwich-008", menu_name: "アボカドベジー", category: "サンドイッチ", calories: 295, protein: 8.4, fat: 9.8, carb: 44.8, sodium: 1.6, allergens: [] },
  { menu_id: "subway-sandwich-009", menu_name: "ベジーデライト", category: "サンドイッチ", calories: 215, protein: 7.2, fat: 4.4, carb: 38.0, sodium: 1.5, allergens: [] },
  { menu_id: "subway-sandwich-010", menu_name: "チリチキン", category: "サンドイッチ", calories: 273, protein: 20.5, fat: 4.1, carb: 39.7, sodium: 2.6, allergens: [] },
  { menu_id: "subway-sandwich-011", menu_name: "えびたま", category: "サンドイッチ", calories: 321, protein: 13.1, fat: 12.8, carb: 39.3, sodium: 1.9, allergens: [] },
  { menu_id: "subway-sandwich-012", menu_name: "サラダチキン（ハニーマスタードソース）", category: "サンドイッチ", calories: 281, protein: 21.2, fat: 2.8, carb: 44.1, sodium: 2.2, allergens: [] },
  { menu_id: "subway-sandwich-013", menu_name: "チーズサラダチキン", category: "サンドイッチ", calories: 331, protein: 22.7, fat: 8.8, carb: 41.8, sodium: 2.3, allergens: [] },
  { menu_id: "subway-sandwich-014", menu_name: "贅沢てりたまチキン", category: "サンドイッチ", calories: 449, protein: 24.1, fat: 19.5, carb: 45.5, sodium: 3.2, allergens: [] },
  { menu_id: "subway-sandwich-015", menu_name: "スパイシークラブハウス", category: "サンドイッチ", calories: 396, protein: 25.4, fat: 12.6, carb: 46.6, sodium: 3.5, allergens: [] },
  { menu_id: "subway-sandwich-016", menu_name: "アボカドチキン", category: "サンドイッチ", calories: 373, protein: 21.7, fat: 12.6, carb: 44.3, sodium: 2.3, allergens: [] },
  { menu_id: "subway-sandwich-017", menu_name: "ピザ ベーコン・イタリアーナ", category: "サンドイッチ", calories: 458, protein: 19.5, fat: 24.3, carb: 41.5, sodium: 2.9, allergens: [] },
  { menu_id: "subway-sandwich-018", menu_name: "ピザ えびジェノベーゼ", category: "サンドイッチ", calories: 414, protein: 19.4, fat: 20.0, carb: 39.9, sodium: 2.4, allergens: [] },
  { menu_id: "subway-sandwich-019", menu_name: "ハム", category: "サンドイッチ", calories: 260, protein: 12.4, fat: 6.4, carb: 40.0, sodium: 2.1, allergens: [] },
  { menu_id: "subway-sandwich-020", menu_name: "贅沢てりたま", category: "サンドイッチ", calories: 449, protein: 19.9, fat: 20.4, carb: 46.8, sodium: 3.2, allergens: [] },
  { menu_id: "subway-sandwich-021", menu_name: "アメリカンクラブハウス", category: "サンドイッチ", calories: 349, protein: 21.0, fat: 11.3, carb: 42.8, sodium: 3.1, allergens: [] },

  // ========== サラダ ==========
  { menu_id: "subway-salad-001", menu_name: "ツナ（サラダ）", category: "サラダ", calories: 169, protein: 8.3, fat: 11.6, carb: 9.6, sodium: 0.9, allergens: [] },
  { menu_id: "subway-salad-002", menu_name: "生ハム＆マスカルポーネ（サラダ）", category: "サラダ", calories: 129, protein: 9.1, fat: 7.0, carb: 9.0, sodium: 1.4, allergens: [] },
  { menu_id: "subway-salad-003", menu_name: "えびアボカド（サラダ）", category: "サラダ", calories: 103, protein: 5.5, fat: 4.8, carb: 10.6, sodium: 0.3, allergens: [] },
  { menu_id: "subway-salad-004", menu_name: "BLT（サラダ）", category: "サラダ", calories: 118, protein: 6.6, fat: 6.8, carb: 8.6, sodium: 0.5, allergens: [] },
  { menu_id: "subway-salad-005", menu_name: "ローストビーフ（サラダ）", category: "サラダ", calories: 144, protein: 10.3, fat: 7.4, carb: 9.7, sodium: 1.2, allergens: [] },
  { menu_id: "subway-salad-006", menu_name: "てり焼きチキン～焦がし醬油仕立て～（サラダ）", category: "サラダ", calories: 177, protein: 14.1, fat: 6.8, carb: 16.4, sodium: 1.5, allergens: [] },
  { menu_id: "subway-salad-007", menu_name: "たまご（サラダ）", category: "サラダ", calories: 163, protein: 6.1, fat: 11.3, carb: 10.8, sodium: 1.0, allergens: [] },
  { menu_id: "subway-salad-008", menu_name: "アボカドベジー（サラダ）", category: "サラダ", calories: 87, protein: 2.0, fat: 4.7, carb: 10.6, sodium: 0.2, allergens: [] },
  { menu_id: "subway-salad-009", menu_name: "ベジーデライト（サラダ）", category: "サラダ", calories: 33, protein: 1.4, fat: 0.2, carb: 8.0, sodium: 0.0, allergens: [] },
  { menu_id: "subway-salad-010", menu_name: "チリチキン（サラダ）", category: "サラダ", calories: 104, protein: 14.9, fat: 0.9, carb: 10.5, sodium: 1.4, allergens: [] },
  { menu_id: "subway-salad-011", menu_name: "チーズオンチーズ（サラダ）", category: "サラダ", calories: 150, protein: 6.5, fat: 10.5, carb: 8.7, sodium: 0.8, allergens: [] },
  { menu_id: "subway-salad-012", menu_name: "えびたま（サラダ）", category: "サラダ", calories: 113, protein: 7.3, fat: 5.7, carb: 9.4, sodium: 0.6, allergens: [] },
  { menu_id: "subway-salad-013", menu_name: "サラダチキン（サラダ）", category: "サラダ", calories: 93, protein: 14.7, fat: 0.8, carb: 8.3, sodium: 0.8, allergens: [] },
  { menu_id: "subway-salad-014", menu_name: "チーズサラダチキン（サラダ）", category: "サラダ", calories: 158, protein: 16.4, fat: 6.9, carb: 8.9, sodium: 1.3, allergens: [] },
  { menu_id: "subway-salad-015", menu_name: "贅沢てりたまチキン（サラダ）", category: "サラダ", calories: 295, protein: 18.6, fat: 17.8, carb: 16.8, sodium: 2.2, allergens: [] },
  { menu_id: "subway-salad-016", menu_name: "スパイシークラブハウス（サラダ）", category: "サラダ", calories: 203, protein: 18.9, fat: 9.3, carb: 12.5, sodium: 2.3, allergens: [] },
  { menu_id: "subway-salad-017", menu_name: "アボカドチキン（サラダ）", category: "サラダ", calories: 147, protein: 15.3, fat: 5.3, carb: 10.9, sodium: 1.0, allergens: [] },
  { menu_id: "subway-salad-018", menu_name: "ハム（サラダ）", category: "サラダ", calories: 87, protein: 6.5, fat: 3.3, carb: 9.7, sodium: 1.0, allergens: [] },

  // ========== サイドメニュー ==========
  { menu_id: "subway-side-001", menu_name: "コロコロポテト オリジナル（S）", category: "サイドメニュー", calories: 158, protein: 2.3, fat: 5.9, carb: 23.7, sodium: 0.6, allergens: [] },
  { menu_id: "subway-side-002", menu_name: "コロコロポテト オリジナル（M）", category: "サイドメニュー", calories: 280, protein: 4.2, fat: 10.6, carb: 42.1, sodium: 1.1, allergens: [] },
  { menu_id: "subway-side-003", menu_name: "コロコロポテト ハーブソルト（S）", category: "サイドメニュー", calories: 161, protein: 2.4, fat: 6.0, carb: 24.4, sodium: 1.2, allergens: [] },
  { menu_id: "subway-side-004", menu_name: "コロコロポテト ハーブソルト（M）", category: "サイドメニュー", calories: 287, protein: 4.4, fat: 10.6, carb: 43.4, sodium: 2.3, allergens: [] },
  { menu_id: "subway-side-005", menu_name: "コロコロポテト トリプルチーズ（S）", category: "サイドメニュー", calories: 164, protein: 2.6, fat: 6.3, carb: 24.2, sodium: 0.9, allergens: [] },
  { menu_id: "subway-side-006", menu_name: "コロコロポテト トリプルチーズ（M）", category: "サイドメニュー", calories: 293, protein: 4.8, fat: 11.2, carb: 43.1, sodium: 1.6, allergens: [] },
  { menu_id: "subway-side-007", menu_name: "ゴロゴロ野菜のトマト＆クラムスープ", category: "サイドメニュー", calories: 62, protein: 3.2, fat: 1.1, carb: 9.8, sodium: 1.6, allergens: [] },
  { menu_id: "subway-side-008", menu_name: "濃厚カントリーコーンスープ", category: "サイドメニュー", calories: 124, protein: 4.6, fat: 4.0, carb: 17.6, sodium: 1.3, allergens: [] },
  { menu_id: "subway-side-009", menu_name: "サイドサラダ サラダチキン", category: "サイドメニュー", calories: 96, protein: 7.3, fat: 5.2, carb: 5.3, sodium: 0.9, allergens: [] },
  { menu_id: "subway-side-010", menu_name: "サイドサラダ たまご", category: "サイドメニュー", calories: 125, protein: 2.8, fat: 10.1, carb: 5.9, sodium: 1.0, allergens: [] },
  { menu_id: "subway-side-011", menu_name: "サイドサラダ ツナ", category: "サイドメニュー", calories: 129, protein: 4.0, fat: 10.3, carb: 5.2, sodium: 0.9, allergens: [] },
  { menu_id: "subway-side-012", menu_name: "さつまいもスープ", category: "サイドメニュー", calories: 115, protein: 1.8, fat: 2.3, carb: 22.0, sodium: 1.3, allergens: [] },
  { menu_id: "subway-side-013", menu_name: "グラスフェッドアイス はちみつ", category: "サイドメニュー", calories: 156, protein: 3.4, fat: 6.6, carb: 22.1, sodium: 0.2, allergens: [] },

  // ========== パン ==========
  { menu_id: "subway-bread-001", menu_name: "ウィート", category: "パン", calories: 180, protein: 6.4, fat: 2.1, carb: 33.8, sodium: 0.9, allergens: [] },
  { menu_id: "subway-bread-002", menu_name: "ホワイト", category: "パン", calories: 179, protein: 6.3, fat: 2.1, carb: 33.6, sodium: 0.9, allergens: [] },
  { menu_id: "subway-bread-003", menu_name: "セサミ", category: "パン", calories: 196, protein: 7.1, fat: 4.5, carb: 34.2, sodium: 0.9, allergens: [] },
  { menu_id: "subway-bread-004", menu_name: "ハニーオーツ", category: "パン", calories: 190, protein: 7.0, fat: 2.3, carb: 36.7, sodium: 0.9, allergens: [] },

  // ========== トッピング ==========
  { menu_id: "subway-topping-001", menu_name: "ナチュラルスライスチーズ", category: "トッピング", calories: 52, protein: 3.3, fat: 4.2, carb: 0.2, sodium: 0.2, allergens: [] },
  { menu_id: "subway-topping-002", menu_name: "クリームタイプチーズ", category: "トッピング", calories: 64, protein: 1.7, fat: 6.1, carb: 0.6, sodium: 0.5, allergens: [] },
  { menu_id: "subway-topping-003", menu_name: "マスカルポーネチーズ", category: "トッピング", calories: 51, protein: 0.4, fat: 5.2, carb: 0.7, sodium: 0.0, allergens: [] },
  { menu_id: "subway-topping-004", menu_name: "えび", category: "トッピング", calories: 16, protein: 3.6, fat: 0.1, carb: 0.0, sodium: 0.1, allergens: [] },
  { menu_id: "subway-topping-005", menu_name: "アボカド", category: "トッピング", calories: 53, protein: 0.6, fat: 4.5, carb: 2.6, sodium: 0.2, allergens: [] },
  { menu_id: "subway-topping-006", menu_name: "たまご", category: "トッピング", calories: 65, protein: 2.4, fat: 5.5, carb: 1.4, sodium: 0.5, allergens: [] },
  { menu_id: "subway-topping-007", menu_name: "ベーコン", category: "トッピング", calories: 61, protein: 1.9, fat: 5.9, carb: 0.1, sodium: 0.3, allergens: [] },
  { menu_id: "subway-topping-008", menu_name: "ツナ", category: "トッピング", calories: 68, protein: 3.4, fat: 5.7, carb: 0.8, sodium: 0.5, allergens: [] },
  { menu_id: "subway-topping-009", menu_name: "ローストビーフ", category: "トッピング", calories: 102, protein: 8.9, fat: 6.8, carb: 1.4, sodium: 0.7, allergens: [] },
  { menu_id: "subway-topping-010", menu_name: "生ハム", category: "トッピング", calories: 44, protein: 7.3, fat: 1.5, carb: 0.4, sodium: 1.4, allergens: [] },
  { menu_id: "subway-topping-011", menu_name: "サラダチキン", category: "トッピング", calories: 60, protein: 13.3, fat: 0.6, carb: 0.3, sodium: 0.8, allergens: [] },
  { menu_id: "subway-topping-012", menu_name: "てり焼きチキン～焦がし醬油仕立て～", category: "トッピング", calories: 130, protein: 8.4, fat: 6.8, carb: 8.0, sodium: 1.5, allergens: [] },
  { menu_id: "subway-topping-013", menu_name: "チリチキン", category: "トッピング", calories: 70, protein: 13.5, fat: 0.7, carb: 2.6, sodium: 1.4, allergens: [] },
  { menu_id: "subway-topping-014", menu_name: "サラミ風セミドライソーセージ", category: "トッピング", calories: 35, protein: 1.7, fat: 2.9, carb: 0.6, sodium: 0.3, allergens: [] },
  { menu_id: "subway-topping-015", menu_name: "シュレッドチーズミックス", category: "トッピング", calories: 46, protein: 3.5, fat: 3.6, carb: 0.1, sodium: 0.3, allergens: [] },
  { menu_id: "subway-topping-016", menu_name: "ハム", category: "トッピング", calories: 53, protein: 5.1, fat: 3.1, carb: 1.8, sodium: 1.0, allergens: [] },

  // ========== ドレッシング・ソース ==========
  { menu_id: "subway-sauce-001", menu_name: "オイル＆ビネガー 塩こしょう", category: "ドレッシング・ソース", calories: 24, protein: 0.0, fat: 2.5, carb: 0.1, sodium: 0.5, allergens: [] },
  { menu_id: "subway-sauce-002", menu_name: "シーザードレッシング", category: "ドレッシング・ソース", calories: 39, protein: 0.2, fat: 3.9, carb: 0.6, sodium: 0.3, allergens: [] },
  { menu_id: "subway-sauce-003", menu_name: "野菜クリーミードレッシング", category: "ドレッシング・ソース", calories: 35, protein: 0.1, fat: 3.2, carb: 1.3, sodium: 0.3, allergens: [] },
  { menu_id: "subway-sauce-004", menu_name: "わさび醤油ソース", category: "ドレッシング・ソース", calories: 6, protein: 0.1, fat: 0.5, carb: 0.4, sodium: 0.2, allergens: [] },
  { menu_id: "subway-sauce-005", menu_name: "バジルソース", category: "ドレッシング・ソース", calories: 24, protein: 0.1, fat: 2.4, carb: 0.4, sodium: 0.1, allergens: [] },
  { menu_id: "subway-sauce-006", menu_name: "マヨネーズタイプ", category: "ドレッシング・ソース", calories: 16, protein: 0.1, fat: 1.5, carb: 0.4, sodium: 0.2, allergens: [] },
  { menu_id: "subway-sauce-007", menu_name: "チリソース（激辛）", category: "ドレッシング・ソース", calories: 3, protein: 0.1, fat: 0.0, carb: 0.8, sodium: 0.2, allergens: [] },
  { menu_id: "subway-sauce-008", menu_name: "マスタード", category: "ドレッシング・ソース", calories: 4, protein: 0.2, fat: 0.2, carb: 0.4, sodium: 0.2, allergens: [] },
  { menu_id: "subway-sauce-009", menu_name: "チポトレソース（辛）", category: "ドレッシング・ソース", calories: 53, protein: 0.1, fat: 5.5, carb: 0.6, sodium: 0.3, allergens: [] },
  { menu_id: "subway-sauce-010", menu_name: "ハニーマスタードソース", category: "ドレッシング・ソース", calories: 14, protein: 0.2, fat: 0.2, carb: 3.0, sodium: 0.4, allergens: [] },

  // ========== モーニングメニュー ==========
  { menu_id: "subway-morning-001", menu_name: "たまご＆ハム", category: "モーニングメニュー", calories: 194, protein: 7.5, fat: 9.5, carb: 20.0, sodium: 1.6, allergens: [] },
  { menu_id: "subway-morning-002", menu_name: "たまご＆チーズ", category: "モーニングメニュー", calories: 201, protein: 7.3, fat: 10.5, carb: 19.5, sodium: 1.4, allergens: [] },
  { menu_id: "subway-morning-003", menu_name: "チーズトースト", category: "モーニングメニュー", calories: 114, protein: 4.9, fat: 3.1, carb: 17.2, sodium: 0.6, allergens: [] },

  // ========== キッズメニュー ==========
  { menu_id: "subway-kids-001", menu_name: "ハムたま", category: "キッズメニュー", calories: 174, protein: 7.4, fat: 7.9, carb: 18.7, sodium: 1.4, allergens: [] },
  { menu_id: "subway-kids-002", menu_name: "てりたま", category: "キッズメニュー", calories: 225, protein: 9.8, fat: 10.2, carb: 23.4, sodium: 1.8, allergens: [] },
  { menu_id: "subway-kids-003", menu_name: "たまご", category: "キッズメニュー", calories: 158, protein: 5.7, fat: 6.8, carb: 19.0, sodium: 1.1, allergens: [] },
  { menu_id: "subway-kids-004", menu_name: "てりチキ", category: "キッズメニュー", calories: 170, protein: 7.7, fat: 5.1, carb: 23.4, sodium: 1.3, allergens: [] },

  // ========== スイーツサンド ==========
  { menu_id: "subway-sweets-001", menu_name: "つぶあん", category: "スイーツサンド", calories: 170, protein: 5.3, fat: 2.4, carb: 32.2, sodium: 0.6, allergens: [] },
  { menu_id: "subway-sweets-002", menu_name: "あんこ＆マスカルポーネ", category: "スイーツサンド", calories: 196, protein: 5.5, fat: 5.0, carb: 32.6, sodium: 0.7, allergens: [] },

  // ========== クッキー ==========
  { menu_id: "subway-cookie-001", menu_name: "チョコチップ", category: "クッキー", calories: 208, protein: 1.9, fat: 9.8, carb: 29.2, sodium: 0.4, allergens: [] },
  { menu_id: "subway-cookie-002", menu_name: "ホワイトマカダミア", category: "クッキー", calories: 219, protein: 2.4, fat: 10.8, carb: 27.0, sodium: 0.4, allergens: [] },

  // ========== 焼き菓子 ==========
  { menu_id: "subway-baked-001", menu_name: "チーズタルト", category: "焼き菓子", calories: 145, protein: 1.2, fat: 7.5, carb: 17.0, sodium: 0.1, allergens: [] },
  { menu_id: "subway-baked-002", menu_name: "チョコブラウニー", category: "焼き菓子", calories: 143, protein: 1.9, fat: 9.0, carb: 14.2, sodium: 0.1, allergens: [] },

  // ========== コールドドリンク ==========
  { menu_id: "subway-drink-001", menu_name: "アイスコーヒー（S）", category: "コールドドリンク", calories: 8, protein: 0.4, fat: 0.0, carb: 1.5, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-002", menu_name: "アイスコーヒー（M）", category: "コールドドリンク", calories: 12, protein: 0.6, fat: 0.0, carb: 2.1, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-003", menu_name: "アイスコーヒー（L）", category: "コールドドリンク", calories: 16, protein: 0.8, fat: 0.0, carb: 2.7, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-004", menu_name: "アイスカフェオレ（S）", category: "コールドドリンク", calories: 76, protein: 3.8, fat: 4.1, carb: 5.8, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-005", menu_name: "アイスカフェオレ（M）", category: "コールドドリンク", calories: 108, protein: 5.4, fat: 5.9, carb: 8.3, sodium: 0.2, allergens: [] },
  { menu_id: "subway-drink-006", menu_name: "アイスカフェオレ（L）", category: "コールドドリンク", calories: 133, protein: 6.7, fat: 7.2, carb: 10.2, sodium: 0.2, allergens: [] },
  { menu_id: "subway-drink-007", menu_name: "アイスティー（S）", category: "コールドドリンク", calories: 6, protein: 0.1, fat: 0.0, carb: 1.4, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-008", menu_name: "アイスティー（M）", category: "コールドドリンク", calories: 8, protein: 0.1, fat: 0.0, carb: 2.1, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-009", menu_name: "アイスティー（L）", category: "コールドドリンク", calories: 10, protein: 0.1, fat: 0.0, carb: 2.7, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-010", menu_name: "オレンジジュース（S）", category: "コールドドリンク", calories: 92, protein: 1.5, fat: 0.0, carb: 21.3, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-011", menu_name: "オレンジジュース（M）", category: "コールドドリンク", calories: 132, protein: 2.1, fat: 0.0, carb: 30.5, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-012", menu_name: "オレンジジュース（L）", category: "コールドドリンク", calories: 172, protein: 2.7, fat: 0.0, carb: 39.8, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-013", menu_name: "野菜と果物のジュース（S）", category: "コールドドリンク", calories: 94, protein: 1.3, fat: 0.4, carb: 21.1, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-014", menu_name: "野菜と果物のジュース（M）", category: "コールドドリンク", calories: 135, protein: 1.8, fat: 0.6, carb: 30.2, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-015", menu_name: "野菜と果物のジュース（L）", category: "コールドドリンク", calories: 176, protein: 2.3, fat: 0.8, carb: 39.4, sodium: 0.2, allergens: [] },
  { menu_id: "subway-drink-016", menu_name: "アイスミルク（S）", category: "コールドドリンク", calories: 142, protein: 7.1, fat: 8.2, carb: 9.8, sodium: 0.2, allergens: [] },
  { menu_id: "subway-drink-017", menu_name: "アイスミルク（M）", category: "コールドドリンク", calories: 203, protein: 10.2, fat: 11.7, carb: 14.1, sodium: 0.3, allergens: [] },
  { menu_id: "subway-drink-018", menu_name: "アイスミルク（L）", category: "コールドドリンク", calories: 265, protein: 13.3, fat: 15.2, carb: 18.3, sodium: 0.4, allergens: [] },
  { menu_id: "subway-drink-019", menu_name: "アイスウーロン茶（S）", category: "コールドドリンク", calories: 1, protein: 0.0, fat: 0.0, carb: 0.3, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-020", menu_name: "アイスウーロン茶（M）", category: "コールドドリンク", calories: 1, protein: 0.1, fat: 0.0, carb: 0.4, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-021", menu_name: "アイスウーロン茶（L）", category: "コールドドリンク", calories: 2, protein: 0.1, fat: 0.0, carb: 0.5, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-022", menu_name: "メロンソーダ（S）", category: "コールドドリンク", calories: 79, protein: 0.0, fat: 0.0, carb: 19.9, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-023", menu_name: "メロンソーダ（M）", category: "コールドドリンク", calories: 114, protein: 0.0, fat: 0.0, carb: 28.4, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-024", menu_name: "メロンソーダ（L）", category: "コールドドリンク", calories: 148, protein: 0.0, fat: 0.0, carb: 37.1, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-025", menu_name: "ジンジャーエール（S）", category: "コールドドリンク", calories: 70, protein: 0.0, fat: 0.0, carb: 17.5, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-026", menu_name: "ジンジャーエール（M）", category: "コールドドリンク", calories: 100, protein: 0.0, fat: 0.0, carb: 24.9, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-027", menu_name: "ジンジャーエール（L）", category: "コールドドリンク", calories: 130, protein: 0.0, fat: 0.0, carb: 32.6, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-028", menu_name: "ペプシコーラ（S）", category: "コールドドリンク", calories: 79, protein: 0.1, fat: 0.0, carb: 19.8, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-029", menu_name: "ペプシコーラ（M）", category: "コールドドリンク", calories: 114, protein: 0.1, fat: 0.0, carb: 28.2, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-030", menu_name: "ペプシコーラ（L）", category: "コールドドリンク", calories: 148, protein: 0.1, fat: 0.0, carb: 36.9, sodium: 0.0, allergens: [] },
  { menu_id: "subway-drink-031", menu_name: "ペプシゼロ（S）", category: "コールドドリンク", calories: 0, protein: 0.1, fat: 0.0, carb: 0.4, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-032", menu_name: "ペプシゼロ（M）", category: "コールドドリンク", calories: 0, protein: 0.1, fat: 0.0, carb: 0.5, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-033", menu_name: "ペプシゼロ（L）", category: "コールドドリンク", calories: 0, protein: 0.2, fat: 0.0, carb: 0.8, sodium: 0.2, allergens: [] },
  { menu_id: "subway-drink-034", menu_name: "アイスココア", category: "コールドドリンク", calories: 198, protein: 5.3, fat: 7.5, carb: 27.2, sodium: 0.4, allergens: [] },

  // ========== ホットドリンク ==========
  { menu_id: "subway-hot-001", menu_name: "ホットコーヒー（S）", category: "ホットドリンク", calories: 5, protein: 0.2, fat: 0.0, carb: 0.8, sodium: 0.0, allergens: [] },
  { menu_id: "subway-hot-002", menu_name: "ホットコーヒー（M）", category: "ホットドリンク", calories: 7, protein: 0.4, fat: 0.0, carb: 1.3, sodium: 0.0, allergens: [] },
  { menu_id: "subway-hot-003", menu_name: "ホットカフェラテ（S）", category: "ホットドリンク", calories: 60, protein: 3.0, fat: 3.3, carb: 4.3, sodium: 0.1, allergens: [] },
  { menu_id: "subway-hot-004", menu_name: "ホットカフェラテ（M）", category: "ホットドリンク", calories: 69, protein: 3.5, fat: 3.8, carb: 5.2, sodium: 0.1, allergens: [] },
  { menu_id: "subway-hot-005", menu_name: "ホットティー", category: "ホットドリンク", calories: 3, protein: 0.3, fat: 0.0, carb: 0.3, sodium: 0.0, allergens: [] },
  { menu_id: "subway-hot-006", menu_name: "ホットミルクティー", category: "ホットドリンク", calories: 23, protein: 1.3, fat: 1.2, carb: 1.7, sodium: 0.0, allergens: [] },
  { menu_id: "subway-hot-007", menu_name: "ハーブティー", category: "ホットドリンク", calories: 5, protein: 0.2, fat: 0.2, carb: 1.2, sodium: 0.0, allergens: [] },

  // ========== フロートドリンク ==========
  { menu_id: "subway-float-001", menu_name: "コーヒーフロート", category: "フロートドリンク", calories: 93, protein: 1.9, fat: 5.2, carb: 10.0, sodium: 0.0, allergens: [] },
  { menu_id: "subway-float-002", menu_name: "カフェオレフロート", category: "フロートドリンク", calories: 151, protein: 4.7, fat: 8.7, carb: 13.5, sodium: 0.1, allergens: [] },
  { menu_id: "subway-float-003", menu_name: "コーラフロート", category: "フロートドリンク", calories: 172, protein: 1.7, fat: 5.2, carb: 29.8, sodium: 0.0, allergens: [] },
  { menu_id: "subway-float-004", menu_name: "クリームソーダ", category: "フロートドリンク", calories: 172, protein: 1.6, fat: 5.2, carb: 30.0, sodium: 0.0, allergens: [] },
  { menu_id: "subway-float-005", menu_name: "ココアフロート", category: "フロートドリンク", calories: 286, protein: 6.9, fat: 12.6, carb: 36.2, sodium: 0.4, allergens: [] },
  { menu_id: "subway-float-006", menu_name: "オレンジフロート", category: "フロートドリンク", calories: 176, protein: 3.0, fat: 5.2, carb: 29.4, sodium: 0.0, allergens: [] },
];
