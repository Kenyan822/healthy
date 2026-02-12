import { NextRequest, NextResponse } from "next/server";
import { getMenuWithChain, getSimilarMenus } from "@/lib/db/queries";

type Props = {
  params: Promise<{ menuId: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { menuId } = await params;
    const result = await getMenuWithChain(menuId);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "メニューが見つかりません" },
        { status: 404 }
      );
    }

    const { menu, chain } = result;
    const similarMenus = await getSimilarMenus(chain.chainId, menuId, 5);

    return NextResponse.json({
      success: true,
      data: {
        menu,
        chain,
        similarMenus,
      },
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { success: false, error: "メニューの取得に失敗しました" },
      { status: 500 }
    );
  }
}
