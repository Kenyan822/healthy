import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userFavorites, menus, chains } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";

// お気に入り一覧取得
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = db
    .select({
      id: userFavorites.id,
      menuId: userFavorites.menuId,
      note: userFavorites.note,
      createdAt: userFavorites.createdAt,
      menuName: menus.menuName,
      calories: menus.calories,
      protein: menus.protein,
      fat: menus.fat,
      carb: menus.carb,
      price: menus.price,
      chainId: chains.chainId,
      chainName: chains.chainName,
    })
    .from(userFavorites)
    .innerJoin(menus, eq(userFavorites.menuId, menus.menuId))
    .innerJoin(chains, eq(menus.chainId, chains.chainId))
    .where(eq(userFavorites.userId, session.user.id))
    .orderBy(desc(userFavorites.createdAt))
    .all();

  const countResult = db
    .select({ value: count() })
    .from(userFavorites)
    .where(eq(userFavorites.userId, session.user.id))
    .get();

  return NextResponse.json({
    favorites,
    count: countResult?.value ?? 0,
  });
}
