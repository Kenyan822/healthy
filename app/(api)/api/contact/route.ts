import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts, chains } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { contactAdminNotification, contactConfirmation } from "@/lib/email-templates";
import { eq } from "drizzle-orm";

const VALID_CATEGORIES = ['general', 'bug', 'feature', 'new_menu', 'correction', 'other'] as const;
type Category = typeof VALID_CATEGORIES[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, subject, message, chainId, menuName, sourceUrl } = body;

    // バリデーション
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "カテゴリが無効です" },
        { status: 400 }
      );
    }

    if (!subject?.trim()) {
      return NextResponse.json(
        { error: "件名は必須です" },
        { status: 400 }
      );
    }

    if (!message?.trim() || message.length < 10) {
      return NextResponse.json(
        { error: "内容は10文字以上で入力してください" },
        { status: 400 }
      );
    }

    // 新メニュー情報の場合、chainIdは必須
    if (category === 'new_menu' && !chainId?.trim()) {
      return NextResponse.json(
        { error: "新メニュー情報の場合、チェーン店の選択は必須です" },
        { status: 400 }
      );
    }

    // chainIdが指定されている場合、存在確認
    let chainName: string | undefined;
    if (chainId?.trim()) {
      const chain = db
        .select({ chainName: chains.chainName })
        .from(chains)
        .where(eq(chains.chainId, chainId))
        .get();

      if (!chain) {
        return NextResponse.json(
          { error: "指定されたチェーン店が見つかりません" },
          { status: 400 }
        );
      }
      chainName = chain.chainName;
    }

    // sourceUrlのバリデーション（指定されている場合）
    if (sourceUrl?.trim()) {
      try {
        new URL(sourceUrl);
      } catch {
        return NextResponse.json(
          { error: "情報源URLが無効です" },
          { status: 400 }
        );
      }
    }

    // ログインユーザーのIDを取得（任意）
    const session = await auth();
    const userId = session?.user?.id || null;

    // DB保存
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    db.insert(contacts)
      .values({
        id,
        name: name?.trim() || null,
        email: email.trim(),
        category: category as Category,
        subject: subject.trim(),
        message: message.trim(),
        chainId: chainId?.trim() || null,
        menuName: menuName?.trim() || null,
        sourceUrl: sourceUrl?.trim() || null,
        userId,
      })
      .run();

    // 管理者へメール通知
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminTemplate = contactAdminNotification({
        id,
        name: name?.trim() || null,
        email: email.trim(),
        category,
        subject: subject.trim(),
        message: message.trim(),
        chainName,
        menuName: menuName?.trim(),
        sourceUrl: sourceUrl?.trim(),
        createdAt,
      });

      await sendEmail({
        to: adminEmail,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        replyTo: email.trim(),
      });
    }

    // 送信者へ確認メール
    const confirmTemplate = contactConfirmation({
      name: name?.trim() || null,
      subject: subject.trim(),
      category,
    });

    await sendEmail({
      to: email.trim(),
      subject: confirmTemplate.subject,
      html: confirmTemplate.html,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "送信に失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 }
    );
  }
}
