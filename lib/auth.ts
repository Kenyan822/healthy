import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, accounts } from "./db/schema";
import { eq, and } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // メール/パスワード認証
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // ユーザー検索
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .get();

        if (!user || !user.hashedPassword) {
          return null;
        }

        // パスワード検証
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // OAuth認証の場合
      if (account?.provider === "google" && profile?.email) {
        const email = profile.email;

        // 既存ユーザーを検索
        let existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .get();

        if (!existingUser) {
          // 新規ユーザー作成
          const userId = crypto.randomUUID();
          await db.insert(users)
            .values({
              id: userId,
              email: email,
              name: profile.name || null,
              image: (profile as { picture?: string }).picture || null,
              plan: "free",
            })
            .run();

          existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .get();
        } else {
          // 既存ユーザーの画像を更新
          await db.update(users)
            .set({
              image: (profile as { picture?: string }).picture || existingUser.image,
              name: profile.name || existingUser.name,
            })
            .where(eq(users.id, existingUser.id))
            .run();
        }

        // アカウント連携を確認/作成
        const existingAccount = await db
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.provider, account.provider),
              eq(accounts.providerAccountId, account.providerAccountId)
            )
          )
          .get();

        if (!existingAccount && existingUser) {
          await db.insert(accounts)
            .values({
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            })
            .run();
        }

        // user.idを更新してJWTコールバックで使用
        user.id = existingUser!.id;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;

        // プラン情報を取得
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, token.id as string))
          .get();
        if (user) {
          (session.user as { plan?: string }).plan = user.plan;
          session.user.image = user.image || null;
        }
      }
      return session;
    },
  },
});
