import { z } from "zod";

// Curated accessible color palette from DESIGN_PRD.md §15
export const ACCESSIBLE_SUBJECT_COLORS = [
  { name: "Indigo", hex: "#5B6EF5" },
  { name: "Teal", hex: "#2DB5A5" },
  { name: "Amber", hex: "#E0A030" },
  { name: "Rose", hex: "#E54885" },
  { name: "Purple", hex: "#8E51DA" },
  { name: "Sky", hex: "#38A5F8" },
  { name: "Lime", hex: "#7DBA28" },
  { name: "Orange", hex: "#E8783D" },
  { name: "Coral", hex: "#E5484D" },
] as const;

export const SUBJECT_HEX_LIST: readonly string[] = ACCESSIBLE_SUBJECT_COLORS.map((c) => c.hex);

export const subjectSchema = z.object({
  termId: z.string().uuid("Please select an academic term"),
  name: z.string().min(1, "Subject name is required").max(60, "Subject name is too long"),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, "Invalid color format")
    .refine((val) => SUBJECT_HEX_LIST.includes(val.toUpperCase()), {
      message: "Please choose a color from the accessible palette",
    }),
});

export type SubjectInput = z.infer<typeof subjectSchema>;
