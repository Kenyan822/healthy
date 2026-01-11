import Link from "next/link";
import { LatestMenu } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { NutritionLabel } from "@/components/ui/NutritionLabel";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

interface LatestMenusProps {
  menus: LatestMenu[];
}

export function LatestMenus({ menus }: LatestMenusProps) {
  const getUpdateBadge = (updateType: LatestMenu["updateType"]) => {
    switch (updateType) {
      case "new":
        return <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm transform -rotate-2">NEW!</span>;
      case "updated":
        return <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">更新</span>;
      case "price_change":
        return <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">価格改定</span>;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto pb-12 pt-4 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-6" style={{ minWidth: "max-content" }}>
        {menus.map((menu, index) => (
          <Link
            key={menu.menuId}
            href={`/menu/${menu.menuId}`}
            className={`
              block w-72 group relative
              transition-all duration-300 hover:-translate-y-2 hover:rotate-1
            `}
            style={{
              transform: `rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`,
            }}
          >
            {/* Tape effect */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-white/30 backdrop-blur-sm border-l border-r border-white/40 shadow-sm rotate-1 z-20" />

            <div className="bg-white dark:bg-zinc-800 p-3 pb-4 rounded-sm shadow-lg border border-zinc-100 dark:border-zinc-700 h-full flex flex-col">
              {/* Image Placeholder - Polaroid Style */}
              <div className="relative aspect-square mb-3 bg-zinc-100 dark:bg-zinc-900 border-4 border-white dark:border-zinc-700 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                  <span className="text-4xl">🍽️</span>
                </div>
                {/* Update Badge */}
                <div className="absolute top-2 left-2 z-10">
                  {getUpdateBadge(menu.updateType)}
                </div>
              </div>

              {/* Handwriting Note Style Content */}
              <div className="flex-1 flex flex-col px-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-zinc-500 border-b border-zinc-200 pb-0.5">
                    {menu.chainName}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-foreground mb-2 leading-tight font-handwriting line-clamp-2 min-h-[3.5rem]">
                  {menu.menuName}
                </h3>

                <div className="mt-auto pt-3 border-t-2 border-dotted border-zinc-200 dark:border-zinc-700/50">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-bold text-zinc-500">Price</span>
                    <span className="text-xl font-bold font-mono text-foreground tracking-tighter">
                      {menu.price !== undefined ? formatPrice(menu.price) : "価格未定"}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-mono text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded">
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider mb-0.5">Prot</div>
                      <div className="font-bold text-foreground">{menu.nutrition.protein}g</div>
                    </div>
                    <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider mb-0.5">Fat</div>
                      <div className="font-bold text-foreground">{menu.nutrition.fat}g</div>
                    </div>
                    <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider mb-0.5">Carb</div>
                      <div className="font-bold text-foreground">{menu.nutrition.carb}g</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
