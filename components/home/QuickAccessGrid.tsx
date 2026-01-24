import Link from "next/link";

const quickAccessItems = [
  {
    id: "high-protein",
    title: "高タンパク",
    description: "筋トレ民の味方",
    href: "/ranking/high-protein",
    className:
      "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-900 dark:text-orange-100",
  },
  {
    id: "low-carb",
    title: "低糖質",
    description: "ロカボ生活",
    href: "/ranking/low-carb",
    className:
      "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-900 dark:text-green-100",
  },
  {
    id: "low-fat",
    title: "低脂質",
    description: "ローファット派",
    href: "/ranking/low-fat",
    className:
      "bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 text-teal-900 dark:text-teal-100",
  },
  {
    id: "low-calorie",
    title: "低カロリー",
    description: "カロリー控えめ",
    href: "/ranking/low-calorie",
    className:
      "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-900 dark:text-blue-100",
  },
  {
    id: "balanced",
    title: "バランス重視",
    description: "PFCバランス◎",
    href: "/ranking/balanced",
    className:
      "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-yellow-900 dark:text-yellow-100",
  },
  {
    id: "cost-performance",
    title: "コスパ最強",
    description: "タンパク質/円",
    href: "/ranking/cost-performance",
    className:
      "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-900 dark:text-purple-100",
  },
];

export function QuickAccessGrid() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-rounded">
          目的から探す
        </h2>
        <Link
          href="/ranking"
          className="text-xs font-bold text-zinc-400 hover:text-primary transition-colors"
        >
          すべて見る →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              <div className="font-bold text-base leading-tight mb-1">
                {item.title}
              </div>
              <div className="text-xs font-medium opacity-70">
                {item.description}
              </div>
            </div>

            {/* Shiny effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Link>
        ))}
      </div>
    </div>
  );
}
