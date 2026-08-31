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
  low: { label: "Low", dot: "bg-graphite-400", text: "text-graphite-300" },
  medium: { label: "Medium", dot: "bg-mist-200", text: "text-mist-100" },
  high: { label: "High", dot: "bg-signal-white shadow-[0_0_8px_rgba(250,250,252,0.6)]", text: "text-signal-white font-semibold" },
  critical: { label: "Critical", dot: "bg-signal-danger shadow-[0_0_8px_rgba(229,72,77,0.6)]", text: "text-signal-danger font-semibold" },
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

  const subjectColor = subject?.color || "#FAFAFC";

  return (
    <div
      onClick={() => onClick?.(deadline)}
      className={cn(
        "group flex items-center gap-3.5 px-4 py-3 rounded-xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 hover:border-white/16 hover:shadow-[0_0_24px_rgba(250,250,252,0.06)] transition-all duration-200 cursor-pointer select-none",
        isCompleted && "opacity-40 bg-void-900/40",
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
          className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_6px_rgba(255,255,255,0.2)]"
          style={{ backgroundColor: subjectColor }}
        />
        <span className="text-xs font-medium text-mist-100 truncate">
          {subject?.name || "No subject"}
        </span>
      </div>

      {/* Type Icon */}
      <div className="shrink-0 text-graphite-300 group-hover:text-mist-100 transition-colors">
        <TypeIcon className="w-4 h-4" />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-medium text-signal-white truncate block",
            isCompleted && "line-through text-graphite-400"
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
          <RiskBadge assessment={assessment} size="sm" showScore={false} />
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
      <div className="shrink-0 text-right tabular-nums text-xs text-mist-100/70 w-28">
        <div
          className={cn(
            "font-medium",
            deadline.status === "overdue" && "text-signal-danger font-semibold drop-shadow-[0_0_8px_rgba(229,72,77,0.4)]"
          )}
        >
          {formattedDate} {countdownText}
        </div>
        {deadline.dueTime && (
          <div className="text-[11px] text-graphite-300">{deadline.dueTime}</div>
        )}
      </div>
    </div>
  );
}
