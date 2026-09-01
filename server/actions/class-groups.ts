"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db";
import {
  classGroups,
  classGroupMembers,
  classGroupInvites,
  sharedDeadlines,
  deadlines,
  friendships,
  users,
  type ClassGroup,
  type ClassGroupMember,
  type ClassGroupInvite,
  type SharedDeadline,
} from "@/server/db/schema";
import {
  createClassGroupSchema,
  inviteFriendToGroupSchema,
  respondGroupInviteSchema,
  mapGroupSubjectSchema,
  createSharedDeadlineSchema,
  updateSharedDeadlineSchema,
  type CreateClassGroupInput,
  type InviteFriendToGroupInput,
  type RespondGroupInviteInput,
  type MapGroupSubjectInput,
  type CreateSharedDeadlineInput,
  type UpdateSharedDeadlineInput,
} from "@/lib/validation/class-groups";
import { canInviteToClassGroup } from "@/server/domain/friendships";
import {
  calculateSharedDeadlineFanOut,
  calculateSharedDeadlinePropagation,
  calculateMemberBackfill,
} from "@/server/domain/class-groups";
import { eq, and, or, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── View Types ─────────────────────────────────────────────────────────────

export interface ClassGroupWithMemberCount {
  group: ClassGroup;
  memberCount: number;
  mySubjectId: string | null;
}

export interface ClassGroupDetail {
  group: ClassGroup;
  members: (ClassGroupMember & { userName: string | null; userEmail: string })[];
  sharedDeadlines: SharedDeadline[];
  myMembership: ClassGroupMember;
}

export interface PendingGroupInvite {
  invite: ClassGroupInvite;
  groupName: string;
  invitedByName: string | null;
  memberCount: number;
}

// ─── Create Class Group ─────────────────────────────────────────────────────

export async function createClassGroupAction(
  rawInput: CreateClassGroupInput
): Promise<ActionResult<ClassGroup>> {
  const parseResult = createClassGroupSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { name, localSubjectId, friendIdsToInvite } = parseResult.data;

    // Create the group
    const [group] = await db
      .insert(classGroups)
      .values({ name, createdByUserId: user.id })
      .returning();

    // Add creator as first active member with their subject mapping
    await db.insert(classGroupMembers).values({
      classGroupId: group.id,
      userId: user.id,
      localSubjectId,
      status: "active",
    });

    // Send invites to selected friends
    if (friendIdsToInvite && friendIdsToInvite.length > 0) {
      const inviteValues = friendIdsToInvite.map((friendId) => ({
        classGroupId: group.id,
        invitedUserId: friendId,
        invitedByUserId: user.id,
        status: "pending" as const,
      }));
      await db.insert(classGroupInvites).values(inviteValues);
    }

    revalidatePath("/subjects");
    revalidatePath("/settings");

    return { success: true, data: group };
  } catch (error) {
    console.error("Failed to create class group:", error);
    return { success: false, error: "Failed to create class group" };
  }
}

// ─── Invite Friend to Group ─────────────────────────────────────────────────

export async function inviteFriendToGroupAction(
  rawInput: InviteFriendToGroupInput
): Promise<ActionResult<ClassGroupInvite>> {
  const parseResult = inviteFriendToGroupSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { classGroupId, friendUserId } = parseResult.data;

    // Verify active membership
    const [membership] = await db
      .select()
      .from(classGroupMembers)
      .where(
        and(
          eq(classGroupMembers.classGroupId, classGroupId),
          eq(classGroupMembers.userId, user.id),
          eq(classGroupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "You are not an active member of this group." };
    }

    // Verify friendship
    const userFriendships = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.requesterId, user.id), eq(friendships.addresseeId, friendUserId)),
          and(eq(friendships.requesterId, friendUserId), eq(friendships.addresseeId, user.id))
        )
      );

    const check = canInviteToClassGroup(userFriendships, user.id, friendUserId);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    // Check if already a member or has pending invite
    const [existingMember] = await db
      .select()
      .from(classGroupMembers)
      .where(
        and(
          eq(classGroupMembers.classGroupId, classGroupId),
          eq(classGroupMembers.userId, friendUserId),
          eq(classGroupMembers.status, "active")
        )
      );

    if (existingMember) {
      return { success: false, error: "This user is already a member of the group." };
    }

    const [existingInvite] = await db
      .select()
      .from(classGroupInvites)
      .where(
        and(
          eq(classGroupInvites.classGroupId, classGroupId),
          eq(classGroupInvites.invitedUserId, friendUserId),
          eq(classGroupInvites.status, "pending")
        )
      );

    if (existingInvite) {
      return { success: false, error: "An invite is already pending for this user." };
    }

    const [invite] = await db
      .insert(classGroupInvites)
      .values({
        classGroupId,
        invitedUserId: friendUserId,
        invitedByUserId: user.id,
      })
      .returning();

    revalidatePath(`/groups/${classGroupId}`);
    return { success: true, data: invite };
  } catch (error) {
    console.error("Failed to invite friend:", error);
    return { success: false, error: "Failed to invite friend" };
  }
}

