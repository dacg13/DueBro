"use client";

import { type Priority, priorityEnum } from "@/types";
import { cn } from "@/lib/utils";

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; dotColor: string; activeClass: string }
> = {
  low: {
    label: "Low",
    dotColor: "bg-priority-low",
    activeClass: "bg-bg-surface border-border-hover text-text-primary",
  },
  medium: {
    label: "Medium",
    dotColor: "bg-priority-medium",
    activeClass: "bg-accent-subtle border-accent/30 text-accent",
  },
  high: {
    label: "High",
    dotColor: "bg-priority-high",
    activeClass: "bg-warning/15 border-warning/30 text-warning",
  },
  critical: {
    label: "Critical",
    dotColor: "bg-priority-critical",
    activeClass: "bg-error/15 border-error/30 text-error",
  },
};

export function PrioritySelector({ value, onChange, disabled }: PrioritySelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-bg-surface border border-border-default">
      {priorityEnum.map((priority) => {
        const config = PRIORITY_CONFIG[priority];
        const isSelected = value === priority;

        return (
          <button
            key={priority}
            type="button"
            disabled={disabled}
            onClick={() => onChange(priority)}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border border-transparent",
              isSelected
                ? config.activeClass
                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full shrink-0", config.dotColor)} />
            <span className="truncate">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
