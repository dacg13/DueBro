"use client";

import { useState, useMemo, useEffect } from "react";
import { type Deadline, type Subject } from "@/types";
import { assessAllDeadlinesRisk } from "@/server/domain/risk";
import { getDaysRemaining } from "@/server/domain/deadlines";
import { getDeadlinesAction, toggleDeadlineCompleteAction } from "@/server/actions/deadlines";
import { getSubjectsAction } from "@/server/actions/subjects";
import { TodayFocusCard } from "@/features/today/components/TodayFocusCard";
import { DeadlineCard } from "@/components/shared/DeadlineCard";
import { DeadlineDetailModal } from "@/features/deadlines/components/DeadlineDetailModal";
import { AddDeadlineDialog } from "@/features/deadlines/components/AddDeadlineDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Calendar,
  Plus,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function TodayPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
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

  // Subject lookup map
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Risk Engine batch assessments
  const riskMap = useMemo(() => {
    return assessAllDeadlinesRisk(deadlines);
  }, [deadlines]);

  // Active deadlines (excluding deleted)
  const activeDeadlines = useMemo(() => {
    return deadlines.filter((d) => !d.deletedAt);
  }, [deadlines]);

  // Categorize deadlines for Today's Planner
  const overdueDeadlines = useMemo(() => {
    return activeDeadlines.filter((d) => {
      if (d.status === "completed" || !d.dueDate) return false;
      return getDaysRemaining(d.dueDate) < 0;
    });
  }, [activeDeadlines]);

  // Top Suggested Focus items: Overdue + Due Today + Highest Risk Tier
  const focusDeadlines = useMemo(() => {
    const candidates = activeDeadlines.filter((d) => d.status !== "completed");

    return [...candidates].sort((a, b) => {
      const riskA = riskMap.get(a.id)?.score ?? 0;
      const riskB = riskMap.get(b.id)?.score ?? 0;
      return riskB - riskA; // Highest risk score first
    }).slice(0, 4);
  }, [activeDeadlines, riskMap]);

  // Upcoming this week (days 1 to 7)
  const upcomingThisWeek = useMemo(() => {
    return activeDeadlines.filter((d) => {
      if (d.status === "completed" || !d.dueDate) return false;
      const days = getDaysRemaining(d.dueDate);
      return days > 0 && days <= 7;
    });
  }, [activeDeadlines]);

  const completedTodayCount = useMemo(() => {
    return activeDeadlines.filter((d) => d.status === "completed").length;
  }, [activeDeadlines]);

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

  const handleOpenDetail = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setIsDetailOpen(true);
  };

  const todayDateString = format(new Date(), "EEEE, MMMM d, yyyy");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-mist-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-signal-white">Today</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-void-850 text-signal-white border border-white/10">
              Daily Planner
            </span>
          </div>
          <p className="text-xs text-mist-200 mt-0.5">
            {todayDateString} &bull; Intelligent focus &amp; deadline intelligence
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2 self-start sm:self-center">
          <Plus className="w-4 h-4" />
          Add Deadline
        </Button>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8">
          <span className="text-xs text-mist-200 font-medium">Focus Tasks</span>
          <p className="text-2xl font-bold text-signal-white mt-1 tabular-nums">
            {focusDeadlines.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8">
          <span className="text-xs text-mist-200 font-medium">Overdue Tasks</span>
          <p className={`text-2xl font-bold mt-1 tabular-nums ${overdueDeadlines.length > 0 ? "text-signal-danger drop-shadow-[0_0_8px_rgba(229,72,77,0.5)]" : "text-signal-white"}`}>
            {overdueDeadlines.length}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-graphite-600/18 backdrop-blur-[20px] border border-white/8">
          <span className="text-xs text-mist-200 font-medium">Completed</span>
          <p className="text-2xl font-bold text-signal-white mt-1 tabular-nums">
            {completedTodayCount}
          </p>
        </div>
      </div>

      {/* Overdue Alert Section (High Urgency) */}
      {overdueDeadlines.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-signal-danger uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Overdue &bull; Requires Attention ({overdueDeadlines.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {overdueDeadlines.map((deadline) => (
              <TodayFocusCard
                key={deadline.id}
                deadline={deadline}
                subject={deadline.subjectId ? subjectMap.get(deadline.subjectId) : null}
                assessment={riskMap.get(deadline.id)}
                onToggleComplete={handleToggleComplete}
                onClick={handleOpenDetail}
              />
            ))}
          </div>
        </div>
      )}

      {/* Today's Suggested Focus Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-signal-white" />
            <h2 className="text-sm font-bold text-signal-white">
              Recommended Focus ({focusDeadlines.length})
            </h2>
          </div>
          <span className="text-xs text-graphite-300">
            Prioritized by Risk Intelligence
          </span>
        </div>

        {focusDeadlines.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All clear for today!"
            description="You have no pending deadlines scheduled for today. Add your next assignment or exam."
            actionLabel="Add Deadline"
            onAction={() => setIsAddOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {focusDeadlines.map((deadline) => (
              <TodayFocusCard
                key={deadline.id}
                deadline={deadline}
                subject={deadline.subjectId ? subjectMap.get(deadline.subjectId) : null}
                assessment={riskMap.get(deadline.id)}
                onToggleComplete={handleToggleComplete}
                onClick={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming This Week Section */}
      {upcomingThisWeek.length > 0 && (
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-graphite-300" />
              <h2 className="text-sm font-bold text-signal-white">
                Upcoming This Week ({upcomingThisWeek.length})
              </h2>
            </div>
            <Link
              href="/deadlines"
              className="text-xs text-mist-200 hover:text-signal-white flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {upcomingThisWeek.map((deadline) => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                subject={deadline.subjectId ? subjectMap.get(deadline.subjectId) : null}
                assessment={riskMap.get(deadline.id)}
                onToggleComplete={handleToggleComplete}
                onClick={handleOpenDetail}
              />
            ))}
          </div>
        </div>
      )}

      {/* Deadline Detail Modal */}
      <DeadlineDetailModal
        deadline={selectedDeadline}
        subject={selectedDeadline?.subjectId ? subjectMap.get(selectedDeadline.subjectId) : null}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onToggleComplete={handleToggleComplete}
        onEdit={() => {}}
      />

      {/* Add Deadline Dialog */}
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
