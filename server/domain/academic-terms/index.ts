/**
 * Domain Module: Academic Terms
 *
 * Responsibilities:
 * - Pure logic for Academic Terms
 * - Term date range validations
 * - Current term resolution
 */

import { type AcademicTerm } from "@/server/db/schema/academic-terms";
import { parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

/**
 * Validates that term start date is before or equal to end date.
 */
export function validateTermRange(
  startDate: string | Date,
  endDate: string | Date
): boolean {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
  return end.getTime() >= start.getTime();
}

/**
 * Checks whether a given date falls within the term window.
 */
export function isDateWithinTerm(
  targetDate: string | Date,
  term: AcademicTerm
): boolean {
  const date = typeof targetDate === "string" ? parseISO(targetDate) : targetDate;
  const start = startOfDay(parseISO(term.startDate));
  const end = endOfDay(parseISO(term.endDate));

  return isWithinInterval(date, { start, end });
}

/**
 * Resolves the currently active term.
 * First checks `isCurrent` flag, then falls back to date matching against `now`.
 */
export function resolveCurrentTerm(
  terms: AcademicTerm[],
  now = new Date()
): AcademicTerm | null {
  if (terms.length === 0) return null;

  // Prefer explicitly marked current term
  const explicit = terms.find((t) => t.isCurrent);
  if (explicit) return explicit;

  // Fallback to active date window
  const activeByDate = terms.find((t) => isDateWithinTerm(now, t));
  if (activeByDate) return activeByDate;

  // Fallback to most recent term
  return [...terms].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )[0] ?? null;
}
