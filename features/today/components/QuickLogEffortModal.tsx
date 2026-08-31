"use client";

import { useState } from "react";
import { type Deadline, type Subject } from "@/types";
import { updateDeadlineAction } from "@/server/actions/deadlines";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Clock, Loader2 } from "lucide-react";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Study Progress"
      description="Record completed effort to advance your progress bar and reduce risk score."
      maxWidth="sm"
    >
      <div className="space-y-5">
        {/* Deadline Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {subject && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-md text-signal-white border border-white/10"
                style={{ backgroundColor: `${subject.color}25` }}
              >
                {subject.name}
              </span>
            )}
            <span className="text-xs text-mist-200 capitalize">
              {deadline.type.replace("_", " ")}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-signal-white">{deadline.title}</h4>
        </div>

        {/* Quick Increment Chips */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-mist-200">
            Study Effort to Log:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_INCREMENTS.map((inc) => (
              <button
                key={inc.hours}
                type="button"
                onClick={() => setLoggedHours(inc.hours)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  loggedHours === inc.hours
                    ? "bg-signal-white text-void-950 border-signal-white shadow-[0_0_16px_rgba(250,250,252,0.35)]"
                    : "bg-void-900/60 border-white/8 text-mist-100 hover:border-white/16 hover:text-signal-white"
                }`}
              >
                {inc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projected Progress Preview */}
        <div className="space-y-2 p-3.5 rounded-xl bg-void-900/60 border border-white/8">
          <div className="flex items-center justify-between text-xs text-mist-200">
            <span>Projected Progress:</span>
            <span className="font-bold text-signal-white tabular-nums">
              {currentProgress}% &rarr; {projectedProgress}%
            </span>
          </div>
          <ProgressBar progress={projectedProgress} variant="default" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Log {loggedHours}h &amp; Update
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
