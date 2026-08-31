/**
 * Domain Module: Risk Engine & Workload Clustering
 *
 * Responsibilities:
 * - Pure algorithmic evaluation of deadline risk scores & tiers
 * - Time-decay, effort remaining vs available study capacity modeling
 * - Multipliers for priority and exam proximity
 * - Rolling 3-day window workload cluster detection
 *
 * Constraints:
 * - Pure functions only — no direct database I/O.
 */

import { type Deadline, type Priority, type DeadlineType, type RiskAssessment, type RiskTier, type WorkloadCluster } from "@/types";
import { calculateRemainingEffort, isDeadlineOverdue, getDaysRemaining } from "../deadlines";
import { parseISO, startOfDay, addDays, isWeekend, isBefore, isAfter, format } from "date-fns";

export const RISK_TIER_COLORS: Record<RiskTier, string> = {
  safe: "#3FB56E",
  low: "#5B6EF5",
  medium: "#E0A030",
  high: "#E8783D",
  critical: "#E5484D",
  overdue: "#B23A3E",
};

export const RISK_TIER_LABELS: Record<RiskTier, string> = {
  safe: "Safe",
  low: "Low Risk",
  medium: "Moderate Risk",
  high: "High Risk",
  critical: "Critical Risk",
  overdue: "Overdue",
};

const PRIORITY_MULTIPLIERS: Record<Priority, number> = {
  low: 0.8,
  medium: 1.0,
  high: 1.2,
  critical: 1.5,
};

/**
 * Calculates total available study capacity in hours between two dates.
 * Considers weekday vs. weekend capacity settings.
 */
export function calculateAvailableCapacity(
  startDate: Date,
  endDate: Date,
  dailyCapacityHours: number = 2.0,
  weekendCapacityHours: number = 4.0
): number {
  let current = startOfDay(startDate);
  const end = startOfDay(endDate);

  if (isAfter(current, end)) {
    // Due today or in past — minimum window calculation for remaining day
    return Math.max(0.5, dailyCapacityHours);
  }

  let totalCapacity = 0;

  while (!isAfter(current, end)) {
    if (isWeekend(current)) {
      totalCapacity += weekendCapacityHours;
    } else {
      totalCapacity += dailyCapacityHours;
    }
    current = addDays(current, 1);
  }

  return Math.max(0.5, totalCapacity);
}

/**
 * Returns the priority weighting multiplier.
 */
export function getPriorityMultiplier(priority: Priority): number {
  return PRIORITY_MULTIPLIERS[priority] ?? 1.0;
}

/**
 * Returns the exam proximity escalation multiplier.
 * PRODUCT_PRD.md §13: Exam risk scales 1.5x within 7 days, 1.2x within 14 days.
 */
export function getExamMultiplier(type: DeadlineType, daysRemaining: number): number {
  if (type !== "exam") return 1.0;
  if (daysRemaining <= 7) return 1.5;
  if (daysRemaining <= 14) return 1.2;
  return 1.0;
}

/**
 * Calculates the risk assessment for a single deadline.
 */
export function calculateDeadlineRisk(
  deadline: Deadline,
  options: {
    dailyCapacityHours?: number;
    weekendCapacityHours?: number;
    isInCluster?: boolean;
    now?: Date;
  } = {}
): RiskAssessment {
  const now = options.now ?? new Date();
  const dailyCap = options.dailyCapacityHours ?? 2.0;
  const weekendCap = options.weekendCapacityHours ?? 4.0;
  const isInCluster = options.isInCluster ?? false;

  // 1. Check Overdue
  const isOverdue = isDeadlineOverdue(deadline.dueDate, deadline.dueTime, deadline.status, now);
  if (isOverdue) {
    const days = deadline.dueDate ? getDaysRemaining(deadline.dueDate, now) : 0;
    return {
      deadlineId: deadline.id,
      score: 2.0,
      tier: "overdue",
      color: RISK_TIER_COLORS.overdue,
      label: RISK_TIER_LABELS.overdue,
      effortRemainingHours: calculateRemainingEffort(deadline.estimatedEffortHours, deadline.progress),
      availableCapacityHours: 0,
      daysRemaining: days,
      isOverdue: true,
      isInCluster,
      explanation: "Deadline is past due date and incomplete.",
    };
  }

  // 2. Completed deadlines are Safe with score 0
  if (deadline.status === "completed") {
    return {
      deadlineId: deadline.id,
      score: 0,
      tier: "safe",
      color: RISK_TIER_COLORS.safe,
      label: "Completed",
      effortRemainingHours: 0,
      availableCapacityHours: 0,
      daysRemaining: deadline.dueDate ? getDaysRemaining(deadline.dueDate, now) : 0,
      isOverdue: false,
      isInCluster: false,
      explanation: "Completed task.",
    };
  }

  // 3. No due date set -> Default Low/Safe
  if (!deadline.dueDate) {
    return {
      deadlineId: deadline.id,
      score: 0.1,
      tier: "safe",
      color: RISK_TIER_COLORS.safe,
      label: RISK_TIER_LABELS.safe,
      effortRemainingHours: calculateRemainingEffort(deadline.estimatedEffortHours, deadline.progress),
      availableCapacityHours: dailyCap * 7,
      daysRemaining: 99,
      isOverdue: false,
      isInCluster: false,
      explanation: "No due date assigned.",
    };
  }

  // 4. Compute Effort Remaining & Capacity
  const targetDate = typeof deadline.dueDate === "string" ? parseISO(deadline.dueDate) : deadline.dueDate;
  const daysRemaining = getDaysRemaining(targetDate, now);
  const effortRemainingHours = calculateRemainingEffort(deadline.estimatedEffortHours, deadline.progress);
  const availableCapacityHours = calculateAvailableCapacity(now, targetDate, dailyCap, weekendCap);

  // 5. Compute Base Ratio & Multipliers
  const baseRatio = effortRemainingHours / Math.max(0.5, availableCapacityHours);
  const priorityMult = getPriorityMultiplier(deadline.priority);
  const examMult = getExamMultiplier(deadline.type, daysRemaining);
  const clusterMult = isInCluster ? 1.15 : 1.0;

  const rawScore = baseRatio * priorityMult * examMult * clusterMult;
  const score = Number(rawScore.toFixed(3));

  // 6. Map to Tier
  let tier: RiskTier = "safe";
  if (score >= 1.0) {
    tier = "critical";
  } else if (score >= 0.75) {
    tier = "high";
  } else if (score >= 0.5) {
    tier = "medium";
  } else if (score >= 0.25) {
    tier = "low";
  } else {
    tier = "safe";
  }

  let explanation = `${daysRemaining} days remaining until due date.`;
  if (tier === "critical") {
    explanation = `High urgency: due within ${daysRemaining} days!`;
  } else if (examMult > 1.0) {
    explanation = `Upcoming exam within ${daysRemaining} days.`;
  }

  return {
    deadlineId: deadline.id,
    score,
    tier,
    color: RISK_TIER_COLORS[tier],
    label: RISK_TIER_LABELS[tier],
    effortRemainingHours,
    availableCapacityHours,
    daysRemaining,
    isOverdue: false,
    isInCluster,
    explanation,
  };
}

