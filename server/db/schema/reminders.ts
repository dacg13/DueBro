import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { deadlines } from "./deadlines";

export const reminderModeEnum = ["relative", "absolute"] as const;
export type ReminderMode = (typeof reminderModeEnum)[number];

export const reminderChannelEnum = ["push", "email"] as const;
export type ReminderChannel = (typeof reminderChannelEnum)[number];

export const reminders = pgTable(
  "reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deadlineId: uuid("deadline_id")
      .notNull()
      .references(() => deadlines.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mode: text("mode", { enum: reminderModeEnum }).notNull().default("relative"),
    offsetMinutes: integer("offset_minutes"), // Used when mode = "relative" (e.g. 1440 = 1 day before)
    fireAt: timestamp("fire_at", { withTimezone: true }).notNull(), // UTC fire timestamp
    channels: jsonb("channels").$type<ReminderChannel[]>().notNull().default(["push", "email"]),
    isDispatched: boolean("is_dispatched").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("reminders_fire_dispatched_idx").on(table.fireAt, table.isDispatched),
    index("reminders_deadline_idx").on(table.deadlineId),
    index("reminders_user_idx").on(table.userId),
  ]
);

export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
