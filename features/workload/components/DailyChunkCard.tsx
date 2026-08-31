"use client";

import { type ScheduledSessionChunk, type Subject } from "@/types";
import { Clock, Calendar, Sparkles } from "lucide-react";

interface DailyChunkCardProps {
  chunk: ScheduledSessionChunk;
  subject?: Subject | null;
  onOpenDeadline?: (deadlineId: string) => void;
  onQuickLog?: (deadlineId: string, hours: number) => void;
}

export function DailyChunkCard({
  chunk,
  subject,
  onOpenDeadline,
  onQuickLog,
}: DailyChunkCardProps) {
  const subjectColor = subject?.color || "#5B6EF5";

  return (
    <div
      onClick={() => onOpenDeadline?.(chunk.deadlineId)}
      className="p-3.5 rounded-xl bg-bg-elevated border border-border-default hover:border-border-hover transition-all cursor-pointer space-y-2 group relative overflow-hidden"
    >
      {/* Subject Color Pill */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: subjectColor }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {subject && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.2 rounded"
                style={{ backgroundColor: `${subjectColor}20`, color: subjectColor }}
              >
                {subject.name}
              </span>
            )}
            <span className="text-[10px] text-text-tertiary capitalize">
              {chunk.type}
            </span>
          </div>

          <h5 className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
            {chunk.title}
          </h5>
        </div>

        {/* Allocated Study Hours Gauge */}
        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-subtle text-accent font-bold text-xs tabular-nums border border-accent/20">
            <Clock className="w-3 h-3" />
            {chunk.allocatedHours.toFixed(1)}h
          </span>
        </div>
      </div>

      {/* Footer: Due date + Log button */}
      <div className="flex items-center justify-between pt-1.5 border-t border-border-default/50 text-[11px] text-text-tertiary">
        <span className="flex items-center gap-1 tabular-nums">
          <Calendar className="w-3 h-3" />
          Final Due: {chunk.dueDate}
        </span>

        {onQuickLog && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickLog(chunk.deadlineId, chunk.allocatedHours);
            }}
            className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            Log {chunk.allocatedHours}h
          </button>
        )}
      </div>
    </div>
  );
}
