import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-12 w-full appearance-none rounded-xl bg-bg-elevated pl-3.5 pr-10 py-2 text-sm text-text-primary transition-colors sm:h-10",
            "border",
            error
              ? "border-error focus:border-error focus:ring-1 focus:ring-error"
              : "border-border-default hover:border-border-hover focus:border-accent focus:ring-1 focus:ring-accent",
            "focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
