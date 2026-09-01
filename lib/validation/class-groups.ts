import { z } from "zod";
import { deadlineTypeEnum } from "@/server/db/schema/deadlines";

export const createClassGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(60, "Group name is too long"),
  localSubjectId: z.string().uuid("Please select a subject"),
  friendIdsToInvite: z.array(z.string()).optional().default([]),
});

export type CreateClassGroupInput = z.infer<typeof createClassGroupSchema>;

export const inviteFriendToGroupSchema = z.object({
  classGroupId: z.string().uuid("Invalid class group ID"),
  friendUserId: z.string().min(1, "Friend user ID is required"),
});

export type InviteFriendToGroupInput = z.infer<typeof inviteFriendToGroupSchema>;

export const respondGroupInviteSchema = z.object({
  inviteId: z.string().uuid("Invalid invite ID"),
  response: z.enum(["accepted", "declined"]),
  // Required on accept — the invitee must map the group to one of their local subjects
  localSubjectId: z.string().uuid("Please select a subject").optional(),
}).refine(
  (data) => data.response === "declined" || (data.response === "accepted" && data.localSubjectId),
  { message: "You must select a subject when accepting an invite", path: ["localSubjectId"] }
);

export type RespondGroupInviteInput = z.infer<typeof respondGroupInviteSchema>;

export const mapGroupSubjectSchema = z.object({
  classGroupMemberId: z.string().uuid("Invalid membership ID"),
  localSubjectId: z.string().uuid("Please select a subject"),
});

export type MapGroupSubjectInput = z.infer<typeof mapGroupSubjectSchema>;

export const createSharedDeadlineSchema = z.object({
  classGroupId: z.string().uuid("Invalid class group ID"),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  type: z.enum(deadlineTypeEnum),
  dueDate: z.string().min(1, "Due date is required"), // YYYY-MM-DD
  dueTime: z.string().nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  sharedNotes: z.string().max(5000).nullable().optional(),
});

export type CreateSharedDeadlineInput = z.infer<typeof createSharedDeadlineSchema>;

export const updateSharedDeadlineSchema = z.object({
  sharedDeadlineId: z.string().uuid("Invalid shared deadline ID"),
  title: z.string().min(1, "Title is required").max(200).optional(),
  type: z.enum(deadlineTypeEnum).optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  sharedNotes: z.string().max(5000).nullable().optional(),
});

export type UpdateSharedDeadlineInput = z.infer<typeof updateSharedDeadlineSchema>;
