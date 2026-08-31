/**
 * Domain Module: Reminders & Notification Scheduling
 *
 * Responsibilities:
 * - Computes type-specific default reminder cadences (Exam 7d/1d/2h; Others 1d/2h)
 * - Strict 3-reminder cap enforcement per deadline
 * - Relative vs. Absolute reminder mode calculations
 * - Quiet hours conflict adjustment and boundary shifting
 *
 * Constraints:
 * - Pure functions only — no direct database I/O.
 */

import { type DeadlineType, type Reminder, type QuietHoursConfig } from "@/types";
import { parseISO, subMinutes, setHours, setMinutes, setSeconds, isBefore, isAfter, addDays, subDays } from "date-fns";

export const MAX_REMINDERS_PER_DEADLINE = 3;

/**
 * Returns type-specific default reminder cadence.
 * PRODUCT_PRD.md §16:
 * - Exam: 7 days before, 1 day before, 2 hours before (3 reminders)
 * - Assignment, Project, Quiz, Lab, Presentation, Other: 1 day before, 2 hours before (2 reminders)
 */
export function getDefaultReminderCadence(type: DeadlineType): Array<{ mode: "relative"; offsetMinutes: number }> {
  if (type === "exam") {
    return [
      { mode: "relative", offsetMinutes: 10080 }, // 7 days (7 * 24 * 60)
      { mode: "relative", offsetMinutes: 1440 },  // 1 day (24 * 60)
      { mode: "relative", offsetMinutes: 120 },   // 2 hours (2 * 60)
    ];
  }

  // All other types (assignments, projects, quizzes, labs, presentations, etc.)
  return [
    { mode: "relative", offsetMinutes: 1440 }, // 1 day
    { mode: "relative", offsetMinutes: 120 },  // 2 hours
  ];
}

/**
 * Combines dueDate (YYYY-MM-DD) and dueTime (HH:MM or null) into a concrete Date.
 */
export function getDeadlineDueDateTime(dueDate: string, dueTime: string | null = null): Date {
  const baseDate = parseISO(dueDate);
  const timeStr = dueTime && dueTime.includes(":") ? dueTime : "23:59";
  const [hours, minutes] = timeStr.split(":").map(Number);

  return setSeconds(setMinutes(setHours(baseDate, hours), minutes), 0);
}

/**
 * Computes exact fireAt timestamp from due date, due time, and relative offset in minutes.
 */
export function computeFireAt(dueDate: string, dueTime: string | null, offsetMinutes: number): Date {
  const dueDateTime = getDeadlineDueDateTime(dueDate, dueTime);
  return subMinutes(dueDateTime, offsetMinutes);
}

/**
 * Checks whether a given Date falls within the configured quiet hours window.
 */
export function isWithinQuietHours(date: Date, quietHours: { start: string; end: string }): boolean {
  const [startH, startM] = quietHours.start.split(":").map(Number);
  const [endH, endM] = quietHours.end.split(":").map(Number);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes > endMinutes) {
    // Overnight quiet hours (e.g. 22:00 to 08:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Daytime quiet hours (e.g. 13:00 to 15:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

/**
 * Adjusts a reminder's fireAt timestamp if it falls within quiet hours.
 * - If the deadline is due comfortably after quiet hours (e.g., afternoon), defer reminder to end of quiet hours (08:00).
 * - If the deadline is due during or early morning after quiet hours (e.g., 09:00), shift reminder before quiet hours starts (e.g., 21:45).
 */
export function adjustForQuietHours(
  fireAt: Date,
  dueDateTime: Date,
  quietHours: { start: string; end: string }
): Date {
  if (!isWithinQuietHours(fireAt, quietHours)) {
    return fireAt;
  }

  const [startH, startM] = quietHours.start.split(":").map(Number);
  const [endH, endM] = quietHours.end.split(":").map(Number);

  // End of quiet hours on the fireAt day (or next day if overnight)
  let quietEnd = setSeconds(setMinutes(setHours(fireAt, endH), endM), 0);
  if (isBefore(quietEnd, fireAt)) {
    quietEnd = addDays(quietEnd, 1);
  }

  // Start of quiet hours on the fireAt day (or previous day if overnight)
  let quietStart = setSeconds(setMinutes(setHours(fireAt, startH), startM), 0);
  if (isAfter(quietStart, fireAt)) {
    quietStart = subDays(quietStart, 1);
  }

  // If shifting to quietEnd still leaves at least 1 hour before the deadline:
  const gapAfterQuietEnd = (dueDateTime.getTime() - quietEnd.getTime()) / (60 * 1000);
  if (gapAfterQuietEnd >= 60) {
    return quietEnd;
  }

  // Otherwise, notify 15 minutes before quiet hours starts so the user sees it the evening prior
  return subMinutes(quietStart, 15);
}

/**
 * Strict 3-reminder cap enforcement per deadline.
 */
export function enforceReminderCap<T>(reminders: T[], cap: number = MAX_REMINDERS_PER_DEADLINE): T[] {
  return reminders.slice(0, cap);
}

/**
 * Recomputes reminder trigger dates when a deadline's dueDate or dueTime changes.
 * - mode === 'relative': Recalculates fireAt using offsetMinutes.
 * - mode === 'absolute': Preserves original fireAt untouched.
 */
export function recomputeRemindersOnDueDateChange(
  reminders: Reminder[],
  newDueDate: string,
  newDueTime: string | null,
  quietHours?: QuietHoursConfig
): Reminder[] {
  const dueDateTime = getDeadlineDueDateTime(newDueDate, newDueTime);

  return reminders.map((r) => {
    if (r.mode !== "relative" || r.offsetMinutes == null) {
      // Absolute reminders stay at fixed timestamp
      return r;
    }

    let calculatedFireAt = subMinutes(dueDateTime, r.offsetMinutes);

    if (quietHours && quietHours.enabled) {
      calculatedFireAt = adjustForQuietHours(calculatedFireAt, dueDateTime, {
        start: quietHours.start,
        end: quietHours.end,
      });
    }

    return {
      ...r,
      fireAt: calculatedFireAt,
    };
  });
}
