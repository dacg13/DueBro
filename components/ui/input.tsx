import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl bg-bg-elevated px-3.5 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-colors sm:h-10",
          "border",
          error
            ? "border-error focus:border-error focus:ring-1 focus:ring-error"
            : "border-border-default hover:border-border-hover focus:border-accent focus:ring-1 focus:ring-accent",
          "focus:outline-none disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
