"use client";

import { useState, useEffect } from "react";
import { SiteStats } from "@/types";
import { formatNumber } from "@/lib/utils";

interface HeroSectionProps {
  stats: SiteStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Search:", searchQuery);
    }
  };

  // 背景に浮かぶ食材たち
  const floatingFood = [
    { icon: "🥗", delay: "0s", left: "10%", top: "20%", rotate: "12deg", size: "text-4xl" },
    { icon: "🍖", delay: "2s", left: "85%", top: "15%", rotate: "-12deg", size: "text-5xl" },
    { icon: "🥑", delay: "4s", left: "80%", top: "60%", rotate: "24deg", size: "text-3xl" },
    { icon: "🥦", delay: "1s", left: "5%", top: "70%", rotate: "-15deg", size: "text-4xl" },
    { icon: "🍤", delay: "3s", left: "15%", top: "10%", rotate: "45deg", size: "text-2xl" },
    { icon: "🥚", delay: "5s", left: "90%", top: "85%", rotate: "-30deg", size: "text-3xl" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#faf9f6] dark:bg-[#1c1917] pt-24 pb-20 md:pt-32 md:pb-28">
      {/* Background Noise Texture */}
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      {/* Organic Blobs Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#fff7ed] dark:bg-[#431407] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-3xl opacity-60 animate-blob mix-blend-multiply dark:mix-blend-normal" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#f0fdf4] dark:bg-[#14532d] rounded-[30%_70%_70%_30%/30%_30%_70%_70%] blur-3xl opacity-60 animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-normal" />

      {/* Floating Elements */}
      {mounted && floatingFood.map((item, index) => (
        <div
          key={index}
          className={`absolute animate-float opacity-20 dark:opacity-10 select-none font-emoji ${item.size}`}
          style={{
            left: item.left,
            top: item.top,
            transform: `rotate(${item.rotate})`,
            animationDelay: item.delay,
          }}
        >
          {item.icon}
        </div>
      ))}

      <div className="container relative mx-auto px-4 z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Layout */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
            
            {/* Left Content */}
            <div className="w-full md:w-3/5 text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-orange-200/50 dark:border-white/10 rounded-full transform -rotate-2 origin-bottom-left shadow-sm">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-bold text-orange-800 dark:text-orange-200 tracking-wider">HEALTHY EATING GUIDE</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-rounded text-foreground leading-[1.1] tracking-tight relative">
                <span className="relative z-10">外食</span>を、もっと
                <br />
                <span className="relative inline-block text-primary transform hover:scale-105 transition-transform duration-300 cursor-default">
                  自由
                  <svg className="absolute w-[120%] -left-[10%] -bottom-2 md:-bottom-4 h-4 md:h-6 text-yellow-300 -z-10 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="12" fill="none" />
                  </svg>
                </span>
                に、
                <span className="relative inline-block ml-2 md:ml-4 text-accent transform hover:scale-105 transition-transform duration-300 cursor-default delay-75">
                  健康
                  <svg className="absolute w-[120%] -left-[10%] -bottom-2 md:-bottom-4 h-4 md:h-6 text-orange-200 -z-10 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 15 Q 50 5 100 15" stroke="currentColor" strokeWidth="12" fill="none" />
                  </svg>
                </span>
                に。
              </h1>
              
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-loose max-w-xl">
                チェーン店のメニューから、あなたの体づくりやダイエットに最適な一皿を見つけます。
                <span className="hidden md:inline bg-gradient-to-r from-orange-100 to-transparent dark:from-orange-900/30 px-1">我慢するだけの食事制限は、もう終わり。</span>
              </p>

              {/* Search Bar */}
              <div className="relative max-w-lg transform transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-primary rounded-2xl blur opacity-20 animate-pulse" />
                <form onSubmit={handleSearch} className="relative bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-xl flex items-center border-2 border-transparent focus-within:border-orange-100 dark:focus-within:border-orange-900/30 transition-colors">
                  <div className="pl-4 text-zinc-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="お店の名前やメニュー..."
                    className="w-full px-4 py-3 bg-transparent text-foreground placeholder-zinc-400 focus:outline-none text-lg"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white p-3 rounded-xl transition-colors shadow-lg shadow-primary/20"
                  >
                    <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 text-sm font-medium text-zinc-500">
                <span className="mr-2 text-zinc-400">人気のタグ:</span>
                {["#高タンパク", "#低糖質", "#500kcal以下", "#スタバ", "#マック"].map((tag) => (
                  <button key={tag} className="hover:text-primary transition-colors underline decoration-dotted underline-offset-4">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Visual Area */}
            <div className="w-full md:w-2/5 relative">
              <div className="relative z-10 bg-white dark:bg-zinc-800 p-6 rounded-[2rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-zinc-100 dark:border-zinc-700">
                <div className="absolute -top-6 -right-6 bg-accent text-white p-4 rounded-full shadow-lg transform rotate-12 z-20">
                  <span className="text-2xl font-bold font-rounded">{formatNumber(stats.totalMenus)}</span>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-accent-light">Menus</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl h-32 flex flex-col justify-between group cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                      <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">🍗</span>
                      <span className="font-bold text-orange-800 dark:text-orange-200">タンパク質<br/>重視</span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl h-40 flex flex-col justify-between group cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">🥗</span>
                      <span className="font-bold text-green-800 dark:text-green-200">野菜<br/>たっぷり</span>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl h-40 flex flex-col justify-between group cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">⚖️</span>
                      <span className="font-bold text-blue-800 dark:text-blue-200">糖質<br/>コントロール</span>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-2xl h-32 flex flex-col justify-between group cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                      <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">🔥</span>
                      <span className="font-bold text-yellow-800 dark:text-yellow-200">低脂質</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements behind the card */}
              <div className="absolute top-10 right-10 w-full h-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-[2.5rem] -z-10 transform translate-x-4 translate-y-4" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-20px) rotate(var(--tw-rotate)); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}
