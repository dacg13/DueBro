"use client";

import { useMemo } from "react";
import { type Deadline, type Subject, type RiskAssessment } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { RiskBadge } from "@/components/shared/RiskBadge";
import {
  startOfWeek,
  addDays,
  format,
  isToday,
} from "date-fns";
import { Flame, Plus, CalendarClock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekCalendarViewProps {
  currentWeekDate: Date;
  deadlines: Deadline[];
  subjectMap: Map<string, Subject>;
  riskMap: Map<string, RiskAssessment>;
  onToggleComplete: (id: string) => void;
  onOpenDeadlineDetail: (deadline: Deadline) => void;
  onReschedule: (deadline: Deadline) => void;
  onAddDeadlineForDate: (dateStr: string) => void;
}

export function WeekCalendarView({
  currentWeekDate,
  deadlines,
  subjectMap,
  riskMap,
  onToggleComplete,
  onOpenDeadlineDetail,
  onReschedule,
  onAddDeadlineForDate,
}: WeekCalendarViewProps) {
  // Compute 7 days from Monday to Sunday
  const weekDays = useMemo(() => {
    const monday = startOfWeek(currentWeekDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [currentWeekDate]);

  // Group deadlines by date
  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, Deadline[]>();
    deadlines.forEach((d) => {
      if (!d.dueDate || d.deletedAt) return;
      if (!map.has(d.dueDate)) map.set(d.dueDate, []);
      map.get(d.dueDate)!.push(d);
    });
    return map;
  }, [deadlines]);

  return (
    <div className="rounded-2xl bg-bg-surface border border-border-default overflow-hidden">
      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-border-default">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isDayToday = isToday(day);
          const dayDeadlines = deadlinesByDate.get(dateStr) || [];

          // Compute total scheduled effort for the day
          const totalEffort = dayDeadlines.reduce((acc, d) => {
            const effort = d.estimatedEffortHours ?? 2.0;
            return acc + effort * (1 - d.progress / 100);
          }, 0);

          const isHeavy = totalEffort > 4.0 || dayDeadlines.length >= 3;

          return (
            <div
              key={dateStr}
              className={cn(
                "flex flex-col min-h-[360px] p-3 transition-colors",
                isDayToday && "bg-accent-subtle/10",
                isHeavy && "bg-warning/5"
              )}
            >
              {/* Column Header */}
              <div className="pb-3 mb-3 border-b border-border-default space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {format(day, "EEE")}
                  </span>
                  {isHeavy && (
                    <span
                      title="Heavy study load (>4h scheduled)"
                      className="flex items-center gap-0.5 text-[10px] font-bold text-warning tabular-nums"
                    >
                      <Flame className="w-3 h-3" />
                      <span>{totalEffort.toFixed(1)}h</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-lg font-bold tabular-nums w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      isDayToday
                        ? "bg-accent text-white shadow-xs"
                        : "text-text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  <span className="text-[11px] text-text-tertiary tabular-nums font-medium">
                    {dayDeadlines.length} task{dayDeadlines.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {/* Deadlines List */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[480px]">
                {dayDeadlines.map((dl) => {
                  const subject = dl.subjectId ? subjectMap.get(dl.subjectId) : null;
                  const subjectColor = subject?.color || "#5B6EF5";
                  const isCompleted = dl.status === "completed";
                  const assessment = riskMap.get(dl.id);

                  return (
                    <div
                      key={dl.id}
                      onClick={() => onOpenDeadlineDetail(dl)}
                      className={cn(
                        "p-3 rounded-xl bg-bg-elevated border border-border-default hover:border-border-hover transition-all cursor-pointer space-y-2 group relative overflow-hidden",
                        isCompleted && "opacity-60 line-through bg-bg-surface/50",
                        assessment?.tier === "critical" && "border-risk-critical/40 bg-risk-critical/5"
                      )}
                    >
                      {/* Subject Color Pill */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: subjectColor }}
                      />

                      {/* Header: Checkbox + Title */}
                      <div className="flex items-start gap-2 min-w-0">
                        <div onClick={(e) => e.stopPropagation()} className="pt-0.5 shrink-0">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => onToggleComplete(dl.id)}
                            aria-label={`Mark ${dl.title}`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            {subject && (
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.2 rounded truncate"
                                style={{ backgroundColor: `${subjectColor}20`, color: subjectColor }}
                              >
                                {subject.name}
                              </span>
                            )}
                            {assessment && !isCompleted && (
                              <RiskBadge assessment={assessment} size="sm" />
                            )}
                          </div>
                          <h5 className="text-xs font-semibold text-text-primary leading-tight line-clamp-2">
                            {dl.title}
                          </h5>
                        </div>
                      </div>

                      {/* Footer: Due Time + Reschedule Button */}
                      <div className="flex items-center justify-between pt-1 border-t border-border-default/50 text-[11px] text-text-tertiary">
                        {dl.dueTime ? (
                          <span className="flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3 text-text-tertiary" />
                            {dl.dueTime}
                          </span>
                        ) : (
                          <span className="tabular-nums">{dl.estimatedEffortHours ?? 2}h effort</span>
                        )}

                        {/* Accessible Reschedule Trigger (WCAG 2.2 Dragging Alternative) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReschedule(dl);
                          }}
                          className="p-1 rounded-md text-text-tertiary hover:text-accent hover:bg-accent-subtle transition-colors cursor-pointer"
                          title="Reschedule to another day (WCAG 2.2 accessible fallback)"
                          aria-label={`Reschedule ${dl.title}`}
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Deadline Button at bottom of column */}
              <div className="pt-2 mt-auto border-t border-border-default/60">
                <button
                  type="button"
                  onClick={() => onAddDeadlineForDate(dateStr)}
                  className="w-full py-1.5 rounded-lg border border-dashed border-border-default hover:border-accent hover:bg-accent-subtle/20 text-text-tertiary hover:text-accent text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
