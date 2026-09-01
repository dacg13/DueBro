/**
 * Domain Module: Class Groups & Shared Deadlines
 *
 * Responsibilities:
 * - Fan-out calculation: shared deadline → per-member individual deadline payloads
 * - Propagation calculation: shared deadline edit → member deadline update payloads
 * - Member backfill calculation: new member joins → upcoming shared deadlines they need
 *
 * Constraints:
 * - Pure functions only — no direct database I/O inside this domain module.
 * - Core fields (title, type, dueDate, dueTime, location) are propagated.
 * - Personal fields (priority, progress, estimatedEffortHours, notes, reminders) are NEVER touched.
 * - sharedNotes lives exclusively on shared_deadlines — never copied to deadlines.
 */

import { type DeadlineType } from "@/server/db/schema/deadlines";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SharedDeadlineInput {
  id: string;
  classGroupId: string;
  createdByUserId: string;
  title: string;
  type: DeadlineType;
  dueDate: string; // YYYY-MM-DD
  dueTime: string | null;
  location: string | null;
}

export interface ActiveMember {
  userId: string;
  localSubjectId: string | null;
  status: "active" | "left";
}

export interface FanOutDeadlinePayload {
  userId: string;
  subjectId: string | null;
  title: string;
  type: DeadlineType;
  dueDate: string;
  dueTime: string | null;
  location: string | null;
  priority: "medium";
  status: "not_started";
  progress: 0;
  sharedDeadlineId: string;
}

export interface PropagationUpdatePayload {
  deadlineId: string;
  updates: Partial<{
    title: string;
    type: DeadlineType;
    dueDate: string;
    dueTime: string | null;
    location: string | null;
  }>;
}

export interface ExistingMemberDeadline {
  id: string;
  userId: string;
  sharedDeadlineId: string;
  title: string;
  type: DeadlineType;
  dueDate: string | null;
  dueTime: string | null;
  location: string | null;
}

export interface SharedDeadlineCoreFields {
  title: string;
  type: DeadlineType;
  dueDate: string;
  dueTime: string | null;
  location: string | null;
}

// ─── Fan-Out ────────────────────────────────────────────────────────────────

/**
 * Calculates per-member deadline payloads for a new shared deadline.
 *
 * Rules:
 * - Only active members with a mapped localSubjectId are included.
 * - Members with status = "left" are excluded.
 * - Members without localSubjectId are excluded (backfill handles them on mapping).
 * - Each output payload gets priority = "medium", progress = 0, status = "not_started".
 */
export function calculateSharedDeadlineFanOut(
  sharedDeadline: SharedDeadlineInput,
  activeMembers: ActiveMember[]
): FanOutDeadlinePayload[] {
  return activeMembers
    .filter((m) => m.status === "active" && m.localSubjectId !== null)
    .map((member) => ({
      userId: member.userId,
      subjectId: member.localSubjectId,
      title: sharedDeadline.title,
      type: sharedDeadline.type,
      dueDate: sharedDeadline.dueDate,
      dueTime: sharedDeadline.dueTime,
      location: sharedDeadline.location,
      priority: "medium" as const,
      status: "not_started" as const,
      progress: 0 as const,
      sharedDeadlineId: sharedDeadline.id,
    }));
}

// ─── Propagation ────────────────────────────────────────────────────────────

/**
 * Calculates update payloads for existing member deadlines when a shared deadline is edited.
 *
 * Rules:
 * - Only core fields are compared and propagated: title, type, dueDate, dueTime, location.
 * - Personal fields (priority, progress, estimatedEffortHours, notes, reminders) are NEVER touched.
 * - If no core fields changed for a particular member deadline, it's excluded from the output.
 */
export function calculateSharedDeadlinePropagation(
  updatedCoreFields: SharedDeadlineCoreFields,
  existingMemberDeadlines: ExistingMemberDeadline[]
): PropagationUpdatePayload[] {
  const results: PropagationUpdatePayload[] = [];

  for (const memberDeadline of existingMemberDeadlines) {
    const updates: PropagationUpdatePayload["updates"] = {};
    let hasChanges = false;

    if (memberDeadline.title !== updatedCoreFields.title) {
      updates.title = updatedCoreFields.title;
      hasChanges = true;
    }
    if (memberDeadline.type !== updatedCoreFields.type) {
      updates.type = updatedCoreFields.type;
      hasChanges = true;
    }
    if (memberDeadline.dueDate !== updatedCoreFields.dueDate) {
      updates.dueDate = updatedCoreFields.dueDate;
      hasChanges = true;
    }
    if (memberDeadline.dueTime !== updatedCoreFields.dueTime) {
      updates.dueTime = updatedCoreFields.dueTime;
      hasChanges = true;
    }
    if (memberDeadline.location !== updatedCoreFields.location) {
      updates.location = updatedCoreFields.location;
      hasChanges = true;
    }

    if (hasChanges) {
      results.push({
        deadlineId: memberDeadline.id,
        updates,
      });
    }
  }

  return results;
}

// ─── Backfill ───────────────────────────────────────────────────────────────

/**
 * Calculates deadline payloads for a new member who just mapped their subject.
 * Only includes shared deadlines with dueDate >= today that the member doesn't already have.
 *
 * Rules:
 * - Past deadlines (dueDate < today) are skipped.
 * - The member's localSubjectId is used as the subjectId for each deadline.
 * - If the member already has a deadline for a given sharedDeadlineId, it's excluded.
 */
export function calculateMemberBackfill(
  allSharedDeadlines: SharedDeadlineInput[],
  newMember: { userId: string; localSubjectId: string },
  existingDeadlineSharedIds: string[],
  today: string // YYYY-MM-DD
): FanOutDeadlinePayload[] {
  const existingSet = new Set(existingDeadlineSharedIds);

  return allSharedDeadlines
    .filter((sd) => {
      // Only upcoming deadlines (dueDate >= today)
      if (sd.dueDate < today) return false;
      // Skip if member already has this shared deadline
      if (existingSet.has(sd.id)) return false;
      return true;
    })
    .map((sd) => ({
      userId: newMember.userId,
      subjectId: newMember.localSubjectId,
      title: sd.title,
      type: sd.type,
      dueDate: sd.dueDate,
      dueTime: sd.dueTime,
      location: sd.location,
      priority: "medium" as const,
      status: "not_started" as const,
      progress: 0 as const,
      sharedDeadlineId: sd.id,
    }));
}
