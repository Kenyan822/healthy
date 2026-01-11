import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { chains, menus } from "./schema";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "chain_restaurant.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

// スコア計算関数
function calculateMuscleScore(protein: number, calories: number): number {
  // タンパク質/カロリー比率を0-100にスケール
  const ratio = (protein / calories) * 1000;
  return Math.min(100, Math.round(ratio * 2));
}

function calculateDietScore(
  calories: number,
  protein: number,
  fat: number,
  carb: number
): number {
  // 低カロリー + 高タンパク + 低炭水化物を評価
  const calorieScore = Math.max(0, 100 - calories / 10);
  const proteinBonus = Math.min(30, protein);
  const carbPenalty = Math.min(30, carb / 3);
  return Math.min(100, Math.round(calorieScore + proteinBonus - carbPenalty));
}

function calculateHealthScore(
  calories: number,
  protein: number,
  fat: number,
  carb: number,
  sodium?: number
): number {
  // PFCバランスを評価
  const total = protein * 4 + fat * 9 + carb * 4;
  if (total === 0) return 50;

  const proteinRatio = (protein * 4) / total;
  const fatRatio = (fat * 9) / total;
  const carbRatio = (carb * 4) / total;

  // 理想的なPFCバランス: P15-25%, F20-30%, C50-60%
  let score = 50;
  if (proteinRatio >= 0.15 && proteinRatio <= 0.25) score += 15;
  if (fatRatio >= 0.2 && fatRatio <= 0.3) score += 15;
  if (carbRatio >= 0.5 && carbRatio <= 0.6) score += 15;

  // 塩分ペナルティ
  if (sodium && sodium > 3) score -= 10;

  return Math.min(100, Math.max(0, Math.round(score)));
}

// 初期データ
const chainData = [
  {
    chainId: "ootoya",
    chainName: "大戸屋",
    chainNameEn: "Ootoya",
    chainNameKana: "おおとや",
    category: "teishoku",
    officialUrl: "https://www.ootoya.com/",
    description:
      "手作りの定食を提供する和食チェーン。野菜たっぷりのメニューが特徴。",
    storeCount: 340,
  },
  {
    chainId: "yayoiken",
    chainName: "やよい軒",
    chainNameEn: "Yayoiken",
    chainNameKana: "やよいけん",
    category: "teishoku",
    officialUrl: "https://www.yayoiken.com/",
    description: "ごはんおかわり自由の定食屋。バランスの良い食事を提供。",
    storeCount: 380,
  },
  {
    chainId: "sukiya",
    chainName: "すき家",
    chainNameEn: "Sukiya",
    chainNameKana: "すきや",
    category: "gyudon",
    officialUrl: "https://www.sukiya.jp/",
    description: "日本最大の牛丼チェーン。トッピングの種類が豊富。",
    storeCount: 1950,
  },
  {
    chainId: "matsuya",
    chainName: "松屋",
    chainNameEn: "Matsuya",
    chainNameKana: "まつや",
    category: "gyudon",
    officialUrl: "https://www.matsuyafoods.co.jp/",
    description: "味噌汁付きの牛めしが人気。カレーメニューも充実。",
    storeCount: 1200,
  },
  {
    chainId: "yoshinoya",
    chainName: "吉野家",
    chainNameEn: "Yoshinoya",
    chainNameKana: "よしのや",
    category: "gyudon",
    officialUrl: "https://www.yoshinoya.com/",
    description: "老舗牛丼チェーン。うまい、やすい、はやいがモットー。",
    storeCount: 1200,
  },
];

