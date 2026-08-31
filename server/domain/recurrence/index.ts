/**
 * Domain Module: Recurrence Engine & Materialized Lazy Generation
 *
 * Responsibilities:
 * - Computes recurrence series dates using standard calendar rules
 * - Materializes occurrences as real rows in the deadlines table within a 60-day rolling window
 * - Independent status, progress, and subtask tracking per materialized occurrence
 * - Splits / truncates recurrence rules on "This and future" edits and deletions
 *
 * Constraints:
 * - Pure functions only — no direct database I/O.
 */

import {
  type RecurrenceRule,
  type DayOfWeek,
  type Deadline,
} from "@/types";
import {
  parseISO,
  format,
  addDays,
  addWeeks,
  addMonths,
  isBefore,
  isAfter,
  startOfDay,
  subDays,
} from "date-fns";

const DAY_OF_WEEK_MAP: Record<DayOfWeek, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

/**
 * Generates an array of occurrence dates (YYYY-MM-DD) within a specified date window.
 */
export function generateRecurrenceDates(
  rule: RecurrenceRule,
  windowStart: Date,
  windowEnd: Date,
  excludedDates: string[] = []
): string[] {
  const ruleStart = startOfDay(parseISO(rule.startDate));
  const ruleUntil = rule.untilDate ? startOfDay(parseISO(rule.untilDate)) : null;
  const excludedSet = new Set(excludedDates);

  const dates: string[] = [];
  let current = ruleStart;
  let occurrenceCount = 0;

  // Maximum safety iteration guard (e.g. 500 occurrences)
  const MAX_ITERATIONS = 500;
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    // Check count limit
    if (rule.count !== null && occurrenceCount >= rule.count) {
      break;
    }

    // Check untilDate limit
    if (ruleUntil && isAfter(current, ruleUntil)) {
      break;
    }

    // Check windowEnd
    if (isAfter(current, windowEnd)) {
      break;
    }

    const currentStr = format(current, "yyyy-MM-dd");

    // Check if current date falls within windowStart and not excluded
    if (!isBefore(current, windowStart) && !excludedSet.has(currentStr)) {
      // ByDay filtering for weekly/custom
      if (rule.frequency === "weekly" || rule.frequency === "biweekly" || rule.frequency === "custom") {
        if (rule.byDay.length > 0) {
          const currentDayNum = current.getDay();
          const matchesDay = rule.byDay.some((d) => DAY_OF_WEEK_MAP[d] === currentDayNum);
          if (matchesDay) {
            dates.push(currentStr);
            occurrenceCount++;
          }
        } else {
          dates.push(currentStr);
          occurrenceCount++;
        }
      } else {
        dates.push(currentStr);
        occurrenceCount++;
      }
    }

    // Advance to next iteration step
    if (rule.frequency === "daily") {
      current = addDays(current, rule.interval || 1);
    } else if (rule.frequency === "weekly") {
      if (rule.byDay.length > 1) {
        // Step day-by-day to check each target day in week
        current = addDays(current, 1);
      } else {
        current = addWeeks(current, rule.interval || 1);
      }
    } else if (rule.frequency === "biweekly") {
      if (rule.byDay.length > 1) {
        current = addDays(current, 1);
      } else {
        current = addWeeks(current, (rule.interval || 1) * 2);
      }
    } else if (rule.frequency === "monthly") {
      current = addMonths(current, rule.interval || 1);
    } else {
      // Default step 1 day
      current = addDays(current, 1);
    }
  }

  return dates;
}

/**
 * Materializes occurrences for a 60-day lazy window as real distinct Deadline objects.
 * Prevents duplicates by cross-referencing existing occurrences.
 */
export function materializeOccurrencesForWindow(
  rule: RecurrenceRule,
  baseDeadline: Omit<Deadline, "id" | "createdAt" | "updatedAt">,
  existingOccurrences: Deadline[],
  windowDays: number = 60,
  now: Date = new Date()
): Array<Omit<Deadline, "id" | "createdAt" | "updatedAt">> {
  const windowStart = startOfDay(now);
  const windowEnd = addDays(windowStart, windowDays);

  // Existing dates already materialized
  const existingDateSet = new Set(
    existingOccurrences
      .filter((d) => !d.deletedAt && d.dueDate)
      .map((d) => d.dueDate!)
  );

  const seriesDates = generateRecurrenceDates(rule, windowStart, windowEnd);

  const newOccurrences: Array<Omit<Deadline, "id" | "createdAt" | "updatedAt">> = [];

  for (const dateStr of seriesDates) {
    if (!existingDateSet.has(dateStr)) {
      newOccurrences.push({
        ...baseDeadline,
        dueDate: dateStr,
        originalOccurrenceDate: dateStr,
        recurrenceRuleId: rule.id,
        status: "not_started",
        progress: 0,
        completedAt: null,
        deletedAt: null,
      });
    }
  }

  return newOccurrences;
}

/**
 * Handles "This and future occurrences" edit:
 * 1. Truncates the old recurrence rule until the day before the split date.
 * 2. Creates a new recurrence rule starting from the split date.
 */
export function splitRecurrenceRuleOnEdit(
  currentRule: RecurrenceRule,
  splitFromDate: string,
  updatedFields: Partial<RecurrenceRule> = {}
): {
  truncatedRule: RecurrenceRule;
  newRule: Omit<RecurrenceRule, "id" | "createdAt" | "updatedAt">;
} {
  const splitDate = parseISO(splitFromDate);
  const dayBeforeStr = format(subDays(splitDate, 1), "yyyy-MM-dd");

  const truncatedRule: RecurrenceRule = {
    ...currentRule,
    untilDate: dayBeforeStr,
    updatedAt: new Date(),
  };

  const newRule: Omit<RecurrenceRule, "id" | "createdAt" | "updatedAt"> = {
    userId: currentRule.userId,
    frequency: updatedFields.frequency ?? currentRule.frequency,
    interval: updatedFields.interval ?? currentRule.interval,
    byDay: updatedFields.byDay ?? currentRule.byDay,
    startDate: splitFromDate,
    untilDate: updatedFields.untilDate ?? currentRule.untilDate,
    count: updatedFields.count ?? currentRule.count,
  };

  return { truncatedRule, newRule };
}

/**
 * Handles "This and future occurrences" delete:
 * Truncates the recurrence rule until the day before the deleted occurrence date.
 */
export function splitRecurrenceRuleOnDelete(
  currentRule: RecurrenceRule,
  deleteFromDate: string
): { truncatedRule: RecurrenceRule } {
  const splitDate = parseISO(deleteFromDate);
  const dayBeforeStr = format(subDays(splitDate, 1), "yyyy-MM-dd");

  const truncatedRule: RecurrenceRule = {
    ...currentRule,
    untilDate: dayBeforeStr,
    updatedAt: new Date(),
  };

  return { truncatedRule };
}
