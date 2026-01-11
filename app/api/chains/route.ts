import { NextResponse } from "next/server";
import { getAllChains } from "@/lib/db/queries";

export async function GET() {
  try {
    const chains = getAllChains();
    return NextResponse.json({
      success: true,
      data: chains,
      count: chains.length,
    });
  } catch (error) {
    console.error("Error fetching chains:", error);
    return NextResponse.json(
      { success: false, error: "チェーン店の取得に失敗しました" },
      { status: 500 }
    );
  }
}