// サンプルメニューデータ（各チェーン店から代表的なメニュー）
const menuData = [
  // 大戸屋
  {
    menuId: "ootoya-001",
    chainId: "ootoya",
    menuName: "しまほっけの炭火焼き定食",
    price: 1090,
    category: "焼き魚定食",
    calories: 650,
    protein: 35.2,
    fat: 22.1,
    carb: 75.3,
    fiber: 4.2,
    sodium: 2.8,
  },
  {
    menuId: "ootoya-002",
    chainId: "ootoya",
    menuName: "チキンかあさん煮定食",
    price: 990,
    category: "煮物定食",
    calories: 780,
    protein: 42.5,
    fat: 28.3,
    carb: 82.1,
    fiber: 3.8,
    sodium: 3.2,
  },
  {
    menuId: "ootoya-003",
    chainId: "ootoya",
    menuName: "大戸屋ランチ",
    price: 850,
    category: "ランチ",
    calories: 720,
    protein: 28.4,
    fat: 24.2,
    carb: 88.5,
    fiber: 3.5,
    sodium: 2.9,
  },
  {
    menuId: "ootoya-004",
    chainId: "ootoya",
    menuName: "鶏と野菜の黒酢あん定食",
    price: 990,
    category: "揚げ物定食",
    calories: 850,
    protein: 32.1,
    fat: 32.5,
    carb: 95.2,
    fiber: 4.8,
    sodium: 2.5,
  },
  {
    menuId: "ootoya-005",
    chainId: "ootoya",
    menuName: "サバの味噌煮定食",
    price: 950,
    category: "煮物定食",
    calories: 720,
    protein: 30.8,
    fat: 25.4,
    carb: 78.6,
    fiber: 3.2,
    sodium: 3.5,
  },
  // やよい軒
  {
    menuId: "yayoiken-001",
    chainId: "yayoiken",
    menuName: "しょうが焼定食",
    price: 790,
    category: "定食",
    calories: 880,
    protein: 38.2,
    fat: 35.4,
    carb: 92.3,
    fiber: 2.8,
    sodium: 3.8,
  },
  {
    menuId: "yayoiken-002",
    chainId: "yayoiken",
    menuName: "サバの塩焼定食",
    price: 820,
    category: "焼き魚定食",
    calories: 650,
    protein: 32.5,
    fat: 22.8,
    carb: 72.4,
    fiber: 2.5,
    sodium: 3.2,
  },
  {
    menuId: "yayoiken-003",
    chainId: "yayoiken",
    menuName: "から揚げ定食",
    price: 850,
    category: "揚げ物定食",
    calories: 950,
    protein: 35.8,
    fat: 42.3,
    carb: 95.8,
    fiber: 2.2,
    sodium: 3.5,
  },
  {
    menuId: "yayoiken-004",
    chainId: "yayoiken",
    menuName: "納豆定食",
    price: 550,
    category: "朝定食",
    calories: 520,
    protein: 22.4,
    fat: 12.5,
    carb: 75.2,
    fiber: 4.8,
    sodium: 2.2,
  },
  {
    menuId: "yayoiken-005",
    chainId: "yayoiken",
    menuName: "チキン南蛮定食",
    price: 890,
    category: "揚げ物定食",
    calories: 1020,
    protein: 38.5,
    fat: 48.2,
    carb: 98.4,
    fiber: 2.5,
    sodium: 3.8,
  },
  // すき家
  {
    menuId: "sukiya-001",
    chainId: "sukiya",
    menuName: "牛丼（並盛）",
    price: 430,
    category: "牛丼",
    calories: 733,
    protein: 22.8,
    fat: 25.4,
    carb: 104.2,
    fiber: 2.1,
    sodium: 2.8,
  },
  {
    menuId: "sukiya-002",
    chainId: "sukiya",
    menuName: "牛丼ライト",
    price: 480,
    category: "牛丼",
    calories: 425,
    protein: 20.5,
    fat: 22.8,
    carb: 32.4,
    fiber: 5.2,
    sodium: 2.5,
  },
  {
    menuId: "sukiya-003",
    chainId: "sukiya",
    menuName: "高菜明太マヨ牛丼",
    price: 580,
    category: "牛丼",
    calories: 892,
    protein: 25.2,
    fat: 38.5,
    carb: 108.3,
    fiber: 2.8,
    sodium: 4.2,
  },
  {
    menuId: "sukiya-004",
    chainId: "sukiya",
    menuName: "鮭定食",
    price: 590,
    category: "定食",
    calories: 620,
    protein: 28.4,
    fat: 18.2,
    carb: 82.5,
    fiber: 2.5,
    sodium: 3.2,
  },
  {
    menuId: "sukiya-005",
    chainId: "sukiya",
    menuName: "まぜのっけごはん朝食",
    price: 400,
    category: "朝食",
    calories: 580,
    protein: 25.8,
    fat: 15.4,
    carb: 78.2,
    fiber: 3.8,
    sodium: 2.8,
  },
  // 松屋
  {
    menuId: "matsuya-001",
    chainId: "matsuya",
    menuName: "牛めし（並）",
    price: 400,
    category: "牛めし",
    calories: 709,
    protein: 21.5,
    fat: 24.8,
    carb: 98.5,
    fiber: 1.8,
    sodium: 2.5,
  },
  {
    menuId: "matsuya-002",
    chainId: "matsuya",
    menuName: "プレミアム牛めし（並）",
    price: 500,
    category: "牛めし",
    calories: 742,
    protein: 23.2,
    fat: 28.4,
    carb: 95.2,
    fiber: 2.0,
    sodium: 2.8,
  },
  {
    menuId: "matsuya-003",
    chainId: "matsuya",
    menuName: "カレギュウ（並）",
    price: 650,
    category: "カレー",
    calories: 945,
    protein: 28.5,
    fat: 32.4,
    carb: 128.5,
    fiber: 4.2,
    sodium: 4.5,
  },
  {
    menuId: "matsuya-004",
    chainId: "matsuya",
    menuName: "ネギたっぷり旨辛ネギたま牛めし",
    price: 550,
    category: "牛めし",
    calories: 825,
    protein: 26.8,
    fat: 32.5,
    carb: 102.4,
    fiber: 3.2,
    sodium: 3.5,
  },
  {
    menuId: "matsuya-005",
    chainId: "matsuya",
    menuName: "焼肉定食",
    price: 730,
    category: "定食",
    calories: 850,
    protein: 35.2,
    fat: 38.5,
    carb: 88.2,
    fiber: 2.8,
    sodium: 3.8,
  },
  // 吉野家
  {
    menuId: "yoshinoya-001",
    chainId: "yoshinoya",
    menuName: "牛丼（並盛）",
    price: 468,
    category: "牛丼",
    calories: 635,
    protein: 20.2,
    fat: 20.4,
    carb: 92.8,
    fiber: 1.5,
    sodium: 2.5,
  },
  {
    menuId: "yoshinoya-002",
    chainId: "yoshinoya",
    menuName: "牛皿定食",
    price: 598,
    category: "定食",
    calories: 720,
    protein: 28.5,
    fat: 25.8,
    carb: 85.2,
    fiber: 2.2,
    sodium: 3.2,
  },
  {
    menuId: "yoshinoya-003",
    chainId: "yoshinoya",
    menuName: "ライザップ牛サラダ",
    price: 598,
    category: "サラダ",
    calories: 398,
    protein: 28.8,
    fat: 25.2,
    carb: 12.5,
    fiber: 4.8,
    sodium: 2.2,
  },
  {
    menuId: "yoshinoya-004",
    chainId: "yoshinoya",
    menuName: "から揚げ丼（並盛）",
    price: 548,
    category: "丼",
    calories: 780,
    protein: 32.5,
    fat: 28.4,
    carb: 95.8,
    fiber: 1.8,
    sodium: 3.5,
  },
  {
    menuId: "yoshinoya-005",
    chainId: "yoshinoya",
    menuName: "鮭定食",
    price: 558,
    category: "定食",
    calories: 585,
    protein: 25.8,
    fat: 15.2,
    carb: 82.4,
    fiber: 2.5,
    sodium: 3.0,
  },
];

async function seed() {
  console.log("Seeding database...");

  // チェーン店データを挿入
  console.log("Inserting chains...");
  for (const chain of chainData) {
    db.insert(chains)
      .values({
        ...chain,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoNothing()
      .run();
  }

  // メニューデータを挿入（スコア計算付き）
  console.log("Inserting menus...");
  for (const menu of menuData) {
    const muscleScore = calculateMuscleScore(menu.protein, menu.calories);
    const dietScore = calculateDietScore(
      menu.calories,
      menu.protein,
      menu.fat,
      menu.carb
    );
    const healthScore = calculateHealthScore(
      menu.calories,
      menu.protein,
      menu.fat,
      menu.carb,
      menu.sodium
    );

    db.insert(menus)
      .values({
        ...menu,
        muscleScore,
        dietScore,
        healthScore,
        isSeasonal: false,
        isLimited: false,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoNothing()
      .run();
  }

  console.log("Seeding completed!");
  console.log(`Inserted ${chainData.length} chains`);
  console.log(`Inserted ${menuData.length} menus`);
}

seed().catch(console.error);
