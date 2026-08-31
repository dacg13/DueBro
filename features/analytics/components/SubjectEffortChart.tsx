"use client";

import { type SubjectEffortSummary } from "@/types";
import { BookOpen } from "lucide-react";

interface SubjectEffortChartProps {
  summaries: SubjectEffortSummary[];
}

export function SubjectEffortChart({ summaries }: SubjectEffortChartProps) {
  if (summaries.length === 0) {
    return (
      <div className="p-5 rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 text-center text-xs text-mist-200">
        No course data available.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-void-850 text-signal-white flex items-center justify-center border border-white/10">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-signal-white">Coursework &amp; Completion Breakdown</h4>
          <p className="text-[11px] text-mist-200">
            Progress and completed assignments per course
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {summaries.map((sub) => (
          <div key={sub.subjectId} className="space-y-1.5 p-3 rounded-xl bg-void-900/40 border border-white/8">
            {/* Header: Course Name + Tasks count + Completion rate */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <span className="font-bold text-signal-white truncate">{sub.subjectName}</span>
                <span className="text-[11px] text-mist-200 tabular-nums">
                  ({sub.completedTasks} of {sub.totalTasks} completed)
                </span>
              </div>

              <div className="flex items-center gap-2 tabular-nums">
                <span className="font-bold text-signal-white">{sub.completionRatePercent}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-void-950 rounded-full overflow-hidden border border-white/6">
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
