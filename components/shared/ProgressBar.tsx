import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: "thin" | "default";
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  variant = "default",
  className,
  showLabel = false,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full flex items-center gap-2", className)}>
      <div
        className={cn(
          "w-full bg-void-900/80 rounded-full overflow-hidden border border-white/8",
          variant === "thin" ? "h-1" : "h-2"
        )}
      >
        <div
          className="h-full bg-signal-white shadow-[0_0_8px_rgba(250,250,252,0.5)] transition-all duration-300 rounded-full"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-mist-200 tabular-nums shrink-0 font-medium">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}
