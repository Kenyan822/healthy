import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(process.cwd(), "data", "chain_restaurant.db"));

// スコア計算関数
function calculateScores(calories: number, protein: number, fat: number, carb: number, fiber: number = 3, sodium: number = 2.5) {
  // muscleScore: タンパク質重視（高タンパク・適正カロリー）- 0-100
  const muscleScore = Math.min(100, Math.max(0, (protein / calories * 100) * 3));

  // dietScore: 低カロリー・低脂質重視 - 0-100
  const dietScore = Math.min(100, Math.max(0, 100 - (calories / 15) - (fat * 1.5)));

  // healthScore: バランス重視 - 0-100
  const healthScore = Math.min(100, Math.max(0, 50 + (protein * 1) + (fiber * 3) - (sodium * 5) - (fat * 0.5)));

  return {
    muscleScore: Math.round(muscleScore * 10) / 10,
    dietScore: Math.round(dietScore * 10) / 10,
    healthScore: Math.round(healthScore * 10) / 10,
  };
}

// ============================
// チェーン店データ
// ============================
const newChains = [
  {
    chain_id: "saizeriya",
    chain_name: "サイゼリヤ",
    chain_name_en: "saizeriya",
    chain_name_kana: "さいぜりや",
    category: "famires",
    subcategory: "イタリアン",
    official_url: "https://www.saizeriya.co.jp/",
    description: "低価格で本格イタリアンが楽しめるファミリーレストラン。ヘルシーなサラダやグリル料理も充実。",
    store_count: 1069,
  },
  {
    chain_id: "cocoichi",
    chain_name: "CoCo壱番屋",
    chain_name_en: "cocoichi",
    chain_name_kana: "ここいちばんや",
    category: "curry",
    subcategory: "カレー専門店",
    official_url: "https://www.ichibanya.co.jp/",
    description: "カレー専門チェーン。トッピングやご飯の量、辛さを自由にカスタマイズ可能。",
    store_count: 1256,
  },
  {
    chain_id: "nakau",
    chain_name: "なか卯",
    chain_name_en: "nakau",
    chain_name_kana: "なかう",
    category: "gyudon",
    subcategory: "丼・うどん",
    official_url: "https://www.nakau.co.jp/",
    description: "親子丼やうどんが人気の和食チェーン。バランスの良いセットメニューが充実。",
    store_count: 461,
  },
  // 新規追加チェーン店
  {
    chain_id: "seven",
    chain_name: "セブン-イレブン",
    chain_name_en: "seven-eleven",
    chain_name_kana: "せぶんいれぶん",
    category: "convenience",
    subcategory: "コンビニ",
    official_url: "https://www.sej.co.jp/",
    description: "日本最大のコンビニチェーン。おにぎり、弁当、サラダなど豊富なラインナップ。",
    store_count: 21300,
  },
  {
    chain_id: "familymart",
    chain_name: "ファミリーマート",
    chain_name_en: "familymart",
    chain_name_kana: "ふぁみりーまーと",
    category: "convenience",
    subcategory: "コンビニ",
    official_url: "https://www.family.co.jp/",
    description: "ファミチキやフラッペで人気のコンビニ。健康志向商品も充実。",
    store_count: 16500,
  },
  {
    chain_id: "lawson",
    chain_name: "ローソン",
    chain_name_en: "lawson",
    chain_name_kana: "ろーそん",
    category: "convenience",
    subcategory: "コンビニ",
    official_url: "https://www.lawson.co.jp/",
    description: "からあげクンやロカボ商品が人気。ナチュラルローソンも展開。",
    store_count: 14600,
  },
  {
    chain_id: "ringerhut",
    chain_name: "リンガーハット",
    chain_name_en: "ringerhut",
    chain_name_kana: "りんがーはっと",
    category: "ramen",
    subcategory: "ちゃんぽん",
    official_url: "https://www.ringerhut.jp/",
    description: "長崎ちゃんぽん専門店。国産野菜をたっぷり使用したヘルシーメニューが特徴。",
    store_count: 670,
  },
  {
    chain_id: "marugame",
    chain_name: "丸亀製麺",
    chain_name_en: "marugame",
    chain_name_kana: "まるがめせいめん",
    category: "udon",
    subcategory: "うどん",
    official_url: "https://www.marugame-seimen.com/",
    description: "打ちたて、茹でたてのうどんを提供。天ぷらやおにぎりも人気。",
    store_count: 850,
  },
  {
    chain_id: "gusto",
    chain_name: "ガスト",
    chain_name_en: "gusto",
    chain_name_kana: "がすと",
    category: "famires",
    subcategory: "ファミレス",
    official_url: "https://www.skylark.co.jp/gusto/",
    description: "すかいらーくグループのファミレス。和洋中バラエティ豊かなメニュー。",
    store_count: 1350,
  },
  {
    chain_id: "sushiro",
    chain_name: "スシロー",
    chain_name_en: "sushiro",
    chain_name_kana: "すしろー",
    category: "sushi",
    subcategory: "回転寿司",
    official_url: "https://www.akindo-sushiro.co.jp/",
    description: "日本最大の回転寿司チェーン。新鮮なネタをリーズナブルに提供。",
    store_count: 650,
  },
  {
    chain_id: "mos",
    chain_name: "モスバーガー",
    chain_name_en: "mosburger",
    chain_name_kana: "もすばーがー",
    category: "fastfood",
    subcategory: "ハンバーガー",
    official_url: "https://www.mos.jp/",
    description: "日本発のハンバーガーチェーン。国産野菜や安全な食材にこだわり。",
    store_count: 1270,
  },
  {
    chain_id: "subway",
    chain_name: "サブウェイ",
    chain_name_en: "subway",
    chain_name_kana: "さぶうぇい",
    category: "fastfood",
    subcategory: "サンドイッチ",
    official_url: "https://www.subway.co.jp/",
    description: "野菜たっぷりのサンドイッチ。カスタマイズ自由でヘルシー志向に人気。",
    store_count: 180,
  },
  {
    chain_id: "ikinari",
    chain_name: "いきなり！ステーキ",
    chain_name_en: "ikinari-steak",
    chain_name_kana: "いきなりすてーき",
    category: "steak",
    subcategory: "ステーキ",
    official_url: "https://ikinaristeak.com/",
    description: "立ち食いスタイルのステーキ店。グラム単位で注文できる高タンパクメニュー。",
    store_count: 190,
  },
];

// ============================
// メニューデータ
// ============================

// 大戸屋 追加メニュー
const ootoyaMenus = [
  { menu_id: "ootoya-006", menu_name: "さばの味噌煮定食", price: 990, category: "煮魚定食", calories: 720, protein: 32.5, fat: 28.2, carb: 78.5, fiber: 3.8, sodium: 3.2 },
  { menu_id: "ootoya-007", menu_name: "鶏と野菜の黒酢あん定食", price: 940, category: "揚げ物定食", calories: 850, protein: 28.4, fat: 32.1, carb: 102.3, fiber: 4.2, sodium: 2.8 },
  { menu_id: "ootoya-008", menu_name: "手造り豆腐とチキンかつの定食", price: 1040, category: "揚げ物定食", calories: 890, protein: 38.2, fat: 35.5, carb: 95.2, fiber: 5.1, sodium: 2.5 },
  { menu_id: "ootoya-009", menu_name: "真だらと野菜の黒酢あん定食", price: 990, category: "揚げ物定食", calories: 680, protein: 26.8, fat: 22.4, carb: 88.5, fiber: 4.5, sodium: 2.2 },
  { menu_id: "ootoya-010", menu_name: "沖目鯛の醤油麹漬け炭火焼き定食", price: 1150, category: "焼き魚定食", calories: 620, protein: 34.2, fat: 18.5, carb: 72.8, fiber: 3.5, sodium: 2.8 },
  { menu_id: "ootoya-011", menu_name: "四元豚のロースかつ定食", price: 1150, category: "揚げ物定食", calories: 980, protein: 35.8, fat: 45.2, carb: 98.5, fiber: 3.2, sodium: 2.5 },
  { menu_id: "ootoya-012", menu_name: "ばくだん丼", price: 890, category: "丼", calories: 580, protein: 28.5, fat: 12.8, carb: 82.5, fiber: 4.8, sodium: 3.5 },
  { menu_id: "ootoya-013", menu_name: "もろみチキンの炭火焼き定食", price: 940, category: "焼き物定食", calories: 720, protein: 38.5, fat: 24.2, carb: 75.8, fiber: 3.2, sodium: 2.8 },
  { menu_id: "ootoya-014", menu_name: "大戸屋風鶏の唐揚げ定食", price: 890, category: "揚げ物定食", calories: 920, protein: 32.5, fat: 38.5, carb: 102.5, fiber: 2.8, sodium: 2.5 },
  { menu_id: "ootoya-015", menu_name: "野菜たっぷり味噌汁定食", price: 850, category: "定食", calories: 520, protein: 18.5, fat: 12.2, carb: 78.5, fiber: 8.5, sodium: 3.8 },
  { menu_id: "ootoya-016", menu_name: "炭火焼きハンバーグ定食", price: 990, category: "焼き物定食", calories: 850, protein: 32.8, fat: 35.2, carb: 88.5, fiber: 3.5, sodium: 2.8 },
  { menu_id: "ootoya-017", menu_name: "すけそう鱈と野菜の生姜煮定食", price: 940, category: "煮物定食", calories: 580, protein: 28.2, fat: 15.5, carb: 72.5, fiber: 5.2, sodium: 2.5 },
  { menu_id: "ootoya-018", menu_name: "特撰大戸屋御膳", price: 1350, category: "御膳", calories: 920, protein: 42.5, fat: 28.5, carb: 112.5, fiber: 6.2, sodium: 3.5 },
  { menu_id: "ootoya-019", menu_name: "鶏むね肉のグリル定食", price: 890, category: "焼き物定食", calories: 550, protein: 42.5, fat: 12.8, carb: 58.5, fiber: 4.2, sodium: 2.2 },
  { menu_id: "ootoya-020", menu_name: "豚の生姜焼き定食", price: 890, category: "焼き物定食", calories: 780, protein: 28.5, fat: 32.5, carb: 85.2, fiber: 3.5, sodium: 2.8 },
];

