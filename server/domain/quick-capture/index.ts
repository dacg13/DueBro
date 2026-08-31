/**
 * Domain Module: Quick Capture & Natural Language Deadline Parsing
 *
 * Responsibilities:
 * - Parses bare-text quick captures with zero required fields
 * - Extracts dates ("today", "tomorrow", "Friday", "next Monday", "in 3 days")
 * - Extracts times ("5pm", "11:59pm", "noon", "midnight", "17:00")
 * - Extracts types (exam, quiz, lab, reading, presentation, assignment)
 * - Extracts effort hours ("2h", "1.5 hours", "45m", "30 min")
 *
 * Constraints:
 * - Pure functions only — no direct database I/O.
 */

import { type DeadlineType, type Priority } from "@/types";
import { addDays, format, nextDay, type Day } from "date-fns";

export interface ParsedQuickCapture {
  cleanTitle: string;
  type: DeadlineType;
  priority: Priority;
  dueDate: string | null; // YYYY-MM-DD
  dueTime: string | null; // HH:MM
  estimatedEffortHours: number | null;
  detectedSubjectHint: string | null;
}

const DAY_NAME_MAP: Record<string, Day> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

const TYPE_KEYWORDS: Array<{ keyword: RegExp; type: DeadlineType }> = [
  { keyword: /\b(exam|midterm|final)\b/i, type: "exam" },
  { keyword: /\b(quiz|test)\b/i, type: "quiz" },
  { keyword: /\b(lab|experiment)\b/i, type: "lab" },
  { keyword: /\b(read|reading|chapter|ch\.\s*\d+)\b/i, type: "reading" },
  { keyword: /\b(presentation|slides|pitch|demo)\b/i, type: "presentation" },
  { keyword: /\b(project|term project)\b/i, type: "project" },
  { keyword: /\b(hw|homework|ps|problem set|assignment)\b/i, type: "assignment" },
];

/**
 * Parses freeform natural language text into structured deadline metadata.
 * Always succeeds even with bare text (zero required fields).
 */
export function parseQuickCaptureText(rawInput: string, now: Date = new Date()): ParsedQuickCapture {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      cleanTitle: "Untitled Task",
      type: "assignment",
      priority: "medium",
      dueDate: null,
      dueTime: null,
      estimatedEffortHours: null,
      detectedSubjectHint: null,
    };
  }

  const text = trimmed;
  let detectedType: DeadlineType = "assignment";
  let detectedPriority: Priority = "medium";
  let detectedDate: string | null = null;
  let detectedTime: string | null = null;
  let detectedEffort: number | null = null;
  let detectedSubjectHint: string | null = null;

  // 1. Detect Deadline Type
  for (const { keyword, type } of TYPE_KEYWORDS) {
    if (keyword.test(text)) {
      detectedType = type;
      break;
    }
  }

  // 2. Detect Priority
  if (/\b(urgent|critical|asap|high priority)\b/i.test(text)) {
    detectedPriority = "critical";
  } else if (/\b(important|high)\b/i.test(text)) {
    detectedPriority = "high";
  } else if (/\b(low priority|optional)\b/i.test(text)) {
    detectedPriority = "low";
  }

  // 3. Detect Effort ("2h", "1.5 hours", "30m", "45 min")
  const hourMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
  const minMatch = text.match(/\b(\d+)\s*(?:minutes?|mins?|m)\b/i);

  if (hourMatch) {
    detectedEffort = parseFloat(hourMatch[1]);
  } else if (minMatch) {
    detectedEffort = Number((parseInt(minMatch[1], 10) / 60).toFixed(2));
  }

  // 4. Detect Due Date ("today", "tomorrow", "Friday", "in 3 days", "next Monday")
  if (/\b(today|tonight)\b/i.test(text)) {
    detectedDate = format(now, "yyyy-MM-dd");
  } else if (/\b(tomorrow|tmrw)\b/i.test(text)) {
    detectedDate = format(addDays(now, 1), "yyyy-MM-dd");
  } else {
    const inDaysMatch = text.match(/\bin\s+(\d+)\s+days?\b/i);
    if (inDaysMatch) {
      const daysToAdd = parseInt(inDaysMatch[1], 10);
      detectedDate = format(addDays(now, daysToAdd), "yyyy-MM-dd");
    } else {
      // Check weekday names e.g. "by Friday", "this Thursday", "next Monday"
      const weekdayMatch = text.match(/\b(?:by|on|this|next)?\s*(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\b/i);
      if (weekdayMatch) {
        const dayName = weekdayMatch[1].toLowerCase();
        const targetDayNum = DAY_NAME_MAP[dayName];
        if (targetDayNum !== undefined) {
          const targetDate = nextDay(now, targetDayNum);
          detectedDate = format(targetDate, "yyyy-MM-dd");
        }
      }
    }
  }

  // 5. Detect Due Time ("5pm", "11:59pm", "17:00", "midnight", "noon")
  const timeMatch = text.match(/\b(?:at|by)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3].toLowerCase();

    if (meridian === "pm" && hours < 12) hours += 12;
    if (meridian === "am" && hours === 12) hours = 0;

    detectedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } else if (/\bmidnight\b/i.test(text)) {
    detectedTime = "23:59";
  } else if (/\bnoon\b/i.test(text)) {
    detectedTime = "12:00";
  }

  // 6. Detect Subject Hint (e.g. "[CS101]" or "CS101:" or "#cs101")
  const subjectTagMatch = text.match(/\[([A-Za-z0-9\s_-]+)\]|#([A-Za-z0-9_-]+)|\b([A-Za-z]{2,4}\s*\d{3})\b/);
  if (subjectTagMatch) {
    detectedSubjectHint = (subjectTagMatch[1] || subjectTagMatch[2] || subjectTagMatch[3]).trim();
  }

  // Clean title
  let cleanTitle = text
    .replace(/\[[A-Za-z0-9\s_-]+\]/g, "")
    .replace(/\b(?:by|on|due|at)?\s*(?:today|tonight|tomorrow|tmrw|midnight|noon)\b/gi, "")
    .replace(/\b(?:by|on|due|at)?\s*(?:monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\b/gi, "")
    .replace(/\b(?:by|at)?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, "")
    .replace(/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|h|minutes?|mins?|m)\b/gi, "")
    .replace(/\b(urgent|critical|asap|high priority|low priority|optional)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanTitle) {
    cleanTitle = trimmed;
  }

  return {
    cleanTitle,
    type: detectedType,
    priority: detectedPriority,
    dueDate: detectedDate,
    dueTime: detectedTime,
    estimatedEffortHours: detectedEffort,
    detectedSubjectHint,
  };
}
