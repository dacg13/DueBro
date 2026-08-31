"use client";

import { type Deadline, type Subject, type RiskAssessment } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { getDaysRemaining } from "@/server/domain/deadlines";
import { Button } from "@/components/ui/button";
import { Clock, Timer, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodayFocusCardProps {
  deadline: Deadline;
  subject?: Subject | null;
  assessment?: RiskAssessment | null;
  onToggleComplete?: (id: string) => void;
  onLogEffort?: (deadline: Deadline) => void;
  onClick?: (deadline: Deadline) => void;
}

export function TodayFocusCard({
  deadline,
  subject,
  assessment,
  onToggleComplete,
  onLogEffort,
  onClick,
}: TodayFocusCardProps) {
  const isCompleted = deadline.status === "completed";
  const subjectColor = subject?.color || "#FAFAFC";

  let countdownText = "No date";
  if (deadline.dueDate) {
    const days = getDaysRemaining(deadline.dueDate);
    if (days < 0) countdownText = `${Math.abs(days)}d overdue`;
    else if (days === 0) countdownText = "Due Today";
    else if (days === 1) countdownText = "Due Tomorrow";
    else countdownText = `Due in ${days}d`;
  }

  const effortHours = deadline.estimatedEffortHours ?? 2.0;
  const remainingHours = Number((effortHours * (1 - deadline.progress / 100)).toFixed(1));

  return (
    <div
      onClick={() => onClick?.(deadline)}
      className={cn(
        "group relative rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 hover:border-white/16 hover:shadow-[0_0_32px_rgba(250,250,252,0.08)] p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col gap-3.5 select-none",
        isCompleted && "opacity-40 bg-void-900/40",
        assessment?.tier === "critical" && "border-signal-danger/40 bg-signal-danger/5",
        assessment?.tier === "high" && "border-white/20"
      )}
    >
      {/* Subject left border indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
        style={{ backgroundColor: subjectColor }}
      />

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Checkbox */}
          <div onClick={(e) => e.stopPropagation()} className="pt-0.5 shrink-0">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onToggleComplete?.(deadline.id)}
              aria-label={`Mark ${deadline.title}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {subject && (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-signal-white border border-white/10"
                  style={{ backgroundColor: `${subjectColor}25` }}
                >
                  {subject.name}
                </span>
              )}
              <span className="text-[11px] text-mist-200 capitalize">
                {deadline.type.replace("_", " ")}
              </span>
            </div>
            <h4
              className={cn(
                "text-base font-semibold text-signal-white leading-snug truncate",
                isCompleted && "line-through text-graphite-400"
              )}
            >
              {deadline.title}
            </h4>
          </div>
        </div>

        {/* Risk Badge */}
        {assessment && (
          <div className="shrink-0">
            <RiskBadge assessment={assessment} size="sm" showScore />
          </div>
        )}
      </div>

      {/* Progress & Effort Readout */}
      <div className="pl-8 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-mist-200">
          <span className="flex items-center gap-1 tabular-nums">
            <Sparkles className="w-3.5 h-3.5 text-signal-white" />
            <span>{remainingHours}h remaining</span>
            <span className="text-graphite-300">({effortHours}h total)</span>
          </span>
          <span className="tabular-nums font-semibold text-signal-white">{deadline.progress}%</span>
        </div>
        <ProgressBar progress={deadline.progress} variant="default" />
      </div>

      {/* Footer: Due Date and Quick Log Button */}
      <div className="pl-8 pt-1 border-t border-white/6 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-mist-100/70 tabular-nums">
          <Clock className="w-3.5 h-3.5 text-graphite-300" />
          <span
            className={cn(
              "font-medium",
              deadline.status === "overdue" && "text-signal-danger font-bold drop-shadow-[0_0_8px_rgba(229,72,77,0.5)]"
            )}
          >
            {countdownText}
          </span>
          {deadline.dueTime && (
            <span className="text-graphite-300">at {deadline.dueTime}</span>
          )}
        </div>

        {/* Quick Log Action */}
        {!isCompleted && onLogEffort && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onLogEffort(deadline);
            }}
            className="h-7 text-xs px-2.5 gap-1.5 border-white/10 hover:bg-void-800 text-mist-100 hover:text-signal-white cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5 text-signal-white" />
            <span>Log Study Time</span>
          </Button>
        )}
      </div>
    </div>
  );
}
