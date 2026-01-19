import Link from "next/link";
import type { SearchResultMenu } from "@/types/search";
import { formatPrice } from "@/lib/utils";

interface MenuResultCardProps {
  result: SearchResultMenu;
  showPFCMatch?: boolean;
}

export function MenuResultCard({ result, showPFCMatch = false }: MenuResultCardProps) {
  const { menu, chain, pfcMatchPercent, costPerProtein, popularityScore } = result;

  return (
    <Link
      href={`/menu/${menu.menuId}`}
      className="block bg-card-bg rounded-xl p-5 border border-border hover:border-primary transition-all hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground truncate">
            {menu.menuName}
          </h3>
          <p className="text-sm text-primary">{chain.chainName}</p>
        </div>
        {showPFCMatch && pfcMatchPercent !== undefined && (
          <div className="ml-3 flex-shrink-0">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                pfcMatchPercent >= 80
                  ? "bg-green-100 text-green-700"
                  : pfcMatchPercent >= 60
                    ? "bg-lime-100 text-lime-700"
                    : pfcMatchPercent >= 40
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-orange-100 text-orange-700"
              }`}
            >
              {pfcMatchPercent}%マッチ
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-foreground/70 mb-3">
        <span className="font-medium">P {menu.protein}g</span>
        <span>|</span>
        <span className="font-medium">F {menu.fat}g</span>
        <span>|</span>
        <span className="font-medium">C {menu.carb}g</span>
        <span className="text-foreground/50 ml-auto">{menu.calories}kcal</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-foreground/60">
          {popularityScore !== undefined && popularityScore > 0 && (
            <span className="flex items-center gap-1">
              <StarIcon />
              {popularityScore > 100 ? "100+" : popularityScore}
            </span>
          )}
          {costPerProtein !== undefined && (
            <span className="flex items-center gap-1">
              <span className="text-foreground/40">コスパ:</span>
              {costPerProtein}円/gP
            </span>
          )}
        </div>
        {menu.price && (
          <span className="font-bold text-primary">{formatPrice(menu.price)}</span>
        )}
      </div>
    </Link>
  );
}

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
