"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subjectSchema, type SubjectInput, ACCESSIBLE_SUBJECT_COLORS } from "@/lib/validation/subjects";
import { createSubjectAction, updateSubjectAction } from "@/server/actions/subjects";
import { type Subject, type AcademicTerm } from "@/types";
import { Modal } from "@/components/ui/modal";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubjectColorPicker } from "./SubjectColorPicker";
import { Loader2 } from "lucide-react";

interface AddSubjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  terms: AcademicTerm[];
  initialData?: Subject | null;
  onSuccess?: (subject: Subject) => void;
}

export function AddSubjectDialog({
  isOpen,
  onClose,
  terms,
  initialData,
  onSuccess,
}: AddSubjectDialogProps) {
  const isEditing = Boolean(initialData);
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
    control,
    reset,
    formState: { errors },
  } = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      termId: terms[0]?.id || "",
      name: "",
      color: ACCESSIBLE_SUBJECT_COLORS[0].hex,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          termId: initialData.termId,
          name: initialData.name,
          color: initialData.color,
        });
      } else {
        reset({
          termId: terms[0]?.id || "",
          name: "",
          color: ACCESSIBLE_SUBJECT_COLORS[0].hex,
        });
      }
    }
  }, [isOpen, initialData, terms, reset]);

  const onSubmit = async (data: SubjectInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (isEditing && initialData) {
        const res = await updateSubjectAction(initialData.id, data);
        if (!res.success) {
          setErrorMsg(res.error || "Failed to update subject");
          setIsSubmitting(false);
          return;
        }
        if (res.data) onSuccess?.(res.data);
      } else {
        const res = await createSubjectAction(data);
        if (!res.success) {
          setErrorMsg(res.error || "Failed to create subject");
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

      {/* Subject Name Field */}
      <div>
        <label htmlFor="subject-name" className="block text-xs font-medium text-text-secondary mb-1.5">
          Subject / Course Name <span className="text-error">*</span>
        </label>
        <Input
          id="subject-name"
          placeholder="e.g. CS101 Algorithms, ECON200 Macroeconomics"
          {...register("name")}
          error={Boolean(errors.name)}
          autoFocus
        />
        {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Term Selector */}
      <div>
        <label htmlFor="subject-term" className="block text-xs font-medium text-text-secondary mb-1.5">
          Academic Term <span className="text-error">*</span>
        </label>
        <Select id="subject-term" {...register("termId")} error={Boolean(errors.termId)}>
          {terms.map((term) => (
            <option key={term.id} value={term.id} className="bg-bg-elevated text-text-primary">
              {term.name} {term.isCurrent ? "(Current)" : ""}
            </option>
          ))}
        </Select>
        {errors.termId && <p className="text-error text-xs mt-1">{errors.termId.message}</p>}
      </div>

      {/* Color Swatch Picker */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-2">
          Subject Accent Color
        </label>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <SubjectColorPicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.color && <p className="text-error text-xs mt-1">{errors.color.message}</p>}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-border-default flex items-center justify-end gap-2.5">
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
            "Save Subject"
          ) : (
            "Add Subject"
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
        title={isEditing ? "Edit Subject" : "New Subject"}
      >
        {formContent}
      </BottomSheet>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Subject" : "Add Subject"}
      description="Create a course container with a distinct accessible color tag."
      maxWidth="md"
    >
      {formContent}
    </Modal>
  );
}
