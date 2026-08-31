/**
 * Domain Module: Subjects
 *
 * Responsibilities:
 * - Pure logic for Subjects
 * - Accessible color validation
 * - Aggregation of per-subject statistics (open, completed, next upcoming)
 * - Filtering active vs. archived subjects
 */

import { type Subject } from "@/server/db/schema/subjects";
import { type Deadline } from "@/server/db/schema/deadlines";
import { SUBJECT_HEX_LIST } from "@/lib/validation/subjects";
import { isDeadlineOverdue } from "../deadlines";

export interface SubjectStats {
  openCount: number;
  completedCount: number;
  overdueCount: number;
  totalCount: number;
  nextUpcomingDeadline: Deadline | null;
}

/**
 * Validates that a subject color belongs to the curated accessible palette.
 */
export function isValidSubjectColor(color: string): boolean {
  if (!color) return false;
  return SUBJECT_HEX_LIST.includes(color.toUpperCase());
}

/**
 * Computes per-subject statistics for detail view (DESIGN_PRD.md §15 & PRODUCT_PRD.md §8).
 */
export function calculateSubjectStats(
  subjectId: string,
  deadlinesList: Deadline[],
  now = new Date()
): SubjectStats {
  const subjectDeadlines = deadlinesList.filter((d) => d.subjectId === subjectId && !d.deletedAt);

  let openCount = 0;
  let completedCount = 0;
  let overdueCount = 0;
  let nextUpcomingDeadline: Deadline | null = null;
  let earliestUpcomingTime = Infinity;

  for (const deadline of subjectDeadlines) {
    if (deadline.status === "completed") {
      completedCount++;
    } else {
      openCount++;
      if (isDeadlineOverdue(deadline.dueDate, deadline.dueTime, deadline.status, now)) {
        overdueCount++;
      } else if (deadline.dueDate) {
        const dueTimestamp = new Date(deadline.dueDate).getTime();
        if (dueTimestamp >= now.getTime() && dueTimestamp < earliestUpcomingTime) {
          earliestUpcomingTime = dueTimestamp;
          nextUpcomingDeadline = deadline;
        }
      }
    }
  }

  return {
    openCount,
    completedCount,
    overdueCount,
    totalCount: subjectDeadlines.length,
    nextUpcomingDeadline,
  };
}

/**
 * Filters for active (non-archived) subjects.
 */
export function filterActiveSubjects(subjectsList: Subject[]): Subject[] {
  return subjectsList.filter((s) => !s.archived);
}