/**
 * Workload Clustering Detection
 * PRODUCT_PRD.md §13 & §14:
 * Detects 3-day rolling windows with >=3 active deadlines OR >8h required effort.
 */
export function detectWorkloadClusters(
  deadlinesList: Deadline[],
  options: {
    rollingDays?: number;
    deadlineThreshold?: number;
    effortThreshold?: number;
    now?: Date;
  } = {}
): WorkloadCluster[] {
  const now = options.now ?? new Date();
  const rollingDays = options.rollingDays ?? 3;
  const deadlineThreshold = options.deadlineThreshold ?? 3;
  const effortThreshold = options.effortThreshold ?? 8.0;

  const activeDeadlines = deadlinesList.filter(
    (d) => d.status !== "completed" && !d.deletedAt && d.dueDate
  );

  if (activeDeadlines.length === 0) return [];

  // Group deadlines by date
  const dateBuckets = new Map<string, Deadline[]>();
  for (const d of activeDeadlines) {
    const key = d.dueDate!;
    if (!dateBuckets.has(key)) dateBuckets.set(key, []);
    dateBuckets.get(key)!.push(d);
  }

  // Scan rolling windows across next 30 days
  const clusters: WorkloadCluster[] = [];
  const startDay = startOfDay(now);

  for (let i = 0; i < 30; i++) {
    const windowStart = addDays(startDay, i);
    const windowEnd = addDays(windowStart, rollingDays - 1);

    const windowStartStr = format(windowStart, "yyyy-MM-dd");
    const windowEndStr = format(windowEnd, "yyyy-MM-dd");

    const matchedDeadlines: Deadline[] = [];
    let totalEffort = 0;

    for (const d of activeDeadlines) {
      const dDate = parseISO(d.dueDate!);
      if (!isBefore(dDate, windowStart) && !isAfter(dDate, windowEnd)) {
        matchedDeadlines.push(d);
        totalEffort += calculateRemainingEffort(d.estimatedEffortHours, d.progress);
      }
    }

    const count = matchedDeadlines.length;
    const isTriggered = count >= deadlineThreshold || totalEffort > effortThreshold;

    if (isTriggered) {
      let reason = "";
      if (count >= deadlineThreshold && totalEffort > effortThreshold) {
        reason = `${count} deadlines totaling ${totalEffort.toFixed(1)}h due within 3 days.`;
      } else if (count >= deadlineThreshold) {
        reason = `${count} deadlines due within 3 days.`;
      } else {
        reason = `Heavy workload: ${totalEffort.toFixed(1)}h of effort due within 3 days.`;
      }

      clusters.push({
        startDate: windowStartStr,
        endDate: windowEndStr,
        deadlineIds: matchedDeadlines.map((d) => d.id),
        totalEffortHours: Number(totalEffort.toFixed(1)),
        deadlineCount: count,
        isTriggered: true,
        reason,
      });

      // Advance by rolling window to avoid duplicate adjacent clusters
      i += rollingDays - 1;
    }
  }

  return clusters;
}

/**
 * Assesses risk for a full batch of deadlines, factoring in active cluster memberships.
 */
export function assessAllDeadlinesRisk(
  deadlinesList: Deadline[],
  userCapacity: { daily: number; weekend: number } = { daily: 2.0, weekend: 4.0 },
  now = new Date()
): Map<string, RiskAssessment> {
  const clusters = detectWorkloadClusters(deadlinesList, { now });
  const clusteredDeadlineIds = new Set<string>();
  clusters.forEach((c) => c.deadlineIds.forEach((id) => clusteredDeadlineIds.add(id)));

  const resultMap = new Map<string, RiskAssessment>();

  for (const deadline of deadlinesList) {
    const isInCluster = clusteredDeadlineIds.has(deadline.id);
    const assessment = calculateDeadlineRisk(deadline, {
      dailyCapacityHours: userCapacity.daily,
      weekendCapacityHours: userCapacity.weekend,
      isInCluster,
      now,
    });
    resultMap.set(deadline.id, assessment);
  }

  return resultMap;
}
