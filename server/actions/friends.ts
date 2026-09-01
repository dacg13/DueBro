"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import { friendships, users, type Friendship, type NewFriendship } from "@/server/db/schema";
import {
  sendFriendRequestSchema,
  respondFriendRequestSchema,
  blockFriendSchema,
  removeFriendSchema,
  type SendFriendRequestInput,
  type RespondFriendRequestInput,
  type BlockFriendInput,
  type RemoveFriendInput,
} from "@/lib/validation/friends";
import { canSendFriendRequest } from "@/server/domain/friendships";
import { eq, and, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Friend types for UI ────────────────────────────────────────────────────

export interface FriendWithProfile {
  friendship: Friendship;
  friend: {
    id: string;
    name: string | null;
    email: string;
  };
}

/**
 * Send a friend request by email.
 */
export async function sendFriendRequestAction(
  rawInput: SendFriendRequestInput
): Promise<ActionResult<Friendship>> {
  const parseResult = sendFriendRequestSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Find target user by email
    const [targetUser] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, parseResult.data.targetEmail.toLowerCase()));

    if (!targetUser) {
      return { success: false, error: "No user found with that email address." };
    }

    // Check eligibility via domain function
    const existingFriendships = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.requesterId, user.id), eq(friendships.addresseeId, targetUser.id)),
          and(eq(friendships.requesterId, targetUser.id), eq(friendships.addresseeId, user.id))
        )
      );

    const check = canSendFriendRequest(existingFriendships, user.id, targetUser.id);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    // If there's a declined friendship, update it to pending instead of inserting
    const declined = existingFriendships.find((f) => f.status === "declined");
    if (declined) {
      const [updated] = await db
        .update(friendships)
        .set({
          requesterId: user.id,
          addresseeId: targetUser.id,
          status: "pending",
          respondedAt: null,
        })
        .where(eq(friendships.id, declined.id))
        .returning();
      revalidatePath("/settings");
      return { success: true, data: updated };
    }

    const [created] = await db
      .insert(friendships)
      .values({
        requesterId: user.id,
        addresseeId: targetUser.id,
        status: "pending",
      })
      .returning();

    revalidatePath("/settings");
    return { success: true, data: created };
  } catch (error) {
    console.error("Failed to send friend request:", error);
    return { success: false, error: "Failed to send friend request" };
  }
}

/**
 * Respond to a friend request (accept or decline).
 */
export async function respondFriendRequestAction(
  rawInput: RespondFriendRequestInput
): Promise<ActionResult<Friendship>> {
  const parseResult = respondFriendRequestSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { friendshipId, response } = parseResult.data;

    const [updated] = await db
      .update(friendships)
      .set({
        status: response,
        respondedAt: new Date(),
      })
      .where(
        and(
          eq(friendships.id, friendshipId),
          eq(friendships.addresseeId, user.id),
          eq(friendships.status, "pending")
        )
      )
      .returning();

    if (!updated) {
      return { success: false, error: "Friend request not found or already responded." };
    }

    revalidatePath("/settings");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to respond to friend request:", error);
    return { success: false, error: "Failed to respond to friend request" };
  }
}

/**
 * Get accepted friends list with profile info.
 */
export async function getFriendsListAction(): Promise<ActionResult<FriendWithProfile[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, data: [] };

    const results = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          or(
            eq(friendships.requesterId, user.id),
            eq(friendships.addresseeId, user.id)
          )
        )
      );

    // Fetch friend profiles
    const friendProfiles: FriendWithProfile[] = [];
    for (const f of results) {
      const friendId = f.requesterId === user.id ? f.addresseeId : f.requesterId;
      const [friendUser] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, friendId));

      if (friendUser) {
        friendProfiles.push({
          friendship: f,
          friend: friendUser,
        });
      }
    }

    return { success: true, data: friendProfiles };
  } catch (error) {
    console.error("Failed to fetch friends:", error);
    return { success: false, error: "Failed to load friends" };
  }
}

/**
 * Get pending friend requests (incoming + outgoing).
 */
export async function getPendingFriendRequestsAction(): Promise<
  ActionResult<{ incoming: FriendWithProfile[]; outgoing: FriendWithProfile[] }>
> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, data: { incoming: [], outgoing: [] } };

    const pendingRequests = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "pending"),
          or(
            eq(friendships.requesterId, user.id),
            eq(friendships.addresseeId, user.id)
          )
        )
      );

    const incoming: FriendWithProfile[] = [];
    const outgoing: FriendWithProfile[] = [];

    for (const f of pendingRequests) {
      const isIncoming = f.addresseeId === user.id;
      const friendId = isIncoming ? f.requesterId : f.addresseeId;

      const [friendUser] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, friendId));

      if (friendUser) {
        const entry: FriendWithProfile = { friendship: f, friend: friendUser };
        if (isIncoming) {
          incoming.push(entry);
        } else {
          outgoing.push(entry);
        }
      }
    }

    return { success: true, data: { incoming, outgoing } };
  } catch (error) {
    console.error("Failed to fetch pending requests:", error);
    return { success: false, error: "Failed to load pending requests" };
  }
}

/**
 * Block a friend — sets friendship status to blocked.
 */
export async function blockFriendAction(
  rawInput: BlockFriendInput
): Promise<ActionResult> {
  const parseResult = blockFriendSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const [updated] = await db
      .update(friendships)
      .set({ status: "blocked", respondedAt: new Date() })
      .where(
        and(
          eq(friendships.id, parseResult.data.friendshipId),
          or(
            eq(friendships.requesterId, user.id),
            eq(friendships.addresseeId, user.id)
          )
        )
      )
      .returning();

    if (!updated) {
      return { success: false, error: "Friendship not found." };
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to block friend:", error);
    return { success: false, error: "Failed to block friend" };
  }
}

/**
 * Remove a friend — deletes the friendship row.
 */
export async function removeFriendAction(
  rawInput: RemoveFriendInput
): Promise<ActionResult> {
  const parseResult = removeFriendSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.id, parseResult.data.friendshipId),
          or(
            eq(friendships.requesterId, user.id),
            eq(friendships.addresseeId, user.id)
          )
        )
      );

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove friend:", error);
    return { success: false, error: "Failed to remove friend" };
  }
}