// やよい軒 追加メニュー
const yayoikenMenus = [
  { menu_id: "yayoiken-006", menu_name: "サバの味噌煮定食", price: 760, category: "煮魚定食", calories: 680, protein: 30.2, fat: 25.5, carb: 75.8, fiber: 3.5, sodium: 3.2 },
  { menu_id: "yayoiken-007", menu_name: "しょうが焼き定食", price: 730, category: "焼き物定食", calories: 820, protein: 28.5, fat: 35.2, carb: 92.5, fiber: 2.8, sodium: 2.8 },
  { menu_id: "yayoiken-008", menu_name: "チキン南蛮定食", price: 790, category: "揚げ物定食", calories: 950, protein: 32.5, fat: 42.5, carb: 105.2, fiber: 2.5, sodium: 2.5 },
  { menu_id: "yayoiken-009", menu_name: "味噌カツ定食", price: 890, category: "揚げ物定食", calories: 1020, protein: 35.8, fat: 48.5, carb: 108.5, fiber: 2.8, sodium: 3.2 },
  { menu_id: "yayoiken-010", menu_name: "納豆定食", price: 530, category: "定食", calories: 520, protein: 22.5, fat: 12.8, carb: 78.5, fiber: 6.5, sodium: 2.2 },
  { menu_id: "yayoiken-011", menu_name: "焼魚定食（ほっけ）", price: 820, category: "焼き魚定食", calories: 580, protein: 32.8, fat: 18.5, carb: 68.5, fiber: 3.2, sodium: 2.8 },
  { menu_id: "yayoiken-012", menu_name: "野菜炒め定食", price: 680, category: "炒め物定食", calories: 620, protein: 18.5, fat: 22.5, carb: 82.5, fiber: 6.8, sodium: 2.5 },
  { menu_id: "yayoiken-013", menu_name: "牛焼肉定食", price: 890, category: "焼き物定食", calories: 880, protein: 32.5, fat: 38.5, carb: 95.2, fiber: 3.2, sodium: 2.8 },
  { menu_id: "yayoiken-014", menu_name: "カットステーキ定食", price: 1090, category: "焼き物定食", calories: 780, protein: 42.5, fat: 32.5, carb: 68.5, fiber: 3.5, sodium: 2.5 },
  { menu_id: "yayoiken-015", menu_name: "鶏もも一枚揚げ定食", price: 820, category: "揚げ物定食", calories: 920, protein: 38.5, fat: 42.8, carb: 88.5, fiber: 2.5, sodium: 2.8 },
  { menu_id: "yayoiken-016", menu_name: "親子丼", price: 590, category: "丼", calories: 680, protein: 28.5, fat: 18.5, carb: 95.2, fiber: 2.2, sodium: 3.2 },
  { menu_id: "yayoiken-017", menu_name: "カツ丼", price: 730, category: "丼", calories: 920, protein: 32.5, fat: 35.8, carb: 112.5, fiber: 2.5, sodium: 3.5 },
  { menu_id: "yayoiken-018", menu_name: "ロースかつ定食", price: 890, category: "揚げ物定食", calories: 980, protein: 35.2, fat: 48.5, carb: 98.5, fiber: 2.8, sodium: 2.5 },
  { menu_id: "yayoiken-019", menu_name: "朝食納豆定食", price: 450, category: "朝食", calories: 480, protein: 20.5, fat: 10.8, carb: 72.5, fiber: 5.8, sodium: 2.2 },
  { menu_id: "yayoiken-020", menu_name: "和風ハンバーグ定食", price: 830, category: "焼き物定食", calories: 820, protein: 30.5, fat: 35.2, carb: 88.5, fiber: 3.8, sodium: 2.8 },
];

// すき家 追加メニュー
const sukiyaMenus = [
  { menu_id: "sukiya-006", menu_name: "ねぎ玉牛丼", price: 520, category: "牛丼", calories: 780, protein: 24.5, fat: 32.5, carb: 98.5, fiber: 2.8, sodium: 2.5 },
  { menu_id: "sukiya-007", menu_name: "キムチ牛丼", price: 520, category: "牛丼", calories: 740, protein: 23.8, fat: 28.5, carb: 95.2, fiber: 3.5, sodium: 3.2 },
  { menu_id: "sukiya-008", menu_name: "おろしポン酢牛丼", price: 550, category: "牛丼", calories: 680, protein: 22.5, fat: 25.8, carb: 88.5, fiber: 3.2, sodium: 2.8 },
  { menu_id: "sukiya-009", menu_name: "高菜明太マヨ牛丼", price: 580, category: "牛丼", calories: 820, protein: 24.2, fat: 38.5, carb: 95.8, fiber: 2.5, sodium: 3.5 },
  { menu_id: "sukiya-010", menu_name: "カレー", price: 550, category: "カレー", calories: 720, protein: 12.5, fat: 22.5, carb: 118.5, fiber: 3.8, sodium: 3.2 },
  { menu_id: "sukiya-011", menu_name: "牛あいがけカレー", price: 650, category: "カレー", calories: 920, protein: 25.5, fat: 35.8, carb: 125.2, fiber: 3.5, sodium: 3.5 },
  { menu_id: "sukiya-012", menu_name: "からあげカレー", price: 750, category: "カレー", calories: 980, protein: 28.5, fat: 42.5, carb: 122.5, fiber: 3.2, sodium: 3.2 },
  { menu_id: "sukiya-013", menu_name: "豚生姜焼き丼", price: 580, category: "丼", calories: 780, protein: 26.5, fat: 32.8, carb: 92.5, fiber: 2.5, sodium: 2.8 },
  { menu_id: "sukiya-014", menu_name: "豚生姜焼き定食", price: 680, category: "定食", calories: 820, protein: 28.5, fat: 35.2, carb: 88.5, fiber: 3.8, sodium: 2.8 },
  { menu_id: "sukiya-015", menu_name: "まぐろたたき丼", price: 650, category: "海鮮丼", calories: 520, protein: 28.5, fat: 8.5, carb: 82.5, fiber: 2.2, sodium: 2.8 },
  { menu_id: "sukiya-016", menu_name: "うな牛", price: 880, category: "牛丼", calories: 850, protein: 32.5, fat: 28.5, carb: 105.2, fiber: 2.5, sodium: 3.5 },
  { menu_id: "sukiya-017", menu_name: "牛丼ライト", price: 480, category: "牛丼", calories: 420, protein: 22.5, fat: 18.5, carb: 42.5, fiber: 8.5, sodium: 2.2 },
  { menu_id: "sukiya-018", menu_name: "朝食牛小鉢定食", price: 450, category: "朝食", calories: 580, protein: 22.8, fat: 18.5, carb: 78.5, fiber: 3.5, sodium: 2.5 },
  { menu_id: "sukiya-019", menu_name: "たまごかけごはん朝食", price: 350, category: "朝食", calories: 450, protein: 15.5, fat: 12.8, carb: 68.5, fiber: 2.2, sodium: 2.2 },
  { menu_id: "sukiya-020", menu_name: "鮭朝食", price: 480, category: "朝食", calories: 520, protein: 25.5, fat: 12.5, carb: 72.5, fiber: 2.8, sodium: 3.2 },
];

// 松屋 追加メニュー
const matsuyaMenus = [
  { menu_id: "matsuya-006", menu_name: "ネギたっぷり旨辛ネギたま牛めし", price: 560, category: "牛めし", calories: 780, protein: 25.5, fat: 32.8, carb: 95.2, fiber: 3.5, sodium: 3.2 },
  { menu_id: "matsuya-007", menu_name: "キムカル丼", price: 630, category: "丼", calories: 850, protein: 28.5, fat: 38.5, carb: 98.5, fiber: 3.2, sodium: 3.5 },
  { menu_id: "matsuya-008", menu_name: "ビビン丼", price: 580, category: "丼", calories: 720, protein: 24.5, fat: 28.5, carb: 92.5, fiber: 4.2, sodium: 3.2 },
  { menu_id: "matsuya-009", menu_name: "カルビ焼肉定食", price: 790, category: "焼肉定食", calories: 920, protein: 32.5, fat: 42.5, carb: 95.8, fiber: 3.5, sodium: 2.8 },
  { menu_id: "matsuya-010", menu_name: "豚バラ生姜焼定食", price: 690, category: "定食", calories: 850, protein: 28.5, fat: 38.5, carb: 92.5, fiber: 3.2, sodium: 2.8 },
  { menu_id: "matsuya-011", menu_name: "ブラウンソースハンバーグ定食", price: 730, category: "定食", calories: 880, protein: 30.5, fat: 42.5, carb: 88.5, fiber: 3.8, sodium: 2.5 },
  { menu_id: "matsuya-012", menu_name: "牛焼肉定食", price: 790, category: "焼肉定食", calories: 880, protein: 32.5, fat: 38.5, carb: 92.5, fiber: 3.2, sodium: 2.8 },
  { menu_id: "matsuya-013", menu_name: "ごろごろ煮込みチキンカレー", price: 650, category: "カレー", calories: 820, protein: 28.5, fat: 28.5, carb: 115.2, fiber: 4.5, sodium: 3.2 },
  { menu_id: "matsuya-014", menu_name: "オリジナルカレー", price: 490, category: "カレー", calories: 680, protein: 12.8, fat: 22.5, carb: 108.5, fiber: 3.8, sodium: 3.2 },
  { menu_id: "matsuya-015", menu_name: "カレギュウ", price: 680, category: "カレー", calories: 920, protein: 28.5, fat: 35.8, carb: 118.5, fiber: 3.5, sodium: 3.5 },
  { menu_id: "matsuya-016", menu_name: "厚切り豚テキ定食", price: 890, category: "定食", calories: 780, protein: 38.5, fat: 32.5, carb: 72.5, fiber: 3.2, sodium: 2.5 },
  { menu_id: "matsuya-017", menu_name: "うまトマハンバーグ定食", price: 790, category: "定食", calories: 820, protein: 30.5, fat: 35.8, carb: 92.5, fiber: 4.8, sodium: 2.5 },
  { menu_id: "matsuya-018", menu_name: "朝定食（選べる小鉢）", price: 450, category: "朝食", calories: 520, protein: 20.5, fat: 15.8, carb: 72.5, fiber: 3.5, sodium: 2.5 },
  { menu_id: "matsuya-019", menu_name: "焼鮭定食", price: 580, category: "朝食", calories: 550, protein: 28.5, fat: 15.2, carb: 68.5, fiber: 2.8, sodium: 3.2 },
  { menu_id: "matsuya-020", menu_name: "牛めしライト（野菜セット）", price: 520, category: "牛めし", calories: 450, protein: 22.5, fat: 18.5, carb: 48.5, fiber: 8.5, sodium: 2.2 },
];

