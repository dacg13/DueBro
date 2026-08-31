"use client";

import { useState } from "react";
import { type Deadline, type Subject } from "@/types";
import { updateDeadlineAction } from "@/server/actions/deadlines";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Clock, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface QuickLogEffortModalProps {
  deadline: Deadline | null;
  subject?: Subject | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: Deadline) => void;
}

const QUICK_INCREMENTS = [
  { label: "+30m", hours: 0.5 },
  { label: "+1h", hours: 1.0 },
  { label: "+1.5h", hours: 1.5 },
  { label: "+2h", hours: 2.0 },
];

export function QuickLogEffortModal({
  deadline,
  subject,
  isOpen,
  onClose,
  onSuccess,
}: QuickLogEffortModalProps) {
  const [loggedHours, setLoggedHours] = useState<number>(1.0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!deadline) return null;

  const totalEstimate = deadline.estimatedEffortHours ?? 2.0;
  const currentProgress = deadline.progress;

  // Compute projected progress after logging study time
  const additionalProgressPercent = totalEstimate > 0 ? Math.round((loggedHours / totalEstimate) * 100) : 25;
  const projectedProgress = Math.min(100, currentProgress + additionalProgressPercent);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await updateDeadlineAction(deadline.id, {
        progress: projectedProgress,
        status: projectedProgress >= 100 ? "completed" : "in_progress",
      });

      if (res.success && res.data) {
        onSuccess?.(res.data);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="space-y-5">
      {/* Deadline Info */}
      <div className="space-y-1.5">
        {subject && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded text-text-primary"
            style={{ backgroundColor: `${subject.color}25` }}
          >
            {subject.name}
          </span>
        )}
        <h3 className="text-base font-bold text-text-primary truncate">{deadline.title}</h3>
      </div>

      {/* Progress Preview */}
      <div className="p-4 rounded-xl bg-bg-surface border border-border-default space-y-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Projected Progress</span>
          <span className="font-bold text-text-primary tabular-nums">
            {currentProgress}% &rarr; <span className="text-accent">{projectedProgress}%</span>
          </span>
        </div>
        <ProgressBar progress={projectedProgress} />
      </div>

      {/* Quick Effort Presets */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Select Study Time Spent
        </label>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_INCREMENTS.map((inc) => (
            <button
              key={inc.label}
              type="button"
              onClick={() => setLoggedHours(inc.hours)}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                loggedHours === inc.hours
                  ? "bg-accent text-white border-accent shadow-sm scale-102"
                  : "bg-bg-surface text-text-secondary hover:text-text-primary border-border-default hover:bg-bg-elevated"
              }`}
            >
              {inc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-border-default flex items-center justify-end gap-2.5">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="gap-1.5">
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5" />
              Log {loggedHours}h &amp; Update
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Log Study Progress">
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Study Progress"
      description="Record completed effort to advance your progress bar and reduce risk score."
      maxWidth="sm"
    >
      {content}
    </Modal>
  );
}
