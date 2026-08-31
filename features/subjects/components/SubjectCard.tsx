"use client";

import { type Subject, type Deadline, type AcademicTerm } from "@/types";
import { calculateSubjectStats } from "@/server/domain/subjects";
import { getDaysRemaining } from "@/server/domain/deadlines";
import {
  archiveSubjectAction,
  unarchiveSubjectAction,
  deleteSubjectAction,
} from "@/server/actions/subjects";
import {
  Archive,
  ArchiveRestore,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: Subject;
  term?: AcademicTerm | null;
  deadlines: Deadline[];
  onClick?: (subject: Subject) => void;
  onEdit?: (subject: Subject) => void;
  onDeleteSuccess?: (id: string) => void;
}

export function SubjectCard({
  subject,
  term,
  deadlines,
  onClick,
  onEdit,
  onDeleteSuccess,
}: SubjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const stats = calculateSubjectStats(subject.id, deadlines);

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    if (subject.archived) {
      await unarchiveSubjectAction(subject.id);
    } else {
      await archiveSubjectAction(subject.id);
    }
    setIsProcessing(false);
    setShowMenu(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${subject.name}? This will also delete related deadlines.`)) {
      setIsProcessing(true);
      await deleteSubjectAction(subject.id);
      setIsProcessing(false);
      onDeleteSuccess?.(subject.id);
    }
    setShowMenu(false);
  };

  let nextDeadlineText = "No upcoming deadlines";
  if (stats.nextUpcomingDeadline && stats.nextUpcomingDeadline.dueDate) {
    const days = getDaysRemaining(stats.nextUpcomingDeadline.dueDate);
    nextDeadlineText = `${stats.nextUpcomingDeadline.title} (${days === 0 ? "Today" : days > 0 ? `${days}d` : "Overdue"})`;
  }

  return (
    <div
      onClick={() => onClick?.(subject)}
      className={cn(
        "group relative rounded-2xl bg-bg-surface border border-border-default hover:border-border-hover p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between gap-4",
        subject.archived && "opacity-60 bg-bg-surface/50"
      )}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: subject.color }}
      />

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: subject.color }}
            />
            <h3 className="text-base font-bold text-text-primary truncate">{subject.name}</h3>
          </div>

          {/* Action Menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
              aria-label="Subject options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-7 z-20 w-36 rounded-xl bg-bg-elevated border border-border-default shadow-xl py-1 text-xs animate-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit?.(subject);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-text-primary hover:bg-bg-surface text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-text-tertiary" />
                  Edit Subject
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleToggleArchive}
                  className="w-full flex items-center gap-2 px-3 py-2 text-text-primary hover:bg-bg-surface text-left"
                >
                  {subject.archived ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5 text-text-tertiary" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 text-text-tertiary" />
                      Archive
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-error hover:bg-error/10 text-left border-t border-border-default/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Term Badge */}
        {term && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-secondary">
            <Calendar className="w-3 h-3 text-text-tertiary" />
            <span>{term.name}</span>
            {subject.archived && (
              <span className="ml-1 text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-bg-elevated text-text-tertiary border border-border-default">
                Archived
              </span>
            )}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-bg-elevated border border-border-default text-center text-xs">
        <div>
          <div className="text-text-tertiary text-[11px]">Open</div>
          <div className="font-bold text-text-primary tabular-nums mt-0.5">{stats.openCount}</div>
        </div>
        <div className="border-x border-border-default">
          <div className="text-text-tertiary text-[11px]">Completed</div>
          <div className="font-bold text-success tabular-nums mt-0.5 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-success inline" />
            {stats.completedCount}
          </div>
        </div>
        <div>
          <div className="text-text-tertiary text-[11px]">Overdue</div>
          <div
            className={cn(
              "font-bold tabular-nums mt-0.5",
              stats.overdueCount > 0 ? "text-risk-overdue" : "text-text-tertiary"
            )}
          >
            {stats.overdueCount > 0 && <AlertCircle className="w-3 h-3 text-risk-overdue inline mr-0.5" />}
            {stats.overdueCount}
          </div>
        </div>
      </div>

      {/* Next Upcoming Deadline */}
      <div className="text-xs text-text-secondary flex items-center gap-2 truncate pt-1 border-t border-border-default/50">
        <Clock className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
        <span className="truncate font-medium">{nextDeadlineText}</span>
      </div>
    </div>
  );
}
