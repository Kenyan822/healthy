"use client";

import { useState } from "react";
import { SiteStats } from "@/types";
import { formatNumber } from "@/lib/utils";

interface HeroSectionProps {
  stats: SiteStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 将来的には検索ページに遷移
      console.log("Search:", searchQuery);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#fffaf0] dark:bg-[#2c241b] py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30" />
      
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-gradient-to-br from-orange-200/40 to-yellow-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-tr from-green-200/40 to-emerald-200/40 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block mb-6 px-4 py-1.5 bg-white dark:bg-zinc-800 border border-orange-200 dark:border-orange-900/30 rounded-full shadow-sm transform -rotate-1">
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
              ✨ 今日は何を食べる？
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-rounded font-bold text-foreground mb-6 leading-tight tracking-tight">
            チェーン店で、
            <br className="md:hidden" />
            <span className="relative inline-block mx-2 text-primary">
              健康的な食事
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10 opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
            を
            <br className="md:hidden" />
            見つけよう。
          </h1>
          
          <p className="text-lg md:text-xl text-[#78716c] dark:text-[#a8a29e] mb-10 max-w-2xl mx-auto leading-relaxed">
            「ダイエット中でも外食したい」「タンパク質をしっかり摂りたい」<br className="hidden md:inline" />
            あなたの目的に合ったメニューがきっと見つかります。
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mb-10 relative z-10">
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-300 to-green-300 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200" />
              <div className="relative flex items-center bg-white dark:bg-[#292524] rounded-full shadow-lg border border-orange-100 dark:border-orange-900/30 p-2">
                <div className="pl-6 text-orange-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="店名、メニュー、駅名など..."
                  className="w-full px-4 py-3 text-lg bg-transparent text-foreground placeholder-[#a8a29e] focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-all transform hover:scale-105"
                >
                  検索
                </button>
              </div>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {[
              { label: "💪 高タンパク", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
              { label: "🥗 低糖質", color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
              { label: "📉 ダイエット", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
              { label: "🥑 低脂質", color: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100" },
            ].map((tag) => (
              <button
                key={tag.label}
                className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all transform hover:-translate-y-0.5 shadow-sm ${tag.color} dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/50 dark:border-zinc-700/50 shadow-sm">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold font-rounded text-primary mb-1">
                {formatNumber(stats.totalChains)}
              </div>
              <div className="text-xs md:text-sm font-bold text-[#78716c] dark:text-[#a8a29e]">
                掲載チェーン
              </div>
            </div>
            <div className="text-center border-l border-r border-[#e7e5e4] dark:border-[#44403c]">
              <div className="text-2xl md:text-4xl font-bold font-rounded text-accent mb-1">
                {formatNumber(stats.totalMenus)}
              </div>
              <div className="text-xs md:text-sm font-bold text-[#78716c] dark:text-[#a8a29e]">
                登録メニュー
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold font-rounded text-primary mb-1">
                {formatNumber(stats.totalStations)}
              </div>
              <div className="text-xs md:text-sm font-bold text-[#78716c] dark:text-[#a8a29e]">
                対応エリア
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
