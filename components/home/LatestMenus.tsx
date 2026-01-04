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
        return <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">NEW</Badge>;
      case "updated":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0">更新</Badge>;
      case "price_change":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0">価格変更</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-4" style={{ minWidth: "max-content" }}>
        {menus.map((menu) => (
          <Link
            key={menu.menuId}
            href={`/menu/${menu.menuId}`}
            className="block w-72 transition-transform hover:-translate-y-1"
          >
            <Card variant="elevated" padding="none" className="h-full overflow-hidden border-0">
              {/* Image Placeholder */}
              <div className="relative h-40 bg-orange-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent opacity-50" />
                <div className="relative text-orange-200 dark:text-zinc-600">
                  <svg
                    className="w-16 h-16 transform -rotate-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                  </svg>
                </div>
                {/* Update Badge */}
                <div className="absolute top-3 left-3 shadow-sm">
                  {getUpdateBadge(menu.updateType)}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-md inline-block">
                    {menu.chainName}
                  </div>
                </div>
                
                <h3 className="font-bold text-base text-foreground mb-3 line-clamp-2 min-h-[3rem]">
                  {menu.menuName}
                </h3>

                {/* Price */}
                {menu.price && (
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-xl font-bold font-rounded text-primary">
                      {formatPrice(menu.price)}
                    </span>
                    <span className="text-xs text-[#78716c] dark:text-[#a8a29e]">
                      (税込)
                    </span>
                  </div>
                )}

                {/* Nutrition */}
                <div className="bg-[#faf9f6] dark:bg-zinc-900/50 rounded-lg p-2 mb-2">
                  <NutritionLabel
                    nutrition={menu.nutrition}
                    layout="compact"
                    showCalories={false}
                  />
                </div>

                {/* Calories */}
                <div className="text-right text-xs font-medium text-[#78716c] dark:text-[#a8a29e]">
                  <span className="font-bold text-foreground text-sm">{menu.nutrition.calories}</span> kcal
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
