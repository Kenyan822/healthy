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
  console.log("✅ 新チェーン店追加完了: サイゼリヤ、CoCo壱番屋、なか卯\n");

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

  // 結果確認
  const chainCount = db.prepare("SELECT COUNT(*) as count FROM chains").get() as { count: number };
  const menuCount = db.prepare("SELECT COUNT(*) as count FROM menus").get() as { count: number };

  console.log("\n📊 データシード完了!");
  console.log(`   チェーン店数: ${chainCount.count}`);
  console.log(`   メニュー数: ${menuCount.count}`);
}

main();
