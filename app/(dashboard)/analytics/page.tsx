"use client";

import { useState, useMemo } from "react";
import { type Deadline, type Subject } from "@/types";
import { calculateStudyAnalytics } from "@/server/domain/analytics";
import { AnalyticsStatCard } from "@/features/analytics/components/AnalyticsStatCard";
import { RiskBreakdownChart } from "@/features/analytics/components/RiskBreakdownChart";
import { SubjectEffortChart } from "@/features/analytics/components/SubjectEffortChart";
import {
  CheckCircle2,
  Clock,
  BarChart2,
  TrendingUp,
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
    progress: 50,
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
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    dueTime: "17:00",
    priority: "medium",
    status: "completed",
    progress: 100,
    estimatedEffortHours: 3.0,
    location: "Physics Lab 102",
    notes: null,
    tags: [],
    links: [],
    recurrenceRuleId: null,
    originalOccurrenceDate: null,
    completedAt: new Date(Date.now() - 86400000 * 3), // completed on time
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

export default function AnalyticsPage() {
  const [deadlines] = useState<Deadline[]>(INITIAL_DEMO_DEADLINES);
  const [subjects] = useState<Subject[]>(INITIAL_DEMO_SUBJECTS);

  // Pure domain analytics calculation
  const analytics = useMemo(() => {
    return calculateStudyAnalytics(deadlines, subjects);
  }, [deadlines, subjects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Study Insights &amp; Analytics
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20">
              V1.5 Insights
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Track completion velocity, on-time punctuality, and effort distributions across courses.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsStatCard
          title="Overall Completion Rate"
          value={`${analytics.completionRatePercent}%`}
          subtitle={`${analytics.completedDeadlines} of ${analytics.totalDeadlines} deadlines done`}
          icon={CheckCircle2}
          variant="success"
        />

        <AnalyticsStatCard
          title="On-Time Punctuality"
          value={`${analytics.onTimeRatePercent}%`}
          subtitle="Completed prior to deadline time"
          icon={TrendingUp}
          variant="accent"
        />

        <AnalyticsStatCard
          title="Remaining Study Effort"
          value={`${analytics.remainingEffortHours}h`}
          subtitle={`Across ${analytics.activeDeadlines} active deadlines`}
          icon={Clock}
          variant={analytics.remainingEffortHours > 10 ? "warning" : "default"}
        />

        <AnalyticsStatCard
          title="Avg Effort Per Task"
          value={`${analytics.averageEffortPerTask}h`}
          subtitle="Estimated time per coursework"
          icon={BarChart2}
          variant="default"
        />
      </div>

      {/* Risk Distribution Breakdown */}
      <RiskBreakdownChart
        breakdown={analytics.riskBreakdown}
        totalActiveTasks={analytics.activeDeadlines}
      />

      {/* Course Effort Breakdown */}
      <SubjectEffortChart summaries={analytics.subjectSummaries} />
    </div>
  );
}
