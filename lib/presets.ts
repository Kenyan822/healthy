import { PresetDefinition, PresetId } from "@/types/search";

export const presets: Record<PresetId, PresetDefinition> = {
  high_protein: {
    id: "high_protein",
    name: "高タンパク",
    description: "タンパク質30g以上のメニュー",
    icon: "🍗",
    filter: {
      minProtein: 30,
    },
    defaultSort: "pfcMatch",
    sortOrder: "desc",
  },
  low_fat: {
    id: "low_fat",
    name: "低脂質",
    description: "脂質15g以下のメニュー",
    icon: "🥗",
    filter: {
      maxFat: 15,
    },
    defaultSort: "pfcMatch",
    sortOrder: "asc",
  },
  low_carb: {
    id: "low_carb",
    name: "低糖質",
    description: "炭水化物40g以下のメニュー",
    icon: "⚖️",
    filter: {
      maxCarb: 40,
    },
    defaultSort: "pfcMatch",
    sortOrder: "asc",
  },
  balanced: {
    id: "balanced",
    name: "バランス型",
    description: "PFC比率2:2:6のバランスメニュー",
    icon: "🎯",
    // バランス型は比率で計算
    targetRatio: {
      protein: 0.2,
      fat: 0.2,
      carb: 0.6,
    },
    defaultSort: "pfcMatch",
  },
};

// プリセットIDの配列
export const presetIds = Object.keys(presets) as PresetId[];

// プリセットが有効かどうかをチェック
export function isValidPreset(id: string): id is PresetId {
  return id in presets;
}

// タグからプリセットIDへのマッピング
export const tagToPresetMap: Record<string, PresetId> = {
  "#高タンパク": "high_protein",
  "#低脂質": "low_fat",
  "#低糖質": "low_carb",
  "#バランス": "balanced",
};

// プリセットからタグへの逆マッピング
export const presetToTagMap: Record<PresetId, string> = {
  high_protein: "#高タンパク",
  low_fat: "#低脂質",
  low_carb: "#低糖質",
  balanced: "#バランス",
};
