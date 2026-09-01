"use client";

import { useState, useMemo, useEffect } from "react";
import { type Deadline, type Subject } from "@/types";
import { DeadlineCard } from "@/components/shared/DeadlineCard";
import { DeadlineDetailModal } from "@/features/deadlines/components/DeadlineDetailModal";
import { AddDeadlineDialog } from "@/features/deadlines/components/AddDeadlineDialog";
import { getDeadlinesAction, toggleDeadlineCompleteAction } from "@/server/actions/deadlines";
import { getSubjectsAction } from "@/server/actions/subjects";
import { assessAllDeadlinesRisk } from "@/server/domain/risk";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { addDays, format, startOfDay } from "date-fns";
import { Plus, Calendar, Loader2 } from "lucide-react";

export default function WorkloadRoadmapPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    Promise.all([getDeadlinesAction(), getSubjectsAction()]).then(([dlRes, subRes]) => {
      if (dlRes.data) setDeadlines(dlRes.data);
      if (subRes.data) setSubjects(subRes.data);
      setIsLoading(false);
    });
  }, []);

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const riskMap = useMemo(() => {
    return assessAllDeadlinesRisk(deadlines);
  }, [deadlines]);

  const days14 = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => {
      const date = addDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const matched = deadlines.filter((d) => d.dueDate === dateStr && !d.deletedAt);
      return {
        date,
        dateStr,
        dayLabel: format(date, "EEE"),
        monthDay: format(date, "MMM d"),
        isToday: i === 0,
        deadlines: matched,
      };
    });
  }, [deadlines]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-mist-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-signal-white">14-Day Roadmap</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-void-850 text-signal-white border border-white/10">
              Upcoming Schedule
            </span>
          </div>
          <p className="text-xs text-mist-200 mt-0.5">
            Chronological glance of your assignments and exams over the next two weeks.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2 self-start sm:self-center">
          <Plus className="w-4 h-4" />
          Add Deadline
        </Button>
      </div>

      {/* 14-Day Timeline List */}
      <div className="space-y-4">
        {days14.map((day) => {
          const hasDeadlines = day.deadlines.length > 0;
          return (
            <div
              key={day.dateStr}
              className={`p-4 rounded-2xl border transition-all ${
                day.isToday
                  ? "bg-graphite-600/25 border-white/20 shadow-[0_0_24px_rgba(250,250,252,0.06)]"
                  : hasDeadlines
                  ? "bg-graphite-600/18 border-white/10"
                  : "bg-void-900/30 border-white/5 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-signal-white uppercase">
                    {day.dayLabel}
                  </span>
                  <span className="text-xs text-mist-200">{day.monthDay}</span>
                  {day.isToday && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-signal-white text-void-950">
                      Today
                    </span>
                  )}
                </div>
                <span className="text-xs text-mist-200 tabular-nums">
                  {day.deadlines.length} {day.deadlines.length === 1 ? "task" : "tasks"}
                </span>
              </div>

              {hasDeadlines ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {day.deadlines.map((dl) => (
                    <DeadlineCard
                      key={dl.id}
                      deadline={dl}
                      subject={dl.subjectId ? subjectMap.get(dl.subjectId) : null}
                      assessment={riskMap.get(dl.id)}
                      onToggleComplete={handleToggleComplete}
                      onClick={() => {
                        setSelectedDeadline(dl);
                        setIsDetailOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-graphite-400 italic py-1">No deadlines scheduled</p>
              )}
            </div>
          );
        })}
      </div>

      <DeadlineDetailModal
        deadline={selectedDeadline}
        subject={selectedDeadline?.subjectId ? subjectMap.get(selectedDeadline.subjectId) : null}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onToggleComplete={handleToggleComplete}
        onEdit={() => {}}
      />

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