// ─── Respond to Group Invite (with mandatory subject mapping) ───────────────

export async function respondGroupInviteAction(
  rawInput: RespondGroupInviteInput
): Promise<ActionResult> {
  const parseResult = respondGroupInviteSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { inviteId, response, localSubjectId } = parseResult.data;

    // Fetch and validate invite
    const [invite] = await db
      .select()
      .from(classGroupInvites)
      .where(
        and(
          eq(classGroupInvites.id, inviteId),
          eq(classGroupInvites.invitedUserId, user.id),
          eq(classGroupInvites.status, "pending")
        )
      );

    if (!invite) {
      return { success: false, error: "Invite not found or already responded." };
    }

    // Step 1: Update invite status
    await db
      .update(classGroupInvites)
      .set({ status: response, respondedAt: new Date() })
      .where(eq(classGroupInvites.id, inviteId));

    if (response === "accepted" && localSubjectId) {
      // Step 2: Create membership with subject mapping
      await db.insert(classGroupMembers).values({
        classGroupId: invite.classGroupId,
        userId: user.id,
        localSubjectId,
        status: "active",
      });

      // Step 3: Immediately run backfill for upcoming shared deadlines
      const groupSharedDeadlines = await db
        .select()
        .from(sharedDeadlines)
        .where(eq(sharedDeadlines.classGroupId, invite.classGroupId));

      const existingDeadlineRows = await db
        .select({ sharedDeadlineId: deadlines.sharedDeadlineId })
        .from(deadlines)
        .where(eq(deadlines.userId, user.id));

      const existingSharedIds = existingDeadlineRows
        .map((d) => d.sharedDeadlineId)
        .filter((id): id is string => id !== null);

      const today = format(new Date(), "yyyy-MM-dd");
      const backfillPayloads = calculateMemberBackfill(
        groupSharedDeadlines.map((sd) => ({
          id: sd.id,
          classGroupId: sd.classGroupId,
          createdByUserId: sd.createdByUserId,
          title: sd.title,
          type: sd.type,
          dueDate: sd.dueDate,
          dueTime: sd.dueTime,
          location: sd.location,
        })),
        { userId: user.id, localSubjectId },
        existingSharedIds,
        today
      );

      if (backfillPayloads.length > 0) {
        await db.insert(deadlines).values(
          backfillPayloads.map((p) => ({
            userId: p.userId,
            subjectId: p.subjectId,
            title: p.title,
            type: p.type,
            dueDate: p.dueDate,
            dueTime: p.dueTime,
            location: p.location,
            priority: p.priority,
            status: p.status,
            progress: p.progress,
            sharedDeadlineId: p.sharedDeadlineId,
          }))
        );
      }
    }

    revalidatePath("/settings");
    revalidatePath("/today");
    revalidatePath("/deadlines");

    return { success: true };
  } catch (error) {
    console.error("Failed to respond to group invite:", error);
    return { success: false, error: "Failed to respond to invite" };
  }
}

// ─── Map/Change Group Subject (with backfill trigger) ───────────────────────