// 吉野家 追加メニュー
const yoshinoyaMenus = [
  { menu_id: "yoshinoya-006", menu_name: "ねぎ玉牛丼", price: 547, category: "牛丼", calories: 780, protein: 25.5, fat: 32.5, carb: 95.8, fiber: 3.2, sodium: 2.8 },
  { menu_id: "yoshinoya-007", menu_name: "ねぎ塩牛丼", price: 547, category: "牛丼", calories: 720, protein: 24.5, fat: 28.5, carb: 92.5, fiber: 3.5, sodium: 3.2 },
  { menu_id: "yoshinoya-008", menu_name: "牛すき丼", price: 598, category: "牛丼", calories: 820, protein: 28.5, fat: 32.8, carb: 98.5, fiber: 3.2, sodium: 3.5 },
  { menu_id: "yoshinoya-009", menu_name: "牛カルビ丼", price: 657, category: "丼", calories: 920, protein: 28.5, fat: 42.5, carb: 102.5, fiber: 2.8, sodium: 2.8 },
  { menu_id: "yoshinoya-010", menu_name: "から揚げ丼", price: 598, category: "丼", calories: 880, protein: 28.5, fat: 38.5, carb: 105.2, fiber: 2.5, sodium: 2.8 },
  { menu_id: "yoshinoya-011", menu_name: "豚丼", price: 448, category: "丼", calories: 720, protein: 22.5, fat: 28.5, carb: 95.8, fiber: 2.5, sodium: 2.5 },
  { menu_id: "yoshinoya-012", menu_name: "豚生姜焼き定食", price: 657, category: "定食", calories: 820, protein: 28.5, fat: 35.2, carb: 88.5, fiber: 3.5, sodium: 2.8 },
  { menu_id: "yoshinoya-013", menu_name: "牛皿定食", price: 657, category: "定食", calories: 780, protein: 28.5, fat: 32.5, carb: 85.2, fiber: 3.2, sodium: 2.8 },
  { menu_id: "yoshinoya-014", menu_name: "サラ牛", price: 498, category: "牛丼", calories: 420, protein: 22.5, fat: 18.5, carb: 42.5, fiber: 8.5, sodium: 2.2 },
  { menu_id: "yoshinoya-015", menu_name: "ライザップ牛サラダ", price: 548, category: "サラダ", calories: 380, protein: 25.5, fat: 22.5, carb: 18.5, fiber: 6.8, sodium: 2.5 },
  { menu_id: "yoshinoya-016", menu_name: "朝牛セット", price: 448, category: "朝食", calories: 580, protein: 22.5, fat: 22.8, carb: 72.5, fiber: 3.2, sodium: 2.5 },
  { menu_id: "yoshinoya-017", menu_name: "納豆定食", price: 398, category: "朝食", calories: 480, protein: 20.5, fat: 12.5, carb: 72.5, fiber: 5.8, sodium: 2.2 },
  { menu_id: "yoshinoya-018", menu_name: "焼魚定食", price: 548, category: "朝食", calories: 520, protein: 28.5, fat: 12.8, carb: 68.5, fiber: 3.2, sodium: 3.2 },
  { menu_id: "yoshinoya-019", menu_name: "牛鮭定食", price: 698, category: "定食", calories: 680, protein: 35.5, fat: 22.5, carb: 78.5, fiber: 3.5, sodium: 3.5 },
  { menu_id: "yoshinoya-020", menu_name: "親子丼", price: 498, category: "丼", calories: 680, protein: 28.5, fat: 18.5, carb: 92.5, fiber: 2.2, sodium: 3.2 },
];

// サイゼリヤ メニュー
const saizeriyaMenus = [
  { menu_id: "saizeriya-001", menu_name: "ミラノ風ドリア", price: 300, category: "ドリア", calories: 520, protein: 15.5, fat: 22.5, carb: 65.8, fiber: 2.2, sodium: 2.5 },
  { menu_id: "saizeriya-002", menu_name: "若鶏のグリル（ディアボラ風）", price: 500, category: "グリル", calories: 480, protein: 38.5, fat: 28.5, carb: 12.5, fiber: 2.8, sodium: 2.2 },
  { menu_id: "saizeriya-003", menu_name: "リブステーキ", price: 1000, category: "ステーキ", calories: 620, protein: 42.5, fat: 45.2, carb: 5.8, fiber: 1.2, sodium: 2.5 },
  { menu_id: "saizeriya-004", menu_name: "小エビのサラダ", price: 350, category: "サラダ", calories: 180, protein: 12.5, fat: 8.5, carb: 15.2, fiber: 4.5, sodium: 1.8 },
  { menu_id: "saizeriya-005", menu_name: "柔らか青豆の温サラダ", price: 200, category: "サラダ", calories: 120, protein: 8.5, fat: 5.2, carb: 12.5, fiber: 6.8, sodium: 1.2 },
  { menu_id: "saizeriya-006", menu_name: "ペペロンチーノ", price: 350, category: "パスタ", calories: 580, protein: 12.5, fat: 18.5, carb: 88.5, fiber: 3.2, sodium: 2.2 },
  { menu_id: "saizeriya-007", menu_name: "たらこソースシシリー風", price: 400, category: "パスタ", calories: 620, protein: 18.5, fat: 22.5, carb: 85.2, fiber: 2.8, sodium: 3.5 },
  { menu_id: "saizeriya-008", menu_name: "ミートソースボロニア風", price: 400, category: "パスタ", calories: 680, protein: 22.5, fat: 25.8, carb: 88.5, fiber: 3.5, sodium: 2.8 },
  { menu_id: "saizeriya-009", menu_name: "辛味チキン", price: 300, category: "おつまみ", calories: 320, protein: 25.5, fat: 18.5, carb: 12.5, fiber: 1.5, sodium: 2.2 },
  { menu_id: "saizeriya-010", menu_name: "ハンバーグステーキ", price: 400, category: "グリル", calories: 520, protein: 28.5, fat: 35.2, carb: 18.5, fiber: 2.2, sodium: 2.5 },
  { menu_id: "saizeriya-011", menu_name: "チキンとブロッコリーのサラダ", price: 350, category: "サラダ", calories: 220, protein: 22.5, fat: 12.5, carb: 8.5, fiber: 5.8, sodium: 1.8 },
  { menu_id: "saizeriya-012", menu_name: "わかめサラダ", price: 300, category: "サラダ", calories: 80, protein: 3.5, fat: 2.8, carb: 12.5, fiber: 4.2, sodium: 2.2 },
  { menu_id: "saizeriya-013", menu_name: "エスカルゴのオーブン焼き", price: 400, category: "おつまみ", calories: 280, protein: 18.5, fat: 18.5, carb: 8.5, fiber: 1.2, sodium: 2.5 },
  { menu_id: "saizeriya-014", menu_name: "パルマ風スパゲッティ", price: 500, category: "パスタ", calories: 720, protein: 25.5, fat: 28.5, carb: 92.5, fiber: 3.2, sodium: 3.2 },
  { menu_id: "saizeriya-015", menu_name: "アロスティチーニ", price: 400, category: "グリル", calories: 380, protein: 28.5, fat: 25.5, carb: 5.2, fiber: 0.8, sodium: 2.2 },
  { menu_id: "saizeriya-016", menu_name: "野菜ときのこのピザ", price: 400, category: "ピザ", calories: 520, protein: 15.5, fat: 22.5, carb: 62.5, fiber: 4.5, sodium: 2.8 },
  { menu_id: "saizeriya-017", menu_name: "マルゲリータピザ", price: 400, category: "ピザ", calories: 580, protein: 18.5, fat: 25.8, carb: 68.5, fiber: 3.2, sodium: 2.5 },
  { menu_id: "saizeriya-018", menu_name: "プチフォッカ", price: 180, category: "パン", calories: 180, protein: 5.5, fat: 8.5, carb: 22.5, fiber: 1.5, sodium: 1.2 },
  { menu_id: "saizeriya-019", menu_name: "スープ入り塩味ボンゴレ", price: 400, category: "パスタ", calories: 480, protein: 18.5, fat: 15.8, carb: 68.5, fiber: 2.8, sodium: 3.2 },
  { menu_id: "saizeriya-020", menu_name: "鶏肉のトマトソース煮込み", price: 500, category: "煮込み", calories: 420, protein: 32.5, fat: 18.5, carb: 28.5, fiber: 4.5, sodium: 2.5 },
];

// CoCo壱番屋 メニュー
const cocoichiMenus = [
  { menu_id: "cocoichi-001", menu_name: "ポークカレー", price: 505, category: "カレー", calories: 755, protein: 15.5, fat: 22.5, carb: 118.5, fiber: 4.2, sodium: 3.5 },
  { menu_id: "cocoichi-002", menu_name: "チキンカツカレー", price: 815, category: "カレー", calories: 1020, protein: 32.5, fat: 38.5, carb: 132.5, fiber: 4.5, sodium: 3.8 },
  { menu_id: "cocoichi-003", menu_name: "ロースカツカレー", price: 866, category: "カレー", calories: 1150, protein: 35.8, fat: 48.5, carb: 138.5, fiber: 4.2, sodium: 3.8 },
  { menu_id: "cocoichi-004", menu_name: "手仕込みささみカツカレー", price: 815, category: "カレー", calories: 880, protein: 42.5, fat: 28.5, carb: 115.2, fiber: 4.5, sodium: 3.5 },
  { menu_id: "cocoichi-005", menu_name: "野菜カレー", price: 710, category: "カレー", calories: 680, protein: 12.5, fat: 18.5, carb: 115.8, fiber: 8.5, sodium: 3.2 },
  { menu_id: "cocoichi-006", menu_name: "ほうれん草カレー", price: 607, category: "カレー", calories: 720, protein: 14.5, fat: 20.5, carb: 118.5, fiber: 6.8, sodium: 3.2 },
  { menu_id: "cocoichi-007", menu_name: "やさいサラダカレー", price: 815, category: "カレー", calories: 520, protein: 12.5, fat: 15.8, carb: 82.5, fiber: 8.5, sodium: 2.8 },
  { menu_id: "cocoichi-008", menu_name: "ビーフカレー", price: 607, category: "カレー", calories: 820, protein: 22.5, fat: 28.5, carb: 115.2, fiber: 4.2, sodium: 3.5 },
  { menu_id: "cocoichi-009", menu_name: "ハンバーグカレー", price: 815, category: "カレー", calories: 980, protein: 32.5, fat: 42.5, carb: 118.5, fiber: 4.5, sodium: 3.5 },
  { menu_id: "cocoichi-010", menu_name: "エビにこみカレー", price: 866, category: "カレー", calories: 780, protein: 25.5, fat: 22.5, carb: 115.8, fiber: 4.8, sodium: 3.8 },
  { menu_id: "cocoichi-011", menu_name: "フィッシュフライカレー", price: 815, category: "カレー", calories: 920, protein: 28.5, fat: 35.8, carb: 125.2, fiber: 4.2, sodium: 3.5 },
  { menu_id: "cocoichi-012", menu_name: "チーズカレー", price: 607, category: "カレー", calories: 880, protein: 22.5, fat: 32.5, carb: 118.5, fiber: 4.2, sodium: 3.8 },
  { menu_id: "cocoichi-013", menu_name: "なすカレー", price: 607, category: "カレー", calories: 720, protein: 13.5, fat: 22.5, carb: 112.5, fiber: 5.8, sodium: 3.2 },
  { menu_id: "cocoichi-014", menu_name: "THEチキンカレー", price: 710, category: "カレー", calories: 820, protein: 32.5, fat: 25.8, carb: 108.5, fiber: 4.5, sodium: 3.2 },
  { menu_id: "cocoichi-015", menu_name: "低糖質カレー", price: 607, category: "低糖質", calories: 480, protein: 15.5, fat: 28.5, carb: 42.5, fiber: 12.5, sodium: 3.2 },
  { menu_id: "cocoichi-016", menu_name: "パリパリチキンカレー", price: 866, category: "カレー", calories: 980, protein: 35.8, fat: 42.5, carb: 115.2, fiber: 4.2, sodium: 3.5 },
  { menu_id: "cocoichi-017", menu_name: "豚しゃぶカレー", price: 866, category: "カレー", calories: 850, protein: 28.5, fat: 32.5, carb: 108.5, fiber: 4.5, sodium: 3.5 },
  { menu_id: "cocoichi-018", menu_name: "きのこカレー", price: 607, category: "カレー", calories: 680, protein: 12.8, fat: 18.5, carb: 112.5, fiber: 6.5, sodium: 3.2 },
  { menu_id: "cocoichi-019", menu_name: "スクランブルエッグカレー", price: 607, category: "カレー", calories: 820, protein: 22.5, fat: 32.8, carb: 108.5, fiber: 4.2, sodium: 3.2 },
  { menu_id: "cocoichi-020", menu_name: "海の幸カレー", price: 969, category: "カレー", calories: 780, protein: 28.5, fat: 22.5, carb: 112.5, fiber: 4.5, sodium: 4.2 },
];

