"use client";

import { type Deadline, type Subject } from "@/types";
import { updateDeadlineAction, deleteDeadlineAction } from "@/server/actions/deadlines";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, nextDay } from "date-fns";
import {
  Calendar,
  BookOpen,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InboxTriageCardProps {
  deadline: Deadline;
  subjects: Subject[];
  onUpdate: (updated: Deadline) => void;
  onDelete: (id: string) => void;
  onOpenDetail: (deadline: Deadline) => void;
}

export function InboxTriageCard({
  deadline,
  subjects,
  onUpdate,
  onDelete,
  onOpenDetail,
}: InboxTriageCardProps) {
  const isCompleted = deadline.status === "completed";
  const assignedSubject = subjects.find((s) => s.id === deadline.subjectId);

  // 1-tap subject assignment
  const handleAssignSubject = async (subjectId: string) => {
    const res = await updateDeadlineAction(deadline.id, { subjectId });
    if (res.success && res.data) {
      onUpdate(res.data);
    }
  };

  // 1-tap date assignment
  const handleAssignDate = async (dateStr: string) => {
    const res = await updateDeadlineAction(deadline.id, { dueDate: dateStr });
    if (res.success && res.data) {
      onUpdate(res.data);
    }
  };

  const handleDelete = async () => {
    await deleteDeadlineAction(deadline.id);
    onDelete(deadline.id);
  };

  const handleToggleComplete = async () => {
    const isNowDone = !isCompleted;
    const res = await updateDeadlineAction(deadline.id, {
      status: isNowDone ? "completed" : "not_started",
      progress: isNowDone ? 100 : 0,
    });
    if (res.success && res.data) {
      onUpdate(res.data);
    }
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const fridayStr = format(nextDay(new Date(), 5), "yyyy-MM-dd");

  return (
    <div
      className={cn(
        "rounded-2xl bg-bg-surface border border-border-default hover:border-border-hover p-4 transition-all duration-200 space-y-3",
        isCompleted && "opacity-60 bg-bg-surface/50"
      )}
    >
      {/* Top row: Checkbox, Title, and Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="pt-0.5 shrink-0">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggleComplete}
              aria-label={`Mark ${deadline.title}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {assignedSubject ? (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded text-text-primary"
                  style={{ backgroundColor: `${assignedSubject.color}25` }}
                >
                  {assignedSubject.name}
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-warning/15 text-warning border border-warning/30">
                  Needs Course
                </span>
              )}

              <span className="text-[11px] text-text-secondary capitalize">
                {deadline.type.replace("_", " ")}
              </span>

              {deadline.dueDate && (
                <span className="text-[11px] text-text-tertiary tabular-nums flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {deadline.dueDate}
                </span>
              )}
            </div>

            <h4
              className={cn(
                "text-sm font-semibold text-text-primary leading-snug",
                isCompleted && "line-through text-text-tertiary"
              )}
            >
              {deadline.title}
            </h4>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenDetail(deadline)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
            title="Edit full deadline details"
            aria-label="Edit full deadline details"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
            title="Delete quick capture"
            aria-label="Delete quick capture"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1-Tap Course Assignment Row (if unassigned) */}
      {!assignedSubject && subjects.length > 0 && !isCompleted && (
        <div className="pt-2 border-t border-border-default/60 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-text-tertiary mr-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Assign:
          </span>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleAssignSubject(sub.id)}
              className="px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all hover:scale-102 border cursor-pointer"
              style={{
                backgroundColor: `${sub.color}15`,
                borderColor: `${sub.color}35`,
                color: sub.color,
              }}
            >
              + {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* 1-Tap Date Suggestion Row (if no date or due today) */}
      {!isCompleted && (
        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-text-tertiary mr-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Set Due:
          </span>
          <button
            type="button"
            onClick={() => handleAssignDate(todayStr)}
            className={cn(
              "px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer",
              deadline.dueDate === todayStr
                ? "bg-accent text-white border-accent font-bold"
                : "bg-bg-elevated text-text-secondary hover:text-text-primary border-border-default"
            )}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleAssignDate(tomorrowStr)}
            className={cn(
              "px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer",
              deadline.dueDate === tomorrowStr
                ? "bg-accent text-white border-accent font-bold"
                : "bg-bg-elevated text-text-secondary hover:text-text-primary border-border-default"
            )}
          >
            Tomorrow
          </button>
          <button
            type="button"
            onClick={() => handleAssignDate(fridayStr)}
            className={cn(
              "px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer",
              deadline.dueDate === fridayStr
                ? "bg-accent text-white border-accent font-bold"
                : "bg-bg-elevated text-text-secondary hover:text-text-primary border-border-default"
            )}
          >
            Friday
          </button>
        </div>
      )}
    </div>
  );
}
