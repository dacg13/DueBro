import { z } from "zod";
import { reminderModeEnum, reminderChannelEnum } from "@/types/reminders";

export const reminderSchema = z
  .object({
    mode: z.enum(reminderModeEnum),
    offsetMinutes: z.number().int().min(0).max(43200).nullable().optional(), // up to 30 days
    fireAt: z.union([z.string(), z.date()]).optional(),
    channels: z.array(z.enum(reminderChannelEnum)).default(["push", "email"]),
  })
  .refine(
    (data) => {
      if (data.mode === "relative") {
        return typeof data.offsetMinutes === "number";
      }
      return Boolean(data.fireAt);
    },
    {
      message: "Relative reminders require offsetMinutes; absolute reminders require fireAt.",
    }
  );

export type ReminderInput = z.infer<typeof reminderSchema>;

export const quietHoursSchema = z.object({
  enabled: z.boolean().default(true),
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:MM"),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:MM"),
});

export type QuietHoursInput = z.infer<typeof quietHoursSchema>;

export const notificationPreferencesSchema = z.object({
  inApp: z.boolean().default(true),
  webPush: z.boolean().default(true),
  email: z.boolean().default(false),
  quietHours: quietHoursSchema,
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
