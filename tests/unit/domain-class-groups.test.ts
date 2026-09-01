import { describe, test, expect } from "vitest";
import {
  calculateSharedDeadlineFanOut,
  calculateSharedDeadlinePropagation,
  calculateMemberBackfill,
  type SharedDeadlineInput,
  type ActiveMember,
  type ExistingMemberDeadline,
} from "@/server/domain/class-groups";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeSharedDeadline(overrides: Partial<SharedDeadlineInput> = {}): SharedDeadlineInput {
  return {
    id: "sd-1",
    classGroupId: "group-1",
    createdByUserId: "user-a",
    title: "Math Homework Ch. 5",
    type: "assignment",
    dueDate: "2026-09-10",
    dueTime: "23:59",
    location: null,
    ...overrides,
  };
}

function makeMember(overrides: Partial<ActiveMember> = {}): ActiveMember {
  return {
    userId: "user-b",
    localSubjectId: "subj-math",
    status: "active",
    ...overrides,
  };
}

function makeMemberDeadline(overrides: Partial<ExistingMemberDeadline> = {}): ExistingMemberDeadline {
  return {
    id: "dl-b-1",
    userId: "user-b",
    sharedDeadlineId: "sd-1",
    title: "Math Homework Ch. 5",
    type: "assignment",
    dueDate: "2026-09-10",
    dueTime: "23:59",
    location: null,
    ...overrides,
  };
}

// ─── Fan-Out Tests ──────────────────────────────────────────────────────────

describe("Domain: Class Groups — calculateSharedDeadlineFanOut", () => {
  test("creates per-member payloads for active members with mapped subjects", () => {
    const sd = makeSharedDeadline();
    const members: ActiveMember[] = [
      makeMember({ userId: "user-a", localSubjectId: "subj-a" }),
      makeMember({ userId: "user-b", localSubjectId: "subj-b" }),
      makeMember({ userId: "user-c", localSubjectId: "subj-c" }),
    ];

    const result = calculateSharedDeadlineFanOut(sd, members);

    expect(result).toHaveLength(3);
    expect(result[0].userId).toBe("user-a");
    expect(result[0].subjectId).toBe("subj-a");
    expect(result[0].title).toBe("Math Homework Ch. 5");
    expect(result[0].sharedDeadlineId).toBe("sd-1");
    expect(result[0].priority).toBe("medium");
    expect(result[0].status).toBe("not_started");
    expect(result[0].progress).toBe(0);
  });

  test("skips members with no localSubjectId (not yet mapped)", () => {
    const sd = makeSharedDeadline();
    const members: ActiveMember[] = [
      makeMember({ userId: "user-a", localSubjectId: "subj-a" }),
      makeMember({ userId: "user-b", localSubjectId: null }),
    ];

    const result = calculateSharedDeadlineFanOut(sd, members);

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe("user-a");
  });

  test("skips members with status 'left'", () => {
    const sd = makeSharedDeadline();
    const members: ActiveMember[] = [
      makeMember({ userId: "user-a", localSubjectId: "subj-a" }),
      makeMember({ userId: "user-b", localSubjectId: "subj-b", status: "left" }),
    ];

    const result = calculateSharedDeadlineFanOut(sd, members);

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe("user-a");
  });

  test("returns empty array when no eligible members", () => {
    const sd = makeSharedDeadline();
    const members: ActiveMember[] = [
      makeMember({ localSubjectId: null }),
      makeMember({ userId: "user-c", status: "left", localSubjectId: "subj-c" }),
    ];

    const result = calculateSharedDeadlineFanOut(sd, members);

    expect(result).toHaveLength(0);
  });

  test("preserves all core fields in output payloads", () => {
    const sd = makeSharedDeadline({
      title: "Final Exam Review",
      type: "exam",
      dueDate: "2026-12-15",
      dueTime: "09:00",
      location: "Room 301",
    });
    const members: ActiveMember[] = [makeMember({ userId: "user-x", localSubjectId: "subj-x" })];

    const [payload] = calculateSharedDeadlineFanOut(sd, members);

    expect(payload.title).toBe("Final Exam Review");
    expect(payload.type).toBe("exam");
    expect(payload.dueDate).toBe("2026-12-15");
    expect(payload.dueTime).toBe("09:00");
    expect(payload.location).toBe("Room 301");
  });
});

