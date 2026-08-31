import { z } from "zod";
import { deadlineTypeEnum, priorityEnum, deadlineStatusEnum } from "@/server/db/schema/deadlines";

export const deadlineSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  type: z.enum(deadlineTypeEnum),
  subjectId: z.string().nullable().optional(),
  termId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(), // YYYY-MM-DD
  dueTime: z.string().nullable().optional(), // HH:MM
  priority: z.enum(priorityEnum),
  status: z.enum(deadlineStatusEnum).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  estimatedEffortHours: z.number().min(0, "Effort cannot be negative").max(100).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  tags: z.array(z.string()).optional(),
  links: z.array(z.object({ title: z.string(), url: z.string().url("Invalid link URL") })).optional(),
  recurrenceRuleId: z.string().nullable().optional(),
});

export type DeadlineFormInput = z.infer<typeof deadlineSchema>;

export const quickCaptureSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
});

export type QuickCaptureInput = z.infer<typeof quickCaptureSchema>;

export const triageDeadlineSchema = z.object({
  id: z.string().uuid(),
  subjectId: z.string().uuid("Subject is required"),
  dueDate: z.string().min(1, "Due date is required"), // YYYY-MM-DD
  dueTime: z.string().nullable().optional(),
  type: z.enum(deadlineTypeEnum),
  priority: z.enum(priorityEnum),
});

export type TriageDeadlineInput = z.infer<typeof triageDeadlineSchema>;
