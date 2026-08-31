"use client";

import { type RiskAssessment } from "@/types";
import { ShieldCheck, ShieldAlert, AlertTriangle, Flame, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  assessment: RiskAssessment;
  showScore?: boolean;
  size?: "sm" | "default";
  className?: string;
}

const TIER_ICONS = {
  safe: ShieldCheck,
  low: CheckCircle2,
  medium: AlertTriangle,
  high: ShieldAlert,
  critical: Flame,
  overdue: Clock,
};

export function RiskBadge({
  assessment,
  showScore = false,
  size = "default",
  className,
}: RiskBadgeProps) {
  const { tier, score, color, label, isOverdue } = assessment;
  const Icon = TIER_ICONS[tier] || ShieldCheck;

  return (
    <div
      title={assessment.explanation}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors border",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span className="font-semibold">{label}</span>
      {showScore && !isOverdue && tier !== "safe" && (
        <span className="opacity-80 tabular-nums text-[10px] ml-0.5">
          ({(score * 100).toFixed(0)}%)
        </span>
      )}
    </div>
  );
}
