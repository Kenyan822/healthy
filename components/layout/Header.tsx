"use client";

import Link from "next/link";
import { useState } from "react";
import { KeywordSearchBox } from "@/components/search/KeywordSearchBox";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
