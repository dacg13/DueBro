"use client";

import { useMemo } from "react";
import { type Deadline, type Subject, type RiskAssessment } from "@/types";
import {
  startOfWeek,
  addDays,
  format,
  isToday,
} from "date-fns";
import { Plus, CalendarClock, Clock, Check } from "lucide-react";
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
    <div className="rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8 overflow-hidden shadow-2xl">
      {/* 7 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-white/6">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isDayToday = isToday(day);
          const dayDeadlines = deadlinesByDate.get(dateStr) || [];

          return (
            <div
              key={dateStr}
              className={cn(
                "flex flex-col min-h-[440px] p-2.5 transition-colors relative group/col",
                isDayToday ? "bg-white/[0.03]" : "hover:bg-white/[0.015]"
              )}
            >
              {/* Clean Column Header */}
              <div className="pb-2.5 mb-2.5 border-b border-white/6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums w-7 h-7 rounded-full flex items-center justify-center transition-all",
                      isDayToday
                        ? "bg-signal-white text-void-950 shadow-[0_0_16px_rgba(250,250,252,0.4)]"
                        : "text-signal-white"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-mist-200 block leading-tight">
                      {format(day, "EEE")}
                    </span>
                    <span className="text-[10px] text-mist-200/70 tabular-nums">
                      {dayDeadlines.length > 0
                        ? `${dayDeadlines.length} task${dayDeadlines.length === 1 ? "" : "s"}`
                        : "No tasks"}
                    </span>
                  </div>
                </div>

                {/* Quick Add Button in Header */}
                <button
                  type="button"
                  onClick={() => onAddDeadlineForDate(dateStr)}
                  className="w-6 h-6 rounded-lg text-mist-200/60 hover:text-signal-white hover:bg-white/10 flex items-center justify-center transition-all opacity-0 group-hover/col:opacity-100 cursor-pointer"
                  title={`Add task for ${format(day, "MMM d")}`}
                  aria-label={`Add task for ${format(day, "MMM d")}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Deadlines List */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {dayDeadlines.map((dl) => {
                  const subject = dl.subjectId ? subjectMap.get(dl.subjectId) : null;
                  const subjectColor = subject?.color || "#5B6EF5";
                  const isCompleted = dl.status === "completed";
                  const assessment = riskMap.get(dl.id);
                  const isCritical = assessment?.tier === "critical" || assessment?.tier === "high";

                  return (
                    <div
                      key={dl.id}
                      onClick={() => onOpenDeadlineDetail(dl)}
                      className={cn(
                        "p-2.5 rounded-xl bg-void-900/70 hover:bg-void-850 border border-white/8 hover:border-white/20 transition-all duration-150 cursor-pointer group/card relative overflow-hidden flex flex-col justify-between gap-2",
                        isCompleted && "opacity-50 bg-void-950/40",
                        isCritical && !isCompleted && "border-red-500/30 bg-red-950/10 hover:border-red-500/50"
                      )}
                    >
                      {/* Left Subject Color Accent Bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
                        style={{ backgroundColor: subjectColor }}
                      />

                      {/* Header row: Subject Tag + Status / Priority Indicator */}
                      <div className="flex items-center justify-between gap-1 pl-1">
                        {subject ? (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.2 rounded truncate max-w-[90px]"
                            style={{
                              backgroundColor: `${subjectColor}20`,
                              color: subjectColor,
                            }}
                          >
                            {subject.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-mist-200">General</span>
                        )}

                        {/* Urgent dot if high/critical */}
                        {isCritical && !isCompleted && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)] shrink-0"
                            title="High Priority / Urgent"
                          />
                        )}
                      </div>

                      {/* Task Title */}
                      <h5
                        className={cn(
                          "text-xs font-semibold text-signal-white leading-snug pl-1 line-clamp-2",
                          isCompleted && "line-through text-mist-200"
                        )}
                      >
                        {dl.title}
                      </h5>

                      {/* Footer: Due Time + Quick Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/6 text-[10px] text-mist-200 pl-1">
                        <span className="flex items-center gap-1 tabular-nums font-medium">
                          {dl.dueTime ? (
                            <>
                              <Clock className="w-3 h-3 text-mist-200/80" />
                              {dl.dueTime}
                            </>
                          ) : (
                            "All day"
                          )}
                        </span>

                        {/* Actions (Complete & Reschedule) */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(dl.id);
                            }}
                            className={cn(
                              "w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer",
                              isCompleted
                                ? "bg-signal-white text-void-950"
                                : "text-mist-200/60 hover:text-signal-white hover:bg-white/10"
                            )}
                            title={isCompleted ? "Mark incomplete" : "Mark complete"}
                            aria-label={`Complete ${dl.title}`}
                          >
                            <Check className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReschedule(dl);
                            }}
                            className="w-5 h-5 rounded-md text-mist-200/60 hover:text-signal-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                            title="Reschedule task"
                            aria-label={`Reschedule ${dl.title}`}
                          >
                            <CalendarClock className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State Action for Column */}
                {dayDeadlines.length === 0 && (
                  <button
                    type="button"
                    onClick={() => onAddDeadlineForDate(dateStr)}
                    className="w-full h-24 rounded-xl border border-dashed border-white/8 hover:border-white/20 hover:bg-white/[0.02] text-mist-200/40 hover:text-signal-white text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group/empty"
                  >
                    <Plus className="w-3.5 h-3.5 text-mist-200/40 group-hover/empty:text-signal-white group-hover/empty:scale-110 transition-transform" />
                    <span>Add deadline</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
