import { pgTable, text, timestamp, date, boolean, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { recurrenceRules } from "./recurrence-rules";

export const recurrenceExceptions = pgTable(
  "recurrence_exceptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ruleId: uuid("rule_id")
      .notNull()
      .references(() => recurrenceRules.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    originalDate: date("original_date").notNull(),
    isSkipped: boolean("is_skipped").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("recurrence_exceptions_rule_date_idx").on(table.ruleId, table.originalDate),
    index("recurrence_exceptions_user_idx").on(table.userId),
  ]
);

export type RecurrenceException = typeof recurrenceExceptions.$inferSelect;
export type NewRecurrenceException = typeof recurrenceExceptions.$inferInsert;
