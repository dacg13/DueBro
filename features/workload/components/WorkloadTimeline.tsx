"use client";

import { type DailyWorkloadPlan } from "@/types";
import { format, parseISO, isToday } from "date-fns";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkloadTimelineProps {
  plans: DailyWorkloadPlan[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export function WorkloadTimeline({
  plans,
  selectedDate,
  onSelectDate,
}: WorkloadTimelineProps) {
  return (
    <div className="rounded-2xl bg-bg-surface border border-border-default p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          14-Day Study Pacing Timeline
        </h4>
        <span className="text-[11px] text-text-tertiary">
          Click any day to inspect allocated study sessions
        </span>
      </div>

      {/* 14 Days Grid / Horizontal Bar Chart */}
      <div className="grid grid-cols-2 sm:grid-cols-7 lg:grid-cols-14 gap-2 pt-1">
        {plans.map((plan) => {
          const parsed = parseISO(plan.date);
          const isDayToday = isToday(parsed);
          const isSelected = selectedDate === plan.date;
          const isOverloaded = plan.isOverloaded || plan.utilizationPercent > 100;
          const isFull = plan.utilizationPercent >= 90 && !isOverloaded;

          // Bar height percentage (capped at 100% for height, but percentage displays true)
          const barHeightPct = Math.min(plan.utilizationPercent, 100);

          return (
            <button
              key={plan.date}
              type="button"
              onClick={() => onSelectDate(plan.date)}
              className={cn(
                "p-2.5 rounded-xl border text-left flex flex-col justify-between min-h-[140px] transition-all cursor-pointer group relative overflow-hidden",
                isSelected
                  ? "border-accent bg-accent-subtle/20 shadow-xs ring-1 ring-accent"
                  : "border-border-default bg-bg-elevated/50 hover:border-border-hover hover:bg-bg-elevated",
                isOverloaded && !isSelected && "border-error/40 bg-error/5"
              )}
            >
              {/* Day Header */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={cn(
                      "font-bold uppercase",
                      isDayToday ? "text-accent" : "text-text-secondary"
                    )}
                  >
                    {format(parsed, "EEE")}
                  </span>
                  {isOverloaded && <Flame className="w-3 h-3 text-error" />}
                </div>

                <div className="text-xs font-bold text-text-primary tabular-nums">
                  {format(parsed, "MMM d")}
                </div>
              </div>

              {/* Bar visualization */}
              <div className="py-2 flex flex-col justify-end h-14">
                <div className="w-full bg-bg-surface rounded-md h-12 flex flex-col justify-end p-0.5 overflow-hidden border border-border-default/50">
                  <div
                    className={cn(
                      "w-full rounded transition-all duration-300",
                      isOverloaded
                        ? "bg-error"
                        : isFull
                        ? "bg-warning"
                        : plan.allocatedHours > 0
                        ? "bg-accent"
                        : "bg-transparent"
                    )}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>
              </div>

              {/* Day Footer Stats */}
              <div className="text-[10px] space-y-0.5">
                <div className="flex items-center justify-between tabular-nums font-semibold">
                  <span className={cn(isOverloaded ? "text-error font-bold" : "text-text-primary")}>
                    {plan.allocatedHours.toFixed(1)}h
                  </span>
                  <span className="text-text-tertiary">/ {plan.capacityHours.toFixed(0)}h</span>
                </div>

                <div
                  className={cn(
                    "text-[9px] tabular-nums font-bold truncate",
                    isOverloaded ? "text-error" : isFull ? "text-warning" : "text-text-tertiary"
                  )}
                >
                  {plan.utilizationPercent.toFixed(0)}% load
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
