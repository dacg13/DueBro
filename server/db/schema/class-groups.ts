import { pgTable, text, timestamp, date, uuid, index, unique } from "drizzle-orm/pg-core";
import { users } from "./users";
import { subjects } from "./subjects";
import { deadlineTypeEnum } from "./deadline-types";

// ─── Class Groups ───────────────────────────────────────────────────────────

export const classGroups = pgTable(
  "class_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("class_groups_creator_idx").on(table.createdByUserId),
  ]
);

export type ClassGroup = typeof classGroups.$inferSelect;
export type NewClassGroup = typeof classGroups.$inferInsert;

// ─── Class Group Members ────────────────────────────────────────────────────

export const classGroupMemberStatusEnum = ["active", "left"] as const;
export type ClassGroupMemberStatus = (typeof classGroupMemberStatusEnum)[number];

export const classGroupMembers = pgTable(
  "class_group_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classGroupId: uuid("class_group_id")
      .notNull()
      .references(() => classGroups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    localSubjectId: uuid("local_subject_id")
      .references(() => subjects.id, { onDelete: "set null" }), // nullable until mapped
    status: text("status", { enum: classGroupMemberStatusEnum }).notNull().default("active"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    leftAt: timestamp("left_at", { withTimezone: true }),
  },
  (table) => [
    unique("class_group_members_group_user_unique").on(table.classGroupId, table.userId),
    index("class_group_members_group_status_idx").on(table.classGroupId, table.status),
    index("class_group_members_user_idx").on(table.userId),
  ]
);

export type ClassGroupMember = typeof classGroupMembers.$inferSelect;
export type NewClassGroupMember = typeof classGroupMembers.$inferInsert;

// ─── Class Group Invites ────────────────────────────────────────────────────

export const classGroupInviteStatusEnum = ["pending", "accepted", "declined"] as const;
export type ClassGroupInviteStatus = (typeof classGroupInviteStatusEnum)[number];

export const classGroupInvites = pgTable(
  "class_group_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classGroupId: uuid("class_group_id")
      .notNull()
      .references(() => classGroups.id, { onDelete: "cascade" }),
    invitedUserId: text("invited_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    invitedByUserId: text("invited_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: classGroupInviteStatusEnum }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (table) => [
    index("class_group_invites_invited_user_idx").on(table.invitedUserId, table.status),
    index("class_group_invites_group_idx").on(table.classGroupId),
  ]
);

export type ClassGroupInvite = typeof classGroupInvites.$inferSelect;
export type NewClassGroupInvite = typeof classGroupInvites.$inferInsert;

// ─── Shared Deadlines ───────────────────────────────────────────────────────

export const sharedDeadlines = pgTable(
  "shared_deadlines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    classGroupId: uuid("class_group_id")
      .notNull()
      .references(() => classGroups.id, { onDelete: "cascade" }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastEditedByUserId: text("last_edited_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: text("type", { enum: deadlineTypeEnum }).notNull().default("other"),
    dueDate: date("due_date").notNull(),
    dueTime: text("due_time"), // e.g. "23:59"
    location: text("location"),
    sharedNotes: text("shared_notes"), // lives ONLY here — never copied to deadlines
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("shared_deadlines_group_due_idx").on(table.classGroupId, table.dueDate),
    index("shared_deadlines_group_idx").on(table.classGroupId),
  ]
);

export type SharedDeadline = typeof sharedDeadlines.$inferSelect;
export type NewSharedDeadline = typeof sharedDeadlines.$inferInsert;
