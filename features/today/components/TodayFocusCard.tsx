"use client";

import { type Deadline, type Subject, type RiskAssessment } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { Button } from "@/components/ui/button";
import { getDaysRemaining } from "@/server/domain/deadlines";
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
  const subjectColor = subject?.color || "#5B6EF5";

  let countdownText = "Today";
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
        "group relative rounded-2xl bg-bg-surface border border-border-default hover:border-border-hover p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col gap-3.5",
        isCompleted && "opacity-60 bg-bg-surface/50",
        assessment?.tier === "critical" && "border-risk-critical/40 bg-risk-critical/5",
        assessment?.tier === "high" && "border-risk-high/30"
      )}
    >
      {/* Subject left border indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
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

          {/* Title & Subject */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {subject && (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded text-text-primary"
                  style={{ backgroundColor: `${subjectColor}25` }}
                >
                  {subject.name}
                </span>
              )}
              <span className="text-[11px] text-text-secondary capitalize">
                {deadline.type.replace("_", " ")}
              </span>
            </div>
            <h4
              className={cn(
                "text-base font-semibold text-text-primary leading-snug truncate",
                isCompleted && "line-through text-text-tertiary"
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
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="flex items-center gap-1 tabular-nums">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{remainingHours}h remaining</span>
            <span className="text-text-tertiary">({effortHours}h total)</span>
          </span>
          <span className="tabular-nums font-semibold text-text-primary">{deadline.progress}%</span>
        </div>
        <ProgressBar progress={deadline.progress} variant="default" />
      </div>

      {/* Footer: Due Date and Quick Log Button */}
      <div className="pl-8 pt-1 border-t border-border-default/60 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary tabular-nums">
          <Clock className="w-3.5 h-3.5 text-text-tertiary" />
          <span
            className={cn(
              "font-medium",
              deadline.status === "overdue" && "text-risk-overdue font-bold"
            )}
          >
            {countdownText}
          </span>
          {deadline.dueTime && (
            <span className="text-text-tertiary">at {deadline.dueTime}</span>
          )}
        </div>

        {/* Quick Log Action */}
        {!isCompleted && onLogEffort && (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onLogEffort(deadline);
            }}
            className="h-7 text-xs px-2.5 gap-1.5 border-border-default hover:bg-bg-elevated text-text-secondary hover:text-text-primary"
          >
            <Timer className="w-3.5 h-3.5 text-accent" />
            <span>Log Study Time</span>
          </Button>
        )}
      </div>
    </div>
  );
}
