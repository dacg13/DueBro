"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deadlineSchema, type DeadlineFormInput } from "@/lib/validation/deadlines";
import { createDeadlineAction, updateDeadlineAction } from "@/server/actions/deadlines";
import { type Deadline, deadlineTypeEnum, type Subject } from "@/types";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PrioritySelector } from "@/components/shared/PrioritySelector";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { type RecurrenceRuleInput } from "@/lib/validation/recurrence";
import { ChevronDown, ChevronUp, Loader2, Bell, Sparkles, MapPin } from "lucide-react";

interface AddDeadlineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialData?: Deadline | null;
  onSuccess?: (deadline: Deadline) => void;
}

export function AddDeadlineDialog({
  isOpen,
  onClose,
  subjects,
  initialData,
  onSuccess,
}: AddDeadlineDialogProps) {
  const isEditing = Boolean(initialData);

  // Progressive disclosure section states
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRuleInput | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DeadlineFormInput>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: {
      title: "",
      type: "assignment",
      subjectId: subjects[0]?.id || "",
      dueDate: new Date().toISOString().split("T")[0],
      dueTime: "23:59",
      priority: "medium",
      progress: 0,
      estimatedEffortHours: 2,
      location: "",
      notes: "",
      tags: [],
      links: [],
    },
  });

  const selectedType = useWatch({ control, name: "type", defaultValue: "assignment" });
  const watchDueDate = useWatch({ control, name: "dueDate", defaultValue: "" });

  // Reset form when initialData or open state changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          type: initialData.type,
          subjectId: initialData.subjectId || "",
          dueDate: initialData.dueDate || "",
          dueTime: initialData.dueTime || "",
          priority: initialData.priority,
          progress: initialData.progress,
          estimatedEffortHours: initialData.estimatedEffortHours || null,
          location: initialData.location || "",
          notes: initialData.notes || "",
          tags: initialData.tags || [],
          links: initialData.links || [],
        });
      } else {
        reset({
          title: "",
          type: "assignment",
          subjectId: subjects[0]?.id || "",
          dueDate: new Date().toISOString().split("T")[0],
          dueTime: "23:59",
          priority: "medium",
          progress: 0,
          estimatedEffortHours: 2,
          location: "",
          notes: "",
          tags: [],
          links: [],
        });
      }
    }
  }, [isOpen, initialData, reset, subjects]);

  const onSubmit = async (data: DeadlineFormInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (isEditing && initialData) {
        const res = await updateDeadlineAction(initialData.id, data);
        if (!res.success) {
          setErrorMsg(res.error || "Failed to update deadline");
          setIsSubmitting(false);
          return;
        }
        if (res.data) onSuccess?.(res.data);
      } else {
        const res = await createDeadlineAction(data);
        if (!res.success) {
          setErrorMsg(res.error || "Failed to create deadline");
          setIsSubmitting(false);
          return;
        }
        if (res.data) onSuccess?.(res.data);
      }

      onClose();
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {errorMsg && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
          {errorMsg}
        </div>
      )}

      {/* Section 1: Title & Type (Required - Always Visible) */}
      <div className="space-y-3">
        <div>
          <label htmlFor="deadline-title" className="block text-xs font-medium text-text-secondary mb-1.5">
            Deadline Title <span className="text-error">*</span>
          </label>
          <Input
            id="deadline-title"
            placeholder="e.g. Database Project Submission, Midterm Exam"
            {...register("title")}
            error={Boolean(errors.title)}
            autoFocus
          />
          {errors.title && <p className="text-error text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="deadline-type" className="block text-xs font-medium text-text-secondary mb-1.5">
              Category / Type
            </label>
            <Select id="deadline-type" {...register("type")}>
              {deadlineTypeEnum.map((type) => (
                <option key={type} value={type} className="bg-bg-elevated text-text-primary capitalize">
                  {type.replace("_", " ")}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="deadline-subject" className="block text-xs font-medium text-text-secondary mb-1.5">
              Subject <span className="text-error">*</span>
            </label>
            <Select id="deadline-subject" {...register("subjectId")} error={Boolean(errors.subjectId)}>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-bg-elevated text-text-primary">
                  {sub.name}
                </option>
              ))}
            </Select>
            {errors.subjectId && <p className="text-error text-xs mt-1">{errors.subjectId.message}</p>}
          </div>
        </div>
      </div>

      {/* Section 2: Due Date & Time (Required - Always Visible) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="deadline-date" className="block text-xs font-medium text-text-secondary mb-1.5">
            Due Date <span className="text-error">*</span>
          </label>
          <Input id="deadline-date" type="date" {...register("dueDate")} error={Boolean(errors.dueDate)} />
          {errors.dueDate && <p className="text-error text-xs mt-1">{errors.dueDate.message}</p>}
        </div>

        <div>
          <label htmlFor="deadline-time" className="block text-xs font-medium text-text-secondary mb-1.5">
            Due Time (Optional)
          </label>
          <Input id="deadline-time" type="time" {...register("dueTime")} />
        </div>
      </div>

      {/* Priority Selector (Segmented control) */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Priority (Importance)
        </label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <PrioritySelector value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      {/* Section 3: More Details (Progressive Disclosure - Collapsed by default) */}
      <div className="border border-border-default rounded-xl overflow-hidden bg-bg-surface/40">
        <button
          type="button"
          onClick={() => setShowMoreDetails(!showMoreDetails)}
          className="w-full flex items-center justify-between p-3.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Estimated Effort, Location & Notes</span>
          </div>
          {showMoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMoreDetails && (
          <div className="p-3.5 pt-0 space-y-3 border-t border-border-default/50">
            <div>
              <label htmlFor="effort-hours" className="block text-xs font-medium text-text-secondary mb-1.5">
                Estimated Effort (Hours) — Powers Risk Engine
              </label>
              <Input
                id="effort-hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g. 4.5"
                {...register("estimatedEffortHours", { valueAsNumber: true })}
              />
            </div>

            {selectedType === "exam" || selectedType === "presentation" ? (
              <div>
                <label htmlFor="deadline-location" className="block text-xs font-medium text-text-secondary mb-1.5">
                  <MapPin className="w-3 h-3 inline mr-1 text-accent" />
                  Room / Exam Location
                </label>
                <Input
                  id="deadline-location"
                  placeholder="e.g. Hall B, Room 402"
                  {...register("location")}
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="deadline-notes" className="block text-xs font-medium text-text-secondary mb-1.5">
                Notes / Requirements
              </label>
              <textarea
                id="deadline-notes"
                rows={3}
                placeholder="Add assignment guidelines, rubric points, portal links..."
                {...register("notes")}
                className="w-full rounded-xl bg-bg-elevated border border-border-default hover:border-border-hover focus:border-accent p-3 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Recurrence Selector */}
            <RecurrenceSelector
              value={recurrenceRule}
              onChange={setRecurrenceRule}
              startDate={watchDueDate || new Date().toISOString().split("T")[0]}
            />
          </div>
        )}
      </div>

      {/* Section 4: Reminders (Progressive Disclosure) */}
      <div className="border border-border-default rounded-xl overflow-hidden bg-bg-surface/40">
        <button
          type="button"
          onClick={() => setShowReminders(!showReminders)}
          className="w-full flex items-center justify-between p-3.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-warning" />
            <span>Reminders (Push & Email in Parallel)</span>
          </div>
          {showReminders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showReminders && (
          <div className="p-3.5 pt-0 space-y-2 border-t border-border-default/50 text-xs text-text-secondary">
            <div className="p-2.5 rounded-lg bg-bg-elevated border border-border-default flex items-center justify-between">
              <span>Default {selectedType.replace("_", " ")} cadence:</span>
              <span className="text-accent font-medium">1 day before + 2 hours before</span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Reminders will be dispatched via Web Push and Email simultaneously with quiet hours respected.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Action Footer */}
      <div className="pt-2 flex items-center justify-end gap-2.5 sticky bottom-0 bg-bg-elevated py-2 -mb-2 border-t border-border-default/80">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-28">
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Deadline"
          )}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? "Edit Deadline" : "New Deadline"}
      >
        {formContent}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Deadline" : "Add Deadline"}
      description="Enter deadline details to track effort and risk."
      maxWidth="md"
    >
      {formContent}
    </Modal>
  );
}
