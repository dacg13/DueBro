"use client";

import { useState, useEffect } from "react";
import { type Deadline, type Subject, type Subtask } from "@/types";
import {
  toggleDeadlineCompleteAction,
  deleteDeadlineAction,
  getSubtasksAction,
  createSubtaskAction,
  toggleSubtaskAction,
  deleteSubtaskAction,
} from "@/server/actions/deadlines";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getDaysRemaining } from "@/server/domain/deadlines";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  MapPin,
  Trash2,
  Edit2,
  CheckCircle2,
  Plus,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeadlineDetailModalProps {
  deadline: Deadline | null;
  isOpen: boolean;
  onClose: () => void;
  subject?: Subject | null;
  onEdit: (deadline: Deadline) => void;
  onDeleteSuccess?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
}

export function DeadlineDetailModal({
  deadline,
  isOpen,
  onClose,
  subject,
  onEdit,
  onDeleteSuccess,
  onToggleComplete,
}: DeadlineDetailModalProps) {
  const [subtasksList, setSubtasksList] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch subtasks when modal opens
  useEffect(() => {
    let isCancelled = false;
    if (isOpen && deadline) {
      getSubtasksAction(deadline.id).then((res) => {
        if (!isCancelled && res.success && res.data) {
          setSubtasksList(res.data);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [isOpen, deadline]);

  if (!deadline) return null;

  const isCompleted = deadline.status === "completed";
  const days = deadline.dueDate ? getDaysRemaining(deadline.dueDate) : null;
  const formattedDate = deadline.dueDate
    ? format(parseISO(deadline.dueDate), "EEEE, MMMM d, yyyy")
    : "No due date set";

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const title = newSubtaskTitle;
    setNewSubtaskTitle("");

    const res = await createSubtaskAction(deadline.id, title);
    if (res.success && res.data) {
      setSubtasksList((prev) => [...prev, res.data!]);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    setSubtasksList((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s))
    );
    await toggleSubtaskAction(subtaskId);
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    setSubtasksList((prev) => prev.filter((s) => s.id !== subtaskId));
    await deleteSubtaskAction(subtaskId);
  };

  const handleToggleComplete = async () => {
    setIsTogglingComplete(true);
    onToggleComplete?.(deadline.id);
    await toggleDeadlineCompleteAction(deadline.id);
    setIsTogglingComplete(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${deadline.title}"?`)) {
      setIsDeleting(true);
      await deleteDeadlineAction(deadline.id);
      setIsDeleting(false);
      onDeleteSuccess?.(deadline.id);
      onClose();
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {subject && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-md text-text-primary"
              style={{ backgroundColor: `${subject.color}25` }}
            >
              {subject.name}
            </span>
          )}
          <span className="text-xs text-text-secondary capitalize font-medium px-2.5 py-1 rounded-md bg-bg-surface border border-border-default">
            {deadline.type.replace("_", " ")}
          </span>
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-md capitalize",
              deadline.priority === "critical" && "bg-error/15 text-error",
              deadline.priority === "high" && "bg-warning/15 text-warning",
              deadline.priority === "medium" && "bg-accent-subtle text-accent",
              deadline.priority === "low" && "bg-bg-surface text-text-secondary"
            )}
          >
            {deadline.priority} Priority
          </span>
        </div>

        <h2 className="text-xl font-bold text-text-primary leading-snug">{deadline.title}</h2>
      </div>

      {/* Due Date & Time Banner */}
      <div className="p-4 rounded-xl bg-bg-surface border border-border-default flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-subtle text-accent flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">{formattedDate}</div>
            <div className="text-xs text-text-secondary">
              {deadline.dueTime ? `Due at ${deadline.dueTime}` : "End of day"}
            </div>
          </div>
        </div>

        {days !== null && (
          <div className="text-right">
            <div
              className={cn(
                "text-sm font-bold tabular-nums",
                days < 0 ? "text-risk-overdue" : days <= 2 ? "text-warning" : "text-accent"
              )}
            >
              {days === 0 ? "Today" : days > 0 ? `${days} days left` : `${Math.abs(days)} days overdue`}
            </div>
          </div>
        )}
      </div>



      {/* Location metadata (if present) */}
      {deadline.location && (
        <div className="p-3 rounded-xl bg-bg-surface border border-border-default flex items-center gap-2.5 text-xs">
          <MapPin className="w-4 h-4 text-warning shrink-0" />
          <div>
            <div className="text-text-tertiary">Location / Room</div>
            <div className="font-semibold text-text-primary">
              {deadline.location}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {deadline.notes && (
        <div className="p-3.5 rounded-xl bg-bg-surface border border-border-default">
          <div className="text-xs font-medium text-text-secondary mb-1.5">Notes & Guidelines</div>
          <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
            {deadline.notes}
          </p>
        </div>
      )}

      {/* Subtasks Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <ListTodo className="w-4 h-4 text-accent" />
            <span>Subtasks & Milestones ({subtasksList.length})</span>
          </div>
        </div>

        {/* Add Subtask Form */}
        <form onSubmit={handleAddSubtask} className="flex gap-2">
          <Input
            placeholder="Add milestone (e.g. Draft introduction)..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="h-10 text-xs"
          />
          <Button type="submit" size="sm" variant="secondary" className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </form>

        {/* Subtask items list */}
        {subtasksList.length === 0 ? (
          <p className="text-xs text-text-tertiary italic py-2">
            No subtasks yet. Break this deadline into smaller steps.
          </p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {subtasksList.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-bg-surface border border-border-default group hover:border-border-hover transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Checkbox
                    checked={subtask.isCompleted}
                    onCheckedChange={() => handleToggleSubtask(subtask.id)}
                    aria-label={`Mark subtask ${subtask.title}`}
                  />
                  <span
                    className={cn(
                      "text-xs text-text-primary truncate",
                      subtask.isCompleted && "line-through text-text-tertiary"
                    )}
                  >
                    {subtask.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-error transition-all"
                  aria-label="Delete subtask"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-border-default flex items-center justify-between gap-3">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(deadline);
            }}
            className="gap-1.5"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleToggleComplete}
            disabled={isTogglingComplete}
            className="gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCompleted ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Deadline Overview">
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deadline Overview" maxWidth="lg">
      {content}
    </Modal>
  );
}