// なか卯 メニュー
const nakauMenus = [
  { menu_id: "nakau-001", menu_name: "親子丼", price: 490, category: "丼", calories: 680, protein: 28.5, fat: 18.5, carb: 95.2, fiber: 2.2, sodium: 3.2 },
  { menu_id: "nakau-002", menu_name: "特製親子丼", price: 690, category: "丼", calories: 780, protein: 35.5, fat: 25.8, carb: 92.5, fiber: 2.5, sodium: 3.5 },
  { menu_id: "nakau-003", menu_name: "和風牛丼", price: 490, category: "牛丼", calories: 720, protein: 22.5, fat: 28.5, carb: 92.5, fiber: 2.5, sodium: 2.8 },
  { menu_id: "nakau-004", menu_name: "カツ丼", price: 690, category: "丼", calories: 920, protein: 32.5, fat: 38.5, carb: 108.5, fiber: 2.8, sodium: 3.2 },
  { menu_id: "nakau-005", menu_name: "きつねうどん", price: 390, category: "うどん", calories: 420, protein: 12.5, fat: 8.5, carb: 72.5, fiber: 3.2, sodium: 4.2 },
  { menu_id: "nakau-006", menu_name: "はいからうどん", price: 350, category: "うどん", calories: 380, protein: 10.5, fat: 5.8, carb: 68.5, fiber: 2.8, sodium: 4.5 },
  { menu_id: "nakau-007", menu_name: "肉うどん", price: 550, category: "うどん", calories: 520, protein: 22.5, fat: 15.8, carb: 72.5, fiber: 2.5, sodium: 4.2 },
  { menu_id: "nakau-008", menu_name: "鶏塩うどん", price: 550, category: "うどん", calories: 480, protein: 28.5, fat: 12.5, carb: 62.5, fiber: 2.2, sodium: 4.5 },
  { menu_id: "nakau-009", menu_name: "天ぷらうどん", price: 590, category: "うどん", calories: 580, protein: 15.5, fat: 22.5, carb: 78.5, fiber: 3.2, sodium: 4.2 },
  { menu_id: "nakau-010", menu_name: "ざるうどん", price: 350, category: "うどん", calories: 320, protein: 10.5, fat: 2.5, carb: 65.8, fiber: 2.5, sodium: 3.8 },
  { menu_id: "nakau-011", menu_name: "海鮮丼", price: 790, category: "丼", calories: 580, protein: 32.5, fat: 12.5, carb: 82.5, fiber: 2.2, sodium: 3.5 },
  { menu_id: "nakau-012", menu_name: "まぐろ丼", price: 690, category: "丼", calories: 520, protein: 32.5, fat: 8.5, carb: 78.5, fiber: 2.2, sodium: 3.2 },
  { menu_id: "nakau-013", menu_name: "鉄火丼", price: 590, category: "丼", calories: 480, protein: 28.5, fat: 5.8, carb: 78.5, fiber: 2.2, sodium: 3.5 },
  { menu_id: "nakau-014", menu_name: "サーモン丼", price: 690, category: "丼", calories: 580, protein: 28.5, fat: 15.8, carb: 78.5, fiber: 2.2, sodium: 3.2 },
  { menu_id: "nakau-015", menu_name: "親子丼とうどんセット", price: 750, category: "セット", calories: 920, protein: 35.5, fat: 22.5, carb: 145.2, fiber: 4.5, sodium: 5.8 },
  { menu_id: "nakau-016", menu_name: "朝まぜごはん", price: 390, category: "朝食", calories: 520, protein: 18.5, fat: 12.5, carb: 82.5, fiber: 3.5, sodium: 2.5 },
  { menu_id: "nakau-017", menu_name: "朝定食（目玉焼き）", price: 450, category: "朝食", calories: 580, protein: 22.5, fat: 18.5, carb: 78.5, fiber: 3.2, sodium: 2.8 },
  { menu_id: "nakau-018", menu_name: "塩さば朝定食", price: 520, category: "朝食", calories: 550, protein: 28.5, fat: 18.5, carb: 68.5, fiber: 2.8, sodium: 3.5 },
  { menu_id: "nakau-019", menu_name: "唐揚げ丼", price: 590, category: "丼", calories: 820, protein: 28.5, fat: 35.8, carb: 98.5, fiber: 2.5, sodium: 2.8 },
  { menu_id: "nakau-020", menu_name: "ローストビーフ丼", price: 790, category: "丼", calories: 680, protein: 35.5, fat: 22.5, carb: 78.5, fiber: 2.5, sodium: 2.8 },
];

// セブン-イレブン メニュー
const sevenMenus = [
  { menu_id: "seven-001", menu_name: "たんぱく質が摂れるチキン&スパイシーチリ", price: 429, category: "サラダ", calories: 238, protein: 26.2, fat: 11.5, carb: 8.5, fiber: 3.2, sodium: 2.1 },
  { menu_id: "seven-002", menu_name: "たんぱく質が摂れる鶏むね肉のサラダ", price: 397, category: "サラダ", calories: 182, protein: 24.8, fat: 6.2, carb: 5.8, fiber: 2.8, sodium: 1.8 },
  { menu_id: "seven-003", menu_name: "たんぱく質が摂れるローストチキン&エッグ", price: 462, category: "サラダ", calories: 265, protein: 28.5, fat: 12.8, carb: 9.2, fiber: 2.5, sodium: 2.2 },
  { menu_id: "seven-004", menu_name: "サラダチキン（プレーン）", price: 213, category: "惣菜", calories: 115, protein: 24.1, fat: 1.2, carb: 0.3, fiber: 0.0, sodium: 1.2 },
  { menu_id: "seven-005", menu_name: "サラダチキン（スモーク）", price: 213, category: "惣菜", calories: 118, protein: 25.2, fat: 1.5, carb: 0.5, fiber: 0.0, sodium: 1.3 },
  { menu_id: "seven-006", menu_name: "サラダチキン（ハーブ）", price: 213, category: "惣菜", calories: 112, protein: 23.8, fat: 1.3, carb: 0.8, fiber: 0.0, sodium: 1.1 },
  { menu_id: "seven-007", menu_name: "ゆで卵（2個入）", price: 162, category: "惣菜", calories: 152, protein: 12.4, fat: 10.2, carb: 0.6, fiber: 0.0, sodium: 0.8 },
  { menu_id: "seven-008", menu_name: "もち麦もっちり！梅こんぶおむすび", price: 140, category: "おにぎり", calories: 168, protein: 3.5, fat: 1.2, carb: 35.8, fiber: 2.2, sodium: 1.2 },
  { menu_id: "seven-009", menu_name: "鶏五目おにぎり", price: 151, category: "おにぎり", calories: 195, protein: 5.2, fat: 2.8, carb: 38.5, fiber: 1.5, sodium: 1.5 },
  { menu_id: "seven-010", menu_name: "鮭おにぎり", price: 162, category: "おにぎり", calories: 182, protein: 5.8, fat: 2.2, carb: 35.2, fiber: 0.8, sodium: 1.8 },
  { menu_id: "seven-011", menu_name: "1/2日分の野菜！だし香る鶏団子鍋", price: 537, category: "弁当", calories: 218, protein: 15.5, fat: 8.5, carb: 20.2, fiber: 6.5, sodium: 2.8 },
  { menu_id: "seven-012", menu_name: "たんぱく質が摂れる！鶏むね肉弁当", price: 537, category: "弁当", calories: 485, protein: 35.2, fat: 12.5, carb: 58.5, fiber: 3.2, sodium: 2.5 },
  { menu_id: "seven-013", menu_name: "幕の内弁当", price: 537, category: "弁当", calories: 652, protein: 22.5, fat: 18.5, carb: 98.5, fiber: 3.8, sodium: 3.2 },
  { menu_id: "seven-014", menu_name: "チキン南蛮弁当", price: 537, category: "弁当", calories: 782, protein: 28.5, fat: 32.5, carb: 95.2, fiber: 2.5, sodium: 2.8 },
  { menu_id: "seven-015", menu_name: "のり弁当", price: 429, category: "弁当", calories: 685, protein: 18.5, fat: 22.8, carb: 102.5, fiber: 2.2, sodium: 3.2 },
  { menu_id: "seven-016", menu_name: "プロテインバー チョコレート", price: 162, category: "プロテイン", calories: 185, protein: 15.0, fat: 8.5, carb: 12.5, fiber: 2.8, sodium: 0.5 },
  { menu_id: "seven-017", menu_name: "グリルチキン", price: 298, category: "惣菜", calories: 158, protein: 28.5, fat: 3.8, carb: 1.2, fiber: 0.2, sodium: 1.5 },
  { menu_id: "seven-018", menu_name: "枝豆（冷凍）", price: 213, category: "惣菜", calories: 135, protein: 11.5, fat: 6.2, carb: 8.5, fiber: 4.8, sodium: 0.8 },
  { menu_id: "seven-019", menu_name: "ブロッコリー（冷凍）", price: 192, category: "惣菜", calories: 42, protein: 4.8, fat: 0.5, carb: 6.5, fiber: 5.2, sodium: 0.2 },
  { menu_id: "seven-020", menu_name: "味付け半熟ゆでたまご", price: 86, category: "惣菜", calories: 76, protein: 6.2, fat: 5.1, carb: 0.5, fiber: 0.0, sodium: 0.6 },
];

