"use client";

import { type Deadline, type Priority, type DeadlineType, type Subject, type RiskAssessment } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { getDaysRemaining } from "@/server/domain/deadlines";
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
  low: { label: "Low", dot: "bg-graphite-400", text: "text-graphite-300" },
  medium: { label: "Medium", dot: "bg-mist-200", text: "text-mist-100" },
  high: { label: "High", dot: "bg-signal-white shadow-[0_0_8px_rgba(250,250,252,0.6)]", text: "text-signal-white font-semibold" },
  critical: { label: "Critical", dot: "bg-signal-danger shadow-[0_0_8px_rgba(229,72,77,0.6)]", text: "text-signal-danger font-semibold" },
};

interface DeadlineCardProps {
  deadline: Deadline;
  subject?: Subject | null;
  assessment?: RiskAssessment | null;
  onToggleComplete?: (id: string) => void;
  onClick?: (deadline: Deadline) => void;
  className?: string;
}

export function DeadlineCard({
  deadline,
  subject,
  assessment,
  onToggleComplete,
  onClick,
  className,
}: DeadlineCardProps) {
  const TypeIcon = TYPE_ICONS[deadline.type] || Clock;
  const isCompleted = deadline.status === "completed";
  const priorityConfig = PRIORITY_BADGES[deadline.priority];

  // Due date countdown string
  let countdownText = "No date";
  if (deadline.dueDate) {
    const days = getDaysRemaining(deadline.dueDate);
    if (deadline.type === "exam") {
      countdownText = days === 0 ? "Today" : days > 0 ? `${days}d countdown` : `${Math.abs(days)}d ago`;
    } else {
      if (days === 0) countdownText = "Due Today";
      else if (days === 1) countdownText = "Due Tomorrow";
      else if (days > 1) countdownText = `Due in ${days}d`;
      else countdownText = `${Math.abs(days)}d overdue`;
    }
  }

  const subjectColor = subject?.color || "#FAFAFC";

  return (
    <div
      onClick={() => onClick?.(deadline)}
      className={cn(
        "group relative rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 hover:border-white/16 hover:shadow-[0_0_28px_rgba(250,250,252,0.08)] p-4 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col gap-2.5 select-none",
        isCompleted && "opacity-40 bg-void-900/40",
        className
      )}
    >
      {/* Subject left border indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: subjectColor }}
      />

      <div className="flex items-start gap-3">
        {/* Leading Quick-Complete Checkbox */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 pt-0.5"
        >
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete?.(deadline.id)}
            aria-label={`Mark ${deadline.title} as ${isCompleted ? "incomplete" : "complete"}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Subject name badge */}
            {subject && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md text-signal-white border border-white/10"
                style={{ backgroundColor: `${subjectColor}25` }}
              >
                {subject.name}
              </span>
            )}

            {/* Type badge */}
            <span className="inline-flex items-center gap-1 text-[11px] text-mist-200 capitalize">
              <TypeIcon className="w-3 h-3 text-graphite-300" />
              {deadline.type.replace("_", " ")}
            </span>

            {/* Risk Badge */}
            {assessment && (
              <div className="ml-auto">
                <RiskBadge assessment={assessment} size="sm" showScore={false} />
              </div>
            )}
          </div>

          <h4
            className={cn(
              "text-sm font-semibold text-signal-white truncate transition-colors",
              isCompleted && "line-through text-graphite-400"
            )}
          >
            {deadline.title}
          </h4>
        </div>
      </div>



      {/* Card Footer: Due Countdown and Priority */}
      <div className="pl-8 flex items-center justify-between text-xs text-mist-100/70 pt-1 border-t border-white/6">
        <div className="flex items-center gap-1.5 tabular-nums">
          <Clock className="w-3.5 h-3.5 text-graphite-300" />
          <span
            className={cn(
              "font-medium",
              deadline.status === "overdue" && "text-signal-danger font-semibold drop-shadow-[0_0_8px_rgba(229,72,77,0.4)]"
            )}
          >
            {countdownText}
          </span>
          {deadline.dueTime && (
            <span className="text-graphite-300">at {deadline.dueTime}</span>
          )}
        </div>

        {/* Priority Indicator */}
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", priorityConfig.dot)} />
          <span className={cn("text-[11px] font-medium", priorityConfig.text)}>
            {priorityConfig.label}
          </span>
        </div>
      </div>
    </div>
  );
}
