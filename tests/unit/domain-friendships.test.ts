import { describe, test, expect } from "vitest";
import { canSendFriendRequest, canInviteToClassGroup } from "@/server/domain/friendships";
import { type Friendship } from "@/types";

// Helper to create a test friendship
function makeFriendship(overrides: Partial<Friendship> = {}): Friendship {
  return {
    id: "fr-1",
    requesterId: "user-a",
    addresseeId: "user-b",
    status: "accepted",
    createdAt: new Date(),
    respondedAt: new Date(),
    ...overrides,
  };
}

describe("Domain: Friendships", () => {
  describe("canSendFriendRequest", () => {
    test("allows sending request when no existing friendship", () => {
      const result = canSendFriendRequest([], "user-a", "user-b");
      expect(result.allowed).toBe(true);
    });

    test("rejects sending request to yourself", () => {
      const result = canSendFriendRequest([], "user-a", "user-a");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("yourself");
    });

    test("rejects when friendship is already pending", () => {
      const existing = [makeFriendship({ status: "pending" })];
      const result = canSendFriendRequest(existing, "user-a", "user-b");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("pending");
    });

    test("rejects when already friends", () => {
      const existing = [makeFriendship({ status: "accepted" })];
      const result = canSendFriendRequest(existing, "user-a", "user-b");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("already friends");
    });

    test("rejects when friendship is blocked", () => {
      const existing = [makeFriendship({ status: "blocked" })];
      const result = canSendFriendRequest(existing, "user-a", "user-b");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("blocked");
    });

    test("allows re-sending after decline", () => {
      const existing = [makeFriendship({ status: "declined" })];
      const result = canSendFriendRequest(existing, "user-a", "user-b");
      expect(result.allowed).toBe(true);
    });

    test("checks reverse direction (addressee sending to requester)", () => {
      const existing = [makeFriendship({ requesterId: "user-b", addresseeId: "user-a", status: "accepted" })];
      const result = canSendFriendRequest(existing, "user-a", "user-b");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("already friends");
    });
  });

  describe("canInviteToClassGroup", () => {
    test("allows invite when accepted friendship exists", () => {
      const friendships = [makeFriendship({ status: "accepted" })];
      const result = canInviteToClassGroup(friendships, "user-a", "user-b");
      expect(result.allowed).toBe(true);
    });

    test("rejects invite when no friendship exists", () => {
      const result = canInviteToClassGroup([], "user-a", "user-b");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("friends");
    });

    test("rejects invite when friendship is pending (not accepted)", () => {
      const friendships = [makeFriendship({ status: "pending" })];
      const result = canInviteToClassGroup(friendships, "user-a", "user-b");
      expect(result.allowed).toBe(false);
    });

    test("rejects invite to yourself", () => {
      const result = canInviteToClassGroup([], "user-a", "user-a");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("yourself");
    });

    test("checks reverse friendship direction", () => {
      const friendships = [makeFriendship({ requesterId: "user-b", addresseeId: "user-a", status: "accepted" })];
      const result = canInviteToClassGroup(friendships, "user-a", "user-b");
      expect(result.allowed).toBe(true);
    });
  });
});
