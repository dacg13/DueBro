"use client";

import { useMemo } from "react";
import { type Deadline, type Subject } from "@/types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Flame, CheckCircle2 } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthCalendarGridProps {
  currentMonth: Date;
  deadlines: Deadline[];
  subjectMap: Map<string, Subject>;
  onSelectDate: (dateStr: string) => void;
}

export function MonthCalendarGrid({
  currentMonth,
  deadlines,
  subjectMap,
  onSelectDate,
}: MonthCalendarGridProps) {
  // Compute calendar days matrix with Monday start
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Group active deadlines by date
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
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border-default bg-bg-elevated/40">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-semibold text-text-tertiary uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border-default">
        {calendarDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isCurMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          const dayDeadlines = deadlinesByDate.get(dateStr) || [];

          // Compute effort and heat level
          const totalEffort = dayDeadlines.reduce((acc, d) => {
            const effort = d.estimatedEffortHours ?? 2.0;
            return acc + effort * (1 - d.progress / 100);
          }, 0);

          const isHeavyWorkload = totalEffort > 4.0 || dayDeadlines.length >= 3;
          const visibleDeadlines = dayDeadlines.slice(0, 3);
          const hiddenCount = dayDeadlines.length - visibleDeadlines.length;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "min-h-[105px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-colors cursor-pointer group hover:bg-bg-elevated/30",
                !isCurMonth && "opacity-35 bg-bg-surface/30",
                isDayToday && "bg-accent-subtle/10",
                isHeavyWorkload && isCurMonth && "bg-warning/5 border-warning/30"
              )}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                    isDayToday
                      ? "bg-signal-white text-void-950 font-bold shadow-[0_0_12px_rgba(250,250,252,0.4)]"
                      : "text-mist-200 group-hover:text-signal-white",
                    isHeavyWorkload && !isDayToday && "text-warning font-bold"
                  )}
                >
                  {format(day, "d")}
                </span>

                {/* Heavy Workload Heat Indicator */}
                {isHeavyWorkload && isCurMonth && (
                  <span
                    title={`${dayDeadlines.length} deadlines scheduled`}
                    className="flex items-center gap-0.5 text-[10px] font-bold text-warning tabular-nums"
                  >
                    <Flame className="w-3 h-3" />
                    <span>{dayDeadlines.length}</span>
                  </span>
                )}
              </div>

              {/* Deadline Chips (up to 3) */}
              <div className="space-y-1 overflow-hidden flex-1">
                {visibleDeadlines.map((dl) => {
                  const subject = dl.subjectId ? subjectMap.get(dl.subjectId) : null;
                  const subjectColor = subject?.color || "#5B6EF5";
                  const isCompleted = dl.status === "completed";

                  return (
                    <div
                      key={dl.id}
                      className={cn(
                        "flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] font-medium truncate transition-colors border",
                        isCompleted
                          ? "opacity-50 line-through bg-bg-elevated text-text-tertiary border-border-default/40"
                          : "bg-bg-elevated/80 text-text-primary border-border-default/60 hover:border-border-hover"
                      )}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: subjectColor }}
                      />
                      <span className="truncate flex-1">{dl.title}</span>
                      {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-success shrink-0" />}
                    </div>
                  );
                })}

                {/* + N more badge */}
                {hiddenCount > 0 && (
                  <div className="text-[10px] font-semibold text-text-tertiary pl-1 tabular-nums">
                    +{hiddenCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
