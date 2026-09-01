"use client";

import { useState, useMemo, useEffect } from "react";
import { type Deadline, type Subject } from "@/types";
import { assessAllDeadlinesRisk } from "@/server/domain/risk";
import { getDeadlinesAction, toggleDeadlineCompleteAction } from "@/server/actions/deadlines";
import { getSubjectsAction } from "@/server/actions/subjects";
import { MonthCalendarGrid } from "@/features/calendar/components/MonthCalendarGrid";
import { WeekCalendarView } from "@/features/calendar/components/WeekCalendarView";
import { CalendarDayDrawer } from "@/features/calendar/components/CalendarDayDrawer";
import { RescheduleDeadlineModal } from "@/features/calendar/components/RescheduleDeadlineModal";
import { DeadlineDetailModal } from "@/features/deadlines/components/DeadlineDetailModal";
import { AddDeadlineDialog } from "@/features/deadlines/components/AddDeadlineDialog";
import { Button } from "@/components/ui/button";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");

  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rescheduleDeadline, setRescheduleDeadline] = useState<Deadline | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    Promise.all([getDeadlinesAction(), getSubjectsAction()]).then(([dlRes, subRes]) => {
      if (dlRes.data) setDeadlines(dlRes.data);
      if (subRes.data) setSubjects(subRes.data);
      setIsLoading(false);
    });
  }, []);

  // Quick lookup map
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const riskMap = useMemo(() => {
    return assessAllDeadlinesRisk(deadlines);
  }, [deadlines]);

  // Filtered by subject
  const filteredDeadlines = useMemo(() => {
    const active = deadlines.filter((d) => !d.deletedAt);
    if (selectedSubjectId === "all") return active;
    return active.filter((d) => d.subjectId === selectedSubjectId);
  }, [deadlines, selectedSubjectId]);

  // Quick complete toggle with optimistic state update
  const handleToggleComplete = async (id: string) => {
    setDeadlines((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const isNowCompleted = d.status !== "completed";
          return {
            ...d,
            status: isNowCompleted ? "completed" : "not_started",
            completedAt: isNowCompleted ? new Date() : null,
            progress: isNowCompleted ? 100 : d.progress,
          };
        }
        return d;
      })
    );

    await toggleDeadlineCompleteAction(id);
  };

  // Month navigation
  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else {
      setCurrentDate((prev) => subWeeks(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else {
      setCurrentDate((prev) => addWeeks(prev, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Day Drawer opener
  const handleSelectDate = (dateStr: string) => {
    setSelectedDayDate(dateStr);
    setIsDayDrawerOpen(true);
  };

  // Reschedule handler
  const handleOpenReschedule = (deadline: Deadline) => {
    setRescheduleDeadline(deadline);
    setIsRescheduleOpen(true);
  };

  const handleRescheduleSuccess = (updated: Deadline) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const dayDeadlines = useMemo(() => {
    if (!selectedDayDate) return [];
    return filteredDeadlines.filter((d) => d.dueDate === selectedDayDate);
  }, [filteredDeadlines, selectedDayDate]);

  // Header date label
  const headerDateLabel = useMemo(() => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy");
    } else {
      const mon = startOfWeek(currentDate, { weekStartsOn: 1 });
      const sun = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(mon, "MMM d")} – ${format(sun, "MMM d, yyyy")}`;
    }
  }, [currentDate, viewMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-mist-200" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-signal-white">
              {headerDateLabel}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-void-850 text-signal-white border border-white/10">
              {viewMode === "month" ? "Month View" : "Week View"}
            </span>
          </div>
          <p className="text-xs text-mist-200 mt-0.5">
            Visualize coursework pacing, upcoming exam windows, and daily workload density.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Navigation Controls */}
          <div className="flex items-center rounded-xl bg-bg-surface border border-border-default p-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-bg-surface border border-border-default text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={cn(
                "px-3 py-1 rounded-lg transition-colors cursor-pointer",
                viewMode === "month"
                  ? "bg-bg-elevated text-text-primary shadow-xs font-bold"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={cn(
                "px-3 py-1 rounded-lg transition-colors cursor-pointer",
                viewMode === "week"
                  ? "bg-bg-elevated text-text-primary shadow-xs font-bold"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              Week
            </button>
          </div>

          <Button
            onClick={() => {
              setSelectedDayDate(null);
              setIsAddOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Deadline
          </Button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      {subjects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider shrink-0 mr-1">
            Courses:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSubjectId("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
              selectedSubjectId === "all"
                ? "bg-accent-subtle text-accent font-bold border border-accent/30"
                : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
            )}
          >
            All Subjects
          </button>

          {subjects.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubjectId(sub.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer",
                selectedSubjectId === sub.id
                  ? "bg-accent-subtle text-accent font-bold border border-accent/30"
                  : "bg-bg-surface text-text-secondary hover:text-text-primary border border-border-default"
              )}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: sub.color }}
              />
              <span>{sub.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Calendar View: Month vs Week */}
      {viewMode === "month" ? (
        <MonthCalendarGrid
          currentMonth={currentDate}
          deadlines={filteredDeadlines}
          subjectMap={subjectMap}
          onSelectDate={handleSelectDate}
        />
      ) : (
        <WeekCalendarView
          currentWeekDate={currentDate}
          deadlines={filteredDeadlines}
          subjectMap={subjectMap}
          riskMap={riskMap}
          onToggleComplete={handleToggleComplete}
          onOpenDeadlineDetail={(dl) => {
            setSelectedDeadline(dl);
            setIsDetailOpen(true);
          }}
          onReschedule={handleOpenReschedule}
          onAddDeadlineForDate={(d) => {
            setSelectedDayDate(d);
            setIsAddOpen(true);
          }}
        />
      )}

      {/* Day Inspection Drawer (Month View click) */}
      <CalendarDayDrawer
        date={selectedDayDate}
        isOpen={isDayDrawerOpen}
        onClose={() => setIsDayDrawerOpen(false)}
        deadlines={dayDeadlines}
        subjectMap={subjectMap}
        riskMap={riskMap}
        onToggleComplete={handleToggleComplete}
        onOpenDeadlineDetail={(dl) => {
          setSelectedDeadline(dl);
          setIsDetailOpen(true);
        }}
        onAddDeadlineForDate={(d) => {
          setSelectedDayDate(d);
          setIsAddOpen(true);
        }}
      />

      {/* Reschedule Deadline Modal */}
      <RescheduleDeadlineModal
        deadline={rescheduleDeadline}
        subject={rescheduleDeadline?.subjectId ? subjectMap.get(rescheduleDeadline.subjectId) : null}
        currentWeekDate={currentDate}
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        onSuccess={handleRescheduleSuccess}
      />

      {/* Deadline Detail Inspection Modal */}
      <DeadlineDetailModal
        deadline={selectedDeadline}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        subject={selectedDeadline?.subjectId ? subjectMap.get(selectedDeadline.subjectId) : null}
        onEdit={(dl) => {
          setSelectedDeadline(dl);
          setIsAddOpen(true);
        }}
        onDeleteSuccess={(id) => setDeadlines((prev) => prev.filter((d) => d.id !== id))}
      />

      {/* Add / Edit Deadline Dialog */}
      <AddDeadlineDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        subjects={subjects}
        onSuccess={(saved) => {
          setDeadlines((prev) => [saved, ...prev]);
        }}
      />
    </div>
  );
}
