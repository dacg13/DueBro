/**
 * iCalendar (RFC 5545) Generator & Parser
 *
 * Responsibilities:
 * - Generates valid RFC 5545 .ics calendar files compatible with Google Calendar, Apple Calendar, and Canvas LMS
 * - Parses incoming .ics feeds into structured deadline objects
 *
 * Constraints:
 * - Pure functions only — no direct database I/O.
 */

import { type Deadline, type Subject, type Priority, type DeadlineType } from "@/types";
import { format } from "date-fns";

const PRIORITY_MAP_TO_ICS: Record<Priority, number> = {
  critical: 1,
  high: 3,
  medium: 5,
  low: 9,
};

const ICS_TO_PRIORITY: Record<number, Priority> = {
  1: "critical",
  2: "critical",
  3: "high",
  4: "high",
  5: "medium",
  6: "medium",
  7: "low",
  8: "low",
  9: "low",
};

/**
 * Escapes text for RFC 5545 compliance (escaping backslashes, semicolons, and commas).
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function unescapeICSText(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

/**
 * Generates RFC 5545 standard VCALENDAR string from an array of deadlines.
 */
export function generateICSFeed(
  deadlines: Deadline[],
  subjects: Subject[] = []
): string {
  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const nowStamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DueBro//Student Deadline Tracker//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:DueBro Academic Deadlines",
    "X-WR-TIMEZONE:UTC",
  ];

  for (const dl of deadlines) {
    if (!dl.dueDate || dl.deletedAt) continue;

    const subject = dl.subjectId ? subjectMap.get(dl.subjectId) : null;
    const summaryPrefix = subject ? `[${subject.name}] ` : "";
    const fullSummary = `${summaryPrefix}${dl.title}`;

    const dateClean = dl.dueDate.replace(/-/g, "");
    const timeClean = dl.dueTime ? dl.dueTime.replace(/:/g, "") + "00" : null;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:dl-${dl.id}@duebro.app`);
    lines.push(`DTSTAMP:${nowStamp}`);

    if (timeClean) {
      lines.push(`DTSTART:${dateClean}T${timeClean}`);
      lines.push(`DTEND:${dateClean}T${timeClean}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dateClean}`);
    }

    lines.push(`SUMMARY:${escapeICSText(fullSummary)}`);

    if (dl.notes) {
      lines.push(`DESCRIPTION:${escapeICSText(dl.notes)}`);
    }

    if (dl.location) {
      lines.push(`LOCATION:${escapeICSText(dl.location)}`);
    }

    lines.push(`PRIORITY:${PRIORITY_MAP_TO_ICS[dl.priority] || 5}`);
    lines.push(
      `STATUS:${dl.status === "completed" ? "COMPLETED" : "CONFIRMED"}`
    );

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

export interface ParsedICSEvent {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  location: string | null;
  notes: string | null;
  priority: Priority;
  type: DeadlineType;
}

/**
 * Parses an iCalendar (.ics) string into an array of partial deadlines.
 */
export function parseICSFeed(icsContent: string): ParsedICSEvent[] {
  const events: ParsedICSEvent[] = [];
  const eventBlocks = icsContent.split(/BEGIN:VEVENT/i).slice(1);

  for (const block of eventBlocks) {
    const lines = block.split(/\r\n|\n|\r/);
    let summary = "Untitled Event";
    let dueDate: string | null = null;
    let dueTime: string | null = null;
    let location: string | null = null;
    let notes: string | null = null;
    let priority: Priority = "medium";

    for (const line of lines) {
      if (line.startsWith("SUMMARY:")) {
        summary = unescapeICSText(line.replace("SUMMARY:", "").trim());
      } else if (line.startsWith("DESCRIPTION:")) {
        notes = unescapeICSText(line.replace("DESCRIPTION:", "").trim());
      } else if (line.startsWith("LOCATION:")) {
        location = unescapeICSText(line.replace("LOCATION:", "").trim());
      } else if (line.startsWith("PRIORITY:")) {
        const pNum = parseInt(line.replace("PRIORITY:", "").trim(), 10);
        priority = ICS_TO_PRIORITY[pNum] || "medium";
      } else if (line.startsWith("DTSTART")) {
        const val = line.split(":")[1]?.trim();
        if (val) {
          if (val.length === 8) {
            // YYYYMMDD
            dueDate = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`;
          } else if (val.includes("T")) {
            const [dPart, tPart] = val.split("T");
            if (dPart.length === 8) {
              dueDate = `${dPart.slice(0, 4)}-${dPart.slice(4, 6)}-${dPart.slice(6, 8)}`;
            }
            if (tPart && tPart.length >= 4) {
              dueTime = `${tPart.slice(0, 2)}:${tPart.slice(2, 4)}`;
            }
          }
        }
      }
    }

    // Infer type from summary
    let type: DeadlineType = "assignment";
    if (/\b(exam|midterm|final)\b/i.test(summary)) type = "exam";
    else if (/\b(quiz|test)\b/i.test(summary)) type = "quiz";
    else if (/\b(lab|experiment)\b/i.test(summary)) type = "lab";
    else if (/\b(read|reading)\b/i.test(summary)) type = "reading";
    else if (/\b(presentation|slides)\b/i.test(summary)) type = "presentation";

    events.push({
      title: summary,
      dueDate,
      dueTime,
      location,
      notes,
      priority,
      type,
    });
  }

  return events;
}