// ファミリーマート メニュー
const familymartMenus = [
  { menu_id: "familymart-001", menu_name: "グリルチキン（タンドリー風）", price: 298, category: "惣菜", calories: 168, protein: 27.5, fat: 5.2, carb: 2.8, fiber: 0.5, sodium: 1.5 },
  { menu_id: "familymart-002", menu_name: "グリルチキン（ブラックペッパー）", price: 298, category: "惣菜", calories: 162, protein: 26.8, fat: 4.8, carb: 3.2, fiber: 0.3, sodium: 1.6 },
  { menu_id: "familymart-003", menu_name: "サラダチキン（プレーン）", price: 213, category: "惣菜", calories: 110, protein: 23.5, fat: 1.2, carb: 0.5, fiber: 0.0, sodium: 1.2 },
  { menu_id: "familymart-004", menu_name: "サラダチキン（タンドリー）", price: 228, category: "惣菜", calories: 125, protein: 24.2, fat: 2.5, carb: 1.8, fiber: 0.2, sodium: 1.4 },
  { menu_id: "familymart-005", menu_name: "ファミチキ", price: 198, category: "ホットスナック", calories: 252, protein: 12.8, fat: 15.8, carb: 14.2, fiber: 0.5, sodium: 1.2 },
  { menu_id: "familymart-006", menu_name: "スパイシーチキン", price: 198, category: "ホットスナック", calories: 248, protein: 14.5, fat: 14.2, carb: 15.5, fiber: 0.8, sodium: 1.5 },
  { menu_id: "familymart-007", menu_name: "たんぱく質が摂れるチキン&たまごサラダ", price: 398, category: "サラダ", calories: 225, protein: 25.8, fat: 10.5, carb: 6.8, fiber: 2.5, sodium: 1.8 },
  { menu_id: "familymart-008", menu_name: "RIZAPサラダチキンバー", price: 184, category: "惣菜", calories: 83, protein: 14.5, fat: 1.8, carb: 2.5, fiber: 0.2, sodium: 0.8 },
  { menu_id: "familymart-009", menu_name: "全粒粉サンド サラダチキンとたまご", price: 348, category: "サンドイッチ", calories: 285, protein: 18.5, fat: 12.2, carb: 25.8, fiber: 3.2, sodium: 1.8 },
  { menu_id: "familymart-010", menu_name: "ツナたまごサンド", price: 268, category: "サンドイッチ", calories: 320, protein: 12.5, fat: 18.5, carb: 28.5, fiber: 1.5, sodium: 1.5 },
  { menu_id: "familymart-011", menu_name: "炙り焼チキンステーキ弁当", price: 530, category: "弁当", calories: 655, protein: 32.5, fat: 22.8, carb: 78.5, fiber: 2.8, sodium: 2.8 },
  { menu_id: "familymart-012", menu_name: "明太のり弁当", price: 450, category: "弁当", calories: 698, protein: 19.5, fat: 24.2, carb: 102.5, fiber: 2.5, sodium: 3.5 },
  { menu_id: "familymart-013", menu_name: "シャケ弁当", price: 480, category: "弁当", calories: 585, protein: 22.5, fat: 15.8, carb: 85.5, fiber: 2.2, sodium: 3.2 },
  { menu_id: "familymart-014", menu_name: "手巻寿司 納豆", price: 118, category: "おにぎり", calories: 185, protein: 6.5, fat: 3.2, carb: 32.5, fiber: 2.5, sodium: 1.2 },
  { menu_id: "familymart-015", menu_name: "スーパー大麦 紅鮭わかめ", price: 151, category: "おにぎり", calories: 178, protein: 5.2, fat: 2.2, carb: 35.5, fiber: 2.8, sodium: 1.5 },
  { menu_id: "familymart-016", menu_name: "和風ツナマヨネーズ", price: 130, category: "おにぎり", calories: 215, protein: 5.8, fat: 6.5, carb: 35.2, fiber: 0.8, sodium: 1.2 },
  { menu_id: "familymart-017", menu_name: "1/3日分野菜が摂れるちゃんぽん", price: 498, category: "麺類", calories: 385, protein: 15.5, fat: 12.5, carb: 52.5, fiber: 5.8, sodium: 4.2 },
  { menu_id: "familymart-018", menu_name: "たんぱく質が摂れるチキンオーバーライス", price: 550, category: "弁当", calories: 520, protein: 32.5, fat: 15.8, carb: 62.5, fiber: 3.2, sodium: 2.5 },
  { menu_id: "familymart-019", menu_name: "ゆで卵（2個入り）", price: 151, category: "惣菜", calories: 148, protein: 12.2, fat: 10.0, carb: 0.5, fiber: 0.0, sodium: 0.8 },
  { menu_id: "familymart-020", menu_name: "RIZAP 糖質0g麺 担々麺風", price: 298, category: "麺類", calories: 95, protein: 8.5, fat: 4.2, carb: 5.8, fiber: 12.5, sodium: 2.2 },
];

// ローソン メニュー
const lawsonMenus = [
  { menu_id: "lawson-001", menu_name: "からあげクン レギュラー", price: 238, category: "ホットスナック", calories: 238, protein: 14.2, fat: 14.5, carb: 12.8, fiber: 0.5, sodium: 1.5 },
  { menu_id: "lawson-002", menu_name: "からあげクン レッド", price: 238, category: "ホットスナック", calories: 235, protein: 14.5, fat: 14.2, carb: 12.5, fiber: 0.5, sodium: 1.6 },
  { menu_id: "lawson-003", menu_name: "サラダチキン（プレーン）", price: 210, category: "惣菜", calories: 108, protein: 23.2, fat: 1.2, carb: 0.5, fiber: 0.0, sodium: 1.2 },
  { menu_id: "lawson-004", menu_name: "サラダチキン（スモーク）", price: 225, category: "惣菜", calories: 115, protein: 24.5, fat: 1.5, carb: 0.8, fiber: 0.0, sodium: 1.3 },
  { menu_id: "lawson-005", menu_name: "サラダチキン（柚子こしょう）", price: 225, category: "惣菜", calories: 112, protein: 23.8, fat: 1.3, carb: 1.2, fiber: 0.1, sodium: 1.4 },
  { menu_id: "lawson-006", menu_name: "たんぱく質が摂れる蒸し鶏のサラダ", price: 420, category: "サラダ", calories: 195, protein: 26.5, fat: 7.8, carb: 5.5, fiber: 3.2, sodium: 1.8 },
  { menu_id: "lawson-007", menu_name: "ブランパン（2個入）", price: 165, category: "パン", calories: 132, protein: 10.2, fat: 4.5, carb: 12.2, fiber: 5.8, sodium: 0.8 },
  { menu_id: "lawson-008", menu_name: "ブラン入り食パン（4枚入）", price: 165, category: "パン", calories: 122, protein: 5.8, fat: 3.5, carb: 18.5, fiber: 4.2, sodium: 0.6 },
  { menu_id: "lawson-009", menu_name: "糖質オフのふっくらパンケーキ", price: 165, category: "パン", calories: 185, protein: 8.5, fat: 10.2, carb: 15.5, fiber: 3.8, sodium: 0.5 },
  { menu_id: "lawson-010", menu_name: "もち麦入りおにぎり 枝豆と塩昆布", price: 140, category: "おにぎり", calories: 172, protein: 4.5, fat: 2.2, carb: 34.5, fiber: 3.2, sodium: 1.2 },
  { menu_id: "lawson-011", menu_name: "金しゃりおにぎり 塩鮭", price: 198, category: "おにぎり", calories: 195, protein: 6.2, fat: 3.5, carb: 36.5, fiber: 0.8, sodium: 1.8 },
  { menu_id: "lawson-012", menu_name: "ナチュラルローソン 野菜を食べるカレー", price: 550, category: "弁当", calories: 425, protein: 12.5, fat: 15.5, carb: 62.5, fiber: 8.5, sodium: 2.8 },
  { menu_id: "lawson-013", menu_name: "1/2日分の野菜が摂れる鶏ちゃんこ鍋", price: 530, category: "弁当", calories: 235, protein: 18.5, fat: 8.5, carb: 22.5, fiber: 6.8, sodium: 3.2 },
  { menu_id: "lawson-014", menu_name: "玉子焼き弁当", price: 398, category: "弁当", calories: 580, protein: 18.5, fat: 18.2, carb: 85.5, fiber: 2.2, sodium: 2.8 },
  { menu_id: "lawson-015", menu_name: "さばの味噌煮弁当", price: 530, category: "弁当", calories: 620, protein: 25.5, fat: 22.5, carb: 78.5, fiber: 2.5, sodium: 3.5 },
  { menu_id: "lawson-016", menu_name: "グリルチキン（プレーン）", price: 290, category: "惣菜", calories: 155, protein: 28.2, fat: 3.5, carb: 1.5, fiber: 0.2, sodium: 1.4 },
  { menu_id: "lawson-017", menu_name: "たまご蒸しパン（糖質オフ）", price: 150, category: "パン", calories: 165, protein: 6.5, fat: 10.5, carb: 12.5, fiber: 2.8, sodium: 0.5 },
  { menu_id: "lawson-018", menu_name: "サラダフィッシュ（サーモン）", price: 298, category: "惣菜", calories: 128, protein: 18.5, fat: 5.2, carb: 1.8, fiber: 0.1, sodium: 1.2 },
  { menu_id: "lawson-019", menu_name: "糖質0g麺 醤油ラーメン風", price: 298, category: "麺類", calories: 85, protein: 6.5, fat: 3.8, carb: 6.5, fiber: 11.5, sodium: 2.5 },
  { menu_id: "lawson-020", menu_name: "ゆで卵（2個入り）", price: 151, category: "惣菜", calories: 145, protein: 12.0, fat: 9.8, carb: 0.5, fiber: 0.0, sodium: 0.8 },
];

// リンガーハット メニュー
const ringerhutMenus = [
  { menu_id: "ringerhut-001", menu_name: "長崎ちゃんぽん", price: 720, category: "ちゃんぽん", calories: 682, protein: 28.5, fat: 22.5, carb: 88.5, fiber: 7.5, sodium: 4.2 },
  { menu_id: "ringerhut-002", menu_name: "野菜たっぷりちゃんぽん", price: 870, category: "ちゃんぽん", calories: 728, protein: 30.5, fat: 24.8, carb: 92.5, fiber: 12.5, sodium: 4.5 },
  { menu_id: "ringerhut-003", menu_name: "スモールちゃんぽん", price: 590, category: "ちゃんぽん", calories: 485, protein: 20.5, fat: 16.2, carb: 62.5, fiber: 5.2, sodium: 3.2 },
  { menu_id: "ringerhut-004", menu_name: "長崎皿うどん", price: 720, category: "皿うどん", calories: 752, protein: 22.5, fat: 32.5, carb: 95.8, fiber: 5.8, sodium: 3.8 },
  { menu_id: "ringerhut-005", menu_name: "野菜たっぷり皿うどん", price: 870, category: "皿うどん", calories: 795, protein: 25.2, fat: 35.5, carb: 98.5, fiber: 10.5, sodium: 4.2 },
  { menu_id: "ringerhut-006", menu_name: "太めん皿うどん", price: 780, category: "皿うどん", calories: 825, protein: 25.5, fat: 28.5, carb: 115.2, fiber: 6.2, sodium: 4.2 },
  { menu_id: "ringerhut-007", menu_name: "減塩ちゃんぽん", price: 750, category: "ちゃんぽん", calories: 665, protein: 27.5, fat: 21.5, carb: 86.5, fiber: 7.2, sodium: 2.8 },
  { menu_id: "ringerhut-008", menu_name: "ピリカラちゃんぽん", price: 780, category: "ちゃんぽん", calories: 695, protein: 28.8, fat: 23.5, carb: 89.5, fiber: 7.8, sodium: 4.5 },
  { menu_id: "ringerhut-009", menu_name: "えびちゃんぽん", price: 920, category: "ちゃんぽん", calories: 712, protein: 32.5, fat: 22.8, carb: 88.5, fiber: 7.5, sodium: 4.5 },
  { menu_id: "ringerhut-010", menu_name: "チャーハン", price: 590, category: "ご飯もの", calories: 620, protein: 15.5, fat: 22.5, carb: 88.5, fiber: 2.2, sodium: 2.8 },
  { menu_id: "ringerhut-011", menu_name: "ぎょうざ（5個）", price: 290, category: "サイド", calories: 245, protein: 8.5, fat: 12.5, carb: 25.5, fiber: 1.5, sodium: 1.5 },
  { menu_id: "ringerhut-012", menu_name: "野菜サラダ", price: 290, category: "サラダ", calories: 85, protein: 2.5, fat: 5.2, carb: 8.5, fiber: 3.2, sodium: 0.5 },
  { menu_id: "ringerhut-013", menu_name: "ちゃんぽんセット（餃子付き）", price: 1020, category: "セット", calories: 925, protein: 37.0, fat: 35.0, carb: 114.0, fiber: 9.0, sodium: 5.7 },
  { menu_id: "ringerhut-014", menu_name: "まぜ辛めん", price: 780, category: "ちゃんぽん", calories: 725, protein: 26.5, fat: 28.5, carb: 92.5, fiber: 6.8, sodium: 4.2 },
  { menu_id: "ringerhut-015", menu_name: "とんかつちゃんぽん", price: 980, category: "ちゃんぽん", calories: 895, protein: 38.5, fat: 35.8, carb: 102.5, fiber: 8.2, sodium: 4.8 },
  { menu_id: "ringerhut-016", menu_name: "長崎ちゃんぽん麺2倍", price: 970, category: "ちゃんぽん", calories: 985, protein: 38.5, fat: 28.5, carb: 142.5, fiber: 10.5, sodium: 5.2 },
  { menu_id: "ringerhut-017", menu_name: "角煮ちゃんぽん", price: 1080, category: "ちゃんぽん", calories: 852, protein: 35.5, fat: 32.5, carb: 98.5, fiber: 7.8, sodium: 4.8 },
  { menu_id: "ringerhut-018", menu_name: "薄皮ぎょうざ（10個）", price: 490, category: "サイド", calories: 420, protein: 15.5, fat: 22.5, carb: 42.5, fiber: 2.5, sodium: 2.5 },
  { menu_id: "ringerhut-019", menu_name: "低糖質麺ちゃんぽん", price: 820, category: "低糖質", calories: 485, protein: 28.5, fat: 22.5, carb: 42.5, fiber: 18.5, sodium: 4.2 },
  { menu_id: "ringerhut-020", menu_name: "チャーハンセット（小ちゃんぽん付き）", price: 980, category: "セット", calories: 1105, protein: 36.0, fat: 38.7, carb: 151.0, fiber: 7.4, sodium: 6.0 },
];

