import { NextRequest, NextResponse } from "next/server";
import { getTopMenusByPurpose, purposes, type PurposeId } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const purposeId = searchParams.get("purpose") || "health";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    // 有効な目的かチェック
    if (!Object.keys(purposes).includes(purposeId)) {
      return NextResponse.json(
        {
          success: false,
          error: "無効な目的です",
          validPurposes: Object.keys(purposes),
        },
        { status: 400 }
      );
    }

    const rankings = await getTopMenusByPurpose(purposeId as PurposeId, limit);
    const purpose = purposes[purposeId as PurposeId];

    return NextResponse.json({
      success: true,
      data: {
        purpose: {
          id: purpose.id,
          name: purpose.name,
          description: purpose.description,
        },
        rankings: rankings.map((item, index) => ({
          rank: index + 1,
          menu: item.menu,
          chain: item.chain,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching ranking:", error);
    return NextResponse.json(
      { success: false, error: "ランキングの取得に失敗しました" },
      { status: 500 }
    );
  }
}
