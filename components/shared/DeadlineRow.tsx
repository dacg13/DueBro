"use client";

import { type Deadline, type Priority, type DeadlineType, type Subject, type RiskAssessment } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { getDaysRemaining } from "@/server/domain/deadlines";
import { format, parseISO } from "date-fns";
import {
  FileText,
  FolderKanban,
  GraduationCap,
  HelpCircle,
  Presentation,
  FlaskConical,
  BookOpen,
  Upload,
  BookMarked,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<DeadlineType, LucideIcon> = {
  assignment: FileText,
  project: FolderKanban,
  exam: GraduationCap,
  quiz: HelpCircle,
  presentation: Presentation,
  lab: FlaskConical,
  reading: BookOpen,
  submission: Upload,
  study_session: BookMarked,
  other: Clock,
};

const PRIORITY_BADGES: Record<Priority, { label: string; dot: string; text: string }> = {
  low: { label: "Low", dot: "bg-priority-low", text: "text-text-tertiary" },
  medium: { label: "Medium", dot: "bg-priority-medium", text: "text-accent" },
  high: { label: "High", dot: "bg-priority-high", text: "text-warning" },
  critical: { label: "Critical", dot: "bg-priority-critical", text: "text-error" },
};

interface DeadlineRowProps {
  deadline: Deadline;
  subject?: Subject | null;
  assessment?: RiskAssessment | null;
  onToggleComplete?: (id: string) => void;
  onClick?: (deadline: Deadline) => void;
  className?: string;
}

export function DeadlineRow({
  deadline,
  subject,
  assessment,
  onToggleComplete,
  onClick,
  className,
}: DeadlineRowProps) {
  const TypeIcon = TYPE_ICONS[deadline.type] || Clock;
  const isCompleted = deadline.status === "completed";
  const priorityConfig = PRIORITY_BADGES[deadline.priority];

  let formattedDate = "No date";
  let countdownText = "";
  if (deadline.dueDate) {
    const days = getDaysRemaining(deadline.dueDate);
    formattedDate = format(parseISO(deadline.dueDate), "MMM d");
    if (days === 0) countdownText = "(Today)";
    else if (days === 1) countdownText = "(Tomorrow)";
    else if (days > 1) countdownText = `(${days}d)`;
    else countdownText = `(${Math.abs(days)}d ago)`;
  }

  const subjectColor = subject?.color || "#5B6EF5";

  return (
    <div
      onClick={() => onClick?.(deadline)}
      className={cn(
        "group flex items-center gap-3.5 px-4 py-3 rounded-xl bg-bg-surface hover:bg-bg-elevated border border-border-default hover:border-border-hover transition-colors cursor-pointer",
        isCompleted && "opacity-60 bg-bg-surface/40",
        className
      )}
    >
      {/* Leading Checkbox */}
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggleComplete?.(deadline.id)}
          aria-label={`Mark ${deadline.title} as ${isCompleted ? "incomplete" : "complete"}`}
        />
      </div>

      {/* Subject Indicator Chip */}
      <div className="shrink-0 flex items-center gap-1.5 w-24 truncate">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: subjectColor }}
        />
        <span className="text-xs font-medium text-text-secondary truncate">
          {subject?.name || "No subject"}
        </span>
      </div>

      {/* Type Icon */}
      <div className="shrink-0 text-text-tertiary">
        <TypeIcon className="w-4 h-4" />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-medium text-text-primary truncate block",
            isCompleted && "line-through text-text-tertiary"
          )}
        >
          {deadline.title}
        </span>
      </div>

      {/* Progress (if applicable) */}
      {deadline.progress > 0 && !isCompleted && (
        <div className="w-24 hidden md:block shrink-0">
          <ProgressBar progress={deadline.progress} variant="thin" showLabel />
        </div>
      )}

      {/* Risk Badge (Desktop) */}
      {assessment && (
        <div className="shrink-0 hidden lg:block">
          <RiskBadge assessment={assessment} size="sm" showScore />
        </div>
      )}

      {/* Priority */}
      <div className="shrink-0 hidden sm:flex items-center gap-1.5 w-16">
        <span className={cn("w-1.5 h-1.5 rounded-full", priorityConfig.dot)} />
        <span className={cn("text-xs font-medium", priorityConfig.text)}>
          {priorityConfig.label}
        </span>
      </div>

      {/* Due Date with tabular numerals */}
      <div className="shrink-0 text-right tabular-nums text-xs text-text-secondary w-28">
        <div
          className={cn(
            "font-medium",
            deadline.status === "overdue" && "text-risk-overdue font-semibold"
          )}
        >
          {formattedDate} {countdownText}
        </div>
        {deadline.dueTime && (
          <div className="text-[11px] text-text-tertiary">{deadline.dueTime}</div>
        )}
      </div>
    </div>
  );
}
