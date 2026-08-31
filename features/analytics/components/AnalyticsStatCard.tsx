"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "error" | "accent";
}

const VARIANT_STYLES = {
  default: "bg-bg-elevated text-text-secondary border-border-default",
  accent: "bg-accent-subtle text-accent border-accent/20",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  error: "bg-error/15 text-error border-error/30",
};

export function AnalyticsStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: AnalyticsStatCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-bg-surface border border-border-default hover:border-border-hover transition-all space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-secondary">{title}</span>
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center border shrink-0",
            VARIANT_STYLES[variant]
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-text-primary tracking-tight tabular-nums">
          {value}
        </div>
        <p className="text-[11px] text-text-tertiary mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
