/**
 * モスバーガーメニューデータ（2026-02-06版 公式サイトスクレイピングより）
 * 自動生成ファイル - scripts/scrape/mos.ts で生成
 */

export interface MosMenuItem {
  menu_id: string;
  menu_name: string;
  category: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  sodium: number;
  allergens: string[];
}

export const mosMenuData: MosMenuItem[] = [
  // 【新とびきりバーガー】
  { menu_id: "mos-tobikiri-1", menu_name: "新とびきりチーズ 〜北海道チーズ〜", category: "新とびきりバーガー", price: 690, calories: 478, protein: 21.9, fat: 24.7, carb: 42.2, sodium: 3, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご", "ゼラチン"] },
  { menu_id: "mos-tobikiri-2", menu_name: "ダブル新とびきりチーズ 〜北海道チーズ〜", category: "新とびきりバーガー", price: 980, calories: 706, protein: 35.6, fat: 40.2, carb: 50.4, sodium: 4.3, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご", "ゼラチン"] },

  // 【ハンバーガー】
  { menu_id: "mos-burger-1", menu_name: "ガーリックトマトのとり竜田バーガー ～国産クリームチーズ～", category: "ハンバーガー", price: 490, calories: 421, protein: 18.7, fat: 17.8, carb: 46.3, sodium: 2.7, allergens: ["卵", "乳", "小麦", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-2", menu_name: "和風旨（うま）だれのとり竜田バーガー 〜くし切りレモン添え〜", category: "ハンバーガー", price: 470, calories: 395, protein: 18.2, fat: 14.5, carb: 47.9, sodium: 2.6, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-3", menu_name: "モスバーガー", category: "ハンバーガー", price: 470, calories: 372, protein: 15.2, fat: 17, carb: 40, sodium: 2.3, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-4", menu_name: "モスチーズバーガー", category: "ハンバーガー", price: 510, calories: 425, protein: 18.2, fat: 21.4, carb: 40.4, sodium: 2.8, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-5", menu_name: "スパイシーモスバーガー", category: "ハンバーガー", price: 510, calories: 374, protein: 15.3, fat: 17, carb: 40.4, sodium: 2.5, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-6", menu_name: "スパイシーモスチーズバーガー", category: "ハンバーガー", price: 550, calories: 427, protein: 18.3, fat: 21.4, carb: 40.8, sodium: 3, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-7", menu_name: "グリーンバーガー＜テリヤキ＞", category: "ハンバーガー", price: 590, calories: 351, protein: 11, fat: 15.7, carb: 41.8, sodium: 2, allergens: ["小麦", "大豆"] },
  { menu_id: "mos-burger-8", menu_name: "テリヤキバーガー", category: "ハンバーガー", price: 460, calories: 383, protein: 14.4, fat: 18.2, carb: 40.6, sodium: 2.7, allergens: ["卵", "乳", "小麦", "牛肉", "ごま", "大豆", "鶏肉", "りんご"] },
  { menu_id: "mos-burger-9", menu_name: "モス野菜バーガー", category: "ハンバーガー", price: 470, calories: 363, protein: 14.1, fat: 18.6, carb: 35.4, sodium: 1.8, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-burger-10", menu_name: "テリヤキチキンバーガー", category: "ハンバーガー", price: 480, calories: 303, protein: 20.1, fat: 10.3, carb: 32.4, sodium: 2.2, allergens: ["卵", "乳", "小麦", "大豆", "鶏肉", "りんご"] },
  { menu_id: "mos-burger-11", menu_name: "フィッシュバーガー", category: "ハンバーガー", price: 400, calories: 381, protein: 16.2, fat: 18.8, carb: 37, sodium: 1.9, allergens: ["卵", "乳", "小麦", "大豆", "りんご"] },
  { menu_id: "mos-burger-12", menu_name: "ロースカツバーガー", category: "ハンバーガー", price: 490, calories: 410, protein: 16.6, fat: 16.3, carb: 49.7, sodium: 2.3, allergens: ["卵", "乳", "小麦", "大豆", "豚肉", "りんご"] },
  { menu_id: "mos-burger-13", menu_name: "海老カツバーガー", category: "ハンバーガー", price: 490, calories: 397, protein: 14.5, fat: 19.3, carb: 42.2, sodium: 2.1, allergens: ["卵", "乳", "小麦", "えび", "大豆", "りんご"] },
  { menu_id: "mos-burger-14", menu_name: "チキンバーガー", category: "ハンバーガー", price: 390, calories: 386, protein: 15, fat: 18.5, carb: 40, sodium: 1.5, allergens: ["卵", "乳", "小麦", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-15", menu_name: "ハンバーガー", category: "ハンバーガー", price: 240, calories: 314, protein: 13.7, fat: 13.2, carb: 35.2, sodium: 1.8, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-burger-16", menu_name: "チーズバーガー", category: "ハンバーガー", price: 280, calories: 367, protein: 16.7, fat: 17.6, carb: 35.6, sodium: 2.3, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-burger-17", menu_name: "ダブルモスバーガー", category: "ハンバーガー", price: 630, calories: 532, protein: 23.7, fat: 28.4, carb: 45.7, sodium: 3.4, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-18", menu_name: "ダブルモスチーズバーガー", category: "ハンバーガー", price: 670, calories: 585, protein: 26.7, fat: 32.8, carb: 46.1, sodium: 3.9, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-19", menu_name: "スパイシーダブルモスバーガー", category: "ハンバーガー", price: 670, calories: 534, protein: 23.8, fat: 28.4, carb: 46.1, sodium: 3.6, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-20", menu_name: "スパイシーダブルモスチーズバーガー", category: "ハンバーガー", price: 710, calories: 587, protein: 26.8, fat: 32.8, carb: 46.5, sodium: 4.1, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-21", menu_name: "ダブルテリヤキバーガー", category: "ハンバーガー", price: 620, calories: 555, protein: 23, fat: 29.2, carb: 50.3, sodium: 4.1, allergens: ["卵", "乳", "小麦", "牛肉", "ごま", "大豆", "鶏肉", "りんご"] },
  { menu_id: "mos-burger-22", menu_name: "ダブルモス野菜バーガー", category: "ハンバーガー", price: 630, calories: 511, protein: 22.2, fat: 29.5, carb: 39.7, sodium: 2.7, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-burger-23", menu_name: "ダブルハンバーガー", category: "ハンバーガー", price: 400, calories: 462, protein: 21.8, fat: 24.1, carb: 39.5, sodium: 2.7, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-burger-24", menu_name: "ダブルチーズバーガー", category: "ハンバーガー", price: 440, calories: 515, protein: 24.8, fat: 28.5, carb: 39.9, sodium: 3.2, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-burger-25", menu_name: "トリプルモスバーガー ＜15時から販売＞", category: "ハンバーガー", price: 790, calories: 680, protein: 31.8, fat: 39.3, carb: 50, sodium: 4.3, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-burger-26", menu_name: "トリプルモスチーズバーガー ＜15時から販売＞", category: "ハンバーガー", price: 830, calories: 733, protein: 34.8, fat: 43.7, carb: 50.4, sodium: 4.8, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },

  // 【モスライスバーガー/ホットドッグ】
  { menu_id: "mos-rice-1", menu_name: "モスライスバーガー海鮮かきあげ（塩だれ）", category: "モスライスバーガー/ホットドッグ", price: 460, calories: 372, protein: 8.5, fat: 10.5, carb: 61.3, sodium: 1.9, allergens: ["卵", "乳", "小麦", "えび", "いか", "ごま", "さば", "大豆", "鶏肉", "豚肉", "ゼラチン"] },
  { menu_id: "mos-rice-2", menu_name: "モスライスバーガー焼肉", category: "モスライスバーガー/ホットドッグ", price: 490, calories: 353, protein: 9.5, fat: 11.6, carb: 52.8, sodium: 1.1, allergens: ["小麦", "牛肉", "大豆"] },
  { menu_id: "mos-rice-3", menu_name: "ホットドッグ", category: "モスライスバーガー/ホットドッグ", price: 420, calories: 358, protein: 11.6, fat: 23.4, carb: 25.4, sodium: 2.1, allergens: ["乳", "小麦", "大豆", "豚肉", "りんご"] },
  { menu_id: "mos-rice-4", menu_name: "チリドッグ", category: "モスライスバーガー/ホットドッグ", price: 450, calories: 373, protein: 13, fat: 24, carb: 26.5, sodium: 2.6, allergens: ["乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-rice-5", menu_name: "スパイシーチリドッグ", category: "モスライスバーガー/ホットドッグ", price: 490, calories: 374, protein: 13.1, fat: 24, carb: 26.6, sodium: 2.7, allergens: ["乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },

  // 【モスの菜摘】
  { menu_id: "mos-natsumi-1", menu_name: "モスの菜摘（なつみ）モス野菜", category: "モスの菜摘", price: 490, calories: 223, protein: 9.1, fat: 16.5, carb: 10.4, sodium: 1.3, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-natsumi-2", menu_name: "モスの菜摘（なつみ）テリヤキチキン", category: "モスの菜摘", price: 500, calories: 186, protein: 15.1, fat: 10.7, carb: 7.7, sodium: 1.9, allergens: ["卵", "小麦", "大豆", "鶏肉", "りんご"] },
  { menu_id: "mos-natsumi-3", menu_name: "モスの菜摘（なつみ）フィッシュ", category: "モスの菜摘", price: 420, calories: 238, protein: 11.1, fat: 16.5, carb: 11.5, sodium: 1.3, allergens: ["卵", "乳", "小麦", "大豆", "りんご"] },
  { menu_id: "mos-natsumi-4", menu_name: "モスの菜摘（なつみ）ロースカツ", category: "モスの菜摘", price: 510, calories: 265, protein: 11.3, fat: 14, carb: 23.6, sodium: 1.7, allergens: ["卵", "乳", "小麦", "大豆", "豚肉", "りんご"] },
  { menu_id: "mos-natsumi-5", menu_name: "モスの菜摘（なつみ）海老カツ", category: "モスの菜摘", price: 510, calories: 254, protein: 9.4, fat: 17, carb: 16.7, sodium: 1.5, allergens: ["卵", "乳", "小麦", "えび", "大豆", "りんご"] },
  { menu_id: "mos-natsumi-6", menu_name: "モスの菜摘（なつみ）チキン", category: "モスの菜摘", price: 410, calories: 243, protein: 9.9, fat: 16.3, carb: 14.6, sodium: 1, allergens: ["卵", "乳", "小麦", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-natsumi-7", menu_name: "モスの菜摘（なつみ）ソイモス野菜", category: "モスの菜摘", price: 510, calories: 202, protein: 6.8, fat: 13.8, carb: 13.7, sodium: 1.1, allergens: ["卵", "小麦", "大豆", "りんご"] },

  // 【ソイパティ】
  { menu_id: "mos-soy-1", menu_name: "ソイモスバーガー", category: "ソイパティ", price: 490, calories: 351, protein: 12.9, fat: 14.3, carb: 43.3, sodium: 2.1, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-soy-2", menu_name: "ソイテリヤキバーガー", category: "ソイパティ", price: 480, calories: 362, protein: 12.1, fat: 15.5, carb: 43.9, sodium: 2.5, allergens: ["卵", "乳", "小麦", "ごま", "大豆", "鶏肉", "りんご"] },
  { menu_id: "mos-soy-3", menu_name: "ソイモス野菜バーガー", category: "ソイパティ", price: 490, calories: 342, protein: 11.8, fat: 15.9, carb: 38.7, sodium: 1.6, allergens: ["卵", "乳", "小麦", "大豆", "りんご"] },
  { menu_id: "mos-soy-4", menu_name: "ソイモスチーズバーガー", category: "ソイパティ", price: 530, calories: 404, protein: 15.9, fat: 18.7, carb: 43.7, sodium: 2.6, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-soy-5", menu_name: "ソイハンバーガー", category: "ソイパティ", price: 260, calories: 293, protein: 11.4, fat: 10.5, carb: 38.5, sodium: 1.6, allergens: ["乳", "小麦", "大豆", "りんご"] },
  { menu_id: "mos-soy-6", menu_name: "ソイチーズバーガー", category: "ソイパティ", price: 300, calories: 346, protein: 14.4, fat: 14.9, carb: 38.9, sodium: 2.1, allergens: ["乳", "小麦", "大豆", "りんご"] },
  { menu_id: "mos-soy-7", menu_name: "ソイスパイシーモスバーガー", category: "ソイパティ", price: 530, calories: 353, protein: 13, fat: 14.3, carb: 43.7, sodium: 2.3, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-soy-8", menu_name: "ソイスパイシーモスチーズバーガー", category: "ソイパティ", price: 570, calories: 406, protein: 16, fat: 18.7, carb: 44.1, sodium: 2.8, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-soy-9", menu_name: "ソイモーニング野菜バーガードリンクセット", category: "ソイパティ", price: 410, calories: 316, protein: 11.6, fat: 12.8, carb: 38.8, sodium: 1.7, allergens: ["卵", "乳", "小麦", "大豆", "りんご"] },
  { menu_id: "mos-soy-10", menu_name: "ソイモーニング野菜チーズバーガードリンクセット", category: "ソイパティ", price: 450, calories: 369, protein: 14.6, fat: 17.2, carb: 39.2, sodium: 2.2, allergens: ["卵", "乳", "小麦", "大豆", "りんご"] },

  // 【サイドメニュー】
  { menu_id: "mos-side-1", menu_name: "オニオンフライデーパック", category: "サイドメニュー", price: 1550, calories: 1096, protein: 17.5, fat: 63.4, carb: 113.8, sodium: 5.7, allergens: ["小麦", "大豆"] },
  { menu_id: "mos-side-2", menu_name: "モスチキン", category: "サイドメニュー", price: 320, calories: 269, protein: 15.3, fat: 16.6, carb: 14.7, sodium: 1.5, allergens: ["小麦", "大豆", "鶏肉"] },
  { menu_id: "mos-side-3", menu_name: "オニポテ（フレンチフライポテト＆オニオンフライ）", category: "サイドメニュー", price: 330, calories: 189, protein: 2.6, fat: 8.7, carb: 25.3, sodium: 0.7, allergens: ["小麦", "大豆"] },
  { menu_id: "mos-side-4", menu_name: "チリディップソース", category: "サイドメニュー", price: 100, calories: 48, protein: 3, fat: 1.2, carb: 6.4, sodium: 1.1, allergens: ["小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-side-5", menu_name: "カップ ハラペーニョ", category: "サイドメニュー", price: 100, calories: 5, protein: 0.2, fat: 0.1, carb: 0.9, sodium: 0.4, allergens: [] },
  { menu_id: "mos-side-6", menu_name: "オニオンフライ", category: "サイドメニュー", price: 330, calories: 219, protein: 3.5, fat: 12.7, carb: 22.8, sodium: 1.1, allergens: ["小麦", "大豆"] },
  { menu_id: "mos-side-7", menu_name: "チキンナゲット（5コ入り）※ソース別売", category: "サイドメニュー", price: 360, calories: 195, protein: 14.8, fat: 10.2, carb: 10.9, sodium: 0.8, allergens: ["乳", "小麦", "さば", "大豆", "鶏肉"] },
  { menu_id: "mos-side-8", menu_name: "バーベキューソース", category: "サイドメニュー", price: 40, calories: 25, protein: 0.1, fat: 0, carb: 6, sodium: 0.7, allergens: ["大豆", "鶏肉", "りんご", "ゼラチン"] },
  { menu_id: "mos-side-9", menu_name: "マスタードソース", category: "サイドメニュー", price: 40, calories: 102, protein: 0.4, fat: 10.1, carb: 2.2, sodium: 0.7, allergens: ["卵", "大豆", "りんご"] },
  { menu_id: "mos-side-10", menu_name: "こだわりサラダ 和風ドレッシング＜減塩タイプ＞", category: "サイドメニュー", price: 330, calories: 41, protein: 1.3, fat: 1, carb: 7.3, sodium: 0.5, allergens: ["小麦", "ごま", "大豆", "鶏肉", "豚肉"] },
  { menu_id: "mos-side-11", menu_name: "和風ドレッシング＜減塩タイプ＞", category: "サイドメニュー", price: 30, calories: 22, protein: 0.3, fat: 1, carb: 3, sodium: 0.5, allergens: ["小麦", "ごま", "大豆", "鶏肉", "豚肉"] },
  { menu_id: "mos-side-12", menu_name: "モスチキンパック 5本入り", category: "サイドメニュー", price: 1500, calories: 1345, protein: 76.5, fat: 83, carb: 73.5, sodium: 7.5, allergens: ["小麦", "大豆", "鶏肉"] },
  { menu_id: "mos-side-13", menu_name: "バラエティパックA", category: "サイドメニュー", price: 1320, calories: 1256, protein: 17.4, fat: 58.8, carb: 164.4, sodium: 4.8, allergens: ["小麦", "大豆"] },
  { menu_id: "mos-side-14", menu_name: "バラエティパックB", category: "サイドメニュー", price: 1770, calories: 1427, protein: 43.5, fat: 66.5, carb: 163.4, sodium: 5.3, allergens: ["乳", "小麦", "さば", "大豆", "鶏肉"] },
  { menu_id: "mos-side-15", menu_name: "＜冷凍＞香る醤油のローストチキン 〜鹿児島県産 若鶏〜", category: "サイドメニュー", price: 650, calories: 208, protein: 20.3, fat: 12.9, carb: 2.6, sodium: 1.9, allergens: ["卵", "乳", "小麦", "大豆", "鶏肉"] },
  { menu_id: "mos-side-16", menu_name: "冷凍モスチキン 5本入り", category: "サイドメニュー", price: 1500, calories: 315, protein: 14.5, fat: 21.7, carb: 15.4, sodium: 1.5, allergens: ["小麦", "大豆", "鶏肉"] },

  // 【ドリンク/スープ】
  { menu_id: "mos-drink-1", menu_name: "ブロッコリーとじゃがいものポタージュ", category: "ドリンク/スープ", price: 380, calories: 119, protein: 1.6, fat: 7.2, carb: 12.1, sodium: 1.6, allergens: ["卵", "乳", "大豆", "豚肉"] },
  { menu_id: "mos-drink-2", menu_name: "ブレンドコーヒー", category: "ドリンク/スープ", price: 300, calories: 5, protein: 0.2, fat: 0.2, carb: 1.3, sodium: 0, allergens: [] },
  { menu_id: "mos-drink-3", menu_name: "紅茶 キャンディ茶葉（レモン／ミルク）", category: "ドリンク/スープ", price: 300, calories: 2, protein: 0.2, fat: 0, carb: 0.2, sodium: 0, allergens: [] },
  { menu_id: "mos-drink-4", menu_name: "カフェラテ", category: "ドリンク/スープ", price: 360, calories: 66, protein: 3.6, fat: 4, carb: 5.4, sodium: 0.1, allergens: ["乳"] },
  { menu_id: "mos-drink-5", menu_name: "コーンスープ 北海道産コーン使用", category: "ドリンク/スープ", price: 380, calories: 140, protein: 3.6, fat: 7.2, carb: 15.3, sodium: 1.3, allergens: ["卵", "乳", "小麦", "大豆", "鶏肉"] },
  { menu_id: "mos-drink-6", menu_name: "クラムチャウダー", category: "ドリンク/スープ", price: 380, calories: 119, protein: 4.1, fat: 4.3, carb: 15.8, sodium: 1.3, allergens: ["卵", "乳", "小麦", "大豆", "鶏肉", "豚肉"] },
  { menu_id: "mos-drink-7", menu_name: "くだものと野菜（125ml紙パック）", category: "ドリンク/スープ", price: 100, calories: 52, protein: 0, fat: 0, carb: 13, sodium: 0.1, allergens: ["りんご"] },

  // 【デザート】
  { menu_id: "mos-dessert-1", menu_name: "おしるこ（粒あん）", category: "デザート", price: 420, calories: 253, protein: 6.5, fat: 0.7, carb: 55.4, sodium: 0.3, allergens: [] },
  { menu_id: "mos-dessert-2", menu_name: "アイスドルチェ カップ ショコラ風ムースケーキ", category: "デザート", price: 390, calories: 199, protein: 2.1, fat: 10.4, carb: 24.3, sodium: 0.1, allergens: ["大豆"] },
  { menu_id: "mos-dessert-3", menu_name: "シングル ふんわりスフレパンケーキ＜メープルシロップ＞", category: "デザート", price: 520, calories: 333, protein: 5.6, fat: 16.7, carb: 39.9, sodium: 0.3, allergens: ["卵", "乳", "小麦", "大豆"] },
  { menu_id: "mos-dessert-4", menu_name: "ダブル ふんわりスフレパンケーキ＜メープルシロップ＞", category: "デザート", price: 920, calories: 639, protein: 11.2, fat: 33.4, carb: 73.3, sodium: 0.6, allergens: ["卵", "乳", "小麦", "大豆"] },
  { menu_id: "mos-dessert-5", menu_name: "＜冷凍＞ ふんわりスフレパンケーキ", category: "デザート", price: 480, calories: 293, protein: 5.6, fat: 16.7, carb: 30, sodium: 0.3, allergens: ["卵", "乳", "小麦", "大豆"] },

  // 【モスワイワイセット】
  { menu_id: "mos-waiwai-1", menu_name: "ワイワイモスチーズバーガーセット", category: "モスワイワイセット", price: 610, calories: 378, protein: 16.9, fat: 19.5, carb: 33.9, sodium: 2.4, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "鶏肉", "豚肉", "りんご"] },
  { menu_id: "mos-waiwai-2", menu_name: "ワイワイバーガーセット", category: "モスワイワイセット", price: 540, calories: 311, protein: 13.6, fat: 13.1, carb: 34.6, sodium: 1.7, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-waiwai-3", menu_name: "ワイワイチーズバーガーセット", category: "モスワイワイセット", price: 580, calories: 364, protein: 16.6, fat: 17.5, carb: 35, sodium: 2.2, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-waiwai-4", menu_name: "ワイワイナゲットセット", category: "モスワイワイセット", price: 660, calories: 195, protein: 14.8, fat: 10.2, carb: 10.9, sodium: 0.8, allergens: ["乳", "小麦", "さば", "大豆", "鶏肉"] },

  // 【低アレルゲンメニュー】
  { menu_id: "mos-lowallergy-1", menu_name: "ポークサンド＜米粉＞ドリンクとおもちゃ付きセット", category: "低アレルゲンメニュー", price: 380, calories: 213, protein: 5.9, fat: 7.1, carb: 31.2, sodium: 1.4, allergens: ["豚肉", "りんご"] },
  { menu_id: "mos-lowallergy-2", menu_name: "ポークロール＜米粉＞ドリンクとおもちゃ付きセット", category: "低アレルゲンメニュー", price: 380, calories: 247, protein: 5.1, fat: 12.6, carb: 28.3, sodium: 1.5, allergens: ["豚肉", "りんご"] },

  // 【朝モス】
  { menu_id: "mos-morning-1", menu_name: "モーニングドッグドリンクセット", category: "朝モス", price: 290, calories: 267, protein: 9.5, fat: 15.4, carb: 22.4, sodium: 1.3, allergens: ["乳", "小麦", "大豆", "豚肉", "りんご"] },
  { menu_id: "mos-morning-2", menu_name: "モーニング野菜バーガードリンクセット", category: "朝モス", price: 390, calories: 337, protein: 13.9, fat: 15.5, carb: 35.5, sodium: 1.9, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
  { menu_id: "mos-morning-3", menu_name: "モーニング野菜チーズバーガードリンクセット", category: "朝モス", price: 430, calories: 390, protein: 16.9, fat: 19.9, carb: 35.9, sodium: 2.4, allergens: ["卵", "乳", "小麦", "牛肉", "大豆", "りんご"] },
];