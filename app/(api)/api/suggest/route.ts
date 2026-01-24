import { NextRequest, NextResponse } from "next/server";
import { getAllChains, countMenusByChain, countMenusByNutritionFilter, countMenusByPriceFilter } from "@/lib/db/queries";
import {
  purposes,
  nutritionFilters,
  priceFilters,
  allPurposeIds,
  allNutritionFilterIds,
  allPriceFilterIds,
  type PurposeId,
  type NutritionFilterId,
  type PriceFilterId,
} from "@/lib/filters";
import { tokyoStations } from "@/lib/db/stations-data";

export interface SuggestItem {
  type: "chain" | "purpose" | "chain_purpose" | "nutrition" | "price" | "ranking" | "area";
  label: string;
  url: string;
  keywords: string[];
}

// キャッシュ用（ビルド時に生成、リクエスト間で再利用）
let suggestionsCache: SuggestItem[] | null = null;

function buildSuggestions(): SuggestItem[] {
  if (suggestionsCache) {
    return suggestionsCache;
  }

  const suggestions: SuggestItem[] = [];
  const chains = getAllChains();
  const MIN_MENU_COUNT = 3;

  // 1. チェーン店単体
  for (const chain of chains) {
    const menuCount = countMenusByChain(chain.chainId);
    if (menuCount < MIN_MENU_COUNT) continue;

    suggestions.push({
      type: "chain",
      label: chain.chainName,
      url: `/${chain.chainId}`,
      keywords: [
        chain.chainName,
        chain.chainNameEn.toLowerCase(),
        chain.chainNameKana || "",
      ].filter(Boolean),
    });
  }

  // 2. 駅エリア
  for (const station of tokyoStations) {
    suggestions.push({
      type: "area",
      label: `${station.stationName}駅`,
      url: `/area/${station.stationId}`,
      keywords: [
        station.stationName,
        station.stationNameKana,
        station.stationNameEn.toLowerCase(),
        `${station.stationName}駅`,
      ],
    });
  }

  // 3. 目的別ランキング
  for (const purposeId of allPurposeIds) {
    const purpose = purposes[purposeId];

    suggestions.push({
      type: "ranking",
      label: `${purpose.name} ランキング`,
      url: `/ranking/${purposeId}`,
      keywords: [
        purpose.name,
        ...purpose.keywords,
        "ランキング",
      ],
    });
  }

  // 4. チェーン店×目的の組み合わせ
  for (const chain of chains) {
    const menuCount = countMenusByChain(chain.chainId);
    if (menuCount < MIN_MENU_COUNT) continue;

    for (const purposeId of allPurposeIds) {
      const purpose = purposes[purposeId];

      suggestions.push({
        type: "chain_purpose",
        label: `${chain.chainName} ${purpose.name}`,
        url: `/${chain.chainId}/${purposeId}`,
        keywords: [
          chain.chainName,
          chain.chainNameEn.toLowerCase(),
          purpose.name,
          ...purpose.keywords,
        ],
      });
    }
  }

  // 5. チェーン店×栄養フィルター（該当メニューが3件以上のみ）
  for (const chain of chains) {
    const chainMenuCount = countMenusByChain(chain.chainId);
    if (chainMenuCount < MIN_MENU_COUNT) continue;

    for (const filterId of allNutritionFilterIds) {
      const count = countMenusByNutritionFilter(chain.chainId, filterId);
      if (count < MIN_MENU_COUNT) continue;

      const filter = nutritionFilters[filterId];
      suggestions.push({
        type: "nutrition",
        label: `${chain.chainName} ${filter.label}`,
        url: `/${chain.chainId}/${filterId}`,
        keywords: [
          chain.chainName,
          filter.label,
        ],
      });
    }
  }

  // 6. チェーン店×価格フィルター（該当メニューが3件以上のみ）
  for (const chain of chains) {
    const chainMenuCount = countMenusByChain(chain.chainId);
    if (chainMenuCount < MIN_MENU_COUNT) continue;

    for (const filterId of allPriceFilterIds) {
      const count = countMenusByPriceFilter(chain.chainId, filterId);
      if (count < MIN_MENU_COUNT) continue;

      const filter = priceFilters[filterId];
      suggestions.push({
        type: "price",
        label: `${chain.chainName} ${filter.label}`,
        url: `/${chain.chainId}/${filterId}`,
        keywords: [
          chain.chainName,
          filter.label,
        ],
      });
    }
  }

  suggestionsCache = suggestions;
  return suggestions;
}