// 丸亀製麺 メニュー
const marugameMenus = [
  { menu_id: "marugame-001", menu_name: "かけうどん（並）", price: 340, category: "うどん", calories: 305, protein: 8.5, fat: 1.5, carb: 62.5, fiber: 2.5, sodium: 4.2 },
  { menu_id: "marugame-002", menu_name: "ぶっかけうどん（並）", price: 390, category: "うどん", calories: 315, protein: 9.2, fat: 1.8, carb: 63.5, fiber: 2.5, sodium: 3.5 },
  { menu_id: "marugame-003", menu_name: "釜揚げうどん（並）", price: 340, category: "うどん", calories: 295, protein: 8.2, fat: 1.2, carb: 61.5, fiber: 2.2, sodium: 2.8 },
  { menu_id: "marugame-004", menu_name: "釜玉うどん（並）", price: 420, category: "うどん", calories: 380, protein: 14.5, fat: 6.5, carb: 62.5, fiber: 2.5, sodium: 2.5 },
  { menu_id: "marugame-005", menu_name: "明太釜玉うどん（並）", price: 520, category: "うどん", calories: 415, protein: 18.5, fat: 8.2, carb: 63.5, fiber: 2.5, sodium: 3.8 },
  { menu_id: "marugame-006", menu_name: "肉うどん（並）", price: 590, category: "うどん", calories: 485, protein: 22.5, fat: 12.5, carb: 68.5, fiber: 2.8, sodium: 4.5 },
  { menu_id: "marugame-007", menu_name: "カレーうどん（並）", price: 590, category: "うどん", calories: 525, protein: 15.5, fat: 15.8, carb: 78.5, fiber: 4.2, sodium: 4.8 },
  { menu_id: "marugame-008", menu_name: "とろろ醤油うどん（並）", price: 440, category: "うどん", calories: 345, protein: 10.5, fat: 2.2, carb: 68.5, fiber: 3.5, sodium: 3.2 },
  { menu_id: "marugame-009", menu_name: "鬼おろし肉ぶっかけ（並）", price: 690, category: "うどん", calories: 520, protein: 25.5, fat: 14.5, carb: 68.5, fiber: 4.2, sodium: 4.2 },
  { menu_id: "marugame-010", menu_name: "かき揚げ", price: 180, category: "天ぷら", calories: 285, protein: 4.5, fat: 18.5, carb: 25.5, fiber: 2.2, sodium: 0.8 },
  { menu_id: "marugame-011", menu_name: "野菜かき揚げ", price: 160, category: "天ぷら", calories: 245, protein: 3.5, fat: 15.2, carb: 24.5, fiber: 3.5, sodium: 0.5 },
  { menu_id: "marugame-012", menu_name: "ちくわ天", price: 130, category: "天ぷら", calories: 145, protein: 5.5, fat: 8.5, carb: 12.5, fiber: 0.5, sodium: 0.8 },
  { menu_id: "marugame-013", menu_name: "えび天", price: 180, category: "天ぷら", calories: 85, protein: 8.2, fat: 4.5, carb: 4.2, fiber: 0.2, sodium: 0.5 },
  { menu_id: "marugame-014", menu_name: "いか天", price: 160, category: "天ぷら", calories: 115, protein: 8.5, fat: 5.8, carb: 7.5, fiber: 0.2, sodium: 0.5 },
  { menu_id: "marugame-015", menu_name: "とり天", price: 180, category: "天ぷら", calories: 165, protein: 14.5, fat: 9.5, carb: 6.5, fiber: 0.2, sodium: 0.8 },
  { menu_id: "marugame-016", menu_name: "おにぎり（鮭）", price: 140, category: "おにぎり", calories: 175, protein: 5.2, fat: 2.5, carb: 34.5, fiber: 0.5, sodium: 1.5 },
  { menu_id: "marugame-017", menu_name: "おにぎり（明太子）", price: 140, category: "おにぎり", calories: 168, protein: 5.8, fat: 1.8, carb: 33.5, fiber: 0.5, sodium: 1.8 },
  { menu_id: "marugame-018", menu_name: "牛すき釜玉（並）", price: 690, category: "うどん", calories: 585, protein: 28.5, fat: 18.5, carb: 72.5, fiber: 3.2, sodium: 4.5 },
  { menu_id: "marugame-019", menu_name: "親子丼", price: 490, category: "丼", calories: 615, protein: 28.5, fat: 15.5, carb: 88.5, fiber: 2.2, sodium: 3.5 },
  { menu_id: "marugame-020", menu_name: "旨辛肉つけうどん（並）", price: 690, category: "うどん", calories: 525, protein: 25.5, fat: 15.8, carb: 68.5, fiber: 3.5, sodium: 4.5 },
];

// ガスト メニュー
const gustoMenus = [
  { menu_id: "gusto-001", menu_name: "チーズINハンバーグ", price: 769, category: "ハンバーグ", calories: 585, protein: 28.5, fat: 38.5, carb: 28.5, fiber: 2.5, sodium: 2.8 },
  { menu_id: "gusto-002", menu_name: "若鶏のグリル 大葉おろしソース", price: 659, category: "チキン", calories: 425, protein: 38.5, fat: 22.5, carb: 12.5, fiber: 2.8, sodium: 2.2 },
  { menu_id: "gusto-003", menu_name: "ミックスグリル", price: 989, category: "グリル", calories: 785, protein: 42.5, fat: 52.5, carb: 28.5, fiber: 2.5, sodium: 3.5 },
  { menu_id: "gusto-004", menu_name: "山盛りポテトフライ", price: 329, category: "サイド", calories: 485, protein: 6.5, fat: 25.5, carb: 58.5, fiber: 5.2, sodium: 1.5 },
  { menu_id: "gusto-005", menu_name: "ガスト風から揚げ", price: 549, category: "チキン", calories: 520, protein: 32.5, fat: 32.5, carb: 22.5, fiber: 1.5, sodium: 2.2 },
  { menu_id: "gusto-006", menu_name: "1日分の野菜のベジ塩タンメン", price: 769, category: "麺類", calories: 485, protein: 18.5, fat: 15.5, carb: 68.5, fiber: 12.5, sodium: 5.2 },
  { menu_id: "gusto-007", menu_name: "ビーフシチューハンバーグ", price: 989, category: "ハンバーグ", calories: 725, protein: 32.5, fat: 42.5, carb: 48.5, fiber: 4.5, sodium: 3.2 },
  { menu_id: "gusto-008", menu_name: "オムライスビーフシチュー", price: 879, category: "洋食", calories: 825, protein: 25.5, fat: 35.5, carb: 102.5, fiber: 3.8, sodium: 3.5 },
  { menu_id: "gusto-009", menu_name: "マルゲリータピザ", price: 549, category: "ピザ", calories: 520, protein: 18.5, fat: 22.5, carb: 62.5, fiber: 3.2, sodium: 2.5 },
  { menu_id: "gusto-010", menu_name: "海老と野菜のトマトスパゲティ", price: 659, category: "パスタ", calories: 585, protein: 18.5, fat: 15.5, carb: 92.5, fiber: 5.5, sodium: 2.8 },
  { menu_id: "gusto-011", menu_name: "サラダうどん", price: 659, category: "麺類", calories: 385, protein: 12.5, fat: 8.5, carb: 65.5, fiber: 5.8, sodium: 3.5 },
  { menu_id: "gusto-012", menu_name: "ガーリックチキンステーキ", price: 769, category: "チキン", calories: 565, protein: 42.5, fat: 35.5, carb: 15.5, fiber: 2.2, sodium: 2.5 },
  { menu_id: "gusto-013", menu_name: "若鶏のグリル ガーリックソース", price: 659, category: "チキン", calories: 485, protein: 40.5, fat: 28.5, carb: 12.5, fiber: 2.2, sodium: 2.5 },
  { menu_id: "gusto-014", menu_name: "きのこ雑炊", price: 439, category: "ご飯もの", calories: 285, protein: 8.5, fat: 5.5, carb: 52.5, fiber: 3.5, sodium: 2.8 },
  { menu_id: "gusto-015", menu_name: "シーザーサラダ", price: 439, category: "サラダ", calories: 185, protein: 8.5, fat: 12.5, carb: 10.5, fiber: 3.8, sodium: 1.5 },
  { menu_id: "gusto-016", menu_name: "ガストバーガー", price: 549, category: "ハンバーガー", calories: 625, protein: 28.5, fat: 32.5, carb: 55.5, fiber: 2.5, sodium: 2.5 },
  { menu_id: "gusto-017", menu_name: "低糖質ハンバーグ ブロッコリー添え", price: 769, category: "低糖質", calories: 385, protein: 32.5, fat: 25.5, carb: 8.5, fiber: 5.8, sodium: 2.2 },
  { menu_id: "gusto-018", menu_name: "10品目のサラダ", price: 439, category: "サラダ", calories: 125, protein: 5.5, fat: 6.5, carb: 12.5, fiber: 4.5, sodium: 0.8 },
  { menu_id: "gusto-019", menu_name: "ミートドリア", price: 549, category: "ドリア", calories: 585, protein: 22.5, fat: 25.5, carb: 68.5, fiber: 2.8, sodium: 2.8 },
  { menu_id: "gusto-020", menu_name: "彩り野菜カレー", price: 659, category: "カレー", calories: 625, protein: 15.5, fat: 18.5, carb: 102.5, fiber: 8.5, sodium: 3.2 },
];

