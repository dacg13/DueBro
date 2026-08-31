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
          "flex h-12 w-full rounded-xl bg-void-900/60 backdrop-blur-[20px] px-3.5 py-2 text-sm text-signal-white placeholder:text-graphite-400 transition-all duration-200 sm:h-10",
          "border",
          error
            ? "border-signal-danger focus:border-signal-danger focus:ring-2 focus:ring-signal-danger/40"
            : "border-graphite-600/60 hover:border-graphite-400 focus:border-white/40 focus:ring-2 focus:ring-white/30 focus:shadow-[0_0_16px_rgba(250,250,252,0.35)]",
          "focus:outline-none disabled:cursor-not-allowed disabled:opacity-30",
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
