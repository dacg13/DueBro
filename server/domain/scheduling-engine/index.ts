/**
 * Domain Module: Smart Planning & Scheduling Engine (V1.5)
 *
 * Responsibilities:
 * - Deterministic workload distribution algorithm (ANTIGRAVITY_BUILD_PROMPT.md line 103)
 * - Allocates remaining effort hours evenly across lead days before each deadline
 * - Respects weekday (2.0h) vs weekend (4.0h) capacity limits
 * - Priority preemption (Critical & High priority deadlines claim capacity first)
 * - Detects workload shortfalls when effort exceeds cumulative capacity
 *
 * Constraints:
 * - Pure functions only — no direct database I/O.
 */

import {
  type Deadline,
  type DailyWorkloadPlan,
  type ScheduledSessionChunk,
  type WorkloadShortfall,
  type SchedulingOptions,
  type ScheduleGenerationResult,
  type Priority,
} from "@/types";
import {
  startOfDay,
  addDays,
  format,
  parseISO,
  isAfter,
  isWeekend,
} from "date-fns";

const PRIORITY_RANK: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Deterministically distributes study effort across calendar days before due dates.
 */
export function generateDeterministicSchedule(
  deadlines: Deadline[],
  options: SchedulingOptions = {}
): ScheduleGenerationResult {
  const {
    startDate = new Date(),
    daysToPlan = 14,
    weekdayCapacityHours = 2.0,
    weekendCapacityHours = 4.0,
    minChunkHours = 0.5,
    maxChunkHours = 2.5,
  } = options;

  const planStart = startOfDay(startDate);

  // 1. Initialize daily capacity buckets
  const days: Array<{
    dateStr: string;
    date: Date;
    dayName: string;
    capacityHours: number;
    remainingCapacity: number;
    chunks: ScheduledSessionChunk[];
  }> = [];

  for (let i = 0; i < daysToPlan; i++) {
    const d = addDays(planStart, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const isWknd = isWeekend(d);
    const capacity = isWknd ? weekendCapacityHours : weekdayCapacityHours;

    days.push({
      dateStr,
      date: d,
      dayName: format(d, "EEEE"),
      capacityHours: capacity,
      remainingCapacity: capacity,
      chunks: [],
    });
  }

  // 2. Filter active deadlines
  const activeDeadlines = deadlines.filter(
    (d) => !d.deletedAt && d.status !== "completed" && d.dueDate
  );

  // 3. Sort deadlines: higher priority first, earlier due date second
  const sortedDeadlines = [...activeDeadlines].sort((a, b) => {
    const pA = PRIORITY_RANK[a.priority];
    const pB = PRIORITY_RANK[b.priority];
    if (pA !== pB) return pB - pA; // Descending priority
    return (a.dueDate || "").localeCompare(b.dueDate || "");
  });

  const shortfalls: WorkloadShortfall[] = [];
  let totalEffortAllocated = 0;
  let totalShortfallHours = 0;

  // 4. Distribute each deadline's remaining effort
  for (const dl of sortedDeadlines) {
    const rawEffort = dl.estimatedEffortHours ?? 2.0;
    const progressFrac = Math.min(Math.max((dl.progress || 0) / 100, 0), 1);
    const remainingEffort = Math.max(rawEffort * (1 - progressFrac), 0.5);

    const deadlineDueDate = startOfDay(parseISO(dl.dueDate!));

    // Find eligible days: from planStart up to min(deadlineDueDate, planEnd)
    const eligibleDayIndices = days
      .map((day, idx) => ({ idx, day }))
      .filter(({ day }) => !isAfter(day.date, deadlineDueDate))
      .map(({ idx }) => idx);

    let unallocated = remainingEffort;

    if (eligibleDayIndices.length === 0) {
      // Overdue deadline: try to allocate on day 0 (today)
      eligibleDayIndices.push(0);
    }

    // Allocate in multi-pass smoothing (distribute evenly across available lead days)
    // Pass 1: Give each eligible day a balanced chunk up to its remaining capacity
    let progressMadeInLoop = true;
    let loopSafety = 0;

    while (unallocated > 0.05 && progressMadeInLoop && loopSafety < 100) {
      loopSafety++;
      progressMadeInLoop = false;

      // Desired chunk per eligible day
      const targetChunk = Math.min(
        Math.max(unallocated / eligibleDayIndices.length, minChunkHours),
        maxChunkHours
      );

      for (const dayIdx of eligibleDayIndices) {
        if (unallocated <= 0.05) break;

        const day = days[dayIdx];
        if (day.remainingCapacity <= 0.05) continue;

        const chunkAmount = Number(
          Math.min(unallocated, targetChunk, day.remainingCapacity).toFixed(2)
        );

        if (chunkAmount > 0) {
          day.remainingCapacity -= chunkAmount;
          unallocated -= chunkAmount;
          progressMadeInLoop = true;

          // Check if a chunk for this deadline already exists on this day
          const existingChunk = day.chunks.find((c) => c.deadlineId === dl.id);
          if (existingChunk) {
            existingChunk.allocatedHours = Number(
              (existingChunk.allocatedHours + chunkAmount).toFixed(2)
            );
          } else {
            day.chunks.push({
              id: `chunk-${dl.id}-${day.dateStr}`,
              deadlineId: dl.id,
              title: dl.title,
              type: dl.type,
              priority: dl.priority,
              subjectId: dl.subjectId,
              date: day.dateStr,
              allocatedHours: chunkAmount,
              dueDate: dl.dueDate!,
            });
          }
        }
      }
    }

    const allocatedForThis = Number((remainingEffort - unallocated).toFixed(2));
    totalEffortAllocated += allocatedForThis;

    // 5. Detect Shortfall
    if (unallocated > 0.05) {
      const shortfallAmt = Number(unallocated.toFixed(2));
      totalShortfallHours += shortfallAmt;

      shortfalls.push({
        deadlineId: dl.id,
        title: dl.title,
        priority: dl.priority,
        dueDate: dl.dueDate!,
        requiredEffortHours: Number(remainingEffort.toFixed(2)),
        allocatedHours: allocatedForThis,
        shortfallHours: shortfallAmt,
        reason: `Capacity exhausted before due date ${dl.dueDate}. Shortfall of ${shortfallAmt}h.`,
      });
    }
  }

  // 6. Build daily workload plans
  const dailyPlans: DailyWorkloadPlan[] = days.map((day) => {
    const totalAllocated = Number(
      (day.capacityHours - day.remainingCapacity).toFixed(2)
    );
    const utilization = Number(
      ((totalAllocated / day.capacityHours) * 100).toFixed(1)
    );

    return {
      date: day.dateStr,
      dayName: day.dayName,
      capacityHours: day.capacityHours,
      allocatedHours: totalAllocated,
      utilizationPercent: utilization,
      isOverloaded: totalAllocated > day.capacityHours,
      chunks: day.chunks,
    };
  });

  return {
    dailyPlans,
    totalEffortAllocated: Number(totalEffortAllocated.toFixed(2)),
    shortfalls,
    totalShortfallHours: Number(totalShortfallHours.toFixed(2)),
  };
}
