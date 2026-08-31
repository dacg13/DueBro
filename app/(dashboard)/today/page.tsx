"use client";

import { useState, useMemo } from "react";
import { type Deadline, type Subject } from "@/types";
import { assessAllDeadlinesRisk, detectWorkloadClusters } from "@/server/domain/risk";
import { getDaysRemaining } from "@/server/domain/deadlines";
import { toggleDeadlineCompleteAction } from "@/server/actions/deadlines";
import { WorkloadCapacityMeter } from "@/features/today/components/WorkloadCapacityMeter";
import { ClusterWarningBanner } from "@/features/today/components/ClusterWarningBanner";
import { TodayFocusCard } from "@/features/today/components/TodayFocusCard";
import { QuickLogEffortModal } from "@/features/today/components/QuickLogEffortModal";
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
} from "lucide-react";
import Link from "next/link";

// Initial demonstration data representing an active semester workload
const INITIAL_DEMO_SUBJECTS: Subject[] = [
  {
    id: "sub-cs101",
    termId: "term-1",
    userId: "demo-user",
    name: "CS101 Algorithms",
    color: "#5B6EF5",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub-math201",
    termId: "term-1",
    userId: "demo-user",
    name: "MATH201 Linear Algebra",
    color: "#2DB5A5",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub-phys150",
    termId: "term-1",
    userId: "demo-user",
    name: "PHYS150 Mechanics",
    color: "#E0A030",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const INITIAL_DEMO_DEADLINES: Deadline[] = [
  {
    id: "dl-1",
    userId: "demo-user",
    subjectId: "sub-cs101",
    termId: "term-1",
    title: "Dynamic Programming Problem Set 4",
    type: "assignment",
    dueDate: new Date().toISOString().split("T")[0], // Due Today!
    dueTime: "23:59",
    priority: "high",
    status: "in_progress",
    progress: 60,
    estimatedEffortHours: 4.0,
    location: null,
    notes: "Submit PDF via Gradescope. Complete memoization analysis for problem 3.",
    tags: ["homework", "gradescope"],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dl-2",
    userId: "demo-user",
    subjectId: "sub-math201",
    termId: "term-1",
    title: "Midterm Exam: Vector Spaces & Eigenvalues",
    type: "exam",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0], // In 3 days (High Risk Exam)
    dueTime: "10:00",
    priority: "critical",
    status: "not_started",
    progress: 10,
    estimatedEffortHours: 8.0,
    location: "Hall B, Room 204",
    notes: "Closed book exam. 1 sheet handwritten notes permitted.",
    tags: ["midterm", "exam"],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dl-3",
    userId: "demo-user",
    subjectId: "sub-phys150",
    termId: "term-1",
    title: "Lab Report 3: Rotational Inertia",
    type: "lab",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0], // Tomorrow
    dueTime: "17:00",
    priority: "medium",
    status: "not_started",
    progress: 25,
    estimatedEffortHours: 2.5,
    location: "Physics Lab 102",
    notes: "Include error analysis and uncertainty propagation tables.",
    tags: ["lab"],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dl-4",
    userId: "demo-user",
    subjectId: "sub-cs101",
    termId: "term-1",
    title: "Weekly Reading: CLRS Chapter 15",
    type: "reading",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0], // Overdue!
    dueTime: "23:59",
    priority: "low",
    status: "overdue",
    progress: 0,
    estimatedEffortHours: 1.5,
    location: null,
    notes: "Pages 359-389.",
    tags: ["reading"],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function TodayPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>(INITIAL_DEMO_DEADLINES);
  const [subjects] = useState<Subject[]>(INITIAL_DEMO_SUBJECTS);

  // Student configured capacity (default 2.0h weekday, 4.0h weekend)
  const userCapacity = useMemo(() => ({ daily: 2.5, weekend: 4.0 }), []);

  // Modals state
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [logEffortDeadline, setLogEffortDeadline] = useState<Deadline | null>(null);
  const [isLogEffortOpen, setIsLogEffortOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Subject lookup map
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Risk Engine batch assessments
  const riskMap = useMemo(() => {
    return assessAllDeadlinesRisk(deadlines, userCapacity);
  }, [deadlines, userCapacity]);

  // Workload Congestion Clusters
  const activeClusters = useMemo(() => {
    return detectWorkloadClusters(deadlines);
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

  // Total planned study effort for today
  const totalPlannedHoursToday = useMemo(() => {
    let hours = 0;
    for (const d of focusDeadlines) {
      const effort = d.estimatedEffortHours ?? 2.0;
      const remaining = effort * (1 - d.progress / 100);
      hours += remaining;
    }
    return Number(hours.toFixed(1));
  }, [focusDeadlines]);

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

  const handleOpenLogEffort = (deadline: Deadline) => {
    setLogEffortDeadline(deadline);
    setIsLogEffortOpen(true);
  };

  const handleProgressLogged = (updated: Deadline) => {
    setDeadlines((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const todayDateString = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Today</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20">
              Daily Planner
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {todayDateString} &bull; Intelligent focus &amp; workload pacing
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2 self-start sm:self-center">
          <Plus className="w-4 h-4" />
          Add Deadline
        </Button>
      </div>

      {/* Workload Capacity Meter */}
      <WorkloadCapacityMeter
        plannedHours={totalPlannedHoursToday}
        capacityHours={userCapacity.daily}
        taskCount={focusDeadlines.length}
      />

      {/* Workload Congestion Alert Banner (if multi-deadline congestion detected) */}
      <ClusterWarningBanner clusters={activeClusters} />

      {/* Overdue Alert Section (High Urgency) */}
      {overdueDeadlines.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-risk-overdue uppercase tracking-wider">
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
                onLogEffort={handleOpenLogEffort}
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
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h3 className="text-sm font-bold text-text-primary">
              Recommended Focus ({focusDeadlines.length})
            </h3>
          </div>
          <span className="text-xs text-text-tertiary">
            Prioritized by Risk Engine
          </span>
        </div>

        {focusDeadlines.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All clear for today!"
            description="You have completed all scheduled tasks. Take a break or add your next assignment."
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
                onLogEffort={handleOpenLogEffort}
                onClick={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming This Week Preview */}
      {upcomingThisWeek.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border-default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-text-tertiary" />
              <span>Upcoming This Week ({upcomingThisWeek.length})</span>
            </div>
            <Link
              href="/deadlines"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* Detail Modal */}
      <DeadlineDetailModal
        deadline={selectedDeadline}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        subject={selectedDeadline?.subjectId ? subjectMap.get(selectedDeadline.subjectId) : null}
        onEdit={(d) => {
          setSelectedDeadline(d);
          setIsAddOpen(true);
        }}
        onDeleteSuccess={(id) => setDeadlines((prev) => prev.filter((d) => d.id !== id))}
      />

      {/* Quick Log Effort Modal */}
      <QuickLogEffortModal
        deadline={logEffortDeadline}
        subject={logEffortDeadline?.subjectId ? subjectMap.get(logEffortDeadline.subjectId) : null}
        isOpen={isLogEffortOpen}
        onClose={() => setIsLogEffortOpen(false)}
        onSuccess={handleProgressLogged}
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