export async function mapGroupSubjectAction(
  rawInput: MapGroupSubjectInput
): Promise<ActionResult> {
  const parseResult = mapGroupSubjectSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { classGroupMemberId, localSubjectId } = parseResult.data;

    // Update membership with new subject
    const [membership] = await db
      .update(classGroupMembers)
      .set({ localSubjectId })
      .where(
        and(
          eq(classGroupMembers.id, classGroupMemberId),
          eq(classGroupMembers.userId, user.id)
        )
      )
      .returning();

    if (!membership) {
      return { success: false, error: "Membership not found." };
    }

    // Trigger backfill for any shared deadlines not yet fanned out
    const groupSharedDeadlines = await db
      .select()
      .from(sharedDeadlines)
      .where(eq(sharedDeadlines.classGroupId, membership.classGroupId));

    const existingDeadlineRows = await db
      .select({ sharedDeadlineId: deadlines.sharedDeadlineId })
      .from(deadlines)
      .where(eq(deadlines.userId, user.id));

    const existingSharedIds = existingDeadlineRows
      .map((d) => d.sharedDeadlineId)
      .filter((id): id is string => id !== null);

    const today = format(new Date(), "yyyy-MM-dd");
    const backfillPayloads = calculateMemberBackfill(
      groupSharedDeadlines.map((sd) => ({
        id: sd.id,
        classGroupId: sd.classGroupId,
        createdByUserId: sd.createdByUserId,
        title: sd.title,
        type: sd.type,
        dueDate: sd.dueDate,
        dueTime: sd.dueTime,
        location: sd.location,
      })),
      { userId: user.id, localSubjectId },
      existingSharedIds,
      today
    );

    if (backfillPayloads.length > 0) {
      await db.insert(deadlines).values(
        backfillPayloads.map((p) => ({
          userId: p.userId,
          subjectId: p.subjectId,
          title: p.title,
          type: p.type,
          dueDate: p.dueDate,
          dueTime: p.dueTime,
          location: p.location,
          priority: p.priority,
          status: p.status,
          progress: p.progress,
          sharedDeadlineId: p.sharedDeadlineId,
        }))
      );
    }

    revalidatePath("/today");
    revalidatePath("/deadlines");

    return { success: true };
  } catch (error) {
    console.error("Failed to map group subject:", error);
    return { success: false, error: "Failed to update subject mapping" };
  }
}

// ─── Create Shared Deadline (with fan-out) ──────────────────────────────────

export async function createSharedDeadlineAction(
  rawInput: CreateSharedDeadlineInput
): Promise<ActionResult<SharedDeadline>> {
  const parseResult = createSharedDeadlineSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const input = parseResult.data;

    // Verify active membership
    const [membership] = await db
      .select()
      .from(classGroupMembers)
      .where(
        and(
          eq(classGroupMembers.classGroupId, input.classGroupId),
          eq(classGroupMembers.userId, user.id),
          eq(classGroupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "You are not an active member of this group." };
    }

    // Create the shared deadline
    const [sharedDeadline] = await db
      .insert(sharedDeadlines)
      .values({
        classGroupId: input.classGroupId,
        createdByUserId: user.id,
        lastEditedByUserId: user.id,
        title: input.title,
        type: input.type,
        dueDate: input.dueDate,
        dueTime: input.dueTime ?? null,
        location: input.location ?? null,
        sharedNotes: input.sharedNotes ?? null,
      })
      .returning();

    // Fan out to all active members with mapped subjects
    const activeMembers = await db
      .select()
      .from(classGroupMembers)
      .where(
        and(
          eq(classGroupMembers.classGroupId, input.classGroupId),
          eq(classGroupMembers.status, "active")
        )
      );

    const fanOutPayloads = calculateSharedDeadlineFanOut(
      {
        id: sharedDeadline.id,
        classGroupId: sharedDeadline.classGroupId,
        createdByUserId: sharedDeadline.createdByUserId,
        title: sharedDeadline.title,
        type: sharedDeadline.type,
        dueDate: sharedDeadline.dueDate,
        dueTime: sharedDeadline.dueTime,
        location: sharedDeadline.location,
      },
      activeMembers.map((m) => ({
        userId: m.userId,
        localSubjectId: m.localSubjectId,
        status: m.status as "active" | "left",
      }))
    );

    if (fanOutPayloads.length > 0) {
      await db.insert(deadlines).values(
        fanOutPayloads.map((p) => ({
          userId: p.userId,
          subjectId: p.subjectId,
          title: p.title,
          type: p.type,
          dueDate: p.dueDate,
          dueTime: p.dueTime,
          location: p.location,
          priority: p.priority,
          status: p.status,
          progress: p.progress,
          sharedDeadlineId: p.sharedDeadlineId,
        }))
      );
    }

    revalidatePath("/today");
    revalidatePath("/deadlines");
    revalidatePath(`/groups/${input.classGroupId}`);

    return { success: true, data: sharedDeadline };
  } catch (error) {
    console.error("Failed to create shared deadline:", error);
    return { success: false, error: "Failed to create shared deadline" };
  }
}

