import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-white/50 focus-visible:shadow-[0_0_16px_rgba(250,250,252,0.4)] disabled:pointer-events-none disabled:opacity-30 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-signal-white text-void-950 font-semibold shadow-[0_0_16px_rgba(250,250,252,0.22)] hover:shadow-[0_0_24px_rgba(250,250,252,0.38)] hover:bg-signal-white/95",
        secondary:
          "bg-graphite-600/28 backdrop-blur-[20px] border border-white/8 text-mist-100 hover:border-white/16 hover:text-signal-white hover:bg-graphite-600/36",
        ghost:
          "text-mist-100/70 hover:text-signal-white hover:bg-void-850/50",
        destructive:
          "border border-signal-danger/40 text-signal-danger hover:bg-signal-danger hover:text-white transition-colors",
        outline:
          "border border-white/10 text-mist-100 hover:border-white/20 hover:text-signal-white hover:bg-void-850/30",
      },
      size: {
        default: "h-11 px-4 py-2 text-sm sm:h-9 sm:px-3 sm:text-xs", // 44px mobile, 36px desktop
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
