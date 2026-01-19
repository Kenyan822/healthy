import { NextRequest, NextResponse } from "next/server";
import { incrementMenuViewCount, getMenuById } from "@/lib/db/queries";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params;

    // メニューの存在確認
    const menu = getMenuById(menuId);
    if (!menu) {
      return NextResponse.json(
        { success: false, error: "メニューが見つかりません" },
        { status: 404 }
      );
    }

    // ビュー数をインクリメント
    incrementMenuViewCount(menuId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("View count API error:", error);
    return NextResponse.json(
      { success: false, error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