// ─── Update Shared Deadline (with propagation) ──────────────────────────────

export async function updateSharedDeadlineAction(
  rawInput: UpdateSharedDeadlineInput
): Promise<ActionResult<SharedDeadline>> {
  const parseResult = updateSharedDeadlineSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid input" };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { sharedDeadlineId, ...updateFields } = parseResult.data;

    // Fetch existing shared deadline
    const [existing] = await db
      .select()
      .from(sharedDeadlines)
      .where(eq(sharedDeadlines.id, sharedDeadlineId));

    if (!existing) {
      return { success: false, error: "Shared deadline not found." };
    }

    // Verify active membership
    const [membership] = await db
      .select()
      .from(classGroupMembers)
      .where(
        and(
          eq(classGroupMembers.classGroupId, existing.classGroupId),
          eq(classGroupMembers.userId, user.id),
          eq(classGroupMembers.status, "active")
        )
      );

    if (!membership) {
      return { success: false, error: "You are not an active member of this group." };
    }

    // Update the shared deadline
    const updateValues: Record<string, unknown> = {
      lastEditedByUserId: user.id,
      updatedAt: new Date(),
    };
    if (updateFields.title !== undefined) updateValues.title = updateFields.title;
    if (updateFields.type !== undefined) updateValues.type = updateFields.type;
    if (updateFields.dueDate !== undefined) updateValues.dueDate = updateFields.dueDate;
    if (updateFields.dueTime !== undefined) updateValues.dueTime = updateFields.dueTime;
    if (updateFields.location !== undefined) updateValues.location = updateFields.location;
    if (updateFields.sharedNotes !== undefined) updateValues.sharedNotes = updateFields.sharedNotes;

    const [updated] = await db
      .update(sharedDeadlines)
      .set(updateValues)
      .where(eq(sharedDeadlines.id, sharedDeadlineId))
      .returning();

    // Propagate core field changes to member deadlines
    const memberDeadlineRows = await db
      .select()
      .from(deadlines)
      .where(eq(deadlines.sharedDeadlineId, sharedDeadlineId));

    const propagationPayloads = calculateSharedDeadlinePropagation(
      {
        title: updated.title,
        type: updated.type,
        dueDate: updated.dueDate,
        dueTime: updated.dueTime,
        location: updated.location,
      },
      memberDeadlineRows.map((d) => ({
        id: d.id,
        userId: d.userId,
        sharedDeadlineId: d.sharedDeadlineId!,
        title: d.title,
        type: d.type,
        dueDate: d.dueDate,
        dueTime: d.dueTime,
        location: d.location,
      }))
    );

    // Apply propagation updates
    for (const payload of propagationPayloads) {
      await db
        .update(deadlines)
        .set({ ...payload.updates, updatedAt: new Date() })
        .where(eq(deadlines.id, payload.deadlineId));
    }

    revalidatePath("/today");
    revalidatePath("/deadlines");
    revalidatePath(`/groups/${existing.classGroupId}`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update shared deadline:", error);
    return { success: false, error: "Failed to update shared deadline" };
  }
}

// ─── Leave Class Group ──────────────────────────────────────────────────────

export async function leaveClassGroupAction(
  classGroupId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const [updated] = await db
      .update(classGroupMembers)
      .set({ status: "left", leftAt: new Date() })
      .where(
        and(
          eq(classGroupMembers.classGroupId, classGroupId),
          eq(classGroupMembers.userId, user.id),
          eq(classGroupMembers.status, "active")
        )
      )
      .returning();

    if (!updated) {
      return { success: false, error: "Membership not found." };
    }

    revalidatePath("/settings");
    revalidatePath("/subjects");
    return { success: true };
  } catch (error) {
    console.error("Failed to leave class group:", error);
    return { success: false, error: "Failed to leave group" };
  }
}

