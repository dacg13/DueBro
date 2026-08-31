/**
 * Domain Module: Deadlines
 *
 * Responsibilities:
 * - Pure business logic for deadlines
 * - Progress calculation (subtask completion percentage vs. manual override rules)
 * - Remaining effort computation
 * - Overdue date evaluations and sorting
 *
 * Constraints:
 * - Pure functions only — no direct database I/O inside this domain module.
 */

import { type Deadline, type DeadlineStatus, type DeadlineType, type Priority } from "@/server/db/schema/deadlines";
import { parseISO, startOfDay, differenceInCalendarDays, isBefore } from "date-fns";

export interface SubtaskProgressInput {
  isCompleted: boolean;
}

/**
 * Calculates deadline progress (0–100).
 * Per PRODUCT_PRD.md §11:
 * 1. If subtasks exist and no manual override is active, progress = (completed / total) * 100
 * 2. If manual override is provided, clamped to 0–100
 * 3. 100% progress does NOT automatically complete the deadline (completion is a distinct user action).
 */
export function calculateDeadlineProgress(
  subtasks: SubtaskProgressInput[] = [],
  manualOverride?: number | null
): number {
  if (manualOverride !== undefined && manualOverride !== null) {
    return Math.min(100, Math.max(0, Math.round(manualOverride)));
  }

  if (subtasks.length === 0) {
    return 0;
  }

  const completed = subtasks.filter((s) => s.isCompleted).length;
  return Math.round((completed / subtasks.length) * 100);
}

/**
 * Computes remaining effort in hours.
 * Per PRODUCT_PRD.md §13: effortRemaining = estimatedEffortHours * (1 - progress / 100)
 * Gracefully falls back to 1.0 hour if no estimate is provided.
 */
export function calculateRemainingEffort(
  estimatedEffortHours: number | null | undefined,
  progress: number = 0
): number {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  if (estimatedEffortHours === null || estimatedEffortHours === undefined || estimatedEffortHours <= 0) {
    return 1.0 * (1 - clampedProgress / 100);
  }
  return Number((estimatedEffortHours * (1 - clampedProgress / 100)).toFixed(2));
}

/**
 * Determines whether a deadline is overdue.
 * Per PRODUCT_PRD.md §13 & §20:
 * A deadline is overdue if its due date is in the past and status is not 'completed'.
 */
export function isDeadlineOverdue(
  dueDate: string | Date | null | undefined,
  dueTime?: string | null,
  status: DeadlineStatus = "not_started",
  now = new Date()
): boolean {
  if (!dueDate || status === "completed") {
    return false;
  }

  const targetDate = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const currentDay = startOfDay(now);
  const dueDay = startOfDay(targetDate);

  if (isBefore(dueDay, currentDay)) {
    return true;
  }

  // If due today, check specific due time if present
  if (differenceInCalendarDays(dueDay, currentDay) === 0 && dueTime) {
    const [hours, minutes] = dueTime.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const deadlineDateTime = new Date(now);
      deadlineDateTime.setHours(hours, minutes, 0, 0);
      return now.getTime() > deadlineDateTime.getTime();
    }
  }

  return false;
}

/**
 * Calculates calendar days remaining until the due date.
 */
export function getDaysRemaining(dueDate: string | Date, now = new Date()): number {
  const targetDate = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const dueDay = startOfDay(targetDate);
  const currentDay = startOfDay(now);
  return differenceInCalendarDays(dueDay, currentDay);
}

/**
 * Checks whether a deadline type is an exam.
 */
export function isExamType(type: DeadlineType): boolean {
  return type === "exam";
}

/**
 * Priority rank helper for sorting.
 */
const PRIORITY_WEIGHTS: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function getPriorityWeight(priority: Priority): number {
  return PRIORITY_WEIGHTS[priority] ?? 2;
}

/**
 * Sorts deadlines by due date, priority, or title.
 */
export function sortDeadlines(
  deadlinesList: Deadline[],
  sortBy: "dueDate" | "priority" | "title" = "dueDate"
): Deadline[] {
  return [...deadlinesList].sort((a, b) => {
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    if (sortBy === "priority") {
      const diff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      if (diff !== 0) return diff;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    return a.title.localeCompare(b.title);
  });
}
