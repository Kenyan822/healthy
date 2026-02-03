/**
 * モスバーガーメニューデータ
 * 出典: menudata/mos.pdf (更新日 2026年1月28日)
 */

export interface MosMenuItem {
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

export const mosMenuData: MosMenuItem[] = [
  // 【新とびきりバーガー】
  { menu_id: "mos-tobikiri-1", menu_name: "新とびきりチーズ～北海道チーズ～", category: "新とびきりバーガー", calories: 478, protein: 21.9, fat: 24.7, carb: 42.2, sodium: 1191, allergens: [] },
  { menu_id: "mos-tobikiri-2", menu_name: "ダブル新とびきりチーズ～北海道チーズ～", category: "新とびきりバーガー", calories: 706, protein: 35.6, fat: 40.2, carb: 50.4, sodium: 1729, allergens: [] },

  // 【ハンバーガー】
  { menu_id: "mos-burger-1", menu_name: "ガーリックトマトのとり竜田バーガー～国産クリームチーズ～", category: "ハンバーガー", calories: 421, protein: 18.7, fat: 17.8, carb: 46.3, sodium: 1044, allergens: [] },
  { menu_id: "mos-burger-2", menu_name: "和風旨だれのとり竜田バーガー～くし切りレモン添え～", category: "ハンバーガー", calories: 395, protein: 18.2, fat: 14.5, carb: 47.9, sodium: 1037, allergens: [] },
  { menu_id: "mos-burger-3", menu_name: "モスバーガー", category: "ハンバーガー", calories: 372, protein: 15.2, fat: 17.0, carb: 40.0, sodium: 906, allergens: [] },
  { menu_id: "mos-burger-4", menu_name: "テリヤキバーガー", category: "ハンバーガー", calories: 383, protein: 14.4, fat: 18.2, carb: 40.6, sodium: 1067, allergens: [] },
  { menu_id: "mos-burger-5", menu_name: "テリヤキチキンバーガー", category: "ハンバーガー", calories: 303, protein: 20.1, fat: 10.3, carb: 32.4, sodium: 842, allergens: [] },
  { menu_id: "mos-burger-6", menu_name: "モスチーズバーガー", category: "ハンバーガー", calories: 425, protein: 18.2, fat: 21.4, carb: 40.4, sodium: 1095, allergens: [] },
  { menu_id: "mos-burger-7", menu_name: "モス野菜バーガー", category: "ハンバーガー", calories: 363, protein: 14.1, fat: 18.6, carb: 35.4, sodium: 710, allergens: [] },
  { menu_id: "mos-burger-8", menu_name: "海老カツバーガー", category: "ハンバーガー", calories: 397, protein: 14.5, fat: 19.3, carb: 42.2, sodium: 797, allergens: [] },
  { menu_id: "mos-burger-9", menu_name: "ロースカツバーガー", category: "ハンバーガー", calories: 410, protein: 16.6, fat: 16.3, carb: 49.7, sodium: 859, allergens: [] },
  { menu_id: "mos-burger-10", menu_name: "フィッシュバーガー", category: "ハンバーガー", calories: 381, protein: 16.2, fat: 18.8, carb: 37.0, sodium: 745, allergens: [] },
  { menu_id: "mos-burger-11", menu_name: "チキンバーガー", category: "ハンバーガー", calories: 386, protein: 15.0, fat: 18.5, carb: 40.0, sodium: 608, allergens: [] },
  { menu_id: "mos-burger-12", menu_name: "ハンバーガー", category: "ハンバーガー", calories: 314, protein: 13.7, fat: 13.2, carb: 35.2, sodium: 696, allergens: [] },
  { menu_id: "mos-burger-13", menu_name: "チーズバーガー", category: "ハンバーガー", calories: 367, protein: 16.7, fat: 17.6, carb: 35.6, sodium: 885, allergens: [] },
  { menu_id: "mos-burger-14", menu_name: "ダブルモスバーガー", category: "ハンバーガー", calories: 532, protein: 23.7, fat: 28.4, carb: 45.7, sodium: 1337, allergens: [] },
  { menu_id: "mos-burger-15", menu_name: "ダブルモスチーズバーガー", category: "ハンバーガー", calories: 585, protein: 26.7, fat: 32.8, carb: 46.1, sodium: 1526, allergens: [] },
  { menu_id: "mos-burger-16", menu_name: "ダブルテリヤキバーガー", category: "ハンバーガー", calories: 555, protein: 23.0, fat: 29.2, carb: 50.3, sodium: 1637, allergens: [] },
  { menu_id: "mos-burger-17", menu_name: "ダブルモス野菜バーガー", category: "ハンバーガー", calories: 511, protein: 22.2, fat: 29.5, carb: 39.7, sodium: 1064, allergens: [] },
  { menu_id: "mos-burger-18", menu_name: "ダブルハンバーガー", category: "ハンバーガー", calories: 462, protein: 21.8, fat: 24.1, carb: 39.5, sodium: 1050, allergens: [] },
  { menu_id: "mos-burger-19", menu_name: "ダブルチーズバーガー", category: "ハンバーガー", calories: 515, protein: 24.8, fat: 28.5, carb: 39.9, sodium: 1239, allergens: [] },
  { menu_id: "mos-burger-20", menu_name: "スパイシーモスバーガー", category: "ハンバーガー", calories: 374, protein: 15.3, fat: 17.0, carb: 40.4, sodium: 972, allergens: [] },
  { menu_id: "mos-burger-21", menu_name: "スパイシーモスチーズバーガー", category: "ハンバーガー", calories: 427, protein: 18.3, fat: 21.4, carb: 40.8, sodium: 1161, allergens: [] },
  { menu_id: "mos-burger-22", menu_name: "スパイシーダブルモスバーガー", category: "ハンバーガー", calories: 534, protein: 23.8, fat: 28.4, carb: 46.1, sodium: 1403, allergens: [] },
  { menu_id: "mos-burger-23", menu_name: "スパイシーダブルモスチーズバーガー", category: "ハンバーガー", calories: 587, protein: 26.8, fat: 32.8, carb: 46.5, sodium: 1592, allergens: [] },
  { menu_id: "mos-burger-24", menu_name: "グリーンバーガー〈テリヤキ〉", category: "ハンバーガー", calories: 351, protein: 11.0, fat: 15.7, carb: 41.8, sodium: 840, allergens: [] },
  { menu_id: "mos-burger-25", menu_name: "モスの菜摘モス野菜", category: "ハンバーガー", calories: 223, protein: 9.1, fat: 16.5, carb: 10.4, sodium: 513, allergens: [] },
  { menu_id: "mos-burger-26", menu_name: "モスの菜摘テリヤキチキン", category: "ハンバーガー", calories: 186, protein: 15.1, fat: 10.7, carb: 7.7, sodium: 749, allergens: [] },
  { menu_id: "mos-burger-27", menu_name: "モスの菜摘フィッシュ", category: "ハンバーガー", calories: 238, protein: 11.1, fat: 16.5, carb: 11.5, sodium: 523, allergens: [] },
  { menu_id: "mos-burger-28", menu_name: "モスの菜摘海老カツ", category: "ハンバーガー", calories: 254, protein: 9.4, fat: 17.0, carb: 16.7, sodium: 575, allergens: [] },
  { menu_id: "mos-burger-29", menu_name: "モスの菜摘ロースカツ", category: "ハンバーガー", calories: 265, protein: 11.3, fat: 14.0, carb: 23.6, sodium: 636, allergens: [] },
  { menu_id: "mos-burger-30", menu_name: "モスの菜摘チキン", category: "ハンバーガー", calories: 243, protein: 9.9, fat: 16.3, carb: 14.6, sodium: 394, allergens: [] },
  { menu_id: "mos-burger-31", menu_name: "モスの菜摘ソイモス野菜", category: "ハンバーガー", calories: 202, protein: 6.8, fat: 13.8, carb: 13.7, sodium: 459, allergens: [] },
  { menu_id: "mos-burger-32", menu_name: "ソイモスバーガー", category: "ハンバーガー", calories: 351, protein: 12.9, fat: 14.3, carb: 43.3, sodium: 852, allergens: [] },
  { menu_id: "mos-burger-33", menu_name: "ソイスパイシーモスバーガー", category: "ハンバーガー", calories: 353, protein: 13.0, fat: 14.3, carb: 43.7, sodium: 918, allergens: [] },
  { menu_id: "mos-burger-34", menu_name: "ソイモスチーズバーガー", category: "ハンバーガー", calories: 404, protein: 15.9, fat: 18.7, carb: 43.7, sodium: 1041, allergens: [] },
  { menu_id: "mos-burger-35", menu_name: "ソイスパイシーモスチーズバーガー", category: "ハンバーガー", calories: 406, protein: 16.0, fat: 18.7, carb: 44.1, sodium: 1107, allergens: [] },
  { menu_id: "mos-burger-36", menu_name: "ソイテリヤキバーガー", category: "ハンバーガー", calories: 362, protein: 12.1, fat: 15.5, carb: 43.9, sodium: 1013, allergens: [] },
  { menu_id: "mos-burger-37", menu_name: "ソイモス野菜バーガー", category: "ハンバーガー", calories: 342, protein: 11.8, fat: 15.9, carb: 38.7, sodium: 656, allergens: [] },
  { menu_id: "mos-burger-38", menu_name: "ソイハンバーガー", category: "ハンバーガー", calories: 293, protein: 11.4, fat: 10.5, carb: 38.5, sodium: 642, allergens: [] },
  { menu_id: "mos-burger-39", menu_name: "ソイチーズバーガー", category: "ハンバーガー", calories: 346, protein: 14.4, fat: 14.9, carb: 38.9, sodium: 831, allergens: [] },

  // 【モスライスバーガー】
  { menu_id: "mos-rice-1", menu_name: "モスライスバーガー海鮮かきあげ（塩だれ）", category: "モスライスバーガー", calories: 372, protein: 8.5, fat: 10.5, carb: 61.3, sodium: 776, allergens: [] },
  { menu_id: "mos-rice-2", menu_name: "モスライスバーガー焼肉", category: "モスライスバーガー", calories: 353, protein: 9.5, fat: 11.6, carb: 52.8, sodium: 449, allergens: [] },

  // 【ホットドッグ】
  { menu_id: "mos-hotdog-1", menu_name: "ホットドッグ", category: "ホットドッグ", calories: 358, protein: 11.6, fat: 23.4, carb: 25.4, sodium: 859, allergens: [] },
  { menu_id: "mos-hotdog-2", menu_name: "チリドッグ", category: "ホットドッグ", calories: 373, protein: 13.0, fat: 24.0, carb: 26.5, sodium: 1018, allergens: [] },
  { menu_id: "mos-hotdog-3", menu_name: "スパイシーチリドッグ", category: "ホットドッグ", calories: 374, protein: 13.1, fat: 24.0, carb: 26.6, sodium: 1068, allergens: [] },

  // 【サイドメニュー】
  { menu_id: "mos-side-1", menu_name: "香る醤油のローストチキン～鹿児島県産若鶏～", category: "サイドメニュー", calories: 208, protein: 20.3, fat: 12.9, carb: 2.6, sodium: 750, allergens: [] },
  { menu_id: "mos-side-2", menu_name: "フレンチフライポテトS", category: "サイドメニュー", calories: 170, protein: 2.2, fat: 7.0, carb: 24.8, sodium: 202, allergens: [] },
  { menu_id: "mos-side-3", menu_name: "フレンチフライポテトM", category: "サイドメニュー", calories: 238, protein: 3.0, fat: 9.8, carb: 34.7, sodium: 283, allergens: [] },
  { menu_id: "mos-side-4", menu_name: "フレンチフライポテトL", category: "サイドメニュー", calories: 409, protein: 5.2, fat: 16.7, carb: 59.4, sodium: 484, allergens: [] },
  { menu_id: "mos-side-5", menu_name: "オニオンフライ", category: "サイドメニュー", calories: 219, protein: 3.5, fat: 12.7, carb: 22.8, sodium: 442, allergens: [] },
  { menu_id: "mos-side-6", menu_name: "オニポテ", category: "サイドメニュー", calories: 189, protein: 2.6, fat: 8.7, carb: 25.3, sodium: 242, allergens: [] },
  { menu_id: "mos-side-7", menu_name: "こだわりサラダ 和風ドレッシング＜減塩タイプ＞", category: "サイドメニュー", calories: 41, protein: 1.3, fat: 1.0, carb: 7.3, sodium: 213, allergens: [] },
  { menu_id: "mos-side-8", menu_name: "チキンナゲット5コ入り", category: "サイドメニュー", calories: 195, protein: 14.8, fat: 10.2, carb: 10.9, sodium: 319, allergens: [] },
  { menu_id: "mos-side-9", menu_name: "モスチキン", category: "サイドメニュー", calories: 269, protein: 15.3, fat: 16.6, carb: 14.7, sodium: 612, allergens: [] },
  { menu_id: "mos-side-10", menu_name: "モスチキンパック5本入り", category: "サイドメニュー", calories: 1345, protein: 76.5, fat: 83.0, carb: 73.5, sodium: 3060, allergens: [] },
  { menu_id: "mos-side-11", menu_name: "バラエティパックA", category: "サイドメニュー", calories: 1256, protein: 17.4, fat: 58.8, carb: 164.4, sodium: 1852, allergens: [] },
  { menu_id: "mos-side-12", menu_name: "バラエティパックB", category: "サイドメニュー", calories: 1427, protein: 43.5, fat: 66.5, carb: 163.4, sodium: 2048, allergens: [] },

  // 【ソース・ドレッシング】
  { menu_id: "mos-sauce-1", menu_name: "チリディップソース", category: "ソース・ドレッシング", calories: 48, protein: 3.0, fat: 1.2, carb: 6.4, sodium: 419, allergens: [] },
  { menu_id: "mos-sauce-2", menu_name: "カップハラペーニョ", category: "ソース・ドレッシング", calories: 5, protein: 0.2, fat: 0.1, carb: 0.9, sodium: 166, allergens: [] },
  { menu_id: "mos-sauce-3", menu_name: "バーベキューソース", category: "ソース・ドレッシング", calories: 25, protein: 0.1, fat: 0.0, carb: 6.0, sodium: 284, allergens: [] },
  { menu_id: "mos-sauce-4", menu_name: "マスタードソース", category: "ソース・ドレッシング", calories: 102, protein: 0.4, fat: 10.1, carb: 2.2, sodium: 270, allergens: [] },
  { menu_id: "mos-sauce-5", menu_name: "和風ドレッシング＜減塩タイプ＞", category: "ソース・ドレッシング", calories: 22, protein: 0.3, fat: 1.0, carb: 3.0, sodium: 207, allergens: [] },

  // 【ドリンク】
  { menu_id: "mos-drink-1", menu_name: "ぶどうとりんごのスパークリングサングリア＜ノンアルコール＞S", category: "ドリンク", calories: 116, protein: 0.0, fat: 0.0, carb: 29.0, sodium: 28, allergens: [] },
  { menu_id: "mos-drink-2", menu_name: "ぶどうとりんごのスパークリングサングリア＜ノンアルコール＞M", category: "ドリンク", calories: 172, protein: 0.0, fat: 0.1, carb: 42.9, sodium: 42, allergens: [] },
  { menu_id: "mos-drink-3", menu_name: "ぶどうとりんごのスパークリングサングリア＜ノンアルコール＞L", category: "ドリンク", calories: 262, protein: 0.0, fat: 0.1, carb: 65.4, sodium: 63, allergens: [] },
  { menu_id: "mos-drink-4", menu_name: "アイスコーヒーS", category: "ドリンク", calories: 10, protein: 0.4, fat: 0.2, carb: 2.1, sodium: 4, allergens: [] },
  { menu_id: "mos-drink-5", menu_name: "アイスコーヒーM", category: "ドリンク", calories: 14, protein: 0.6, fat: 0.3, carb: 3.1, sodium: 6, allergens: [] },
  { menu_id: "mos-drink-6", menu_name: "アイスコーヒーL", category: "ドリンク", calories: 22, protein: 0.9, fat: 0.4, carb: 4.7, sodium: 9, allergens: [] },
  { menu_id: "mos-drink-7", menu_name: "アイスティー キャンディ茶葉S", category: "ドリンク", calories: 2, protein: 0.2, fat: 0.0, carb: 0.2, sodium: 2, allergens: [] },
  { menu_id: "mos-drink-8", menu_name: "アイスティー キャンディ茶葉M", category: "ドリンク", calories: 2, protein: 0.2, fat: 0.0, carb: 0.2, sodium: 2, allergens: [] },
  { menu_id: "mos-drink-9", menu_name: "アイスティー キャンディ茶葉L", category: "ドリンク", calories: 4, protein: 0.4, fat: 0.0, carb: 0.4, sodium: 4, allergens: [] },
  { menu_id: "mos-drink-10", menu_name: "オレンジブレンド100 S", category: "ドリンク", calories: 92, protein: 1.0, fat: 0.0, carb: 22.1, sodium: 88, allergens: [] },
  { menu_id: "mos-drink-11", menu_name: "オレンジブレンド100 M", category: "ドリンク", calories: 136, protein: 1.4, fat: 0.0, carb: 32.5, sodium: 130, allergens: [] },
  { menu_id: "mos-drink-12", menu_name: "オレンジブレンド100 L", category: "ドリンク", calories: 208, protein: 2.2, fat: 0.0, carb: 50.0, sodium: 200, allergens: [] },
  { menu_id: "mos-drink-13", menu_name: "ペプシコーラS", category: "ドリンク", calories: 87, protein: 0.0, fat: 0.0, carb: 21.7, sodium: 4, allergens: [] },
  { menu_id: "mos-drink-14", menu_name: "ペプシコーラM", category: "ドリンク", calories: 129, protein: 0.0, fat: 0.0, carb: 31.9, sodium: 6, allergens: [] },
  { menu_id: "mos-drink-15", menu_name: "ペプシコーラL", category: "ドリンク", calories: 198, protein: 0.0, fat: 0.0, carb: 49.0, sodium: 9, allergens: [] },
  { menu_id: "mos-drink-16", menu_name: "ジンジャーエールS", category: "ドリンク", calories: 74, protein: 0.0, fat: 0.0, carb: 18.6, sodium: 3, allergens: [] },
  { menu_id: "mos-drink-17", menu_name: "ジンジャーエールM", category: "ドリンク", calories: 109, protein: 0.0, fat: 0.0, carb: 27.4, sodium: 4, allergens: [] },
  { menu_id: "mos-drink-18", menu_name: "ジンジャーエールL", category: "ドリンク", calories: 168, protein: 0.0, fat: 0.0, carb: 42.1, sodium: 6, allergens: [] },
  { menu_id: "mos-drink-19", menu_name: "メロンソーダ（無果汁）S", category: "ドリンク", calories: 87, protein: 0.0, fat: 0.0, carb: 22.0, sodium: 5, allergens: [] },
  { menu_id: "mos-drink-20", menu_name: "メロンソーダ（無果汁）M", category: "ドリンク", calories: 129, protein: 0.0, fat: 0.0, carb: 32.5, sodium: 7, allergens: [] },
  { menu_id: "mos-drink-21", menu_name: "メロンソーダ（無果汁）L", category: "ドリンク", calories: 198, protein: 0.0, fat: 0.0, carb: 49.9, sodium: 11, allergens: [] },
  { menu_id: "mos-drink-22", menu_name: "アイスウーロン茶S", category: "ドリンク", calories: 2, protein: 0.0, fat: 0.0, carb: 0.3, sodium: 7, allergens: [] },
  { menu_id: "mos-drink-23", menu_name: "アイスウーロン茶M", category: "ドリンク", calories: 2, protein: 0.0, fat: 0.0, carb: 0.5, sodium: 11, allergens: [] },
  { menu_id: "mos-drink-24", menu_name: "アイスウーロン茶L", category: "ドリンク", calories: 3, protein: 0.0, fat: 0.0, carb: 0.7, sodium: 17, allergens: [] },
  { menu_id: "mos-drink-25", menu_name: "アイスカフェラテS", category: "ドリンク", calories: 63, protein: 3.4, fat: 3.8, carb: 5.1, sodium: 41, allergens: [] },
  { menu_id: "mos-drink-26", menu_name: "アイスカフェラテM", category: "ドリンク", calories: 100, protein: 5.4, fat: 6.1, carb: 8.1, sodium: 67, allergens: [] },
  { menu_id: "mos-drink-27", menu_name: "ブレンドコーヒー", category: "ドリンク", calories: 5, protein: 0.2, fat: 0.2, carb: 1.3, sodium: 4, allergens: [] },
  { menu_id: "mos-drink-28", menu_name: "紅茶 キャンディ茶葉", category: "ドリンク", calories: 2, protein: 0.2, fat: 0.0, carb: 0.2, sodium: 2, allergens: [] },
  { menu_id: "mos-drink-29", menu_name: "カフェラテ", category: "ドリンク", calories: 66, protein: 3.6, fat: 4.0, carb: 5.4, sodium: 44, allergens: [] },
  { menu_id: "mos-drink-30", menu_name: "まぜるシェイク いちご～とちあいか～S", category: "ドリンク", calories: 237, protein: 2.7, fat: 5.3, carb: 44.4, sodium: 125, allergens: [] },
  { menu_id: "mos-drink-31", menu_name: "まぜるシェイク いちご～とちあいか～M", category: "ドリンク", calories: 367, protein: 4.3, fat: 8.3, carb: 68.6, sodium: 195, allergens: [] },
  { menu_id: "mos-drink-32", menu_name: "まぜるシェイク 出雲の抹茶S", category: "ドリンク", calories: 218, protein: 3.5, fat: 5.5, carb: 38.6, sodium: 138, allergens: [] },
  { menu_id: "mos-drink-33", menu_name: "まぜるシェイク 出雲の抹茶M", category: "ドリンク", calories: 339, protein: 5.5, fat: 8.5, carb: 59.9, sodium: 215, allergens: [] },
  { menu_id: "mos-drink-34", menu_name: "モスシェイク バニラS", category: "ドリンク", calories: 201, protein: 3.0, fat: 5.8, carb: 34.1, sodium: 137, allergens: [] },
  { menu_id: "mos-drink-35", menu_name: "モスシェイク バニラM", category: "ドリンク", calories: 321, protein: 4.7, fat: 9.2, carb: 54.4, sodium: 218, allergens: [] },
  { menu_id: "mos-drink-36", menu_name: "モスシェイク コーヒーS", category: "ドリンク", calories: 183, protein: 2.8, fat: 5.2, carb: 31.0, sodium: 130, allergens: [] },
  { menu_id: "mos-drink-37", menu_name: "モスシェイク コーヒーM", category: "ドリンク", calories: 293, protein: 4.5, fat: 8.3, carb: 49.7, sodium: 209, allergens: [] },
  { menu_id: "mos-drink-38", menu_name: "くだものと野菜（125ml紙パック）", category: "ドリンク", calories: 52, protein: 0.0, fat: 0.0, carb: 13.0, sodium: 39, allergens: [] },
  { menu_id: "mos-drink-39", menu_name: "モスシュガー", category: "ドリンク", calories: 10, protein: 0.0, fat: 0.0, carb: 3.0, sodium: 0, allergens: [] },
  { menu_id: "mos-drink-40", menu_name: "ガムシロップ", category: "ドリンク", calories: 22, protein: 0.0, fat: 0.0, carb: 5.4, sodium: 0, allergens: [] },
  { menu_id: "mos-drink-41", menu_name: "コーヒーフレッシュ", category: "ドリンク", calories: 10, protein: 0.2, fat: 1.0, carb: 0.2, sodium: 11, allergens: [] },

  // 【スープ】
  { menu_id: "mos-soup-1", menu_name: "コーンスープ 北海道産コーン使用", category: "スープ", calories: 140, protein: 3.6, fat: 7.2, carb: 15.3, sodium: 522, allergens: [] },
  { menu_id: "mos-soup-2", menu_name: "クラムチャウダー", category: "スープ", calories: 119, protein: 4.1, fat: 4.3, carb: 15.8, sodium: 509, allergens: [] },
  { menu_id: "mos-soup-3", menu_name: "ブロッコリーとじゃがいものポタージュ", category: "スープ", calories: 119, protein: 1.6, fat: 7.2, carb: 12.1, sodium: 623, allergens: [] },

  // 【デザート】
  { menu_id: "mos-dessert-1", menu_name: "おしるこ（粒あん）", category: "デザート", calories: 253, protein: 6.5, fat: 0.7, carb: 55.4, sodium: 98, allergens: [] },
  { menu_id: "mos-dessert-2", menu_name: "シングル ふんわりスフレパンケーキ＜メープルシロップ＞", category: "デザート", calories: 333, protein: 5.6, fat: 16.7, carb: 39.9, sodium: 132, allergens: [] },
  { menu_id: "mos-dessert-3", menu_name: "ダブル ふんわりスフレパンケーキ＜メープルシロップ＞", category: "デザート", calories: 639, protein: 11.2, fat: 33.4, carb: 73.3, sodium: 264, allergens: [] },
  { menu_id: "mos-dessert-4", menu_name: "＜冷凍＞ふんわりスフレパンケーキ", category: "デザート", calories: 293, protein: 5.6, fat: 16.7, carb: 30.0, sodium: 132, allergens: [] },
  { menu_id: "mos-dessert-5", menu_name: "アイスドルチェ カップ ショコラ風ムースケーキ", category: "デザート", calories: 199, protein: 2.1, fat: 10.4, carb: 24.3, sodium: 57, allergens: [] },

  // 【低アレルゲンセット】
  { menu_id: "mos-lowallergy-1", menu_name: "ポークサンド〈米粉〉", category: "低アレルゲンセット", calories: 213, protein: 5.9, fat: 7.1, carb: 31.2, sodium: 571, allergens: [] },
  { menu_id: "mos-lowallergy-2", menu_name: "ポークロール〈米粉〉", category: "低アレルゲンセット", calories: 247, protein: 5.1, fat: 12.6, carb: 28.3, sodium: 571, allergens: [] },

  // 【ワイワイセット】
  { menu_id: "mos-waiwai-1", menu_name: "ワイワイバーガーセット（バーガー単品）", category: "ワイワイセット", calories: 311, protein: 13.6, fat: 13.1, carb: 34.6, sodium: 671, allergens: [] },
  { menu_id: "mos-waiwai-2", menu_name: "ワイワイチーズバーガーセット（バーガー単品）", category: "ワイワイセット", calories: 364, protein: 16.6, fat: 17.5, carb: 35.0, sodium: 860, allergens: [] },
  { menu_id: "mos-waiwai-3", menu_name: "ワイワイモスチーズバーガー（バーガー単品）", category: "ワイワイセット", calories: 378, protein: 16.9, fat: 19.5, carb: 33.9, sodium: 907, allergens: [] },
  { menu_id: "mos-waiwai-4", menu_name: "ワイワイナゲットセット（ナゲット単品）", category: "ワイワイセット", calories: 195, protein: 14.8, fat: 10.2, carb: 10.9, sodium: 319, allergens: [] },

  // 【朝モス】
  { menu_id: "mos-morning-1", menu_name: "モーニング野菜バーガー", category: "朝モス", calories: 337, protein: 13.9, fat: 15.5, carb: 35.5, sodium: 736, allergens: [] },
  { menu_id: "mos-morning-2", menu_name: "モーニング野菜チーズバーガー", category: "朝モス", calories: 390, protein: 16.9, fat: 19.9, carb: 35.9, sodium: 925, allergens: [] },
  { menu_id: "mos-morning-3", menu_name: "ソイモーニング野菜バーガー", category: "朝モス", calories: 316, protein: 11.6, fat: 12.8, carb: 38.8, sodium: 682, allergens: [] },
  { menu_id: "mos-morning-4", menu_name: "ソイモーニング野菜チーズバーガー", category: "朝モス", calories: 369, protein: 14.6, fat: 17.2, carb: 39.2, sodium: 871, allergens: [] },
  { menu_id: "mos-morning-5", menu_name: "モーニングドッグ", category: "朝モス", calories: 267, protein: 9.5, fat: 15.4, carb: 22.4, sodium: 540, allergens: [] },

  // 【夜モス】
  { menu_id: "mos-night-1", menu_name: "トリプルモスバーガー", category: "夜モス", calories: 680, protein: 31.8, fat: 39.3, carb: 50.0, sodium: 1691, allergens: [] },
  { menu_id: "mos-night-2", menu_name: "トリプルモスチーズバーガー", category: "夜モス", calories: 733, protein: 34.8, fat: 43.7, carb: 50.4, sodium: 1880, allergens: [] },

  // 【金曜日限定】
  { menu_id: "mos-friday-1", menu_name: "オニオンフライデーパック", category: "金曜日限定", calories: 1096, protein: 17.5, fat: 63.4, carb: 113.8, sodium: 2208, allergens: [] },

  // 【店舗限定】
  { menu_id: "mos-limited-1", menu_name: "ごちそうチリバーガー 2種のチーズ", category: "店舗限定", calories: 490, protein: 21.0, fat: 25.9, carb: 43.6, sodium: 1251, allergens: [] },
  { menu_id: "mos-limited-2", menu_name: "スパイシーごちそうチリバーガー 2種のチーズ", category: "店舗限定", calories: 492, protein: 21.1, fat: 25.9, carb: 44.0, sodium: 1317, allergens: [] },
  { menu_id: "mos-limited-3", menu_name: "ぜいたくモスバーガー", category: "店舗限定", calories: 591, protein: 24.9, fat: 31.8, carb: 52.0, sodium: 1613, allergens: [] },
  { menu_id: "mos-limited-4", menu_name: "ぜいたくモスチーズバーガー", category: "店舗限定", calories: 697, protein: 30.9, fat: 40.6, carb: 52.8, sodium: 1991, allergens: [] },

  // 【モスバーガー&カフェ専用メニュー】
  { menu_id: "mos-cafe-1", menu_name: "べジバーガー", category: "モスバーガー&カフェ", calories: 353, protein: 15.1, fat: 16.0, carb: 37.4, sodium: 804, allergens: [] },
  { menu_id: "mos-cafe-2", menu_name: "ダブルべジバーガー", category: "モスバーガー&カフェ", calories: 501, protein: 23.2, fat: 26.9, carb: 41.7, sodium: 1158, allergens: [] },
  { menu_id: "mos-cafe-3", menu_name: "ソイべジバーガー", category: "モスバーガー&カフェ", calories: 332, protein: 12.8, fat: 13.3, carb: 40.7, sodium: 750, allergens: [] },
  { menu_id: "mos-cafe-4", menu_name: "あごだし香る 和風粥（イートイン）", category: "モスバーガー&カフェ", calories: 158, protein: 6.5, fat: 4.0, carb: 24.0, sodium: 613, allergens: [] },
  { menu_id: "mos-cafe-5", menu_name: "鶏だし香る 台湾風粥～鹹粥～（イートイン）", category: "モスバーガー&カフェ", calories: 173, protein: 7.3, fat: 6.3, carb: 22.8, sodium: 573, allergens: [] },
  { menu_id: "mos-cafe-6", menu_name: "サラダ 和風ドレッシング＜減塩タイプ＞", category: "モスバーガー&カフェ", calories: 38, protein: 1.2, fat: 1.0, carb: 7.0, sodium: 211, allergens: [] },
  { menu_id: "mos-cafe-7", menu_name: "プレミアムスフレパンケーキ バターで味わう ふわしゅわスフレ", category: "モスバーガー&カフェ", calories: 172, protein: 4.7, fat: 8.1, carb: 20.2, sodium: 121, allergens: [] },
  { menu_id: "mos-cafe-8", menu_name: "プレミアムスフレパンケーキ バターで味わう ふわしゅわスフレ＜ハニーメイプル&ホイップ＞", category: "モスバーガー&カフェ", calories: 269, protein: 5.1, fat: 12.0, carb: 35.4, sodium: 132, allergens: [] },
  { menu_id: "mos-cafe-9", menu_name: "スウィートセパレートミルクティー", category: "モスバーガー&カフェ", calories: 175, protein: 4.9, fat: 5.5, carb: 28.7, sodium: 60, allergens: [] },
  { menu_id: "mos-cafe-10", menu_name: "練乳いちごみるく～とちあいか～", category: "モスバーガー&カフェ", calories: 264, protein: 6.7, fat: 11.1, carb: 36.5, sodium: 90, allergens: [] },
  { menu_id: "mos-cafe-11", menu_name: "デザートシェイク いちご～とちあいかソース使用～", category: "モスバーガー&カフェ", calories: 303, protein: 3.3, fat: 10.5, carb: 48.7, sodium: 139, allergens: [] },
  { menu_id: "mos-cafe-12", menu_name: "ロイヤルミルクティー", category: "モスバーガー&カフェ", calories: 133, protein: 4.5, fat: 5.0, carb: 18.9, sodium: 100, allergens: [] },
  { menu_id: "mos-cafe-13", menu_name: "出雲抹茶ラテ", category: "モスバーガー&カフェ", calories: 132, protein: 6.1, fat: 6.3, carb: 15.1, sodium: 79, allergens: [] },
  { menu_id: "mos-cafe-14", menu_name: "ホットココア", category: "モスバーガー&カフェ", calories: 265, protein: 7.6, fat: 13.7, carb: 29.5, sodium: 86, allergens: [] },
  { menu_id: "mos-cafe-15", menu_name: "アイスロイヤルミルクティー", category: "モスバーガー&カフェ", calories: 133, protein: 4.5, fat: 5.0, carb: 18.9, sodium: 100, allergens: [] },
  { menu_id: "mos-cafe-16", menu_name: "アイス出雲抹茶ラテ", category: "モスバーガー&カフェ", calories: 204, protein: 6.8, fat: 11.5, carb: 20.5, sodium: 95, allergens: [] },
  { menu_id: "mos-cafe-17", menu_name: "アイスココア", category: "モスバーガー&カフェ", calories: 315, protein: 9.2, fat: 15.6, carb: 36.6, sodium: 99, allergens: [] },
  { menu_id: "mos-cafe-18", menu_name: "デカフェ アイスコーヒー（カフェインレス）", category: "モスバーガー&カフェ", calories: 5, protein: 0.1, fat: 0.0, carb: 1.1, sodium: 0, allergens: [] },
  { menu_id: "mos-cafe-19", menu_name: "デカフェ コーヒー（カフェインレス）", category: "モスバーガー&カフェ", calories: 9, protein: 0.2, fat: 0.0, carb: 1.8, sodium: 0, allergens: [] },
  { menu_id: "mos-cafe-20", menu_name: "デカフェ カフェラテ（カフェインレス）", category: "モスバーガー&カフェ", calories: 87, protein: 4.7, fat: 5.3, carb: 7.2, sodium: 57, allergens: [] },
  { menu_id: "mos-cafe-21", menu_name: "デカフェ アイスカフェラテ（カフェインレス）", category: "モスバーガー&カフェ", calories: 87, protein: 4.7, fat: 5.3, carb: 7.2, sodium: 57, allergens: [] },
  { menu_id: "mos-cafe-22", menu_name: "チョコチャンクスコーン", category: "モスバーガー&カフェ", calories: 329, protein: 4.8, fat: 15.7, carb: 41.3, sodium: 242, allergens: [] },
];