// ─── Get User's Class Groups ────────────────────────────────────────────────

export async function getClassGroupsAction(): Promise<ActionResult<ClassGroupWithMemberCount[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, data: [] };

    // Get groups where user is active member
    const memberships = await db
      .select()
      .from(classGroupMembers)
      .where(
        and(
          eq(classGroupMembers.userId, user.id),
          eq(classGroupMembers.status, "active")
        )
      );

    if (memberships.length === 0) return { success: true, data: [] };

    const groupIds = memberships.map((m) => m.classGroupId);
    const groups = await db
      .select()
      .from(classGroups)
      .where(inArray(classGroups.id, groupIds));

    // Count active members per group
    const result: ClassGroupWithMemberCount[] = [];
    for (const group of groups) {
      const members = await db
        .select()
        .from(classGroupMembers)
        .where(
          and(
            eq(classGroupMembers.classGroupId, group.id),
            eq(classGroupMembers.status, "active")
          )
        );
      const myMembership = memberships.find((m) => m.classGroupId === group.id);
      result.push({
        group,
        memberCount: members.length,
        mySubjectId: myMembership?.localSubjectId ?? null,
      });
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch class groups:", error);
    return { success: false, error: "Failed to load class groups" };
  }
}

// ─── Get Class Group Detail ─────────────────────────────────────────────────

export async function getClassGroupDetailAction(
  classGroupId: string
): Promise<ActionResult<ClassGroupDetail>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Verify active membership
    const [myMembership] = await db
      .select()
      .from(classGroupMembers)
      .where(
        and(
          eq(classGroupMembers.classGroupId, classGroupId),
          eq(classGroupMembers.userId, user.id),
          eq(classGroupMembers.status, "active")
        )
      );

    if (!myMembership) {
      return { success: false, error: "You are not a member of this group." };
    }

    // Fetch group
    const [group] = await db
      .select()
      .from(classGroups)
      .where(eq(classGroups.id, classGroupId));

    if (!group) {
      return { success: false, error: "Group not found." };
    }

    // Fetch active members with profiles
    const memberRows = await db
      .select()
      .from(classGroupMembers)
      .where(
        and(
          eq(classGroupMembers.classGroupId, classGroupId),
          eq(classGroupMembers.status, "active")
        )
      );

    const membersWithProfile = [];
    for (const m of memberRows) {
      const [memberUser] = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, m.userId));
      membersWithProfile.push({
        ...m,
        userName: memberUser?.name ?? null,
        userEmail: memberUser?.email ?? "",
      });
    }

    // Fetch shared deadlines
    const groupSharedDeadlines = await db
      .select()
      .from(sharedDeadlines)
      .where(eq(sharedDeadlines.classGroupId, classGroupId));

    return {
      success: true,
      data: {
        group,
        members: membersWithProfile,
        sharedDeadlines: groupSharedDeadlines,
        myMembership,
      },
    };
  } catch (error) {
    console.error("Failed to fetch class group detail:", error);
    return { success: false, error: "Failed to load group details" };
  }
}

// ─── Get Pending Group Invites ──────────────────────────────────────────────

export async function getPendingGroupInvitesAction(): Promise<ActionResult<PendingGroupInvite[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: true, data: [] };

    const pendingInvites = await db
      .select()
      .from(classGroupInvites)
      .where(
        and(
          eq(classGroupInvites.invitedUserId, user.id),
          eq(classGroupInvites.status, "pending")
        )
      );

    const result: PendingGroupInvite[] = [];
    for (const invite of pendingInvites) {
      const [group] = await db
        .select()
        .from(classGroups)
        .where(eq(classGroups.id, invite.classGroupId));

      const [inviter] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, invite.invitedByUserId));

      const memberCount = (
        await db
          .select()
          .from(classGroupMembers)
          .where(
            and(
              eq(classGroupMembers.classGroupId, invite.classGroupId),
              eq(classGroupMembers.status, "active")
            )
          )
      ).length;

      result.push({
        invite,
        groupName: group?.name ?? "Unknown Group",
        invitedByName: inviter?.name ?? null,
        memberCount,
      });
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to fetch pending invites:", error);
    return { success: false, error: "Failed to load invites" };
  }
}
