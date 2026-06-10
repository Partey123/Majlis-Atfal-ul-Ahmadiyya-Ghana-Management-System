import { cn } from "@/lib/utils";

interface WingBadgeProps {
  wing: "atfal_sughir" | "atfal_kabir" | "khuddam" | string;
  size?: "sm" | "md";
  className?: string;
}

export function WingBadge({ wing, size = "sm", className }: WingBadgeProps) {
  let label = "Atfal Sughir";
  let colorClass = "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/50";
  let dotClass = "bg-sky-500";

  if (wing === "khuddam") {
    label = "Khuddam";
    colorClass = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50";
    dotClass = "bg-amber-500";
  } else if (wing === "atfal_kabir") {
    label = "Atfal Kabir";
    colorClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50";
    dotClass = "bg-emerald-500";
  }

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        colorClass,
        sizeClass,
        className
      )}
    >
      <span className={cn("rounded-full", dotClass, dotSize)} />
      {label}
    </div>
  );
}
