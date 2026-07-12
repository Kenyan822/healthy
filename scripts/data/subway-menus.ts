/**
 * サブウェイメニューデータ（2026-07-12 公式サイトより自動生成）
 * 自動生成ファイル - scripts/scrape/subway.ts で生成
 * sodiumは食塩相当量(g)。ドリンクの栄養値は公式掲載の単一値（サイズ別未公表）
 */

export interface SubwayMenuItem {
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

export const subwayMenuData: SubwayMenuItem[] = [
  // ========== サンドイッチ ==========
  { menu_id: "subway-sandwich-021", menu_name: "メキシカンミートタコス", price: 590, category: "サンドイッチ", calories: 368, protein: 14.3, fat: 15.5, carb: 44.9, sodium: 2.3, allergens: [] },
  { menu_id: "subway-sandwich-022", menu_name: "ざく切りサルサタコス", price: 630, category: "サンドイッチ", calories: 280, protein: 11.2, fat: 5.9, carb: 48.1, sodium: 2.1, allergens: [] },
  { menu_id: "subway-sandwich-023", menu_name: "濃厚チーズタコス", price: 650, category: "サンドイッチ", calories: 402, protein: 14.8, fat: 18.6, carb: 45.8, sodium: 2.7, allergens: [] },
  { menu_id: "subway-salad-001", menu_name: "ベジーデライト", price: 430, category: "サンドイッチ", calories: 215, protein: 7.2, fat: 4.4, carb: 38, sodium: 1.5, allergens: [] },
  { menu_id: "subway-topping-008", menu_name: "ハム", price: 480, category: "サンドイッチ", calories: 260, protein: 12.4, fat: 6.4, carb: 40, sodium: 2.1, allergens: [] },
  { menu_id: "subway-topping-003", menu_name: "たまご", price: 500, category: "サンドイッチ", calories: 318, protein: 11.7, fat: 13, carb: 39.6, sodium: 2.5, allergens: [] },
  { menu_id: "subway-topping-004", menu_name: "ツナ", price: 490, category: "サンドイッチ", calories: 350, protein: 14.6, fat: 15.7, carb: 38.9, sodium: 1.9, allergens: [] },
  { menu_id: "subway-salad-005", menu_name: "アボカドベジー", price: 520, category: "サンドイッチ", calories: 295, protein: 8.4, fat: 9.8, carb: 44.8, sodium: 1.6, allergens: [] },
  { menu_id: "subway-topping-011", menu_name: "サラダチキン", price: 550, category: "サンドイッチ", calories: 281, protein: 21.2, fat: 2.8, carb: 44.1, sodium: 2.2, allergens: [] },
  { menu_id: "subway-topping-013", menu_name: "チリチキン", price: 550, category: "サンドイッチ", calories: 273, protein: 20.5, fat: 4.1, carb: 39.7, sodium: 2.6, allergens: [] },
  { menu_id: "subway-salad-008", menu_name: "BLT", price: 560, category: "サンドイッチ", calories: 335, protein: 11.3, fat: 14.2, carb: 41.9, sodium: 1.9, allergens: [] },
  { menu_id: "subway-sandwich-024", menu_name: "てり焼きチキン", price: 580, category: "サンドイッチ", calories: 346, protein: 19.7, fat: 9.9, carb: 45.5, sodium: 2.7, allergens: [] },
  { menu_id: "subway-salad-010", menu_name: "えびたま", price: 570, category: "サンドイッチ", calories: 321, protein: 13.1, fat: 12.8, carb: 39.3, sodium: 1.9, allergens: [] },
  { menu_id: "subway-sandwich-025", menu_name: "生ハムマスカルポーネ", price: 630, category: "サンドイッチ", calories: 326, protein: 15.5, fat: 11.2, carb: 42.3, sodium: 2.5, allergens: [] },
  { menu_id: "subway-salad-011", menu_name: "えびアボカド", price: 630, category: "サンドイッチ", calories: 319, protein: 11.9, fat: 12.2, carb: 41.1, sodium: 1.7, allergens: [] },
  { menu_id: "subway-salad-013", menu_name: "アボカドチキン", price: 650, category: "サンドイッチ", calories: 373, protein: 21.7, fat: 12.6, carb: 44.3, sodium: 2.3, allergens: [] },
  { menu_id: "subway-sandwich-017", menu_name: "贅沢てりたま", price: 690, category: "サンドイッチ", calories: 449, protein: 19.9, fat: 20.4, carb: 46.8, sodium: 3.2, allergens: [] },
  { menu_id: "subway-salad-014", menu_name: "スパイシークラブハウス", price: 680, category: "サンドイッチ", calories: 396, protein: 25.4, fat: 12.6, carb: 46.6, sodium: 3.5, allergens: [] },
  { menu_id: "subway-sandwich-019", menu_name: "アメリカンクラブハウス", price: 710, category: "サンドイッチ", calories: 349, protein: 21, fat: 11.3, carb: 42.8, sodium: 3.1, allergens: [] },
  { menu_id: "subway-topping-015", menu_name: "ローストビーフ", price: 790, category: "サンドイッチ", calories: 263, protein: 15.4, fat: 5, carb: 40.9, sodium: 1.9, allergens: [] },
  // ========== スナックサンド ==========
  { menu_id: "subway-snacksand-001", menu_name: "あんこ＆マスカルポーネ", price: 250, category: "スナックサンド", calories: 196, protein: 5.5, fat: 5, carb: 32.6, sodium: 0.7, allergens: [] },
  { menu_id: "subway-snacksand-002", menu_name: "つぶあん", price: 250, category: "スナックサンド", calories: 170, protein: 5.3, fat: 2.4, carb: 32.2, sodium: 0.6, allergens: [] },
  // ========== サラダ ==========
  { menu_id: "subway-salad-001", menu_name: "ベジーデライト", price: 760, category: "サラダ", calories: 33, protein: 1.4, fat: 0.2, carb: 8, sodium: 0, allergens: [] },
  { menu_id: "subway-topping-008", menu_name: "ハム", price: 810, category: "サラダ", calories: 87, protein: 6.5, fat: 3.3, carb: 9.7, sodium: 1, allergens: [] },
  { menu_id: "subway-topping-003", menu_name: "たまご", price: 830, category: "サラダ", calories: 163, protein: 6.1, fat: 11.3, carb: 10.8, sodium: 1, allergens: [] },
  { menu_id: "subway-topping-004", menu_name: "ツナ", price: 820, category: "サラダ", calories: 169, protein: 8.3, fat: 11.6, carb: 9.6, sodium: 0.9, allergens: [] },
  { menu_id: "subway-salad-005", menu_name: "アボカドベジー", price: 850, category: "サラダ", calories: 87, protein: 2, fat: 4.7, carb: 10.6, sodium: 0.2, allergens: [] },
  { menu_id: "subway-topping-011", menu_name: "サラダチキン", price: 880, category: "サラダ", calories: 93, protein: 14.7, fat: 0.8, carb: 8.3, sodium: 0.8, allergens: [] },
  { menu_id: "subway-topping-013", menu_name: "チリチキン", price: 880, category: "サラダ", calories: 104, protein: 14.9, fat: 0.9, carb: 10.5, sodium: 1.4, allergens: [] },
  { menu_id: "subway-salad-008", menu_name: "BLT", price: 890, category: "サラダ", calories: 101, protein: 3.8, fat: 8.4, carb: 3.1, sodium: 0.6, allergens: [] },
  { menu_id: "subway-salad-016", menu_name: "てり焼きチキン", price: 910, category: "サラダ", calories: 177, protein: 14.1, fat: 6.8, carb: 16.4, sodium: 1.5, allergens: [] },
  { menu_id: "subway-salad-010", menu_name: "えびたま", price: 900, category: "サラダ", calories: 113, protein: 7.3, fat: 5.7, carb: 9.4, sodium: 0.6, allergens: [] },
  { menu_id: "subway-salad-011", menu_name: "えびアボカド", price: 960, category: "サラダ", calories: 103, protein: 5.5, fat: 4.8, carb: 10.6, sodium: 0.3, allergens: [] },
  { menu_id: "subway-salad-017", menu_name: "生ハムマスカルポーネ", price: 960, category: "サラダ", calories: 129, protein: 9.1, fat: 7, carb: 9, sodium: 1.4, allergens: [] },
  { menu_id: "subway-salad-013", menu_name: "アボカドチキン", price: 980, category: "サラダ", calories: 147, protein: 15.3, fat: 5.3, carb: 10.9, sodium: 1, allergens: [] },
  { menu_id: "subway-salad-014", menu_name: "スパイシークラブハウス", price: 1010, category: "サラダ", calories: 203, protein: 18.9, fat: 9.3, carb: 12.5, sodium: 2.3, allergens: [] },
  { menu_id: "subway-topping-015", menu_name: "ローストビーフ", price: 1120, category: "サラダ", calories: 92, protein: 9.5, fat: 3.2, carb: 8, sodium: 0.5, allergens: [] },
  // ========== サイドメニュー ==========
  { menu_id: "subway-side-013", menu_name: "コロコロポテト／オリジナル", price: null, category: "サイドメニュー", calories: 158, protein: 2.3, fat: 5.9, carb: 23.7, sodium: 0.6, allergens: [] },
  { menu_id: "subway-side-014", menu_name: "コロコロポテト／ハーブソルト", price: null, category: "サイドメニュー", calories: 161, protein: 2.4, fat: 6, carb: 24.4, sodium: 1.2, allergens: [] },
  { menu_id: "subway-side-015", menu_name: "コロコロポテト／トリプルチーズ", price: null, category: "サイドメニュー", calories: 164, protein: 2.6, fat: 6.3, carb: 24.2, sodium: 0.9, allergens: [] },
  { menu_id: "subway-side-007", menu_name: "ゴロゴロ野菜のトマト＆クラムスープ", price: 420, category: "サイドメニュー", calories: 62, protein: 3.2, fat: 1.1, carb: 9.8, sodium: 1.6, allergens: [] },
  { menu_id: "subway-side-009", menu_name: "チョコチップ", price: 250, category: "サイドメニュー", calories: 208, protein: 1.9, fat: 9.8, carb: 29.2, sodium: 0.4, allergens: [] },
  { menu_id: "subway-side-010", menu_name: "ホワイトマカダミア", price: 250, category: "サイドメニュー", calories: 219, protein: 2.4, fat: 10.8, carb: 27, sodium: 0.4, allergens: [] },
  { menu_id: "subway-side-016", menu_name: "ダブルチョコ", price: 250, category: "サイドメニュー", calories: 212, protein: 2.3, fat: 10.1, carb: 28.4, sodium: 0.4, allergens: [] },
  { menu_id: "subway-side-017", menu_name: "ポテトドリンクセット", price: 390, category: "サイドメニュー", calories: 0, protein: 0, fat: 0, carb: 0, sodium: 0, allergens: [] },
  { menu_id: "subway-side-018", menu_name: "スープドリンクセット", price: 490, category: "サイドメニュー", calories: 0, protein: 0, fat: 0, carb: 0, sodium: 0, allergens: [] },
  { menu_id: "subway-side-019", menu_name: "クッキードリンクセット", price: 390, category: "サイドメニュー", calories: 0, protein: 0, fat: 0, carb: 0, sodium: 0, allergens: [] },
  // ========== ドリンク ==========
  { menu_id: "subway-drink-001-s", menu_name: "アイスコーヒー（S）", price: 270, category: "ドリンク", calories: 8, protein: 0.4, fat: 0, carb: 1.5, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-002-m", menu_name: "アイスコーヒー（M）", price: 320, category: "ドリンク", calories: 8, protein: 0.4, fat: 0, carb: 1.5, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-003-l", menu_name: "アイスコーヒー（L）", price: 370, category: "ドリンク", calories: 8, protein: 0.4, fat: 0, carb: 1.5, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-004-s", menu_name: "アイスカフェラテ（S）", price: 270, category: "ドリンク", calories: 76, protein: 3.8, fat: 4.1, carb: 5.8, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-005-m", menu_name: "アイスカフェラテ（M）", price: 320, category: "ドリンク", calories: 76, protein: 3.8, fat: 4.1, carb: 5.8, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-006-l", menu_name: "アイスカフェラテ（L）", price: 370, category: "ドリンク", calories: 76, protein: 3.8, fat: 4.1, carb: 5.8, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-007-s", menu_name: "アイスティー（S）", price: 220, category: "ドリンク", calories: 6, protein: 0.1, fat: 0, carb: 1.4, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-008-m", menu_name: "アイスティー（M）", price: 270, category: "ドリンク", calories: 6, protein: 0.1, fat: 0, carb: 1.4, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-009-l", menu_name: "アイスティー（L）", price: 320, category: "ドリンク", calories: 6, protein: 0.1, fat: 0, carb: 1.4, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-010-s", menu_name: "アイスミルク（S）", price: 220, category: "ドリンク", calories: 142, protein: 7.1, fat: 8.2, carb: 9.8, sodium: 0.2, allergens: [] },
  { menu_id: "subway-drink-011-m", menu_name: "アイスミルク（M）", price: 270, category: "ドリンク", calories: 142, protein: 7.1, fat: 8.2, carb: 9.8, sodium: 0.2, allergens: [] },
  { menu_id: "subway-drink-012-l", menu_name: "アイスミルク（L）", price: 320, category: "ドリンク", calories: 142, protein: 7.1, fat: 8.2, carb: 9.8, sodium: 0.2, allergens: [] },
  { menu_id: "subway-drink-013-s", menu_name: "野菜と果物のジュース（S）", price: 270, category: "ドリンク", calories: 94, protein: 1.3, fat: 0.4, carb: 21.1, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-014-m", menu_name: "野菜と果物のジュース（M）", price: 320, category: "ドリンク", calories: 94, protein: 1.3, fat: 0.4, carb: 21.1, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-016-s", menu_name: "オレンジジュース100%（S）", price: 270, category: "ドリンク", calories: 102, protein: 1.5, fat: 0, carb: 24.2, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-017-m", menu_name: "オレンジジュース100%（M）", price: 320, category: "ドリンク", calories: 102, protein: 1.5, fat: 0, carb: 24.2, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-019-s", menu_name: "アイスウーロン茶（S）", price: 220, category: "ドリンク", calories: 1, protein: 0, fat: 0, carb: 0.3, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-020-m", menu_name: "アイスウーロン茶（M）", price: 270, category: "ドリンク", calories: 1, protein: 0, fat: 0, carb: 0.3, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-021-l", menu_name: "アイスウーロン茶（L）", price: 320, category: "ドリンク", calories: 1, protein: 0, fat: 0, carb: 0.3, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-022-s", menu_name: "メロンソーダ（S）", price: 220, category: "ドリンク", calories: 79, protein: 0, fat: 0, carb: 19.9, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-023-m", menu_name: "メロンソーダ（M）", price: 270, category: "ドリンク", calories: 79, protein: 0, fat: 0, carb: 19.9, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-024-l", menu_name: "メロンソーダ（L）", price: 320, category: "ドリンク", calories: 79, protein: 0, fat: 0, carb: 19.9, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-025-s", menu_name: "ジンジャーエール（S）", price: 220, category: "ドリンク", calories: 70, protein: 0, fat: 0, carb: 17.5, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-026-m", menu_name: "ジンジャーエール（M）", price: 270, category: "ドリンク", calories: 70, protein: 0, fat: 0, carb: 17.5, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-027-l", menu_name: "ジンジャーエール（L）", price: 320, category: "ドリンク", calories: 70, protein: 0, fat: 0, carb: 17.5, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-028-s", menu_name: "ペプシコーラ（S）", price: 220, category: "ドリンク", calories: 79, protein: 0.1, fat: 0, carb: 19.8, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-029-m", menu_name: "ペプシコーラ（M）", price: 270, category: "ドリンク", calories: 79, protein: 0.1, fat: 0, carb: 19.8, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-030-l", menu_name: "ペプシコーラ（L）", price: 320, category: "ドリンク", calories: 79, protein: 0.1, fat: 0, carb: 19.8, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-031-s", menu_name: "ペプシゼロ（S）", price: 220, category: "ドリンク", calories: 0, protein: 0.1, fat: 0, carb: 0.4, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-032-m", menu_name: "ペプシゼロ（M）", price: 270, category: "ドリンク", calories: 0, protein: 0.1, fat: 0, carb: 0.4, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-033-l", menu_name: "ペプシゼロ（L）", price: 320, category: "ドリンク", calories: 0, protein: 0.1, fat: 0, carb: 0.4, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-034-s", menu_name: "ホットコーヒー（S）", price: 220, category: "ドリンク", calories: 5, protein: 0.2, fat: 0, carb: 0.8, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-035-m", menu_name: "ホットコーヒー（M）", price: 270, category: "ドリンク", calories: 5, protein: 0.2, fat: 0, carb: 0.8, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-036-s", menu_name: "ホットカフェラテ（S）", price: 270, category: "ドリンク", calories: 60, protein: 3, fat: 3.3, carb: 4.5, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-037-m", menu_name: "ホットカフェラテ（M）", price: 320, category: "ドリンク", calories: 60, protein: 3, fat: 3.3, carb: 4.5, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-038", menu_name: "コーヒーフロート", price: 390, category: "ドリンク", calories: 93, protein: 1.9, fat: 5.2, carb: 10, sodium: 0, allergens: [] },
  { menu_id: "subway-drink-039", menu_name: "カフェオレフロート", price: 390, category: "ドリンク", calories: 151, protein: 4.7, fat: 8.7, carb: 13.5, sodium: 0.1, allergens: [] },
  { menu_id: "subway-drink-040", menu_name: "クリームソーダ", price: 390, category: "ドリンク", calories: 172, protein: 1.6, fat: 5.2, carb: 30, sodium: 0, allergens: [] },
  // ========== モーニング ==========
  { menu_id: "subway-morning-005", menu_name: "サンドセット（ハム）", price: 580, category: "モーニング", calories: 260, protein: 12.4, fat: 6.4, carb: 40, sodium: 2.1, allergens: [] },
  { menu_id: "subway-morning-006", menu_name: "サンドセット（アボカドベジー）", price: 580, category: "モーニング", calories: 295, protein: 8.4, fat: 9.8, carb: 44.8, sodium: 1.6, allergens: [] },
  { menu_id: "subway-morning-007", menu_name: "サンドセット（たまご）", price: 580, category: "モーニング", calories: 318, protein: 11.7, fat: 13, carb: 39.6, sodium: 2.5, allergens: [] },
  { menu_id: "subway-morning-004", menu_name: "スープセット", price: 490, category: "モーニング", calories: 114, protein: 4.9, fat: 3.1, carb: 17.2, sodium: 0.6, allergens: [] },
  { menu_id: "subway-morning-001", menu_name: "ドリンクセット たまご＆ハム", price: 420, category: "モーニング", calories: 194, protein: 7.5, fat: 9.5, carb: 20, sodium: 1.6, allergens: [] },
  { menu_id: "subway-morning-002", menu_name: "ドリンクセット たまご＆チーズ", price: 420, category: "モーニング", calories: 201, protein: 7.3, fat: 10.5, carb: 19.5, sodium: 1.4, allergens: [] },
  // ========== キッズ ==========
  { menu_id: "subway-kids-001", menu_name: "キッズてりチキ", price: 420, category: "キッズ", calories: 170, protein: 7.7, fat: 5.1, carb: 23.4, sodium: 1.3, allergens: [] },
  { menu_id: "subway-kids-002", menu_name: "キッズハムたま", price: 420, category: "キッズ", calories: 174, protein: 7.4, fat: 7.9, carb: 18.7, sodium: 1.4, allergens: [] },
  { menu_id: "subway-kids-003", menu_name: "キッズたまご", price: 420, category: "キッズ", calories: 158, protein: 5.7, fat: 6.8, carb: 19, sodium: 1.1, allergens: [] },
  { menu_id: "subway-kids-004", menu_name: "キッズてりたま", price: 420, category: "キッズ", calories: 225, protein: 9.8, fat: 10.2, carb: 23.4, sodium: 1.8, allergens: [] },
  // ========== トッピング ==========
  { menu_id: "subway-topping-001", menu_name: "ナチュラルスライスチーズ", price: 100, category: "トッピング", calories: 52, protein: 3.3, fat: 4.2, carb: 0.2, sodium: 0.2, allergens: [] },
  { menu_id: "subway-topping-002", menu_name: "クリームタイプチーズ", price: 100, category: "トッピング", calories: 64, protein: 1.7, fat: 6.1, carb: 0.6, sodium: 0.5, allergens: [] },
  { menu_id: "subway-topping-003", menu_name: "たまご", price: 100, category: "トッピング", calories: 65, protein: 2.4, fat: 5.5, carb: 1.4, sodium: 0.5, allergens: [] },
  { menu_id: "subway-topping-004", menu_name: "ツナ", price: 100, category: "トッピング", calories: 68, protein: 3.4, fat: 5.7, carb: 0.8, sodium: 0.7, allergens: [] },
  { menu_id: "subway-topping-005", menu_name: "サラミ風セミドライソーセージ", price: 100, category: "トッピング", calories: 35, protein: 1.7, fat: 2.9, carb: 0.6, sodium: 0.3, allergens: [] },
  { menu_id: "subway-topping-006", menu_name: "ベーコン", price: 120, category: "トッピング", calories: 61, protein: 1.9, fat: 5.9, carb: 0.1, sodium: 0.3, allergens: [] },
  { menu_id: "subway-topping-007", menu_name: "マスカルポーネチーズ", price: 100, category: "トッピング", calories: 51, protein: 0.4, fat: 5.2, carb: 0.7, sodium: 0.5, allergens: [] },
  { menu_id: "subway-topping-008", menu_name: "ハム", price: 180, category: "トッピング", calories: 53, protein: 5.1, fat: 3.1, carb: 1.8, sodium: 1, allergens: [] },
  { menu_id: "subway-topping-009", menu_name: "えび", price: 180, category: "トッピング", calories: 16, protein: 3.6, fat: 0.1, carb: 0, sodium: 0, allergens: [] },
  { menu_id: "subway-topping-010", menu_name: "アボカド", price: 150, category: "トッピング", calories: 53, protein: 0.6, fat: 4.5, carb: 2.6, sodium: 0.2, allergens: [] },
  { menu_id: "subway-topping-011", menu_name: "サラダチキン", price: 250, category: "トッピング", calories: 60, protein: 13.3, fat: 0.6, carb: 0.3, sodium: 0.8, allergens: [] },
  { menu_id: "subway-topping-012", menu_name: "生ハム", price: 200, category: "トッピング", calories: 44, protein: 7.3, fat: 1.5, carb: 0.4, sodium: 0, allergens: [] },
  { menu_id: "subway-topping-013", menu_name: "チリチキン", price: 250, category: "トッピング", calories: 70, protein: 13.5, fat: 0.7, carb: 2.6, sodium: 1.4, allergens: [] },
  { menu_id: "subway-topping-016", menu_name: "てり焼きチキン", price: 300, category: "トッピング", calories: 130, protein: 8.4, fat: 6.8, carb: 8, sodium: 1, allergens: [] },
  { menu_id: "subway-topping-015", menu_name: "ローストビーフ", price: 400, category: "トッピング", calories: 58, protein: 8.1, fat: 3, carb: 0, sodium: 0.5, allergens: [] },
];
