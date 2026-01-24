import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードは必須です" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "パスワードは8文字以上で入力してください" },
        { status: 400 }
      );
    }

    // 既存ユーザーチェック
    const existingUser = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();
    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザー作成
    const userId = crypto.randomUUID();
    db.insert(users)
      .values({
        id: userId,
        name: name || null,
        email,
        hashedPassword,
        plan: "free",
      })
      .run();

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}
