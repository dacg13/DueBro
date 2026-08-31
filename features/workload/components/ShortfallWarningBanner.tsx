"use client";

import { type WorkloadShortfall } from "@/types";
import { AlertTriangle, Sparkles } from "lucide-react";

interface ShortfallWarningBannerProps {
  shortfalls: WorkloadShortfall[];
  onOpenCapacityTuner?: () => void;
}

export function ShortfallWarningBanner({
  shortfalls,
  onOpenCapacityTuner,
}: ShortfallWarningBannerProps) {
  if (shortfalls.length === 0) return null;

  const totalShortfall = shortfalls.reduce((acc, s) => acc + s.shortfallHours, 0);

  return (
    <div className="rounded-2xl bg-error/10 border border-error/30 p-4 space-y-3 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-error/20 text-error flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-error flex items-center gap-1.5">
              <span>Workload Capacity Shortfall ({totalShortfall.toFixed(1)}h unallocated)</span>
            </h4>

            {onOpenCapacityTuner && (
              <button
                type="button"
                onClick={onOpenCapacityTuner}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Adjust Daily Capacity
              </button>
            )}
          </div>

          <p className="text-xs text-text-secondary">
            Your cumulative study capacity before these due dates is exhausted. Consider allocating earlier study sessions or tuning your daily capacity.
          </p>

          {/* List of shortfalls */}
          <div className="pt-2 space-y-1.5">
            {shortfalls.map((sf) => (
              <div
                key={sf.deadlineId}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-bg-surface/80 border border-error/20"
              >
                <span className="font-semibold text-text-primary truncate mr-2">
                  {sf.title} <span className="text-[11px] text-text-tertiary">(Due {sf.dueDate})</span>
                </span>
                <span className="text-error font-bold tabular-nums shrink-0">
                  -{sf.shortfallHours.toFixed(1)}h shortfall
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