// スシロー メニュー
const sushiroMenus = [
  { menu_id: "sushiro-001", menu_name: "まぐろ", price: 120, category: "赤身", calories: 72, protein: 8.5, fat: 1.2, carb: 7.5, fiber: 0.2, sodium: 0.5 },
  { menu_id: "sushiro-002", menu_name: "サーモン", price: 120, category: "サーモン", calories: 85, protein: 7.8, fat: 3.5, carb: 7.2, fiber: 0.2, sodium: 0.4 },
  { menu_id: "sushiro-003", menu_name: "えび", price: 120, category: "えび・かに", calories: 62, protein: 7.5, fat: 0.5, carb: 7.5, fiber: 0.1, sodium: 0.4 },
  { menu_id: "sushiro-004", menu_name: "いか", price: 120, category: "いか・たこ", calories: 58, protein: 7.2, fat: 0.3, carb: 7.5, fiber: 0.1, sodium: 0.3 },
  { menu_id: "sushiro-005", menu_name: "たまご", price: 120, category: "その他", calories: 85, protein: 4.5, fat: 2.5, carb: 12.5, fiber: 0.1, sodium: 0.5 },
  { menu_id: "sushiro-006", menu_name: "納豆巻", price: 120, category: "巻き物", calories: 125, protein: 5.5, fat: 2.2, carb: 22.5, fiber: 2.2, sodium: 0.8 },
  { menu_id: "sushiro-007", menu_name: "えびアボカド", price: 150, category: "創作", calories: 98, protein: 6.5, fat: 4.5, carb: 10.5, fiber: 1.5, sodium: 0.5 },
  { menu_id: "sushiro-008", menu_name: "中トロ", price: 180, category: "赤身", calories: 105, protein: 8.2, fat: 5.5, carb: 7.2, fiber: 0.2, sodium: 0.4 },
  { menu_id: "sushiro-009", menu_name: "はまち", price: 150, category: "青魚", calories: 95, protein: 8.5, fat: 4.2, carb: 7.2, fiber: 0.2, sodium: 0.4 },
  { menu_id: "sushiro-010", menu_name: "あじ", price: 120, category: "青魚", calories: 78, protein: 8.0, fat: 2.5, carb: 7.2, fiber: 0.2, sodium: 0.4 },
  { menu_id: "sushiro-011", menu_name: "サーモンアボカド", price: 150, category: "創作", calories: 112, protein: 7.2, fat: 5.8, carb: 10.2, fiber: 1.5, sodium: 0.5 },
  { menu_id: "sushiro-012", menu_name: "炙りサーモンバジルチーズ", price: 150, category: "創作", calories: 125, protein: 8.5, fat: 6.5, carb: 9.5, fiber: 0.3, sodium: 0.6 },
  { menu_id: "sushiro-013", menu_name: "たこ", price: 120, category: "いか・たこ", calories: 55, protein: 7.8, fat: 0.3, carb: 7.2, fiber: 0.1, sodium: 0.4 },
  { menu_id: "sushiro-014", menu_name: "えんがわ", price: 120, category: "白身", calories: 95, protein: 6.5, fat: 5.2, carb: 7.5, fiber: 0.2, sodium: 0.4 },
  { menu_id: "sushiro-015", menu_name: "ほたて", price: 180, category: "貝", calories: 68, protein: 8.5, fat: 0.5, carb: 8.2, fiber: 0.1, sodium: 0.5 },
  { menu_id: "sushiro-016", menu_name: "茶碗蒸し", price: 220, category: "サイド", calories: 125, protein: 8.5, fat: 5.5, carb: 10.5, fiber: 0.5, sodium: 1.2 },
  { menu_id: "sushiro-017", menu_name: "あおさの味噌汁", price: 120, category: "サイド", calories: 35, protein: 2.5, fat: 1.2, carb: 4.5, fiber: 1.5, sodium: 1.8 },
  { menu_id: "sushiro-018", menu_name: "えびの天ぷら", price: 150, category: "揚げ物", calories: 125, protein: 8.5, fat: 5.8, carb: 12.5, fiber: 0.5, sodium: 0.6 },
  { menu_id: "sushiro-019", menu_name: "特ネタ大とろ", price: 360, category: "赤身", calories: 145, protein: 7.5, fat: 10.5, carb: 7.2, fiber: 0.2, sodium: 0.4 },
  { menu_id: "sushiro-020", menu_name: "まぐろユッケ", price: 150, category: "創作", calories: 95, protein: 9.5, fat: 3.5, carb: 8.5, fiber: 0.3, sodium: 0.8 },
];

// モスバーガー メニュー
const mosMenus = [
  { menu_id: "mos-001", menu_name: "モスバーガー", price: 420, category: "バーガー", calories: 368, protein: 15.5, fat: 17.5, carb: 38.5, fiber: 2.2, sodium: 1.8 },
  { menu_id: "mos-002", menu_name: "テリヤキバーガー", price: 400, category: "バーガー", calories: 385, protein: 14.5, fat: 18.5, carb: 42.5, fiber: 1.8, sodium: 2.2 },
  { menu_id: "mos-003", menu_name: "モスチーズバーガー", price: 470, category: "バーガー", calories: 425, protein: 18.5, fat: 22.5, carb: 38.5, fiber: 2.2, sodium: 2.2 },
  { menu_id: "mos-004", menu_name: "フィッシュバーガー", price: 400, category: "バーガー", calories: 342, protein: 14.5, fat: 15.5, carb: 38.5, fiber: 1.8, sodium: 1.8 },
  { menu_id: "mos-005", menu_name: "モスの菜摘 テリヤキチキン", price: 380, category: "菜摘", calories: 215, protein: 18.5, fat: 10.5, carb: 12.5, fiber: 2.5, sodium: 1.5 },
  { menu_id: "mos-006", menu_name: "モスの菜摘 モス野菜", price: 380, category: "菜摘", calories: 185, protein: 12.5, fat: 10.5, carb: 12.5, fiber: 3.2, sodium: 1.2 },
  { menu_id: "mos-007", menu_name: "モスライスバーガー 海鮮かきあげ", price: 450, category: "ライスバーガー", calories: 385, protein: 8.5, fat: 15.5, carb: 55.5, fiber: 2.5, sodium: 2.2 },
  { menu_id: "mos-008", menu_name: "ソイモスバーガー", price: 450, category: "バーガー", calories: 325, protein: 15.5, fat: 12.5, carb: 38.5, fiber: 3.5, sodium: 1.8 },
  { menu_id: "mos-009", menu_name: "グリーンバーガー", price: 520, category: "バーガー", calories: 285, protein: 12.5, fat: 8.5, carb: 42.5, fiber: 4.5, sodium: 1.5 },
  { menu_id: "mos-010", menu_name: "スパイシーモスバーガー", price: 450, category: "バーガー", calories: 395, protein: 16.5, fat: 19.5, carb: 40.5, fiber: 2.5, sodium: 2.2 },
  { menu_id: "mos-011", menu_name: "モスチキン", price: 280, category: "サイド", calories: 285, protein: 18.5, fat: 18.5, carb: 12.5, fiber: 0.5, sodium: 1.2 },
  { menu_id: "mos-012", menu_name: "オニオンリング", price: 280, category: "サイド", calories: 265, protein: 4.5, fat: 15.5, carb: 28.5, fiber: 2.5, sodium: 0.8 },
  { menu_id: "mos-013", menu_name: "フレンチフライポテト S", price: 230, category: "サイド", calories: 225, protein: 3.2, fat: 12.5, carb: 26.5, fiber: 2.2, sodium: 0.5 },
  { menu_id: "mos-014", menu_name: "ガーデンサラダ", price: 280, category: "サラダ", calories: 45, protein: 2.5, fat: 0.5, carb: 8.5, fiber: 3.2, sodium: 0.2 },
  { menu_id: "mos-015", menu_name: "和風ドレッシングサラダ", price: 310, category: "サラダ", calories: 85, protein: 3.5, fat: 5.5, carb: 8.5, fiber: 3.5, sodium: 0.8 },
  { menu_id: "mos-016", menu_name: "モス野菜バーガー", price: 420, category: "バーガー", calories: 328, protein: 13.5, fat: 14.5, carb: 38.5, fiber: 3.8, sodium: 1.5 },
  { menu_id: "mos-017", menu_name: "ロースカツバーガー", price: 450, category: "バーガー", calories: 465, protein: 18.5, fat: 25.5, carb: 42.5, fiber: 2.2, sodium: 2.2 },
  { menu_id: "mos-018", menu_name: "とびきりハンバーグサンド", price: 550, category: "バーガー", calories: 525, protein: 25.5, fat: 28.5, carb: 42.5, fiber: 2.5, sodium: 2.5 },
  { menu_id: "mos-019", menu_name: "海老カツバーガー", price: 470, category: "バーガー", calories: 385, protein: 12.5, fat: 18.5, carb: 45.5, fiber: 2.2, sodium: 1.8 },
  { menu_id: "mos-020", menu_name: "玄米フレークシェイク バニラ", price: 350, category: "ドリンク", calories: 265, protein: 5.5, fat: 8.5, carb: 42.5, fiber: 1.5, sodium: 0.5 },
];

// サブウェイ メニュー
const subwayMenus = [
  { menu_id: "subway-001", menu_name: "ローストチキン", price: 490, category: "サンドイッチ", calories: 282, protein: 22.5, fat: 4.5, carb: 38.5, fiber: 4.5, sodium: 1.8 },
  { menu_id: "subway-002", menu_name: "ターキーブレスト", price: 490, category: "サンドイッチ", calories: 265, protein: 21.5, fat: 3.5, carb: 38.5, fiber: 4.5, sodium: 1.5 },
  { menu_id: "subway-003", menu_name: "チキンブレスト", price: 560, category: "サンドイッチ", calories: 295, protein: 25.5, fat: 5.2, carb: 38.5, fiber: 4.5, sodium: 1.8 },
  { menu_id: "subway-004", menu_name: "ローストビーフ", price: 660, category: "サンドイッチ", calories: 315, protein: 24.5, fat: 8.5, carb: 38.5, fiber: 4.5, sodium: 2.2 },
  { menu_id: "subway-005", menu_name: "BLT", price: 490, category: "サンドイッチ", calories: 325, protein: 14.5, fat: 12.5, carb: 40.5, fiber: 4.5, sodium: 2.2 },
  { menu_id: "subway-006", menu_name: "ツナ", price: 490, category: "サンドイッチ", calories: 385, protein: 18.5, fat: 16.5, carb: 40.5, fiber: 4.5, sodium: 1.8 },
  { menu_id: "subway-007", menu_name: "えびアボカド", price: 560, category: "サンドイッチ", calories: 325, protein: 15.5, fat: 10.5, carb: 42.5, fiber: 5.8, sodium: 1.5 },
  { menu_id: "subway-008", menu_name: "てり焼きチキン", price: 490, category: "サンドイッチ", calories: 345, protein: 22.5, fat: 8.5, carb: 45.5, fiber: 4.5, sodium: 2.5 },
  { menu_id: "subway-009", menu_name: "チーズローストチキン", price: 560, category: "サンドイッチ", calories: 355, protein: 26.5, fat: 10.5, carb: 38.5, fiber: 4.5, sodium: 2.2 },
  { menu_id: "subway-010", menu_name: "生ハム＆マスカルポーネ", price: 610, category: "サンドイッチ", calories: 375, protein: 20.5, fat: 14.5, carb: 42.5, fiber: 4.5, sodium: 2.5 },
  { menu_id: "subway-011", menu_name: "ベジーデライト", price: 410, category: "サンドイッチ", calories: 225, protein: 8.5, fat: 2.5, carb: 42.5, fiber: 5.8, sodium: 0.8 },
  { menu_id: "subway-012", menu_name: "アボカドベジー", price: 490, category: "サンドイッチ", calories: 285, protein: 9.5, fat: 8.5, carb: 45.5, fiber: 7.5, sodium: 0.8 },
  { menu_id: "subway-013", menu_name: "直火焼きチキン", price: 490, category: "サンドイッチ", calories: 288, protein: 24.5, fat: 4.8, carb: 38.5, fiber: 4.5, sodium: 1.8 },
  { menu_id: "subway-014", menu_name: "クラブサンド（ハム・ターキー・ベーコン）", price: 610, category: "サンドイッチ", calories: 395, protein: 25.5, fat: 14.5, carb: 42.5, fiber: 4.5, sodium: 2.8 },
  { menu_id: "subway-015", menu_name: "たまご", price: 450, category: "サンドイッチ", calories: 365, protein: 15.5, fat: 14.5, carb: 42.5, fiber: 4.5, sodium: 1.5 },
  { menu_id: "subway-016", menu_name: "サラダ ローストチキン", price: 490, category: "サラダ", calories: 125, protein: 18.5, fat: 3.5, carb: 8.5, fiber: 4.2, sodium: 1.2 },
  { menu_id: "subway-017", menu_name: "サラダ ターキーブレスト", price: 490, category: "サラダ", calories: 108, protein: 17.5, fat: 2.5, carb: 8.5, fiber: 4.2, sodium: 1.0 },
  { menu_id: "subway-018", menu_name: "サラダ チキンブレスト", price: 560, category: "サラダ", calories: 138, protein: 21.5, fat: 4.2, carb: 8.5, fiber: 4.2, sodium: 1.2 },
  { menu_id: "subway-019", menu_name: "チョップドサラダ ローストチキン", price: 550, category: "サラダ", calories: 145, protein: 20.5, fat: 4.5, carb: 10.5, fiber: 5.5, sodium: 1.2 },
  { menu_id: "subway-020", menu_name: "チョップドサラダ えびアボカド", price: 620, category: "サラダ", calories: 168, protein: 12.5, fat: 9.5, carb: 12.5, fiber: 6.2, sodium: 1.0 },
];

