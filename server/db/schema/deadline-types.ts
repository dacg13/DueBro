export const deadlineTypeEnum = [
  "assignment",
  "project",
  "exam",
  "quiz",
  "presentation",
  "lab",
  "reading",
  "submission",
  "study_session",
  "other",
] as const;
export type DeadlineType = (typeof deadlineTypeEnum)[number];

export const priorityEnum = ["low", "medium", "high", "critical"] as const;
export type Priority = (typeof priorityEnum)[number];

export const deadlineStatusEnum = ["not_started", "in_progress", "completed", "overdue"] as const;
export type DeadlineStatus = (typeof deadlineStatusEnum)[number];
