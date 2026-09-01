/**
 * Domain Module: Friendships
 *
 * Responsibilities:
 * - Pure validation logic for friendship operations
 * - Request eligibility checks (duplicates, blocked pairs)
 * - Class group invite eligibility checks
 *
 * Constraints:
 * - Pure functions only — no direct database I/O.
 */

import { type Friendship, type FriendshipStatus } from "@/types";

/**
 * Checks whether a friend request can be sent to a target user.
 * Rejects if there's already a pending/accepted/blocked friendship between the pair.
 */
export function canSendFriendRequest(
  existingFriendships: Friendship[],
  currentUserId: string,
  targetUserId: string
): { allowed: boolean; reason?: string } {
  if (currentUserId === targetUserId) {
    return { allowed: false, reason: "You cannot send a friend request to yourself." };
  }

  const existing = existingFriendships.find(
    (f) =>
      (f.requesterId === currentUserId && f.addresseeId === targetUserId) ||
      (f.requesterId === targetUserId && f.addresseeId === currentUserId)
  );

  if (!existing) {
    return { allowed: true };
  }

  switch (existing.status) {
    case "pending":
      return { allowed: false, reason: "A friend request is already pending." };
    case "accepted":
      return { allowed: false, reason: "You are already friends." };
    case "blocked":
      return { allowed: false, reason: "This friendship has been blocked." };
    case "declined":
      // Allow re-sending after a decline
      return { allowed: true };
    default:
      return { allowed: false, reason: "Unexpected friendship status." };
  }
}

/**
 * Checks whether a user can invite another user to a class group.
 * Requires an accepted friendship between them.
 */
export function canInviteToClassGroup(
  friendships: Friendship[],
  invitedByUserId: string,
  invitedUserId: string
): { allowed: boolean; reason?: string } {
  if (invitedByUserId === invitedUserId) {
    return { allowed: false, reason: "You cannot invite yourself." };
  }

  const acceptedFriendship = friendships.find(
    (f) =>
      f.status === "accepted" &&
      ((f.requesterId === invitedByUserId && f.addresseeId === invitedUserId) ||
        (f.requesterId === invitedUserId && f.addresseeId === invitedByUserId))
  );

  if (!acceptedFriendship) {
    return { allowed: false, reason: "You can only invite friends to a class group." };
  }

  return { allowed: true };
}
