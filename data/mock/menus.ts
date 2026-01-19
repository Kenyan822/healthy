import { Menu, LatestMenu } from "@/types";

export const mockMenus: Menu[] = [
  {
    menuId: "ootoya-chicken-kaasan",
    chainId: "ootoya",
    chainName: "大戸屋",
    menuName: "チキンかあさん煮定食",
    price: 890,
    nutrition: {
      calories: 750,
      protein: 35.2,
      fat: 28.5,
      carb: 85.0,
      fiber: 3.2,
      sodium: 4.5,
    },
    scores: {
      muscleScore: 46.9,
      ketoScore: 0,
      healthScore: 15.5,
    },
    category: "teishoku",
    isSeasonal: false,
    isLimited: false,
    description: "甘辛いタレで煮込んだチキンとたっぷり野菜",
    updatedAt: "2024-01-15",
  },
  {
    menuId: "sukiya-gyudon-light",
    chainId: "sukiya",
    chainName: "すき家",
    menuName: "牛丼ライト",
    price: 480,
    nutrition: {
      calories: 425,
      protein: 19.5,
      fat: 16.3,
      carb: 49.2,
    },
    scores: {
      muscleScore: 45.9,
      ketoScore: 1.6,
      healthScore: 10.0,
    },
    category: "don",
    isSeasonal: false,
    isLimited: false,
    description: "ご飯の代わりに豆腐を使用した低糖質牛丼",
    updatedAt: "2024-01-14",
  },
  {
    menuId: "ootoya-saba-miso",
    chainId: "ootoya",
    chainName: "大戸屋",
    menuName: "さばの味噌煮定食",
    price: 890,
    nutrition: {
      calories: 680,
      protein: 28.5,
      fat: 32.0,
      carb: 65.0,
    },
    scores: {
      muscleScore: 41.9,
      ketoScore: 0,
      healthScore: 4.0,
    },
    category: "teishoku",
    isSeasonal: false,
    isLimited: false,
    description: "脂ののったさばを特製味噌で",
    updatedAt: "2024-01-13",
  },
  {
    menuId: "yayoiken-shimahokke",
    chainId: "yayoiken",
    chainName: "やよい軒",
    menuName: "しまほっけ定食",
    price: 850,
    nutrition: {
      calories: 620,
      protein: 38.0,
      fat: 22.0,
      carb: 70.0,
    },
    scores: {
      muscleScore: 61.3,
      ketoScore: 0,
      healthScore: 28.0,
    },
    category: "teishoku",
    isSeasonal: false,
    isLimited: false,
    description: "肉厚のしまほっけを丁寧に焼き上げました",
    updatedAt: "2024-01-12",
  },
  {
    menuId: "matsuya-negi-tama",
    chainId: "matsuya",
    chainName: "松屋",
    menuName: "ネギたま牛めし",
    price: 490,
    nutrition: {
      calories: 780,
      protein: 25.0,
      fat: 28.0,
      carb: 105.0,
    },
    scores: {
      muscleScore: 32.1,
      ketoScore: 0,
      healthScore: -44.5,
    },
    category: "don",
    isSeasonal: false,
    isLimited: false,
    description: "たっぷりネギと温泉玉子をトッピング",
    updatedAt: "2024-01-11",
  },
  {
    menuId: "yoshinoya-gyudon",
    chainId: "yoshinoya",
    chainName: "吉野家",
    menuName: "牛丼（並盛）",
    price: 468,
    nutrition: {
      calories: 652,
      protein: 20.0,
      fat: 23.4,
      carb: 92.8,
    },
    scores: {
      muscleScore: 30.7,
      ketoScore: 0,
      healthScore: -35.0,
    },
    category: "don",
    isSeasonal: false,
    isLimited: false,
    description: "伝統の味を受け継ぐ吉野家の牛丼",
    updatedAt: "2024-01-10",
  },
];

export const mockLatestMenus: LatestMenu[] = [
  {
    ...mockMenus[0],
    updateType: "updated",
  },
  {
    ...mockMenus[1],
    updateType: "new",
  },
  {
    ...mockMenus[2],
    updateType: "price_change",
  },
  {
    ...mockMenus[3],
    updateType: "new",
  },
  {
    ...mockMenus[4],
    updateType: "updated",
  },
  {
    ...mockMenus[5],
    updateType: "updated",
  },
];

export const mockHighProteinMenus: Menu[] = [...mockMenus]
  .sort((a, b) => b.nutrition.protein - a.nutrition.protein)
  .slice(0, 5);

export const mockLowCarbMenus: Menu[] = [...mockMenus]
  .sort((a, b) => a.nutrition.carb - b.nutrition.carb)
  .slice(0, 5);

// 人気メニューランキング（healthScoreでソート）
export const mockMenuRanking = [...mockMenus]
  .sort((a, b) => b.scores.healthScore - a.scores.healthScore)
  .map((menu, index) => ({
    ...menu,
    rank: index + 1,
  }));
