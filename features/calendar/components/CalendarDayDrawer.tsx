"use client";

import { useState, useEffect } from "react";
import { type Deadline, type Subject, type RiskAssessment } from "@/types";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { DeadlineRow } from "@/components/shared/DeadlineRow";
import { format, parseISO } from "date-fns";
import { Plus, Calendar as CalendarIcon, Sparkles } from "lucide-react";

interface CalendarDayDrawerProps {
  date: string | null; // YYYY-MM-DD
  isOpen: boolean;
  onClose: () => void;
  deadlines: Deadline[];
  subjectMap: Map<string, Subject>;
  riskMap: Map<string, RiskAssessment>;
  onToggleComplete: (id: string) => void;
  onOpenDeadlineDetail: (deadline: Deadline) => void;
  onAddDeadlineForDate: (date: string) => void;
}

export function CalendarDayDrawer({
  date,
  isOpen,
  onClose,
  deadlines,
  subjectMap,
  riskMap,
  onToggleComplete,
  onOpenDeadlineDetail,
  onAddDeadlineForDate,
}: CalendarDayDrawerProps) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!date) return null;

  const formattedDate = format(parseISO(date), "EEEE, MMMM d, yyyy");

  const totalEffort = deadlines.reduce((acc, d) => {
    const effort = d.estimatedEffortHours ?? 2.0;
    return acc + effort * (1 - d.progress / 100);
  }, 0);

  const content = (
    <div className="space-y-4">
      {/* Date Workload Summary */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-bg-surface border border-border-default">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-text-primary">
              {deadlines.length} Deadline{deadlines.length === 1 ? "" : "s"} Scheduled
            </div>
            <div className="text-[11px] text-text-secondary flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>{totalEffort.toFixed(1)}h remaining effort</span>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => {
            onClose();
            onAddDeadlineForDate(date);
          }}
          className="gap-1 text-xs h-8"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </Button>
      </div>

      {/* Deadlines list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {deadlines.length === 0 ? (
          <div className="py-10 text-center text-text-tertiary text-xs">
            No deadlines scheduled for this day.
          </div>
        ) : (
          deadlines.map((deadline) => (
            <DeadlineRow
              key={deadline.id}
              deadline={deadline}
              subject={deadline.subjectId ? subjectMap.get(deadline.subjectId) : null}
              assessment={riskMap.get(deadline.id)}
              onToggleComplete={onToggleComplete}
              onClick={onOpenDeadlineDetail}
            />
          ))
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={formattedDate}>
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formattedDate}
      description="Schedule and workload breakdown for this date."
      maxWidth="md"
    >
      {content}
    </Modal>
  );
}
