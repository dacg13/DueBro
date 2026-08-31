"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { academicTermSchema, type AcademicTermInput } from "@/lib/validation/academic-terms";
import {
  createAcademicTermAction,
  setActiveAcademicTermAction,
  deleteAcademicTermAction,
} from "@/server/actions/academic-terms";
import { type AcademicTerm } from "@/types";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AcademicTermsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  terms: AcademicTerm[];
  onTermsChange?: (terms: AcademicTerm[]) => void;
}

export function AcademicTermsDialog({
  isOpen,
  onClose,
  terms,
  onTermsChange,
}: AcademicTermsDialogProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<AcademicTermInput>({
    resolver: zodResolver(academicTermSchema),
    defaultValues: {
      name: "",
      startDate: "2026-09-01",
      endDate: "2026-12-20",
      isCurrent: true,
    },
  });

  const isCurrentValue = useWatch({ control, name: "isCurrent", defaultValue: true });

  const onSubmit = async (data: AcademicTermInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createAcademicTermAction(data);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to create academic term");
        setIsSubmitting(false);
        return;
      }

      if (res.data) {
        let updatedList = terms;
        if (res.data.isCurrent) {
          updatedList = updatedList.map((t) => ({ ...t, isCurrent: false }));
        }
        onTermsChange?.([res.data, ...updatedList]);
      }

      reset();
      setShowAddForm(false);
    } catch {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActive = async (id: string) => {
    const res = await setActiveAcademicTermAction(id);
    if (res.success && res.data) {
      onTermsChange?.(terms.map((t) => ({ ...t, isCurrent: t.id === id })));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteAcademicTermAction(id);
      onTermsChange?.(terms.filter((t) => t.id !== id));
    }
  };

  const content = (
    <div className="space-y-5">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
          {errorMsg}
        </div>
      )}

      {/* Existing Terms List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Configured Terms ({terms.length})
          </span>
          {!showAddForm && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowAddForm(true)}
              className="gap-1.5 h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Term
            </Button>
          )}
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {terms.map((term) => {
            const startFormatted = format(parseISO(term.startDate), "MMM d, yyyy");
            const endFormatted = format(parseISO(term.endDate), "MMM d, yyyy");

            return (
              <div
                key={term.id}
                className={cn(
                  "p-3 rounded-xl bg-bg-surface border flex items-center justify-between gap-3 transition-colors",
                  term.isCurrent
                    ? "border-accent/40 bg-accent-subtle/30"
                    : "border-border-default hover:border-border-hover"
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-text-primary truncate">{term.name}</h4>
                    {term.isCurrent && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-accent text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
                    {startFormatted} &ndash; {endFormatted}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!term.isCurrent && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetActive(term.id)}
                      className="text-xs text-accent hover:text-accent hover:bg-accent-subtle"
                    >
                      Set Active
                    </Button>
                  )}
                  {terms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(term.id, term.name)}
                      className="p-1.5 rounded-lg text-text-tertiary hover:text-error hover:bg-error/10 transition-colors"
                      aria-label={`Delete ${term.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Term Subform */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 rounded-xl bg-bg-surface border border-border-default space-y-3.5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Add Academic Term
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-text-tertiary hover:text-text-secondary"
            >
              Cancel
            </button>
          </div>

          <div>
            <label htmlFor="term-name" className="block text-xs font-medium text-text-secondary mb-1">
              Term Name
            </label>
            <Input
              id="term-name"
              placeholder="e.g. Fall 2026, Spring 2027"
              {...register("name")}
              error={Boolean(errors.name)}
              className="h-10 text-xs"
            />
            {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="term-start" className="block text-xs font-medium text-text-secondary mb-1">
                Start Date
              </label>
              <Input
                id="term-start"
                type="date"
                {...register("startDate")}
                error={Boolean(errors.startDate)}
                className="h-10 text-xs"
              />
            </div>
            <div>
              <label htmlFor="term-end" className="block text-xs font-medium text-text-secondary mb-1">
                End Date
              </label>
              <Input
                id="term-end"
                type="date"
                {...register("endDate")}
                error={Boolean(errors.endDate)}
                className="h-10 text-xs"
              />
              {errors.endDate && <p className="text-error text-xs mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="isCurrent"
              checked={isCurrentValue}
              onCheckedChange={(checked) => setValue("isCurrent", checked)}
            />
            <label htmlFor="isCurrent" className="text-xs text-text-secondary cursor-pointer">
              Set as currently active semester
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-default">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Term"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title="Manage Academic Terms">
        {content}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Academic Terms"
      description="Define semester or quarter date windows to automatically organize your courses."
      maxWidth="md"
    >
      {content}
    </Modal>
  );
}
