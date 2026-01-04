import Link from "next/link";
import { Card } from "@/components/ui/Card";

const quickAccessItems = [
  {
    id: "high-protein",
    title: "高タンパク",
    description: "筋トレ・ボディメイクに",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    href: "/combination/protein/30g",
    color: "bg-green-500",
    bg: "bg-green-50 text-green-700",
  },
  {
    id: "low-carb",
    title: "低糖質",
    description: "糖質制限・ケトジェニック",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    href: "/combination/carb/50g以下",
    color: "bg-blue-500",
    bg: "bg-blue-50 text-blue-700",
  },
  {
    id: "diet",
    title: "ダイエット",
    description: "カロリー控えめ",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    href: "/combination/calories/500kcal以下",
    color: "bg-pink-500",
    bg: "bg-pink-50 text-pink-700",
  },
  {
    id: "low-fat",
    title: "低脂質",
    description: "脂質を抑えたい方に",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    href: "/combination/fat/20g以下",
    color: "bg-amber-500",
    bg: "bg-amber-50 text-amber-700",
  },
];

export function QuickAccessGrid() {
  return (
    <Card variant="default" className="border-0 shadow-md">
      <h2 className="text-lg font-bold font-rounded text-foreground mb-4 flex items-center gap-2">
        <span className="text-xl">🎯</span> 目的別で探す
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {quickAccessItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#faf9f6] dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border-2 border-transparent hover:border-orange-100 transition-all hover:shadow-sm text-center"
          >
            <div
              className={`flex-shrink-0 w-12 h-12 ${item.bg} rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}
            >
              {item.icon}
            </div>
            <div className="w-full">
              <div className="font-bold text-foreground text-sm mb-1">
                {item.title}
              </div>
              <div className="text-[10px] font-medium text-[#78716c] dark:text-[#a8a29e] truncate px-1">
                {item.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
