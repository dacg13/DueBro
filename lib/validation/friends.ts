import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  targetEmail: z.string().email("Please enter a valid email address"),
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;

export const respondFriendRequestSchema = z.object({
  friendshipId: z.string().uuid("Invalid friendship ID"),
  response: z.enum(["accepted", "declined"]),
});

export type RespondFriendRequestInput = z.infer<typeof respondFriendRequestSchema>;

export const blockFriendSchema = z.object({
  friendshipId: z.string().uuid("Invalid friendship ID"),
});

export type BlockFriendInput = z.infer<typeof blockFriendSchema>;

export const removeFriendSchema = z.object({
  friendshipId: z.string().uuid("Invalid friendship ID"),
});

export type RemoveFriendInput = z.infer<typeof removeFriendSchema>;
