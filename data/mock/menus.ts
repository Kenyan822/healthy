import { Menu, LatestMenu } from "@/types";

// DBの実際のメニューデータに基づくモックデータ
export const mockMenus: Menu[] = [
  {
    menuId: "ringerhut-019",
    chainId: "ringerhut",
    chainName: "リンガーハット",
    menuName: "低糖質麺ちゃんぽん",
    price: 790,
    nutrition: {
      calories: 361,
      protein: 19.5,
      fat: 18.3,
      carb: 29.9,
    },
    scores: {
      muscleScore: 54,
      ketoScore: 0,
      healthScore: 100,
    },
    category: "ramen",
    isSeasonal: false,
    isLimited: false,
    description: "低糖質麺を使用したヘルシーなちゃんぽん",
    updatedAt: "2024-01-15",
  },
  {
    menuId: "yayoiken-004",
    chainId: "yayoiken",
    chainName: "やよい軒",
    menuName: "納豆定食",
    price: 500,
    nutrition: {
      calories: 536,
      protein: 22.1,
      fat: 12.4,
      carb: 82.7,
    },
    scores: {
      muscleScore: 41,
      ketoScore: 0,
      healthScore: 95,
    },
    category: "teishoku",
    isSeasonal: false,
    isLimited: false,
    description: "朝食の定番、納豆定食",
    updatedAt: "2024-01-14",
  },
  {
    menuId: "sukiya-005",
    chainId: "sukiya",
    chainName: "すき家",
    menuName: "まぜのっけごはん朝食",
    price: 400,
    nutrition: {
      calories: 577,
      protein: 19.9,
      fat: 15,
      carb: 87.8,
    },
    scores: {
      muscleScore: 34,
      ketoScore: 0,
      healthScore: 95,
    },
    category: "teishoku",
    isSeasonal: false,
    isLimited: false,
    description: "具材をのせて混ぜて食べる朝食",
    updatedAt: "2024-01-13",
  },
  {
    menuId: "yoshinoya-005",
    chainId: "yoshinoya",
    chainName: "吉野家",
    menuName: "鮭定食",
    price: 657,
    nutrition: {
      calories: 618,
      protein: 28.8,
      fat: 13.9,
      carb: 92.3,
    },
    scores: {
      muscleScore: 47,
      ketoScore: 0,
      healthScore: 95,
    },
    category: "teishoku",
    isSeasonal: false,
    isLimited: false,
    description: "焼き鮭をメインにした定食",
    updatedAt: "2024-01-12",
  },
  {
    menuId: "ootoya-019",
    chainId: "ootoya",
    chainName: "大戸屋",
    menuName: "鶏むね肉のグリル定食",
    price: 990,
    nutrition: {
      calories: 613,
      protein: 43.5,
      fat: 18.4,
      carb: 62.2,
    },
    scores: {
      muscleScore: 71,
      ketoScore: 0,
      healthScore: 87.7,
    },
    category: "teishoku",
    isSeasonal: false,
    isLimited: false,
    description: "高タンパクな鶏むね肉をグリルした定食",
    updatedAt: "2024-01-11",
  },
  {
    menuId: "sukiya-004",
    chainId: "sukiya",
    chainName: "すき家",
    menuName: "鮭定食",
    price: 550,
    nutrition: {
      calories: 639,
      protein: 27.3,
      fat: 16.9,
      carb: 91.5,
    },
    scores: {
      muscleScore: 43,
      ketoScore: 0,
      healthScore: 85,
    },
    category: "teishoku",
    isSeasonal: false,
    isLimited: false,
    description: "すき家の鮭定食",
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
