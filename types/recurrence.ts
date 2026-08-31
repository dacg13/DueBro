export const recurrenceFrequencyEnum = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "custom",
] as const;

export type RecurrenceFrequency = (typeof recurrenceFrequencyEnum)[number];

export const dayOfWeekEnum = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;
export type DayOfWeek = (typeof dayOfWeekEnum)[number];

export interface RecurrenceRule {
  id: string;
  userId: string;
  frequency: RecurrenceFrequency;
  interval: number; // e.g. 1 for weekly, 2 for biweekly
  byDay: DayOfWeek[]; // e.g. ["MO", "WE", "FR"]
  startDate: string; // YYYY-MM-DD
  untilDate: string | null; // YYYY-MM-DD or null for ongoing
  count: number | null; // max number of occurrences
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurrenceException {
  id: string;
  recurrenceRuleId: string;
  userId: string;
  originalDate: string; // YYYY-MM-DD
  isCancelled: boolean;
  createdAt: Date;
}

export type RecurrenceEditScope = "this_only" | "this_and_future";
