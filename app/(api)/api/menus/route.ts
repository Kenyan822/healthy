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
    const sortBy = searchParams.get("sortBy") || "proteinDensity";
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

    // ソート関数を取得（事実ベース指標）
    const getOrderBy = () => {
      const orderFn = sortOrder === "asc" ? asc : desc;
      switch (sortBy) {
        case "protein":
          return orderFn(menus.protein);
        case "calories":
          return orderFn(menus.calories);
        case "carb":
          return orderFn(menus.carb);
        case "fat":
          return orderFn(menus.fat);
        case "proteinDensity":
          // タンパク質密度: protein / calories * 100
          return orderFn(sql`${menus.protein} * 100.0 / NULLIF(${menus.calories}, 0)`);
        case "carbRatio":
          // 糖質比率: (carb * 4) / calories
          return orderFn(sql`(${menus.carb} * 4.0) / NULLIF(${menus.calories}, 0)`);
        case "fatRatio":
          // 脂質比率: (fat * 9) / calories
          return orderFn(sql`(${menus.fat} * 9.0) / NULLIF(${menus.calories}, 0)`);
        case "pfcBalance":
        default:
          // PFCバランス
          return orderFn(sql`
            100 - (
              ABS((${menus.protein} * 4.0 / NULLIF(${menus.calories}, 0)) - 0.20) * 100 +
              ABS((${menus.fat} * 9.0 / NULLIF(${menus.calories}, 0)) - 0.25) * 100 +
              ABS((${menus.carb} * 4.0 / NULLIF(${menus.calories}, 0)) - 0.55) * 100
            )
          `);
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
