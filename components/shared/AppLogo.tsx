"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  glow?: boolean;
}

export function AppLogo({
  size = "md",
  showWordmark = true,
  className,
  glow = true,
}: AppLogoProps) {
  const sizeMap = {
    sm: { box: "w-7 h-7", px: 28, text: "text-sm" },
    md: { box: "w-8 h-8", px: 32, text: "text-base" },
    lg: { box: "w-12 h-12", px: 48, text: "text-xl" },
    xl: { box: "w-20 h-20", px: 80, text: "text-3xl" },
  };

  const { box, px, text } = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div
        className={cn(
          "relative rounded-[22%] overflow-hidden shrink-0 transition-all duration-300",
          box,
          glow && "hover:shadow-[0_0_24px_rgba(250,250,252,0.45)]"
        )}
      >
        <Image
          src="/logo.png"
          alt="DueBro — Suspend Logo"
          width={px}
          height={px}
          className="w-full h-full object-cover object-center"
          priority
        />
        {/* Subtle illuminated glass rim highlight */}
        <div className="absolute inset-0 rounded-[22%] ring-1 ring-white/20 pointer-events-none" />
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-bold tracking-tight text-signal-white", text)}>
            DueBro
          </span>
          {size === "lg" || size === "xl" ? (
            <span className="text-xs text-mist-200 tracking-wider font-medium mt-1">
              Deadline Intelligence
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
