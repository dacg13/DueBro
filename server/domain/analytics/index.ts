/**
 * Domain Module: Academic & Study Workload Analytics (V1.5)
 *
 * Responsibilities:
 * - Computes historical completion rates and on-time performance
 * - Aggregates risk tier distribution across active tasks
 * - Calculates study effort invested vs remaining per course
 *
 * Constraints:
 * - Pure functions only — no direct database I/O.
 */

import {
  type Deadline,
  type Subject,
  type StudyAnalyticsSummary,
  type SubjectEffortSummary,
  type RiskTierBreakdown,
  type RiskTier,
} from "@/types";
import { calculateDeadlineRisk } from "@/server/domain/risk";
import { parseISO, isAfter, startOfDay } from "date-fns";

const RISK_COLORS: Record<RiskTier, { label: string; color: string }> = {
  safe: { label: "Safe", color: "#3FB56E" },
  low: { label: "Low", color: "#5B6EF5" },
  medium: { label: "Medium", color: "#E0A030" },
  high: { label: "High", color: "#E8783D" },
  critical: { label: "Critical", color: "#E5484D" },
  overdue: { label: "Overdue", color: "#B23A3E" },
};

/**
 * Pure analytics aggregator computing completion rates, risk breakdown, and effort metrics.
 */
export function calculateStudyAnalytics(
  deadlines: Deadline[],
  subjects: Subject[],
  now: Date = new Date()
): StudyAnalyticsSummary {
  const activeDeadlines = deadlines.filter((d) => !d.deletedAt);
  const totalDeadlines = activeDeadlines.length;

  if (totalDeadlines === 0) {
    return {
      totalDeadlines: 0,
      completedDeadlines: 0,
      activeDeadlines: 0,
      overdueDeadlines: 0,
      completionRatePercent: 0,
      onTimeRatePercent: 100,
      totalEffortHours: 0,
      completedEffortHours: 0,
      remainingEffortHours: 0,
      averageEffortPerTask: 0,
      riskBreakdown: [],
      subjectSummaries: [],
    };
  }

  const today = startOfDay(now);
  let completedCount = 0;
  let onTimeCompletedCount = 0;
  let overdueCount = 0;
  let totalEffort = 0;
  let completedEffort = 0;

  const riskCounts: Record<RiskTier, number> = {
    safe: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
    overdue: 0,
  };

  const activeIncompleteList: Deadline[] = [];

  for (const dl of activeDeadlines) {
    const rawEffort = dl.estimatedEffortHours ?? 2.0;
    totalEffort += rawEffort;

    const progressFrac = Math.min(Math.max((dl.progress || 0) / 100, 0), 1);
    completedEffort += rawEffort * progressFrac;

    if (dl.status === "completed") {
      completedCount++;
      // Check if completed on time
      if (dl.completedAt && dl.dueDate) {
        const completedDay = startOfDay(new Date(dl.completedAt));
        const dueDay = startOfDay(parseISO(dl.dueDate));
        if (!isAfter(completedDay, dueDay)) {
          onTimeCompletedCount++;
        }
      } else {
        onTimeCompletedCount++;
      }
    } else {
      activeIncompleteList.push(dl);
      // Check if overdue
      if (dl.dueDate) {
        const dueDay = startOfDay(parseISO(dl.dueDate));
        if (isAfter(today, dueDay)) {
          overdueCount++;
        }
      }

      // Assess Risk Tier
      const risk = calculateDeadlineRisk(dl, { now });
      riskCounts[risk.tier] = (riskCounts[risk.tier] || 0) + 1;
    }
  }

  const remainingEffort = Math.max(totalEffort - completedEffort, 0);
  const activeCount = totalDeadlines - completedCount;

  const completionRate = Number(
    ((completedCount / totalDeadlines) * 100).toFixed(1)
  );

  const onTimeRate =
    completedCount > 0
      ? Number(((onTimeCompletedCount / completedCount) * 100).toFixed(1))
      : 100;

  // Build Risk Breakdown Array
  const riskBreakdown: RiskTierBreakdown[] = (
    Object.keys(riskCounts) as RiskTier[]
  ).map((tier) => {
    const count = riskCounts[tier];
    const pct = activeCount > 0 ? Number(((count / activeCount) * 100).toFixed(1)) : 0;
    return {
      tier,
      label: RISK_COLORS[tier].label,
      count,
      percent: pct,
      color: RISK_COLORS[tier].color,
    };
  });

  // Build Subject Effort Summaries
  const subjectSummaries: SubjectEffortSummary[] = subjects.map((sub) => {
    const subDeadlines = activeDeadlines.filter((d) => d.subjectId === sub.id);
    const subTotal = subDeadlines.length;
    const subCompleted = subDeadlines.filter((d) => d.status === "completed").length;

    let subTotalHours = 0;
    let subCompletedHours = 0;

    for (const d of subDeadlines) {
      const effort = d.estimatedEffortHours ?? 2.0;
      subTotalHours += effort;
      const frac = Math.min(Math.max((d.progress || 0) / 100, 0), 1);
      subCompletedHours += effort * frac;
    }

    const subRemaining = Math.max(subTotalHours - subCompletedHours, 0);
    const subRate = subTotal > 0 ? Number(((subCompleted / subTotal) * 100).toFixed(1)) : 0;

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      color: sub.color,
      totalTasks: subTotal,
      completedTasks: subCompleted,
      totalEstimatedHours: Number(subTotalHours.toFixed(1)),
      remainingHours: Number(subRemaining.toFixed(1)),
      completionRatePercent: subRate,
    };
  });

  return {
    totalDeadlines,
    completedDeadlines: completedCount,
    activeDeadlines: activeCount,
    overdueDeadlines: overdueCount,
    completionRatePercent: completionRate,
    onTimeRatePercent: onTimeRate,
    totalEffortHours: Number(totalEffort.toFixed(1)),
    completedEffortHours: Number(completedEffort.toFixed(1)),
    remainingEffortHours: Number(remainingEffort.toFixed(1)),
    averageEffortPerTask: Number((totalEffort / totalDeadlines).toFixed(1)),
    riskBreakdown,
    subjectSummaries,
  };
}
