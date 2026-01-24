import Link from "next/link";
import type { SearchResultMenu } from "@/types/search";
import { formatPrice } from "@/lib/utils";
import { FavoriteButton } from "@/components/menu/FavoriteButton";

interface MenuResultCardProps {
  result: SearchResultMenu;
}

export function MenuResultCard({ result }: MenuResultCardProps) {
  const { menu, chain, proteinDensity, carbRatio, fatRatio, pfcBalanceScore, costPerProtein } = result;

  return (
    <div className="relative">
      <Link
        href={`/menu/${menu.menuId}`}
        className="block bg-card-bg rounded-xl p-5 border border-border hover:border-primary transition-all hover:shadow-md"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0 pr-10">
            <h3 className="font-bold text-lg text-foreground truncate">
              {menu.menuName}
            </h3>
            <p className="text-sm text-primary">{chain.chainName}</p>
          </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-foreground/70 mb-3">
        <span className="font-medium">P {menu.protein}g</span>
        <span>|</span>
        <span className="font-medium">F {menu.fat}g</span>
        <span>|</span>
        <span className="font-medium">C {menu.carb}g</span>
        <span className="text-foreground/50 ml-auto">{menu.calories}kcal</span>
      </div>

      {/* 栄養指標 */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        {carbRatio !== undefined && (
          <div className="flex justify-between px-2 py-1 bg-background rounded">
            <span className="text-foreground/60">糖質比率</span>
            <span className="font-medium">{carbRatio.toFixed(0)}%</span>
          </div>
        )}
        {fatRatio !== undefined && (
          <div className="flex justify-between px-2 py-1 bg-background rounded">
            <span className="text-foreground/60">脂質比率</span>
            <span className="font-medium">{fatRatio.toFixed(0)}%</span>
          </div>
        )}
        {pfcBalanceScore !== undefined && (
          <div className="flex justify-between px-2 py-1 bg-background rounded">
            <span className="text-foreground/60">PFCバランス</span>
            <span className="font-medium">{pfcBalanceScore}</span>
          </div>
        )}
        {proteinDensity !== undefined && (
          <div className="flex justify-between px-2 py-1 bg-background rounded">
            <span className="text-foreground/60">P密度</span>
            <span className="font-medium">{proteinDensity.toFixed(1)}g/100kcal</span>
          </div>
        )}
        {costPerProtein !== undefined && (
          <div className="flex justify-between px-2 py-1 bg-background rounded">
            <span className="text-foreground/60">Pコスパ</span>
            <span className="font-medium">{costPerProtein}円/gP</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end">
        {menu.price && (
          <span className="font-bold text-primary">{formatPrice(menu.price)}</span>
        )}
      </div>
    </Link>
      <FavoriteButton
        menuId={menu.menuId}
        size="sm"
        className="absolute top-3 right-3"
      />
    </div>
  );
}

