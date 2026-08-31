import { z } from "zod";
import { recurrenceFrequencyEnum, dayOfWeekEnum } from "@/types/recurrence";

export const recurrenceRuleSchema = z
  .object({
    frequency: z.enum(recurrenceFrequencyEnum),
    interval: z.number().int().min(1).default(1),
    byDay: z.array(z.enum(dayOfWeekEnum)).default([]),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
    untilDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Until date must be YYYY-MM-DD")
      .nullable()
      .optional(),
    count: z.number().int().min(1).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.untilDate) {
        return new Date(data.untilDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be on or after start date",
      path: ["untilDate"],
    }
  );

export type RecurrenceRuleInput = z.infer<typeof recurrenceRuleSchema>;

export const recurrenceEditScopeSchema = z.enum(["this_only", "this_and_future"]);
export type RecurrenceEditScopeInput = z.infer<typeof recurrenceEditScopeSchema>;
