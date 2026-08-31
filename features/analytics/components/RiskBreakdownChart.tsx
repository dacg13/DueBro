"use client";

import { type RiskTierBreakdown } from "@/types";
import { ShieldAlert } from "lucide-react";

interface RiskBreakdownChartProps {
  breakdown: RiskTierBreakdown[];
  totalActiveTasks: number;
}

export function RiskBreakdownChart({
  breakdown,
  totalActiveTasks,
}: RiskBreakdownChartProps) {
  return (
    <div className="p-5 rounded-2xl bg-bg-surface border border-border-default space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">Workload Risk Distribution</h4>
            <p className="text-[11px] text-text-tertiary">
              Algorithmic tier classification of all {totalActiveTasks} active tasks
            </p>
          </div>
        </div>
      </div>

      {/* Stacked Horizontal Bar */}
      <div className="h-4 w-full bg-bg-elevated rounded-full overflow-hidden flex border border-border-default/50">
        {breakdown.map((item) => {
          if (item.percent <= 0) return null;
          return (
            <div
              key={item.tier}
              style={{
                width: `${item.percent}%`,
                backgroundColor: item.color,
              }}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              title={`${item.label}: ${item.count} tasks (${item.percent}%)`}
            />
          );
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
        {breakdown.map((item) => (
          <div
            key={item.tier}
            className="p-2 rounded-xl bg-bg-elevated/50 border border-border-default space-y-0.5"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.label}</span>
            </div>
            <div className="text-sm font-bold text-text-primary tabular-nums">
              {item.count}{" "}
              <span className="text-[10px] text-text-tertiary font-normal">
                ({item.percent}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
