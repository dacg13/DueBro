import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent/90 shadow-sm",
        secondary:
          "bg-bg-surface border border-border-default text-text-primary hover:border-border-hover hover:bg-bg-elevated",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
        destructive: "bg-error text-white hover:bg-error/90",
        outline: "border border-border-default text-text-primary hover:bg-bg-elevated",
      },
      size: {
        default: "h-11 px-4 py-2 text-sm sm:h-9 sm:px-3 sm:text-xs", // 44px mobile, 36px desktop per DESIGN_PRD.md §3
        sm: "h-8 px-2.5 text-xs rounded-lg",
        lg: "h-12 px-6 text-base rounded-xl",
        icon: "h-10 w-10 sm:h-9 sm:w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
