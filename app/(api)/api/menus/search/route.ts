import { NextRequest, NextResponse } from "next/server";
import {
  searchMenusByPFC,
  searchMenusByMultiplePresets,
  countMenusByMultiplePresets,
  countAllMenus,
  searchAllMenus,
} from "@/lib/db/queries";
import { isValidPreset } from "@/lib/presets";
import type { PresetId, SortBy, SearchResponse } from "@/types/search";

// 有効なソート種別（事実ベース指標）
const validSortBy: SortBy[] = [
  "protein",
  "calories",
  "proteinDensity",
  "carbRatio",
  "fatRatio",
  "pfcBalance",
  "distance",
  "costPerformance",
];

function isValidSortBy(value: string): value is SortBy {
  return validSortBy.includes(value as SortBy);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // パラメータ取得
    const protein = searchParams.get("protein");
    const fat = searchParams.get("fat");
    const carb = searchParams.get("carb");
    // 複数プリセット対応: preset=high_protein,low_fat のようにカンマ区切り
    const presetParam = searchParams.get("preset");
    const chainId = searchParams.get("chainId"); // チェーン店フィルター
    const sortByParam = searchParams.get("sortBy") || "proteinDensity";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    // ソート種別のバリデーション
    const sortBy: SortBy = isValidSortBy(sortByParam) ? sortByParam : "proteinDensity";

    // 距離ソートは現在未実装（位置情報が必要）
    const effectiveSortBy = sortBy === "distance" ? "proteinDensity" : sortBy;

    const offset = (page - 1) * limit;
    let results;
    let totalCount: number;

    // プリセット検索（複数対応）
    if (presetParam) {
      const presetIds = presetParam.split(",").filter(isValidPreset) as PresetId[];

      if (presetIds.length > 0) {
        results = await searchMenusByMultiplePresets(presetIds, effectiveSortBy, limit, offset, chainId || undefined);
        totalCount = await countMenusByMultiplePresets(presetIds, chainId || undefined);

        const response: SearchResponse = {
          success: true,
          data: results,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
          query: {
            preset: presetIds[0], // 後方互換性のため最初のプリセットを返す
            sortBy: effectiveSortBy,
            chainId: chainId || undefined,
          },
        };

        return NextResponse.json(response);
      }
    }

    // PFCカスタム検索
    if (protein || fat || carb) {
      const targetP = parseFloat(protein || "0");
      const targetF = parseFloat(fat || "0");
      const targetC = parseFloat(carb || "0");

      // NaN, Infinity, マイナス値, 異常値チェック
      if ([targetP, targetF, targetC].some(v => !Number.isFinite(v) || v < 0)) {
        return NextResponse.json(
          { success: false, error: "PFC値は0以上の数値で入力してください" },
          { status: 400 }
        );
      }
      if ([targetP, targetF, targetC].some(v => v > 1000)) {
        return NextResponse.json(
          { success: false, error: "PFC値が大きすぎます" },
          { status: 400 }
        );
      }

      // 少なくとも1つは入力されている必要がある
      if (targetP === 0 && targetF === 0 && targetC === 0) {
        return NextResponse.json(
          { success: false, error: "少なくとも1つのPFC値を入力してください" },
          { status: 400 }
        );
      }

      results = await searchMenusByPFC(targetP, targetF, targetC, effectiveSortBy, limit, offset, chainId || undefined);
      totalCount = await countAllMenus(chainId || undefined);

      const response: SearchResponse = {
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        query: {
          targetPFC: { protein: targetP, fat: targetF, carb: targetC },
          sortBy: effectiveSortBy,
          chainId: chainId || undefined,
        },
      };

      return NextResponse.json(response);
    }

    // 検索条件なしの場合は全メニュー検索（目的別検索）
    results = await searchAllMenus(effectiveSortBy, limit, offset, chainId || undefined);
    totalCount = await countAllMenus(chainId || undefined);

    const response: SearchResponse = {
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      query: {
        sortBy: effectiveSortBy,
        chainId: chainId || undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: "検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
