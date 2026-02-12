import { NextRequest, NextResponse } from "next/server";
import { getChainById, getMenusByChain } from "@/lib/db/queries";

type Props = {
  params: Promise<{ chainId: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { chainId } = await params;
    const chain = await getChainById(chainId);

    if (!chain) {
      return NextResponse.json(
        { success: false, error: "チェーン店が見つかりません" },
        { status: 404 }
      );
    }

    const menus = await getMenusByChain(chainId);

    return NextResponse.json({
      success: true,
      data: {
        chain,
        menus,
        menuCount: menus.length,
      },
    });
  } catch (error) {
    console.error("Error fetching chain:", error);
    return NextResponse.json(
      { success: false, error: "チェーン店の取得に失敗しました" },
      { status: 500 }
    );
  }
}
