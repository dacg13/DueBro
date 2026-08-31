import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, id, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center justify-center p-2.5 sm:p-1.5 -m-2.5 sm:-m-1.5 cursor-pointer">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          onClick={() => !disabled && onCheckedChange?.(!checked)}
          className={cn(
            "h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-200 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-white/50 focus-visible:shadow-[0_0_16px_rgba(250,250,252,0.5)]",
            checked
              ? "bg-signal-white border-signal-white text-void-950 shadow-[0_0_20px_rgba(250,250,252,0.7)]"
              : "border-graphite-600/60 hover:border-graphite-400 bg-void-900/60 backdrop-blur-[10px] text-transparent",
            disabled && "cursor-not-allowed opacity-30",
            className
          )}
        >
          <Check
            className={cn(
              "w-3.5 h-3.5 stroke-[3] transition-transform duration-200",
              checked ? "scale-100" : "scale-0"
            )}
          />
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