// 入力キーワードがラベルに含まれているかチェック
function matchesQuery(item: SuggestItem, query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedLabel = item.label.toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);

  // 全ての入力単語がラベルまたはキーワードに含まれているかチェック
  for (const word of queryWords) {
    const inLabel = normalizedLabel.includes(word);

    // 1文字のクエリはラベルのみでマッチ（キーワードマッチは2文字以上）
    // これにより「お」→「お得」のような意図しないマッチを防ぐ
    const inKeywords = word.length >= 2 &&
      item.keywords.some(k => k.toLowerCase().includes(word));

    if (!inLabel && !inKeywords) {
      return false;
    }
  }
  return true;
}

// 検索マッチングスコアを計算
function calculateMatchScore(item: SuggestItem, query: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedLabel = item.label.toLowerCase();

  let score = 0;

  // ラベルの前方一致
  if (normalizedLabel.startsWith(normalizedQuery)) {
    score += 100;
  }
  // ラベルに含まれる
  else if (normalizedLabel.includes(normalizedQuery)) {
    score += 80;
  }

  // キーワードでの前方一致
  for (const keyword of item.keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    if (normalizedKeyword.startsWith(normalizedQuery)) {
      score += 50;
    } else if (normalizedKeyword.includes(normalizedQuery)) {
      score += 30;
    }
  }

  // タイプによる優先度調整
  if (item.type === "chain") score += 10;
  if (item.type === "area") score += 8;
  if (item.type === "chain_purpose") score += 5;

  return score;
}

// 入力キーワードをラベルに反映する
function buildDisplayLabel(item: SuggestItem, query: string): string {
  const queryWords = query.trim().split(/\s+/).filter(w => w.length > 0);

  // 入力が1単語の場合は常に元のラベルを返す
  // （キーワードマッチでも元のラベルが最も分かりやすい）
  if (queryWords.length === 1) {
    return item.label;
  }

  // 複数単語の場合のみ、ラベルの組み立てを行う
  const matchedParts: string[] = [];
  const labelWords = item.label.split(/\s+/);

  for (const word of queryWords) {
    const wordLower = word.toLowerCase();

    // ラベル内の単語と一致するものがあればそれを使う
    let foundInLabel = false;
    for (const labelWord of labelWords) {
      if (labelWord.toLowerCase().includes(wordLower) && !matchedParts.includes(labelWord)) {
        matchedParts.push(labelWord);
        foundInLabel = true;
        break;
      }
    }

    // ラベルに見つからなかった場合、キーワードにマッチしても元のラベル単語を追加
    if (!foundInLabel) {
      for (const keyword of item.keywords) {
        if (keyword.toLowerCase().includes(wordLower)) {
          // ラベルからまだ追加していない単語を追加
          for (const lw of labelWords) {
            if (!matchedParts.includes(lw)) {
              matchedParts.push(lw);
              break;
            }
          }
          break;
        }
      }
    }
  }

  return matchedParts.length > 0 ? matchedParts.join(" ") : item.label;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

  if (!query || query.length < 1) {
    return NextResponse.json({
      success: true,
      data: [],
    });
  }

  const suggestions = buildSuggestions();

  // 入力キーワードを含むもののみフィルタリング & スコア計算
  const scored = suggestions
    .filter((item) => matchesQuery(item, query))
    .map((item) => ({
      item,
      score: calculateMatchScore(item, query),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({
      type: s.item.type,
      label: buildDisplayLabel(s.item, query),
      url: s.item.url,
    }));

  return NextResponse.json({
    success: true,
    data: scored,
  });
}
