"use client";

import { useState, useMemo, useEffect } from "react";
import { type Subject, type Deadline, type AcademicTerm } from "@/types";
import { calculateSubjectStats } from "@/server/domain/subjects";
import { sortDeadlines, isDeadlineOverdue } from "@/server/domain/deadlines";
import { toggleDeadlineCompleteAction } from "@/server/actions/deadlines";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { DeadlineRow } from "@/components/shared/DeadlineRow";
import { Plus, CheckCircle2, BookOpen, Layers, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectDetailModalProps {
  subject: Subject | null;
  term?: AcademicTerm | null;
  deadlines: Deadline[];
  isOpen: boolean;
  onClose: () => void;
  onAddDeadline: (subjectId: string) => void;
  onOpenDeadlineDetail: (deadline: Deadline) => void;
  mappedGroupId?: string | null;
  onShareWithClassmates?: (subject: Subject) => void;
}

export function SubjectDetailModal({
  subject,
  term,
  deadlines,
  isOpen,
  onClose,
  onAddDeadline,
  onOpenDeadlineDetail,
  mappedGroupId,
  onShareWithClassmates,
}: SubjectDetailModalProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const subjectDeadlines = useMemo(() => {
    if (!subject) return [];
    return deadlines.filter((d) => d.subjectId === subject.id && !d.deletedAt);
  }, [subject, deadlines]);

  const stats = useMemo(() => {
    if (!subject) return null;
    return calculateSubjectStats(subject.id, deadlines);
  }, [subject, deadlines]);

  const filteredDeadlines = useMemo(() => {
    let list = subjectDeadlines;
    if (statusFilter !== "all") {
      if (statusFilter === "overdue") {
        list = list.filter((d) => isDeadlineOverdue(d.dueDate, d.dueTime, d.status));
      } else {
        list = list.filter((d) => d.status === statusFilter);
      }
    }
    return sortDeadlines(list, "dueDate");
  }, [subjectDeadlines, statusFilter]);

  if (!subject || !stats) return null;

  const content = (
    <div className="space-y-6">
      {/* Subject Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-5 h-5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: subject.color }}
          />
          <div>
            <h2 className="text-xl font-bold text-text-primary leading-tight truncate">
              {subject.name}
            </h2>
            {term && (
              <p className="text-xs text-text-secondary mt-0.5">
                {term.name} &bull; {subject.archived ? "Archived Course" : "Active Semester Course"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              onClose();
              onShareWithClassmates?.(subject);
            }}
            className="gap-1.5 shrink-0"
          >
            <Users className="w-4 h-4" />
            {mappedGroupId ? "View Class Group" : "Share with Classmates"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onClose();
              onAddDeadline(subject.id);
            }}
            className="gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Deadline
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2.5 p-3 rounded-xl bg-bg-surface border border-border-default text-center text-xs">
        <div>
          <div className="text-text-tertiary text-[11px]">Total Items</div>
          <div className="font-bold text-text-primary tabular-nums mt-0.5 text-base">{stats.totalCount}</div>
        </div>
        <div className="border-l border-border-default">
          <div className="text-text-tertiary text-[11px]">To Do / In Progress</div>
          <div className="font-bold text-accent tabular-nums mt-0.5 text-base">{stats.openCount}</div>
        </div>
        <div className="border-l border-border-default">
          <div className="text-text-tertiary text-[11px]">Completed</div>
          <div className="font-bold text-success tabular-nums mt-0.5 text-base flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-success" />
            {stats.completedCount}
          </div>
        </div>
        <div className="border-l border-border-default">
          <div className="text-text-tertiary text-[11px]">Overdue</div>
          <div
            className={cn(
              "font-bold tabular-nums mt-0.5 text-base",
              stats.overdueCount > 0 ? "text-risk-overdue" : "text-text-tertiary"
            )}
          >
            {stats.overdueCount}
          </div>
        </div>
      </div>

      {/* Deadlines Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Layers className="w-4 h-4 text-accent" />
            <span>Course Deadlines ({filteredDeadlines.length})</span>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5">
            {["all", "not_started", "in_progress", "completed", "overdue"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize cursor-pointer",
                  statusFilter === status
                    ? "bg-accent-subtle text-accent font-semibold border border-accent/30"
                    : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
                )}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Deadlines List */}
        {filteredDeadlines.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-tertiary rounded-xl bg-bg-surface border border-border-default">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-text-tertiary opacity-60" />
            No deadlines found for this filter.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredDeadlines.map((deadline) => (
              <DeadlineRow
                key={deadline.id}
                deadline={deadline}
                subject={subject}
                onToggleComplete={(id) => toggleDeadlineCompleteAction(id)}
                onClick={onOpenDeadlineDetail}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Course Overview">
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Course Overview" maxWidth="lg">
      {content}
    </Modal>
  );
}
