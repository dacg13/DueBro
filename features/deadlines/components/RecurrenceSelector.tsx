"use client";

import { type RecurrenceFrequency, type DayOfWeek } from "@/types/recurrence";
import { type RecurrenceRuleInput } from "@/lib/validation/recurrence";
import { Input } from "@/components/ui/input";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

const FREQUENCY_OPTIONS: Array<{ value: RecurrenceFrequency | "none"; label: string }> = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Every month" },
];

const DAYS: Array<{ key: DayOfWeek; label: string }> = [
  { key: "MO", label: "M" },
  { key: "TU", label: "T" },
  { key: "WE", label: "W" },
  { key: "TH", label: "T" },
  { key: "FR", label: "F" },
  { key: "SA", label: "S" },
  { key: "SU", label: "S" },
];

interface RecurrenceSelectorProps {
  value: RecurrenceRuleInput | null;
  onChange: (value: RecurrenceRuleInput | null) => void;
  startDate?: string;
}

export function RecurrenceSelector({
  value,
  onChange,
  startDate = new Date().toISOString().split("T")[0],
}: RecurrenceSelectorProps) {
  const currentFrequency = value?.frequency ?? "none";
  const selectedDays = value?.byDay ?? [];

  const handleFrequencyChange = (freq: RecurrenceFrequency | "none") => {
    if (freq === "none") {
      onChange(null);
      return;
    }

    onChange({
      frequency: freq,
      interval: freq === "biweekly" ? 2 : 1,
      byDay: freq === "weekly" || freq === "biweekly" ? ["MO"] : [],
      startDate,
      untilDate: null,
      count: null,
    });
  };

  const toggleDay = (day: DayOfWeek) => {
    if (!value) return;
    const exists = selectedDays.includes(day);
    const updated = exists ? selectedDays.filter((d) => d !== day) : [...selectedDays, day];
    onChange({
      ...value,
      byDay: updated.length > 0 ? updated : [day],
    });
  };

  return (
    <div className="space-y-3 p-3.5 rounded-xl bg-bg-surface border border-border-default">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-text-primary">Recurrence</span>
        </div>

        <select
          value={currentFrequency}
          onChange={(e) => handleFrequencyChange(e.target.value as RecurrenceFrequency | "none")}
          className="h-8 px-2.5 rounded-lg bg-bg-elevated border border-border-default text-xs text-text-primary focus:outline-hidden focus:border-accent cursor-pointer"
        >
          {FREQUENCY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Weekday Selection Pills (if weekly or biweekly) */}
      {(currentFrequency === "weekly" || currentFrequency === "biweekly") && (
        <div className="pt-2 border-t border-border-default/60 animate-in fade-in duration-200">
          <span className="block text-[11px] font-medium text-text-secondary mb-1.5">Repeat on</span>
          <div className="flex items-center gap-1.5">
            {DAYS.map((d) => {
              const isSelected = selectedDays.includes(d.key);
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => toggleDay(d.key)}
                  className={cn(
                    "w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    isSelected
                      ? "bg-signal-white text-void-950 shadow-[0_0_12px_rgba(250,250,252,0.3)] font-bold"
                      : "bg-void-900/60 text-mist-200 hover:text-signal-white border border-white/8 hover:border-white/20"
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* End condition (Until Date) */}
      {value && currentFrequency !== "none" && (
        <div className="pt-2 border-t border-border-default/60 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-text-secondary">Repeats until (optional)</span>
            <Input
              type="date"
              value={value.untilDate ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  untilDate: e.target.value || null,
                })
              }
              className="h-7 text-xs w-36 py-0 px-2 tabular-nums"
            />
          </div>
        </div>
      )}
    </div>
  );
}
