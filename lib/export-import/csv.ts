/**
 * CSV & JSON Data Portability Module
 *
 * Responsibilities:
 * - Generates CSV spreadsheet exports of all deadlines (PRODUCT_PRD.md §24)
 * - Parses CSV imports into structured deadline objects
 * - Generates full JSON backup files
 *
 * Constraints:
 * - Pure functions only — no direct database I/O.
 */

import {
  type Deadline,
  type Subject,
  type AcademicTerm,
  type DeadlineType,
  type Priority,
  type DeadlineStatus,
} from "@/types";

function escapeCSVField(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates standard CSV string for all deadlines.
 */
export function exportDeadlinesToCSV(
  deadlines: Deadline[],
  subjects: Subject[] = []
): string {
  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const headers = [
    "Title",
    "Type",
    "Subject",
    "DueDate",
    "DueTime",
    "Priority",
    "Status",
    "Progress",
    "EstimatedHours",
    "Location",
    "Notes",
  ];

  const rows = deadlines
    .filter((d) => !d.deletedAt)
    .map((d) => {
      const subject = d.subjectId ? subjectMap.get(d.subjectId) : null;
      return [
        escapeCSVField(d.title),
        escapeCSVField(d.type),
        escapeCSVField(subject?.name || ""),
        escapeCSVField(d.dueDate || ""),
        escapeCSVField(d.dueTime || ""),
        escapeCSVField(d.priority),
        escapeCSVField(d.status),
        escapeCSVField(d.progress),
        escapeCSVField(d.estimatedEffortHours ?? ""),
        escapeCSVField(d.location || ""),
        escapeCSVField(d.notes || ""),
      ].join(",");
    });

  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * Parses CSV lines into partial deadline objects.
 */
export function parseCSVToDeadlines(csvContent: string): Array<Partial<Deadline>> {
  const lines = csvContent.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: Array<Partial<Deadline>> = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple regex CSV field splitter
    const fields: string[] = [];
    let insideQuotes = false;
    let curField = "";

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (insideQuotes && line[j + 1] === '"') {
          curField += '"';
          j++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        fields.push(curField.trim());
        curField = "";
      } else {
        curField += char;
      }
    }
    fields.push(curField.trim());

    const [
      title,
      type,
      ,
      dueDate,
      dueTime,
      priority,
      status,
      progress,
      estimatedHours,
      location,
      notes,
    ] = fields;

    if (!title) continue;

    results.push({
      title,
      type: (type as DeadlineType) || "assignment",
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      priority: (priority as Priority) || "medium",
      status: (status as DeadlineStatus) || "not_started",
      progress: progress ? parseInt(progress, 10) : 0,
      estimatedEffortHours: estimatedHours ? parseFloat(estimatedHours) : null,
      location: location || null,
      notes: notes || null,
    });
  }

  return results;
}

/**
 * Generates full JSON backup package of all student academic data.
 */
export function exportAllUserDataJSON(data: {
  deadlines: Deadline[];
  subjects: Subject[];
  terms?: AcademicTerm[];
}): string {
  const exportPayload = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    duebroSchema: "v1",
    deadlines: data.deadlines.filter((d) => !d.deletedAt),
    subjects: data.subjects.filter((s) => !s.archived),
    academicTerms: data.terms || [],
  };

  return JSON.stringify(exportPayload, null, 2);
}
