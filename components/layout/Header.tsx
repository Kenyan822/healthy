"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { KeywordSearchBox } from "@/components/search/KeywordSearchBox";

export function Header() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#faf9f6]/90 dark:bg-[#1c1917]/90 backdrop-blur-md border-b border-[#e7e5e4] dark:border-[#44403c]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 bg-primary rounded-2xl rotate-3 transition-transform group-hover:rotate-6 shadow-sm">
              <span className="text-white font-rounded font-bold text-xl">
                H
              </span>
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="font-rounded font-bold text-lg md:text-xl text-foreground tracking-tight">
                ヘルシー検索
              </span>
              <span className="text-[10px] text-primary font-bold tracking-wider">
                HEALTHY SEARCH
              </span>
            </div>
          </Link>

          {/* Desktop Search Box */}
          <div className="hidden md:block flex-1 max-w-md">
            <KeywordSearchBox
              placeholder="店舗名や目的で検索"
              className="w-full"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-shrink-0">
            <Link
              href="/chains"
              className="font-medium text-sm text-[#78716c] dark:text-[#a8a29e] hover:text-primary dark:hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-primary"
            >
              チェーン店一覧
            </Link>
            <Link
              href="/area"
              className="font-medium text-sm text-[#78716c] dark:text-[#a8a29e] hover:text-primary dark:hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-primary"
            >
              駅から探す
            </Link>
            <Link
              href="/ranking"
              className="font-medium text-sm text-[#78716c] dark:text-[#a8a29e] hover:text-primary dark:hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-primary"
            >
              ランキング
            </Link>

            {/* ログイン状態による表示切り替え */}
            {status === "loading" ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "ユーザー"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {session.user?.name?.[0] || session.user?.email?.[0] || "U"}
                    </div>
                  )}
                </button>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-[#433422] truncate">
                          {session.user?.name || session.user?.email}
                        </p>
                      </div>
                      <Link
                        href="/favorites"
                        className="block px-4 py-2 text-sm text-[#433422] hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        お気に入り
                      </Link>
                      {(session.user as { plan?: string })?.plan === "plus" ? (
                        <div className="px-4 py-2 text-sm text-primary font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          Plus会員
                        </div>
                      ) : (
                        <Link
                          href="/pricing"
                          className="block px-4 py-2 text-sm text-primary font-medium hover:bg-primary/5"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Plusにアップグレード
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        ログアウト
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                ログイン
              </Link>
            )}
          </nav>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Search Button */}
            <button
              className="p-2 text-[#78716c] dark:text-[#a8a29e] hover:text-primary transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="検索"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isSearchOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                )}
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="p-2 text-[#78716c] dark:text-[#a8a29e]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="メニュー"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search Box */}
        {isSearchOpen && (
          <div className="md:hidden py-3 border-t border-[#e7e5e4] dark:border-[#44403c]">
            <KeywordSearchBox
              placeholder="店舗名や目的で検索"
              autoFocus
            />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[#e7e5e4] dark:border-[#44403c] bg-[#faf9f6] dark:bg-[#1c1917]">
            <div className="flex flex-col gap-2 p-2">
              <Link
                href="/chains"
                className="px-4 py-3 rounded-xl font-medium text-[#78716c] dark:text-[#a8a29e] hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                チェーン店一覧
              </Link>
              <Link
                href="/area"
                className="px-4 py-3 rounded-xl font-medium text-[#78716c] dark:text-[#a8a29e] hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                駅から探す
              </Link>
              <Link
                href="/ranking"
                className="px-4 py-3 rounded-xl font-medium text-[#78716c] dark:text-[#a8a29e] hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ランキング
              </Link>

              {/* モバイル用ログイン */}
              <div className="border-t border-[#e7e5e4] dark:border-[#44403c] mt-2 pt-2">
                {session ? (
                  <>
                    <Link
                      href="/favorites"
                      className="px-4 py-3 rounded-xl font-medium text-[#78716c] dark:text-[#a8a29e] hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-primary transition-colors flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      お気に入り
                    </Link>
                    {(session.user as { plan?: string })?.plan === "plus" ? (
                      <div className="px-4 py-3 rounded-xl font-medium text-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Plus会員
                      </div>
                    ) : (
                      <Link
                        href="/pricing"
                        className="px-4 py-3 rounded-xl font-medium text-primary hover:bg-primary/5 transition-colors flex items-center gap-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Plusにアップグレード
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      ログアウト
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="px-4 py-3 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 transition-colors block text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