// いきなり！ステーキ メニュー
const ikinariMenus = [
  { menu_id: "ikinari-001", menu_name: "ワイルドステーキ 200g", price: 1290, category: "ステーキ", calories: 485, protein: 42.5, fat: 32.5, carb: 2.5, fiber: 0.2, sodium: 1.8 },
  { menu_id: "ikinari-002", menu_name: "ワイルドステーキ 300g", price: 1790, category: "ステーキ", calories: 728, protein: 63.8, fat: 48.8, carb: 3.8, fiber: 0.3, sodium: 2.7 },
  { menu_id: "ikinari-003", menu_name: "リブロースステーキ 200g", price: 1890, category: "ステーキ", calories: 545, protein: 38.5, fat: 42.5, carb: 1.8, fiber: 0.2, sodium: 1.8 },
  { menu_id: "ikinari-004", menu_name: "ヒレステーキ 200g", price: 2290, category: "ステーキ", calories: 365, protein: 48.5, fat: 18.5, carb: 1.5, fiber: 0.2, sodium: 1.5 },
  { menu_id: "ikinari-005", menu_name: "TOP リブロースステーキ 200g", price: 2190, category: "ステーキ", calories: 565, protein: 40.5, fat: 44.5, carb: 1.8, fiber: 0.2, sodium: 1.8 },
  { menu_id: "ikinari-006", menu_name: "ワイルドハンバーグ 300g", price: 1190, category: "ハンバーグ", calories: 585, protein: 35.5, fat: 42.5, carb: 12.5, fiber: 0.8, sodium: 2.2 },
  { menu_id: "ikinari-007", menu_name: "ハンバーグ＆ステーキ コンボ", price: 1690, category: "コンボ", calories: 685, protein: 48.5, fat: 48.5, carb: 8.5, fiber: 0.5, sodium: 2.5 },
  { menu_id: "ikinari-008", menu_name: "ミスジステーキ 200g", price: 1990, category: "ステーキ", calories: 485, protein: 42.5, fat: 35.5, carb: 1.5, fiber: 0.2, sodium: 1.5 },
  { menu_id: "ikinari-009", menu_name: "乱切りカットステーキ 200g", price: 1490, category: "ステーキ", calories: 465, protein: 40.5, fat: 32.5, carb: 2.5, fiber: 0.2, sodium: 1.8 },
  { menu_id: "ikinari-010", menu_name: "サーロインステーキ 200g", price: 2090, category: "ステーキ", calories: 525, protein: 38.5, fat: 40.5, carb: 1.8, fiber: 0.2, sodium: 1.8 },
  { menu_id: "ikinari-011", menu_name: "ライス", price: 220, category: "サイド", calories: 285, protein: 4.5, fat: 0.5, carb: 62.5, fiber: 0.5, sodium: 0.0 },
  { menu_id: "ikinari-012", menu_name: "サラダ", price: 290, category: "サイド", calories: 45, protein: 2.5, fat: 0.5, carb: 8.5, fiber: 3.2, sodium: 0.2 },
  { menu_id: "ikinari-013", menu_name: "ブロッコリー", price: 190, category: "サイド", calories: 35, protein: 4.2, fat: 0.5, carb: 5.5, fiber: 4.5, sodium: 0.1 },
  { menu_id: "ikinari-014", menu_name: "コーンスープ", price: 290, category: "サイド", calories: 125, protein: 3.5, fat: 5.5, carb: 16.5, fiber: 0.8, sodium: 1.2 },
  { menu_id: "ikinari-015", menu_name: "いきなりステーキセット（ライス・サラダ・スープ）", price: 550, category: "セット", calories: 455, protein: 10.5, fat: 6.5, carb: 87.5, fiber: 4.5, sodium: 1.4 },
  { menu_id: "ikinari-016", menu_name: "国産牛サーロイン 200g", price: 2590, category: "ステーキ", calories: 545, protein: 40.5, fat: 42.5, carb: 1.5, fiber: 0.2, sodium: 1.8 },
  { menu_id: "ikinari-017", menu_name: "アンガスサーロイン 300g", price: 2690, category: "ステーキ", calories: 788, protein: 57.8, fat: 60.8, carb: 2.7, fiber: 0.3, sodium: 2.7 },
  { menu_id: "ikinari-018", menu_name: "ガーリックライス", price: 390, category: "サイド", calories: 385, protein: 6.5, fat: 8.5, carb: 68.5, fiber: 1.2, sodium: 1.5 },
  { menu_id: "ikinari-019", menu_name: "ウルグアイ産ステーキ 200g", price: 1590, category: "ステーキ", calories: 495, protein: 42.5, fat: 35.5, carb: 2.2, fiber: 0.2, sodium: 1.8 },
  { menu_id: "ikinari-020", menu_name: "CABアンガスステーキ 200g", price: 1890, category: "ステーキ", calories: 515, protein: 40.5, fat: 38.5, carb: 2.2, fiber: 0.2, sodium: 1.8 },
];

// メニューを挿入する関数
function insertMenus(menus: typeof ootoyaMenus, chainId: string) {
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO menus (
      menu_id, chain_id, menu_name, price, category,
      calories, protein, fat, carb, fiber, sodium,
      muscle_score, diet_score, health_score,
      is_seasonal, is_limited, is_available,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?,
      0, 0, 1,
      datetime('now'), datetime('now')
    )
  `);

  for (const menu of menus) {
    const scores = calculateScores(
      menu.calories,
      menu.protein,
      menu.fat,
      menu.carb,
      menu.fiber,
      menu.sodium
    );

    insertStmt.run(
      menu.menu_id,
      chainId,
      menu.menu_name,
      menu.price,
      menu.category,
      menu.calories,
      menu.protein,
      menu.fat,
      menu.carb,
      menu.fiber,
      menu.sodium,
      scores.muscleScore,
      scores.dietScore,
      scores.healthScore
    );
  }
}

// チェーンを挿入する関数
function insertChains() {
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO chains (
      chain_id, chain_name, chain_name_en, chain_name_kana,
      category, subcategory, official_url, description, store_count,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      datetime('now'), datetime('now')
    )
  `);

  for (const chain of newChains) {
    insertStmt.run(
      chain.chain_id,
      chain.chain_name,
      chain.chain_name_en,
      chain.chain_name_kana,
      chain.category,
      chain.subcategory,
      chain.official_url,
      chain.description,
      chain.store_count
    );
  }
}

// メイン実行
function main() {
  console.log("🚀 データシード開始...\n");

  // 新チェーン店を追加
  console.log("📦 新チェーン店を追加中...");
  insertChains();
  console.log("✅ 新チェーン店追加完了\n");

  // 既存チェーン店のメニュー追加
  console.log("🍽️ 既存チェーン店のメニューを追加中...");
  insertMenus(ootoyaMenus, "ootoya");
  console.log("  - 大戸屋: +15メニュー");

  insertMenus(yayoikenMenus, "yayoiken");
  console.log("  - やよい軒: +15メニュー");

  insertMenus(sukiyaMenus, "sukiya");
  console.log("  - すき家: +15メニュー");

  insertMenus(matsuyaMenus, "matsuya");
  console.log("  - 松屋: +15メニュー");

  insertMenus(yoshinoyaMenus, "yoshinoya");
  console.log("  - 吉野家: +15メニュー");

  // 新チェーン店のメニュー追加
  console.log("\n🍽️ 新チェーン店のメニューを追加中...");
  insertMenus(saizeriyaMenus, "saizeriya");
  console.log("  - サイゼリヤ: 20メニュー");

  insertMenus(cocoichiMenus, "cocoichi");
  console.log("  - CoCo壱番屋: 20メニュー");

  insertMenus(nakauMenus, "nakau");
  console.log("  - なか卯: 20メニュー");

  // 追加チェーン店のメニュー追加
  console.log("\n🍽️ 追加チェーン店のメニューを追加中...");

  insertMenus(sevenMenus, "seven");
  console.log("  - セブン-イレブン: 20メニュー");

  insertMenus(familymartMenus, "familymart");
  console.log("  - ファミリーマート: 20メニュー");

  insertMenus(lawsonMenus, "lawson");
  console.log("  - ローソン: 20メニュー");

  insertMenus(ringerhutMenus, "ringerhut");
  console.log("  - リンガーハット: 20メニュー");

  insertMenus(marugameMenus, "marugame");
  console.log("  - 丸亀製麺: 20メニュー");

  insertMenus(gustoMenus, "gusto");
  console.log("  - ガスト: 20メニュー");

  insertMenus(sushiroMenus, "sushiro");
  console.log("  - スシロー: 20メニュー");

  insertMenus(mosMenus, "mos");
  console.log("  - モスバーガー: 20メニュー");

  insertMenus(subwayMenus, "subway");
  console.log("  - サブウェイ: 20メニュー");

  insertMenus(ikinariMenus, "ikinari");
  console.log("  - いきなり！ステーキ: 20メニュー");

  // 結果確認
  const chainCount = db.prepare("SELECT COUNT(*) as count FROM chains").get() as { count: number };
  const menuCount = db.prepare("SELECT COUNT(*) as count FROM menus").get() as { count: number };

  console.log("\n📊 データシード完了!");
  console.log(`   チェーン店数: ${chainCount.count}`);
  console.log(`   メニュー数: ${menuCount.count}`);
}

main();
