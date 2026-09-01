import { pgTable, text, timestamp, uuid, index, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const friendshipStatusEnum = ["pending", "accepted", "declined", "blocked"] as const;
export type FriendshipStatus = (typeof friendshipStatusEnum)[number];

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: friendshipStatusEnum }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (table) => [
    index("friendships_requester_status_idx").on(table.requesterId, table.status),
    index("friendships_addressee_status_idx").on(table.addresseeId, table.status),
    // Unique constraint on unordered pair to prevent duplicate friendships
    unique("friendships_unordered_pair_unique").on(table.requesterId, table.addresseeId),
  ]
);

export type Friendship = typeof friendships.$inferSelect;
export type NewFriendship = typeof friendships.$inferInsert;
