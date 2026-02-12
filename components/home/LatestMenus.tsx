import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { FavoriteButton } from "@/components/menu/FavoriteButton";

interface LatestMenuProps {
  menuId: string;
  chainId: string;
  chainName: string;
  menuName: string;
  price: number | null;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carb: number | null;
}

interface LatestMenusProps {
  menus: LatestMenuProps[];
}

export function LatestMenus({ menus }: LatestMenusProps) {
  return (
    <div className="overflow-x-auto pb-12 pt-4 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-6" style={{ minWidth: "max-content" }}>
        {menus.map((menu) => (
          <div key={menu.menuId} className="group relative w-72 transition-all duration-300 hover:-translate-y-2">
            <Link
              href={`/${menu.chainId}`}
              className="block"
            >
              {/* Tape effect */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-white/30 backdrop-blur-sm border-l border-r border-white/40 shadow-sm z-20" />

              <div className="bg-white dark:bg-zinc-800 p-4 rounded-sm shadow-lg border border-zinc-100 dark:border-zinc-700 h-full flex flex-col">
                {/* Header */}
                <span className="text-xs font-bold text-zinc-500 border-b border-zinc-200 pb-0.5 mb-3 inline-block">
                  {menu.chainName}
                </span>

                <h3 className="font-bold text-base text-foreground mb-2 leading-tight line-clamp-2 min-h-[3rem]">
                  {menu.menuName}
                </h3>

                <div className="mt-auto pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs text-zinc-500">価格</span>
                    <span className="text-lg font-bold text-foreground">
                      {menu.price !== null ? formatPrice(menu.price) : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded">
                    <div className="text-center">
                      <div className="text-[10px] mb-0.5">P</div>
                      <div className="font-bold text-foreground">{menu.protein ?? "-"}g</div>
                    </div>
                    <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
                    <div className="text-center">
                      <div className="text-[10px] mb-0.5">F</div>
                      <div className="font-bold text-foreground">{menu.fat ?? "-"}g</div>
                    </div>
                    <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
                    <div className="text-center">
                      <div className="text-[10px] mb-0.5">C</div>
                      <div className="font-bold text-foreground">{menu.carb ?? "-"}g</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            <FavoriteButton
              menuId={menu.menuId}
              size="sm"
              className="absolute top-1 right-1 z-30"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
