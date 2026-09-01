import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(60),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  timezone: z.string().default("UTC"),
  dailyCapacityHours: z.number().min(0.5, "Daily capacity must be at least 30 minutes").max(16),
  weekendCapacityHours: z.number().min(0, "Weekend capacity must be non-negative").max(16),
  quietHoursStart: z.string().nullable().optional(),
  quietHoursEnd: z.string().nullable().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const channelPreferenceSchema = z.object({
  push: z.boolean(),
  email: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  upcoming: channelPreferenceSchema,
  critical: channelPreferenceSchema,
  overdue: channelPreferenceSchema,
  exam: channelPreferenceSchema,
  digest: channelPreferenceSchema,
  workload: channelPreferenceSchema,
  shared_deadline_added: channelPreferenceSchema,
  shared_deadline_edited: channelPreferenceSchema,
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
