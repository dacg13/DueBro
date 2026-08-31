"use client";

import { useState, useMemo } from "react";
import { type Deadline, type Subject } from "@/types";
import { generateDeterministicSchedule } from "@/server/domain/scheduling-engine";
import { WorkloadTimeline } from "@/features/workload/components/WorkloadTimeline";
import { DailyChunkCard } from "@/features/workload/components/DailyChunkCard";
import { CapacityTuner } from "@/features/workload/components/CapacityTuner";
import { ShortfallWarningBanner } from "@/features/workload/components/ShortfallWarningBanner";
import { QuickLogEffortModal } from "@/features/today/components/QuickLogEffortModal";
import { DeadlineDetailModal } from "@/features/deadlines/components/DeadlineDetailModal";
import { AddDeadlineDialog } from "@/features/deadlines/components/AddDeadlineDialog";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

// Initial demonstration data
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
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    dueTime: "23:59",
    priority: "high",
    status: "in_progress",
    progress: 40,
    estimatedEffortHours: 4.5,
    location: null,
    notes: null,
    tags: [],
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
    title: "Midterm Exam: Vector Spaces",
    type: "exam",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    dueTime: "10:00",
    priority: "critical",
    status: "not_started",
    progress: 10,
    estimatedEffortHours: 8.0,
    location: "Hall B, Room 204",
    notes: null,
    tags: [],
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
    title: "Lab Report 3",
    type: "lab",
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0],
    dueTime: "17:00",
    priority: "medium",
    status: "not_started",
    progress: 20,
    estimatedEffortHours: 3.0,
    location: "Physics Lab 102",
    notes: null,
    tags: [],
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
    title: "Graph Algorithms Problem Set 5",
    type: "assignment",
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0],
    dueTime: "23:59",
    priority: "high",
    status: "not_started",
    progress: 0,
    estimatedEffortHours: 6.0,
    location: null,
    notes: null,
    tags: [],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function WorkloadPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>(INITIAL_DEMO_DEADLINES);
  const [subjects] = useState<Subject[]>(INITIAL_DEMO_SUBJECTS);

  // Capacity Tuner states
  const [weekdayHours, setWeekdayHours] = useState(2.5);
  const [weekendHours, setWeekendHours] = useState(4.5);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Modals state
  const [activeDeadlineForLog, setActiveDeadlineForLog] = useState<Deadline | null>(null);
  const [selectedDeadlineForDetail, setSelectedDeadlineForDetail] = useState<Deadline | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Subject lookup
  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Consumes pure scheduling-engine directly! (Does not re-derive)
  const scheduleResult = useMemo(() => {
    return generateDeterministicSchedule(deadlines, {
      startDate: new Date(),
      daysToPlan: 14,
      weekdayCapacityHours: weekdayHours,
      weekendCapacityHours: weekendHours,
      minChunkHours: 0.5,
      maxChunkHours: 2.5,
    });
  }, [deadlines, weekdayHours, weekendHours]);

  // Selected day's plan
  const activeDayPlan = useMemo(() => {
    return (
      scheduleResult.dailyPlans.find((p) => p.date === selectedDate) ||
      scheduleResult.dailyPlans[0]
    );
  }, [scheduleResult, selectedDate]);

  const formattedSelectedDay = activeDayPlan
    ? format(parseISO(activeDayPlan.date), "EEEE, MMMM d, yyyy")
    : "Selected Day";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Workload Pacing &amp; Capacity Planner
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20">
              V1.5 Smart Planner
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Deterministic workload smoothing distributes study hours evenly to avoid exam cramming and burnout.
          </p>
        </div>

        {/* Global Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-bg-surface border border-border-default flex items-center gap-1.5 tabular-nums">
            <BarChart3 className="w-3.5 h-3.5 text-accent" />
            <span className="text-text-secondary">14-Day Effort:</span>
            <span className="font-bold text-text-primary">{scheduleResult.totalEffortAllocated.toFixed(1)}h</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-bg-surface border border-border-default flex items-center gap-1.5 tabular-nums">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span className="text-text-secondary">Avg Daily Load:</span>
            <span className="font-bold text-text-primary">
              {(scheduleResult.totalEffortAllocated / 14).toFixed(1)}h/day
            </span>
          </div>
        </div>
      </div>

      {/* Shortfall Warnings Banner */}
      <ShortfallWarningBanner shortfalls={scheduleResult.shortfalls} />

      {/* Capacity Tuner Controls */}
      <CapacityTuner
        weekdayHours={weekdayHours}
        weekendHours={weekendHours}
        onChangeWeekday={setWeekdayHours}
        onChangeWeekend={setWeekendHours}
      />

      {/* 14-Day Timeline Heatmap */}
      <WorkloadTimeline
        plans={scheduleResult.dailyPlans}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Selected Day Breakdown */}
      {activeDayPlan && (
        <div className="rounded-2xl bg-bg-surface border border-border-default p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border-default pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">{formattedSelectedDay}</h3>
                <div className="text-xs text-text-secondary flex items-center gap-1.5 tabular-nums">
                  <span>Planned: <strong className="text-accent">{activeDayPlan.allocatedHours.toFixed(1)}h</strong></span>
                  <span>&bull;</span>
                  <span>Capacity: {activeDayPlan.capacityHours.toFixed(1)}h ({activeDayPlan.utilizationPercent.toFixed(0)}% load)</span>
                </div>
              </div>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-bg-elevated text-text-secondary border border-border-default tabular-nums">
              {activeDayPlan.chunks.length} Study Session{activeDayPlan.chunks.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Session Chunks List */}
          <div className="space-y-2.5">
            {activeDayPlan.chunks.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-tertiary">
                No study sessions scheduled for this date.
              </div>
            ) : (
              activeDayPlan.chunks.map((chunk) => (
                <DailyChunkCard
                  key={chunk.id}
                  chunk={chunk}
                  subject={chunk.subjectId ? subjectMap.get(chunk.subjectId) : null}
                  onOpenDeadline={(dlId) => {
                    const found = deadlines.find((d) => d.id === dlId);
                    if (found) {
                      setSelectedDeadlineForDetail(found);
                      setIsDetailOpen(true);
                    }
                  }}
                  onQuickLog={(dlId) => {
                    const found = deadlines.find((d) => d.id === dlId);
                    if (found) {
                      setActiveDeadlineForLog(found);
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Effort Logger Modal */}
      <QuickLogEffortModal
        deadline={activeDeadlineForLog}
        subject={activeDeadlineForLog?.subjectId ? subjectMap.get(activeDeadlineForLog.subjectId) : null}
        isOpen={Boolean(activeDeadlineForLog)}
        onClose={() => setActiveDeadlineForLog(null)}
        onSuccess={(updated) => {
          setDeadlines((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
          setActiveDeadlineForLog(null);
        }}
      />

      {/* Deadline Detail Inspection Modal */}
      <DeadlineDetailModal
        deadline={selectedDeadlineForDetail}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        subject={
          selectedDeadlineForDetail?.subjectId
            ? subjectMap.get(selectedDeadlineForDetail.subjectId)
            : null
        }
        onEdit={(dl) => {
          setSelectedDeadlineForDetail(dl);
          setIsAddOpen(true);
        }}
        onDeleteSuccess={(id) =>
          setDeadlines((prev) => prev.filter((d) => d.id !== id))
        }
      />

      {/* Add / Edit Deadline Dialog */}
      <AddDeadlineDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        subjects={subjects}
        initialData={selectedDeadlineForDetail}
        onSuccess={(saved) => {
          setDeadlines((prev) => {
            const exists = prev.some((d) => d.id === saved.id);
            return exists ? prev.map((d) => (d.id === saved.id ? saved : d)) : [saved, ...prev];
          });
        }}
      />
    </div>
  );
}
