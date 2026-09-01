import { pgTable, text, timestamp, real, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Matches Supabase auth.users.id
  email: text("email").notNull().unique(),
  name: text("name"),
  timezone: text("timezone").notNull().default("UTC"),
  dailyCapacityHours: real("daily_capacity_hours").notNull().default(2.0),
  weekendCapacityHours: real("weekend_capacity_hours").notNull().default(4.0),
  quietHoursStart: text("quiet_hours_start"), // e.g. "22:00"
  quietHoursEnd: text("quiet_hours_end"),     // e.g. "08:00"
  notificationPreferences: jsonb("notification_preferences").notNull().default({
    upcoming: { push: true, email: true },
    critical: { push: true, email: true },
    overdue: { push: true, email: true },
    exam: { push: true, email: true },
    digest: { push: false, email: false },
    workload: { push: true, email: false },
    shared_deadline_added: { push: true, email: true },
    shared_deadline_edited: { push: false, email: false },
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