// ─── Propagation Tests ──────────────────────────────────────────────────────

describe("Domain: Class Groups — calculateSharedDeadlinePropagation", () => {
  test("generates updates only for changed core fields", () => {
    const updatedFields = {
      title: "Math Homework Ch. 6", // changed
      type: "assignment" as const, // unchanged
      dueDate: "2026-09-10", // unchanged
      dueTime: "23:59", // unchanged
      location: null, // unchanged
    };

    const memberDeadlines: ExistingMemberDeadline[] = [makeMemberDeadline()];

    const result = calculateSharedDeadlinePropagation(updatedFields, memberDeadlines);

    expect(result).toHaveLength(1);
    expect(result[0].updates).toEqual({ title: "Math Homework Ch. 6" });
  });

  test("excludes member deadlines with no changes", () => {
    const updatedFields = {
      title: "Math Homework Ch. 5", // same
      type: "assignment" as const,
      dueDate: "2026-09-10",
      dueTime: "23:59",
      location: null,
    };

    const memberDeadlines: ExistingMemberDeadline[] = [makeMemberDeadline()];

    const result = calculateSharedDeadlinePropagation(updatedFields, memberDeadlines);

    expect(result).toHaveLength(0);
  });

  test("propagates multiple changed fields at once", () => {
    const updatedFields = {
      title: "Updated Title",
      type: "exam" as const,
      dueDate: "2026-09-15",
      dueTime: "10:00",
      location: "Library",
    };

    const memberDeadlines: ExistingMemberDeadline[] = [makeMemberDeadline()];

    const result = calculateSharedDeadlinePropagation(updatedFields, memberDeadlines);

    expect(result).toHaveLength(1);
    expect(result[0].updates).toEqual({
      title: "Updated Title",
      type: "exam",
      dueDate: "2026-09-15",
      dueTime: "10:00",
      location: "Library",
    });
  });

  test("never includes personal fields (priority, progress, notes, etc.)", () => {
    const updatedFields = {
      title: "Changed Title",
      type: "assignment" as const,
      dueDate: "2026-09-10",
      dueTime: "23:59",
      location: null,
    };

    const memberDeadlines: ExistingMemberDeadline[] = [makeMemberDeadline()];

    const result = calculateSharedDeadlinePropagation(updatedFields, memberDeadlines);

    expect(result).toHaveLength(1);
    const updateKeys = Object.keys(result[0].updates);
    expect(updateKeys).not.toContain("priority");
    expect(updateKeys).not.toContain("progress");
    expect(updateKeys).not.toContain("estimatedEffortHours");
    expect(updateKeys).not.toContain("notes");
    expect(updateKeys).not.toContain("reminders");
  });

  test("handles multiple member deadlines independently", () => {
    const updatedFields = {
      title: "New Title",
      type: "assignment" as const,
      dueDate: "2026-09-10",
      dueTime: "23:59",
      location: null,
    };

    const memberDeadlines: ExistingMemberDeadline[] = [
      makeMemberDeadline({ id: "dl-1", title: "Math Homework Ch. 5" }),
      makeMemberDeadline({ id: "dl-2", title: "New Title" }), // already matches
    ];

    const result = calculateSharedDeadlinePropagation(updatedFields, memberDeadlines);

    expect(result).toHaveLength(1);
    expect(result[0].deadlineId).toBe("dl-1");
  });
});

// ─── Backfill Tests ─────────────────────────────────────────────────────────

