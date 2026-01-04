import { NutritionInfo } from "@/types";
import { cn } from "@/lib/utils";

interface NutritionLabelProps {
  nutrition: NutritionInfo;
  layout?: "horizontal" | "vertical" | "compact";
  showCalories?: boolean;
  className?: string;
}

export function NutritionLabel({
  nutrition,
  layout = "horizontal",
  showCalories = true,
  className,
}: NutritionLabelProps) {
  const { calories, protein, fat, carb } = nutrition;

  if (layout === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-xs", className)}>
        <span className="text-green-600 dark:text-green-400 font-medium">
          P {protein.toFixed(1)}g
        </span>
        <span className="text-zinc-400">|</span>
        <span className="text-amber-600 dark:text-amber-400 font-medium">
          F {fat.toFixed(1)}g
        </span>
        <span className="text-zinc-400">|</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">
          C {carb.toFixed(1)}g
        </span>
      </div>
    );
  }

  if (layout === "vertical") {
    return (
      <div className={cn("space-y-1", className)}>
        {showCalories && (
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {calories} kcal
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-green-600 dark:text-green-400 font-bold">
              {protein.toFixed(1)}g
            </div>
            <div className="text-zinc-500 dark:text-zinc-400">タンパク質</div>
          </div>
          <div className="text-center">
            <div className="text-amber-600 dark:text-amber-400 font-bold">
              {fat.toFixed(1)}g
            </div>
            <div className="text-zinc-500 dark:text-zinc-400">脂質</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 dark:text-blue-400 font-bold">
              {carb.toFixed(1)}g
            </div>
            <div className="text-zinc-500 dark:text-zinc-400">炭水化物</div>
          </div>
        </div>
      </div>
    );
  }

  // horizontal layout
  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      {showCalories && (
        <>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {calories} kcal
          </span>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
        </>
      )}
      <span className="text-green-600 dark:text-green-400">
        P <span className="font-medium">{protein.toFixed(1)}g</span>
      </span>
      <span className="text-amber-600 dark:text-amber-400">
        F <span className="font-medium">{fat.toFixed(1)}g</span>
      </span>
      <span className="text-blue-600 dark:text-blue-400">
        C <span className="font-medium">{carb.toFixed(1)}g</span>
      </span>
    </div>
  );
}
