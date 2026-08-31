"use client";

import { useState, useEffect, useMemo } from "react";
import { type Deadline, type Subject } from "@/types";
import { updateDeadlineAction } from "@/server/actions/deadlines";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  startOfWeek,
  addDays,
  format,
} from "date-fns";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface RescheduleDeadlineModalProps {
  deadline: Deadline | null;
  subject?: Subject | null;
  currentWeekDate: Date;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: Deadline) => void;
}

export function RescheduleDeadlineModal({
  deadline,
  subject,
  currentWeekDate,
  isOpen,
  onClose,
  onSuccess,
}: RescheduleDeadlineModalProps) {
  const [customDate, setCustomDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Compute 7 days of the active week (Monday start)
  const weekDays = useMemo(() => {
    const monday = startOfWeek(currentWeekDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [currentWeekDate]);

  if (!deadline) return null;

  const activeSelectedDate = customDate ?? deadline.dueDate ?? "";

  const handleSave = async () => {
    if (!activeSelectedDate) return;
    setIsSubmitting(true);

    try {
      const res = await updateDeadlineAction(deadline.id, {
        dueDate: activeSelectedDate,
      });

      if (res.success && res.data) {
        onSuccess?.(res.data);
      }
      setCustomDate(null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="space-y-5">
      {/* Deadline Info */}
      <div className="space-y-1">
        {subject && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded text-text-primary"
            style={{ backgroundColor: `${subject.color}25` }}
          >
            {subject.name}
          </span>
        )}
        <h4 className="text-sm font-bold text-text-primary truncate">{deadline.title}</h4>
        <p className="text-xs text-text-secondary">
          Currently due: <span className="font-semibold text-text-primary tabular-nums">{deadline.dueDate || "No date"}</span>
        </p>
      </div>

      {/* Quick Weekday Jump Grid (WCAG 2.2 Compliant Keyboard / Tap Action) */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Reschedule to This Week
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {weekDays.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd");
            const isSelected = activeSelectedDate === dayStr;
            const isOriginal = deadline.dueDate === dayStr;

            return (
              <button
                key={dayStr}
                type="button"
                onClick={() => setCustomDate(dayStr)}
                className={cn(
                  "p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer",
                  isSelected
                    ? "bg-accent text-white border-accent shadow-xs scale-102"
                    : "bg-bg-surface text-text-primary border-border-default hover:border-border-hover hover:bg-bg-elevated"
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={cn("font-bold uppercase", isSelected ? "text-white" : "text-text-secondary")}>
                    {format(day, "EEE")}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {isOriginal && !isSelected && (
                    <span className="text-[9px] uppercase font-bold px-1 rounded bg-bg-elevated text-text-tertiary">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold mt-1 tabular-nums">
                  {format(day, "MMM d")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Picker Fallback */}
      <div className="pt-2 border-t border-border-default space-y-1.5">
        <label htmlFor="custom-date-picker" className="block text-xs font-medium text-text-secondary">
          Or Select Custom Future Date
        </label>
        <Input
          id="custom-date-picker"
          type="date"
          value={activeSelectedDate}
          onChange={(e) => setCustomDate(e.target.value)}
          className="h-10 text-xs tabular-nums"
        />
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border-default flex items-center justify-end gap-2.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCustomDate(null);
            onClose();
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSubmitting || activeSelectedDate === deadline.dueDate}
          className="gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Rescheduling...
            </>
          ) : (
            <>
              <ArrowRight className="w-3.5 h-3.5" />
              Confirm Reschedule
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={() => {
          setCustomDate(null);
          onClose();
        }}
        title="Reschedule Deadline"
      >
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setCustomDate(null);
        onClose();
      }}
      title="Reschedule Deadline"
      description="Move this assignment or exam to a different study date with 1 tap."
      maxWidth="md"
    >
      {content}
    </Modal>
  );
}
