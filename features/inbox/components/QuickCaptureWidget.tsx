"use client";

import { useState, useMemo } from "react";
import { parseQuickCaptureText } from "@/server/domain/quick-capture";
import { createDeadlineAction } from "@/server/actions/deadlines";
import { type Deadline, type Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Calendar,
  Clock,
  Send,
  Loader2,
  Tag,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickCaptureWidgetProps {
  subjects: Subject[];
  onSuccess?: (newDeadline: Deadline) => void;
  className?: string;
}

export function QuickCaptureWidget({
  subjects,
  onSuccess,
  className,
}: QuickCaptureWidgetProps) {
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live NLP parsing preview
  const parsed = useMemo(() => {
    if (!inputText.trim()) return null;
    return parseQuickCaptureText(inputText);
  }, [inputText]);

  // Match subject hint to real course if possible
  const matchedSubject = useMemo(() => {
    if (!parsed?.detectedSubjectHint) return null;
    const hint = parsed.detectedSubjectHint.toLowerCase();
    return subjects.find(
      (s) => s.name.toLowerCase().includes(hint) || s.id.toLowerCase().includes(hint)
    );
  }, [parsed, subjects]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const parsedData = parseQuickCaptureText(inputText);

    try {
      const res = await createDeadlineAction({
        title: parsedData.cleanTitle,
        type: parsedData.type,
        priority: parsedData.priority,
        subjectId: matchedSubject?.id || undefined,
        dueDate: parsedData.dueDate || new Date().toISOString().split("T")[0],
        dueTime: parsedData.dueTime || "23:59",
        progress: 0,
        estimatedEffortHours: parsedData.estimatedEffortHours ?? 2.0,
        location: null,
        notes: null,
        tags: [],
        links: [],
      });

      if (res.success && res.data) {
        onSuccess?.(res.data);
        setInputText("");
      } else {
        // Optimistic client / demo fallback
        const demoCreated: Deadline = {
          id: `dl-captured-${Date.now()}`,
          userId: "demo-user",
          subjectId: matchedSubject?.id || null,
          termId: null,
          title: parsedData.cleanTitle,
          type: parsedData.type,
          dueDate: parsedData.dueDate || new Date().toISOString().split("T")[0],
          dueTime: parsedData.dueTime || "23:59",
          priority: parsedData.priority,
          status: "not_started",
          progress: 0,
          estimatedEffortHours: parsedData.estimatedEffortHours ?? 2.0,
          location: null,
          notes: null,
          tags: [],
          links: [],
          recurrenceRuleId: null,
          originalOccurrenceDate: null,
          completedAt: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        onSuccess?.(demoCreated);
        setInputText("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-2xl bg-bg-surface border border-border-default hover:border-accent/40 p-4 transition-all duration-200 space-y-2.5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-accent-subtle text-accent flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold text-text-primary">Instant Quick Capture</span>
        <span className="text-[11px] text-text-tertiary ml-auto hidden sm:inline">
          Press <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated text-text-secondary border border-border-default font-mono text-[10px]">Enter ↵</kbd> to save
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. Read biology chapter 4 by Friday 5pm urgent"
          disabled={isSubmitting}
          className="h-10 text-xs bg-bg-elevated border-border-default focus:border-accent flex-1"
        />

        <Button
          type="submit"
          size="sm"
          aria-label="Capture deadline"
          disabled={!inputText.trim() || isSubmitting}
          className="h-10 px-4 gap-1.5 shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Capture</span>
            </>
          )}
        </Button>
      </div>

      {/* Live NLP Preview Chips */}
      {parsed && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] animate-in fade-in duration-200">
          <span className="text-text-tertiary font-medium mr-1">Detected:</span>

          {parsed.dueDate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20 font-semibold tabular-nums">
              <Calendar className="w-3 h-3" />
              {parsed.dueDate}
            </span>
          )}

          {parsed.dueTime && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-elevated text-text-secondary border border-border-default tabular-nums">
              <Clock className="w-3 h-3" />
              {parsed.dueTime}
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-elevated text-text-secondary border border-border-default capitalize">
            <Tag className="w-3 h-3 text-text-tertiary" />
            {parsed.type}
          </span>

          {parsed.priority === "critical" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error/15 text-error border border-error/30 font-bold">
              <Flame className="w-3 h-3" />
              Critical
            </span>
          )}

          {matchedSubject && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-text-primary font-semibold"
              style={{ backgroundColor: `${matchedSubject.color}25` }}
            >
              {matchedSubject.name}
            </span>
          )}
        </div>
      )}
    </form>
  );
}
