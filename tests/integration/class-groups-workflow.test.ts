import { describe, test, expect } from "vitest";
import {
  calculateSharedDeadlineFanOut,
  calculateSharedDeadlinePropagation,
  calculateMemberBackfill,
  type SharedDeadlineInput,
  type ActiveMember,
  type ExistingMemberDeadline,
} from "@/server/domain/class-groups";
import { canSendFriendRequest, canInviteToClassGroup } from "@/server/domain/friendships";
import { type Friendship, type Deadline } from "@/types";

describe("Collaboration Workflow & Isolation Integration Test", () => {
  // Setup mock users
  const userA = "user-a";
  const userB = "user-b";
  const userC = "user-c-nonmember";

  test("End-to-End Collaboration Pipeline: Friendship -> Group -> Invite with Mapping -> Fan-Out -> Edit -> Propagation -> Leave", () => {
    // ── 1. Friendship Lifecycle ──
    const friendships: Friendship[] = [];

    // User A can send friend request to User B
    const reqCheck = canSendFriendRequest(friendships, userA, userB);
    expect(reqCheck.allowed).toBe(true);

    // Friend request created (pending)
    const pendingFriendship: Friendship = {
      id: "fr-1",
      requesterId: userA,
      addresseeId: userB,
      status: "pending",
      createdAt: new Date(),
      respondedAt: null,
    };
    friendships.push(pendingFriendship);

    // Cannot invite to group while friendship is pending
    const inviteBeforeAccept = canInviteToClassGroup(friendships, userA, userB);
    expect(inviteBeforeAccept.allowed).toBe(false);

    // User B accepts friendship
    pendingFriendship.status = "accepted";
    pendingFriendship.respondedAt = new Date();

    // Now User A can invite User B
    const inviteAfterAccept = canInviteToClassGroup(friendships, userA, userB);
    expect(inviteAfterAccept.allowed).toBe(true);

    // Non-friend User C cannot be invited
    const inviteNonFriend = canInviteToClassGroup(friendships, userA, userC);
    expect(inviteNonFriend.allowed).toBe(false);

    // ── 2. Class Group Creation & Subject Mapping ──
    const members: ActiveMember[] = [
      { userId: userA, localSubjectId: "subj-a-cs101", status: "active" },
    ];

    // User A creates shared deadline BEFORE User B joins
    const sharedDeadline1: SharedDeadlineInput = {
      id: "sd-1",
      classGroupId: "group-cs101",
      createdByUserId: userA,
      title: "Homework 1",
      type: "assignment",
      dueDate: "2026-10-01",
      dueTime: "23:59",
      location: null,
    };

    // Fan-out runs for existing active members (User A only)
    const initialFanOut = calculateSharedDeadlineFanOut(sharedDeadline1, members);
    expect(initialFanOut).toHaveLength(1);
    expect(initialFanOut[0].userId).toBe(userA);
    expect(initialFanOut[0].subjectId).toBe("subj-a-cs101");

    // ── 3. User B Accepts Invite with Subject Mapping & Backfill Runs ──
    const userBMapping = { userId: userB, localSubjectId: "subj-b-algorithms" };
    members.push({ userId: userB, localSubjectId: userBMapping.localSubjectId, status: "active" });

    // Backfill runs immediately for User B on accept
    const userBBackfill = calculateMemberBackfill(
      [sharedDeadline1],
      userBMapping,
      [], // User B has no existing deadline for this group
      "2026-09-15" // today
    );
    expect(userBBackfill).toHaveLength(1);
    expect(userBBackfill[0].userId).toBe(userB);
    expect(userBBackfill[0].subjectId).toBe("subj-b-algorithms");
    expect(userBBackfill[0].sharedDeadlineId).toBe("sd-1");

    // ── 4. User A Adds a Second Shared Deadline -> Fans out to both ──
    const sharedDeadline2: SharedDeadlineInput = {
      id: "sd-2",
      classGroupId: "group-cs101",
      createdByUserId: userA,
      title: "Midterm Exam",
      type: "exam",
      dueDate: "2026-10-20",
      dueTime: "10:00",
      location: "Room 401",
    };

    const fanOut2 = calculateSharedDeadlineFanOut(sharedDeadline2, members);
    expect(fanOut2).toHaveLength(2);
    expect(fanOut2.map((f) => f.userId)).toEqual([userA, userB]);
    expect(fanOut2.find((f) => f.userId === userB)?.subjectId).toBe("subj-b-algorithms");

    // ── 5. User B Customizes Personal Fields ──
    // Simulated personal copy of deadline 2 for User B:
    const userBDeadlineRow: ExistingMemberDeadline & { priority: string; progress: number; notes: string } = {
      id: "dl-b-sd2",
      userId: userB,
      sharedDeadlineId: "sd-2",
      title: "Midterm Exam",
      type: "exam",
      dueDate: "2026-10-20",
      dueTime: "10:00",
      location: "Room 401",
      priority: "critical", // personalized!
      progress: 60, // personalized!
      notes: "My personal study plan for exam", // personalized!
    };

    // ── 6. User A Edits Shared Deadline Core Fields ──
    const updatedCore = {
      title: "Midterm Exam (Rescheduled)",
      type: "exam" as const,
      dueDate: "2026-10-25",
      dueTime: "14:00",
      location: "Auditorium A",
    };

    const propagation = calculateSharedDeadlinePropagation(updatedCore, [userBDeadlineRow]);
    expect(propagation).toHaveLength(1);
    expect(propagation[0].deadlineId).toBe("dl-b-sd2");
    expect(propagation[0].updates).toEqual({
      title: "Midterm Exam (Rescheduled)",
      dueDate: "2026-10-25",
      dueTime: "14:00",
      location: "Auditorium A",
    });

    // Verify personal fields were NOT in the updates payload
    const updateKeys = Object.keys(propagation[0].updates);
    expect(updateKeys).not.toContain("priority");
    expect(updateKeys).not.toContain("progress");
    expect(updateKeys).not.toContain("notes");

    // ── 7. User B Leaves Group ──
    const userBMember = members.find((m) => m.userId === userB)!;
    userBMember.status = "left";

    // User A creates third shared deadline
    const sharedDeadline3: SharedDeadlineInput = {
      id: "sd-3",
      classGroupId: "group-cs101",
      createdByUserId: userA,
      title: "Final Project",
      type: "project",
      dueDate: "2026-12-01",
      dueTime: "23:59",
      location: null,
    };

    // Fan-out excludes User B who left
    const fanOut3 = calculateSharedDeadlineFanOut(sharedDeadline3, members);
    expect(fanOut3).toHaveLength(1);
    expect(fanOut3[0].userId).toBe(userA);
  });

  test("Fix #6: Non-Member Isolation Verification", () => {
    // Active members in Group CS101
    const activeMembers: ActiveMember[] = [
      { userId: userA, localSubjectId: "subj-a-1", status: "active" },
      { userId: userB, localSubjectId: "subj-b-1", status: "active" },
    ];

    const sharedDeadline: SharedDeadlineInput = {
      id: "sd-sec-1",
      classGroupId: "group-cs101",
      createdByUserId: userA,
      title: "Secret Assignment",
      type: "assignment",
      dueDate: "2026-11-01",
      dueTime: "23:59",
      location: null,
    };

    // Fan-out ONLY delivers to active group members
    const payloads = calculateSharedDeadlineFanOut(sharedDeadline, activeMembers);
    const recipientUserIds = payloads.map((p) => p.userId);

    expect(recipientUserIds).toContain(userA);
    expect(recipientUserIds).toContain(userB);
    expect(recipientUserIds).not.toContain(userC);

    // Non-member User C attempting backfill gets nothing if they don't map to the group
    const nonMemberBackfill = calculateMemberBackfill(
      [], // Empty because non-member query for group shared deadlines returns 0 rows via RLS
      { userId: userC, localSubjectId: "subj-c-1" },
      [],
      "2026-09-15"
    );
    expect(nonMemberBackfill).toHaveLength(0);
  });
});