describe("Domain: Class Groups — calculateMemberBackfill", () => {
  test("creates payloads for upcoming shared deadlines", () => {
    const sharedDeadlines: SharedDeadlineInput[] = [
      makeSharedDeadline({ id: "sd-1", dueDate: "2026-09-10" }),
      makeSharedDeadline({ id: "sd-2", dueDate: "2026-09-15" }),
    ];
    const newMember = { userId: "user-new", localSubjectId: "subj-new" };

    const result = calculateMemberBackfill(sharedDeadlines, newMember, [], "2026-09-05");

    expect(result).toHaveLength(2);
    expect(result[0].userId).toBe("user-new");
    expect(result[0].subjectId).toBe("subj-new");
    expect(result[0].sharedDeadlineId).toBe("sd-1");
    expect(result[1].sharedDeadlineId).toBe("sd-2");
  });

  test("skips past deadlines (dueDate < today)", () => {
    const sharedDeadlines: SharedDeadlineInput[] = [
      makeSharedDeadline({ id: "sd-past", dueDate: "2026-09-01" }),
      makeSharedDeadline({ id: "sd-future", dueDate: "2026-09-15" }),
    ];
    const newMember = { userId: "user-new", localSubjectId: "subj-new" };

    const result = calculateMemberBackfill(sharedDeadlines, newMember, [], "2026-09-05");

    expect(result).toHaveLength(1);
    expect(result[0].sharedDeadlineId).toBe("sd-future");
  });

  test("skips shared deadlines the member already has", () => {
    const sharedDeadlines: SharedDeadlineInput[] = [
      makeSharedDeadline({ id: "sd-1", dueDate: "2026-09-10" }),
      makeSharedDeadline({ id: "sd-2", dueDate: "2026-09-15" }),
    ];
    const newMember = { userId: "user-new", localSubjectId: "subj-new" };
    const existingIds = ["sd-1"];

    const result = calculateMemberBackfill(sharedDeadlines, newMember, existingIds, "2026-09-05");

    expect(result).toHaveLength(1);
    expect(result[0].sharedDeadlineId).toBe("sd-2");
  });

  test("returns empty array when no upcoming shared deadlines", () => {
    const sharedDeadlines: SharedDeadlineInput[] = [
      makeSharedDeadline({ id: "sd-past-1", dueDate: "2026-09-01" }),
      makeSharedDeadline({ id: "sd-past-2", dueDate: "2026-09-02" }),
    ];
    const newMember = { userId: "user-new", localSubjectId: "subj-new" };

    const result = calculateMemberBackfill(sharedDeadlines, newMember, [], "2026-09-05");

    expect(result).toHaveLength(0);
  });

  test("returns empty array when group has no shared deadlines", () => {
    const newMember = { userId: "user-new", localSubjectId: "subj-new" };

    const result = calculateMemberBackfill([], newMember, [], "2026-09-05");

    expect(result).toHaveLength(0);
  });

  test("includes deadlines due today", () => {
    const sharedDeadlines: SharedDeadlineInput[] = [
      makeSharedDeadline({ id: "sd-today", dueDate: "2026-09-05" }),
    ];
    const newMember = { userId: "user-new", localSubjectId: "subj-new" };

    const result = calculateMemberBackfill(sharedDeadlines, newMember, [], "2026-09-05");

    expect(result).toHaveLength(1);
    expect(result[0].sharedDeadlineId).toBe("sd-today");
  });

  test("uses the new member's localSubjectId for all payloads", () => {
    const sharedDeadlines: SharedDeadlineInput[] = [
      makeSharedDeadline({ id: "sd-1", dueDate: "2026-09-10" }),
    ];
    const newMember = { userId: "user-new", localSubjectId: "subj-physics" };

    const result = calculateMemberBackfill(sharedDeadlines, newMember, [], "2026-09-05");

    expect(result[0].subjectId).toBe("subj-physics");
  });
});
