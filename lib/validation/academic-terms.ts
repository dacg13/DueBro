import { z } from "zod";

export const academicTermSchema = z
  .object({
    name: z.string().min(1, "Term name is required").max(60, "Term name is too long"),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
    isCurrent: z.boolean(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export type AcademicTermInput = z.infer<typeof academicTermSchema>;
