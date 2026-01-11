import { NextRequest, NextResponse } from "next/server";
import { db, menus, chains } from "@/lib/db";
import { eq, desc, asc, gte, lte, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメータ
    const chainId = searchParams.get("chainId");
    const minProtein = searchParams.get("minProtein");
    const maxCalories = searchParams.get("maxCalories");
    const sortBy = searchParams.get("sortBy") || "healthScore";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    // 条件の構築
    const conditions = [];

    if (chainId) {
      conditions.push(eq(menus.chainId, chainId));
    }
    if (minProtein) {
      conditions.push(gte(menus.protein, parseFloat(minProtein)));
    }
    if (maxCalories) {
      conditions.push(lte(menus.calories, parseFloat(maxCalories)));
    }

    // ソート関数を取得
    const getOrderBy = () => {
      const orderFn = sortOrder === "asc" ? asc : desc;
      switch (sortBy) {
        case "protein":
          return orderFn(menus.protein);
        case "calories":
          return orderFn(menus.calories);
        case "muscleScore":
          return orderFn(menus.muscleScore);
        case "dietScore":
          return orderFn(menus.dietScore);
        case "healthScore":
        default:
          return orderFn(menus.healthScore);
      }
    };

    // クエリ実行
    const query = db
      .select({
        menu: menus,
        chain: chains,
      })
      .from(menus)
      .innerJoin(chains, eq(menus.chainId, chains.chainId));

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const results = query
      .orderBy(getOrderBy())
      .limit(limit)
      .offset((page - 1) * limit)
      .all();

    // 総件数取得
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(menus);

    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }

    const countResult = countQuery.get();
    const totalCount = countResult?.count || 0;

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { success: false, error: "メニューの取得に失敗しました" },
      { status: 500 }
    );
  }
}
