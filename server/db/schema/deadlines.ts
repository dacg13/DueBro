import { pgTable, text, timestamp, date, integer, real, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { academicTerms } from "./academic-terms";
import { subjects } from "./subjects";
import { recurrenceRules } from "./recurrence-rules";
import { sharedDeadlines } from "./class-groups";
import {
  deadlineTypeEnum,
  type DeadlineType,
  priorityEnum,
  type Priority,
  deadlineStatusEnum,
  type DeadlineStatus,
} from "./deadline-types";

export {
  deadlineTypeEnum,
  type DeadlineType,
  priorityEnum,
  type Priority,
  deadlineStatusEnum,
  type DeadlineStatus,
};

export const deadlines = pgTable(
  "deadlines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .references(() => subjects.id, { onDelete: "cascade" }), // nullable in Inbox
    termId: uuid("term_id")
      .references(() => academicTerms.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: text("type", { enum: deadlineTypeEnum }).notNull().default("other"),
    dueDate: date("due_date"), // nullable in Inbox, required once triaged
    dueTime: text("due_time"), // e.g. "23:59"
    priority: text("priority", { enum: priorityEnum }).notNull().default("medium"),
    status: text("status", { enum: deadlineStatusEnum }).notNull().default("not_started"),
    progress: integer("progress").notNull().default(0), // 0 to 100
    estimatedEffortHours: real("estimated_effort_hours"), // powers Risk Engine & Smart Planning
    location: text("location"), // used for exams, presentations, study sessions
    notes: text("notes"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    links: jsonb("links").$type<{ title: string; url: string }[]>().notNull().default([]),
    recurrenceRuleId: uuid("recurrence_rule_id")
      .references(() => recurrenceRules.id, { onDelete: "set null" }),
    originalOccurrenceDate: date("original_occurrence_date"), // For materialized recurring instances
    sharedDeadlineId: uuid("shared_deadline_id")
      .references(() => sharedDeadlines.id, { onDelete: "set null" }), // Links fanned-out copies to shared origin
    completedAt: timestamp("completed_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }), // Soft delete support
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Performance critical index for Today screen, clustering calculations, and active filters
    index("deadlines_user_date_status_idx").on(table.userId, table.dueDate, table.status),
    index("deadlines_subject_date_idx").on(table.subjectId, table.dueDate),
    index("deadlines_user_status_idx").on(table.userId, table.status),
    index("deadlines_recurrence_instance_idx").on(table.recurrenceRuleId, table.originalOccurrenceDate),
    index("deadlines_shared_deadline_idx").on(table.sharedDeadlineId),
  ]
);

export type Deadline = typeof deadlines.$inferSelect;
export type NewDeadline = typeof deadlines.$inferInsert;
