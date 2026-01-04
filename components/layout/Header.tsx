"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#faf9f6]/90 dark:bg-[#1c1917]/90 backdrop-blur-md border-b border-[#e7e5e4] dark:border-[#44403c]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 bg-primary rounded-2xl rotate-3 transition-transform group-hover:rotate-6 shadow-sm">
              <span className="text-white font-rounded font-bold text-xl">H</span>
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/chains"
              className="font-medium text-sm text-[#78716c] dark:text-[#a8a29e] hover:text-primary dark:hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-primary"
            >
              チェーン店一覧
            </Link>
            <Link
              href="/stations"
              className="font-medium text-sm text-[#78716c] dark:text-[#a8a29e] hover:text-primary dark:hover:text-primary transition-colors py-2 border-b-2 border-transparent hover:border-primary"
            >
              駅から探す
            </Link>
            <Link
              href="/combination"
              className="px-5 py-2.5 bg-accent text-white font-bold rounded-full text-sm hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200"
            >
              目的別検索
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#78716c] dark:text-[#a8a29e]"
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
                href="/stations"
                className="px-4 py-3 rounded-xl font-medium text-[#78716c] dark:text-[#a8a29e] hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                駅から探す
              </Link>
              <Link
                href="/combination"
                className="px-4 py-3 rounded-xl font-bold text-accent hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                目的別検索
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
