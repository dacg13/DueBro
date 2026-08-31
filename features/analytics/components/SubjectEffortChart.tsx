"use client";

import { type SubjectEffortSummary } from "@/types";
import { BookOpen } from "lucide-react";

interface SubjectEffortChartProps {
  summaries: SubjectEffortSummary[];
}

export function SubjectEffortChart({ summaries }: SubjectEffortChartProps) {
  if (summaries.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-bg-surface border border-border-default text-center text-xs text-text-tertiary">
        No course data available.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-bg-surface border border-border-default space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-text-primary">Course Effort &amp; Completion Breakdown</h4>
          <p className="text-[11px] text-text-tertiary">
            Progress and study hours invested per active course
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {summaries.map((sub) => (
          <div key={sub.subjectId} className="space-y-1.5 p-3 rounded-xl bg-bg-elevated/40 border border-border-default">
            {/* Header: Course Name + Tasks count + Completion rate */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <span className="font-bold text-text-primary truncate">{sub.subjectName}</span>
                <span className="text-[11px] text-text-tertiary tabular-nums">
                  ({sub.completedTasks}/{sub.totalTasks} completed)
                </span>
              </div>

              <div className="flex items-center gap-2 tabular-nums">
                <span className="text-text-secondary text-[11px]">
                  {sub.remainingHours}h left of {sub.totalEstimatedHours}h
                </span>
                <span className="font-bold text-accent">{sub.completionRatePercent}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-bg-surface rounded-full overflow-hidden border border-border-default/40">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${sub.completionRatePercent}%`,
                  backgroundColor: sub.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
