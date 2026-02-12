import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userFavorites, users, menus } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

// お気に入り状態確認
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const session = await auth();
  const { menuId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ isFavorite: false });
  }

  const result = db
    .select()
    .from(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, session.user.id),
        eq(userFavorites.menuId, menuId)
      )
    )
    .get();

  return NextResponse.json({ isFavorite: !!result });
}

// お気に入り追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const session = await auth();
  const { menuId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // ユーザーのプラン確認
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  const plan = user?.plan || "free";

  // 無料プランの制限チェック
  if (plan === "free") {
    const countResult = db
      .select({ value: count() })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId))
      .get();

    if ((countResult?.value ?? 0) >= 5) {
      return NextResponse.json(
        { error: "無料プランでは5件までお気に入り登録できます" },
        { status: 403 }
      );
    }
  }

  try {
    db.insert(userFavorites)
      .values({
        userId,
        menuId,
      })
      .run();

    // menus.favorite_count をインクリメント
    db.update(menus)
      .set({ favoriteCount: sql`COALESCE(${menus.favoriteCount}, 0) + 1` })
      .where(eq(menus.menuId, menuId))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    // 重複エラーの場合
    return NextResponse.json(
      { error: "既にお気に入りに登録されています" },
      { status: 400 }
    );
  }
}

// お気に入り削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const session = await auth();
  const { menuId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = db.delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, session.user.id),
          eq(userFavorites.menuId, menuId)
        )
      )
      .run();

    // 実際に削除された場合のみデクリメント
    if (result.changes > 0) {
      db.update(menus)
        .set({ favoriteCount: sql`MAX(COALESCE(${menus.favoriteCount}, 0) - 1, 0)` })
        .where(eq(menus.menuId, menuId))
        .run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "お気に入り解除に失敗しました" },
      { status: 500 }
    );
  }
}
