import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "bordered" | "elevated" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  className,
  onClick,
}: CardProps) {
  // rounded-2xl for friendlier look
  const baseStyles = "rounded-2xl transition-all duration-300 overflow-hidden";

  const variantStyles = {
    // Default: Soft shadow, clean white bg
    default: "bg-white dark:bg-zinc-800 shadow-sm border border-stone-100 dark:border-zinc-700",
    
    // Bordered: More distinct border, less shadow
    bordered:
      "bg-white dark:bg-zinc-800 border-2 border-stone-200 dark:border-zinc-700",
    
    // Elevated: Stronger shadow for emphasis (floating effect)
    elevated:
      "bg-white dark:bg-zinc-800 shadow-lg shadow-stone-200/50 dark:shadow-black/30 border border-stone-100 dark:border-zinc-700 hover:shadow-xl hover:-translate-y-1",
      
    // Flat: No shadow, subtle bg (good for lists)
    flat: "bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-700",
  };

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-5", // Increased slightly for breathing room
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        onClick && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
