import Link from "next/link";
import { Card } from "@/components/ui/Card";

const quickAccessItems = [
  {
    id: "high-protein",
    title: "高タンパク",
    description: "筋トレ民の味方",
    icon: "💪",
    href: "/combination/protein/30g",
    className: "col-span-2 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-900 dark:text-orange-100",
    iconSize: "text-4xl right-2 bottom-2",
  },
  {
    id: "low-carb",
    title: "低糖質",
    description: "ロカボ生活",
    icon: "🥬",
    href: "/combination/carb/50g以下",
    className: "col-span-1 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-900 dark:text-green-100",
    iconSize: "text-3xl right-1 bottom-1",
  },
  {
    id: "diet",
    title: "ダイエット",
    description: "500kcal以下",
    icon: "📉",
    href: "/combination/calories/500kcal以下",
    className: "col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-900 dark:text-blue-100",
    iconSize: "text-3xl right-1 bottom-1",
  },
  {
    id: "low-fat",
    title: "低脂質",
    description: "さっぱりヘルシー",
    icon: "🥑",
    href: "/combination/fat/20g以下",
    className: "col-span-2 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-yellow-900 dark:text-yellow-100",
    iconSize: "text-4xl right-2 bottom-2",
  },
];

export function QuickAccessGrid() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-rounded flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span>目的から探す</span>
        </h2>
        <Link href="/search" className="text-xs font-bold text-zinc-400 hover:text-primary transition-colors">
          すべて見る →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickAccessItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`
              ${item.className}
              group relative overflow-hidden rounded-2xl p-4 transition-all duration-300
              hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]
              border border-white/50 dark:border-white/5
            `}
          >
            <div className="relative z-10">
              <div className="font-bold text-lg leading-tight mb-1">
                {item.title}
              </div>
              <div className="text-xs font-medium opacity-70">
                {item.description}
              </div>
            </div>
            
            {/* Background Icon */}
            <div 
              className={`
                absolute ${item.iconSize} transform transition-transform duration-500
                group-hover:scale-125 group-hover:rotate-12 opacity-80 filter grayscale-[0.2] group-hover:grayscale-0
              `}
            >
              {item.icon}
            </div>
            
            {/* Shiny effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Link>
        ))}
      </div>
    </div>
  );
}
