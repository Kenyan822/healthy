import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Stripe Checkout Sessionを取得して検証
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    // 支払いが完了しているか確認
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "支払いが完了していません" },
        { status: 400 }
      );
    }

    // metadataのuserIdが現在のユーザーと一致するか確認
    if (checkoutSession.metadata?.userId !== session.user.id) {
      return NextResponse.json(
        { error: "無効なセッションです" },
        { status: 403 }
      );
    }

    // ユーザーのプランをplusに更新
    await db.update(users)
      .set({ plan: "plus" })
      .where(eq(users.id, session.user.id))
      .run();

    return NextResponse.json({ success: true, plan: "plus" });
  } catch (error) {
    console.error("Verify session error:", error);
    return NextResponse.json(
      { error: "セッションの検証に失敗しました" },
      { status: 500 }
    );
  }
}
