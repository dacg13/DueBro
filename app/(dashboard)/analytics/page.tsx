"use client";

import { useState, useMemo, useEffect } from "react";
import { type Deadline, type Subject } from "@/types";
import { calculateStudyAnalytics } from "@/server/domain/analytics";
import { AnalyticsStatCard } from "@/features/analytics/components/AnalyticsStatCard";
import { RiskBreakdownChart } from "@/features/analytics/components/RiskBreakdownChart";
import { SubjectEffortChart } from "@/features/analytics/components/SubjectEffortChart";
import { getDeadlinesAction } from "@/server/actions/deadlines";
import { getSubjectsAction } from "@/server/actions/subjects";
import {
  CheckCircle2,
  TrendingUp,
  ListTodo,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function AnalyticsPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDeadlinesAction(), getSubjectsAction()]).then(([dlRes, subRes]) => {
      if (dlRes.data) setDeadlines(dlRes.data);
      if (subRes.data) setSubjects(subRes.data);
      setIsLoading(false);
    });
  }, []);

  const analytics = useMemo(() => {
    return calculateStudyAnalytics(deadlines, subjects);
  }, [deadlines, subjects]);

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
            <h1 className="text-2xl font-bold tracking-tight text-signal-white">
              Coursework &amp; Performance Insights
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-void-850 text-signal-white border border-white/10">
              Analytics
            </span>
          </div>
          <p className="text-xs text-mist-200 mt-0.5">
            Track completion velocity, on-time punctuality, and coursework distribution.
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
          subtitle="Completed prior to deadline"
          icon={TrendingUp}
          variant="accent"
        />

        <AnalyticsStatCard
          title="Active Deadlines"
          value={`${analytics.activeDeadlines}`}
          subtitle="Incomplete tasks pending"
          icon={ListTodo}
          variant="default"
        />

        <AnalyticsStatCard
          title="Completed Coursework"
          value={`${analytics.completedDeadlines}`}
          subtitle="Successfully submitted"
          icon={Sparkles}
          variant="default"
        />
      </div>

      {/* Risk Distribution Breakdown */}
      <RiskBreakdownChart
        breakdown={analytics.riskBreakdown}
        totalActiveTasks={analytics.activeDeadlines}
      />

      {/* Course Breakdown */}
      <SubjectEffortChart summaries={analytics.subjectSummaries} />
    </div>
  );
}
