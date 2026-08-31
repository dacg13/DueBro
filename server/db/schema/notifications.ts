import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { reminders } from "./reminders";

export const notificationStatusEnum = ["queued", "sent", "failed"] as const;
export type NotificationStatus = (typeof notificationStatusEnum)[number];

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reminderId: uuid("reminder_id")
      .references(() => reminders.id, { onDelete: "set null" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(), // "push" | "email"
    status: text("status", { enum: notificationStatusEnum }).notNull().default("queued"),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("notifications_reminder_channel_status_idx").on(table.reminderId, table.channel, table.status),
    index("notifications_user_created_idx").on(table.userId, table.createdAt),
  ]
);

export type NotificationLog = typeof notifications.$inferSelect;
export type NewNotificationLog = typeof notifications.$inferInsert;
