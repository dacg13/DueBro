import { describe, it, expect } from "vitest";
import { generateICSFeed, parseICSFeed } from "@/lib/export-import/ics";
import { exportDeadlinesToCSV, parseCSVToDeadlines, exportAllUserDataJSON } from "@/lib/export-import/csv";
import { type Deadline, type Subject } from "@/types";

describe("Data Portability & Export / Import Engine (RFC 5545 & CSV)", () => {
  const sampleSubject: Subject = {
    id: "sub-1",
    termId: "term-1",
    userId: "u1",
    name: "CS101 Algorithms",
    color: "#5B6EF5",
    archived: false,
    archivedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleDeadlines: Deadline[] = [
    {
      id: "dl-1",
      userId: "u1",
      subjectId: "sub-1",
      termId: "term-1",
      title: "Midterm Exam, Part 1",
      type: "exam",
      dueDate: "2026-10-15",
      dueTime: "10:00",
      priority: "critical",
      status: "not_started",
      progress: 0,
      estimatedEffortHours: 4.0,
      location: "Hall B, Room 204",
      notes: "Bring 2B pencil & calculator",
      tags: [],
      links: [],
      recurrenceRuleId: null,
      originalOccurrenceDate: null,
      completedAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "dl-2",
      userId: "u1",
      subjectId: "sub-1",
      termId: "term-1",
      title: "Lab Report 2",
      type: "lab",
      dueDate: "2026-10-18",
      dueTime: "17:00",
      priority: "medium",
      status: "completed",
      progress: 100,
      estimatedEffortHours: 2.0,
      location: null,
      notes: null,
      tags: [],
      links: [],
      recurrenceRuleId: null,
      originalOccurrenceDate: null,
      completedAt: new Date(),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe("iCalendar (RFC 5545)", () => {
    it("generates valid RFC 5545 VCALENDAR feed with VEVENTs", () => {
      const ics = generateICSFeed(sampleDeadlines, [sampleSubject]);

      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("VERSION:2.0");
      expect(ics).toContain("PRODID:-//DueBro//Student Deadline Tracker//EN");
      expect(ics).toContain("BEGIN:VEVENT");
      expect(ics).toContain("UID:dl-dl-1@duebro.app");
      expect(ics).toContain("SUMMARY:[CS101 Algorithms] Midterm Exam\\, Part 1");
      expect(ics).toContain("DTSTART:20261015T100000");
      expect(ics).toContain("LOCATION:Hall B\\, Room 204");
      expect(ics).toContain("PRIORITY:1"); // Critical
      expect(ics).toContain("STATUS:CONFIRMED");
      expect(ics).toContain("STATUS:COMPLETED");
      expect(ics).toContain("END:VCALENDAR");
    });

    it("parses ICS feed back into structured deadline objects", () => {
      const sampleICS = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Physics Final Exam
DTSTART:20261205T090000
LOCATION:Auditorium A
DESCRIPTION:Cumulative final
PRIORITY:1
END:VEVENT
END:VCALENDAR
      `.trim();

      const parsed = parseICSFeed(sampleICS);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe("Physics Final Exam");
      expect(parsed[0].dueDate).toBe("2026-12-05");
      expect(parsed[0].dueTime).toBe("09:00");
      expect(parsed[0].type).toBe("exam");
      expect(parsed[0].priority).toBe("critical");
      expect(parsed[0].location).toBe("Auditorium A");
      expect(parsed[0].notes).toBe("Cumulative final");
    });
  });

  describe("CSV & JSON Data Portability", () => {
    it("exports deadlines into CSV with proper escaping", () => {
      const csv = exportDeadlinesToCSV(sampleDeadlines, [sampleSubject]);
      const lines = csv.split("\r\n");

      expect(lines[0]).toBe("Title,Type,Subject,DueDate,DueTime,Priority,Status,Progress,EstimatedHours,Location,Notes");
      // "Midterm Exam, Part 1" has a comma, so it must be enclosed in quotes
      expect(lines[1]).toContain('"Midterm Exam, Part 1"');
      expect(lines[1]).toContain("exam");
      expect(lines[1]).toContain("CS101 Algorithms");
      expect(lines[1]).toContain("2026-10-15");
    });

    it("parses CSV content into structured deadline objects", () => {
      const csv = `
Title,Type,Subject,DueDate,DueTime,Priority,Status,Progress,EstimatedHours,Location,Notes
"Chemistry Quiz 3",quiz,CHEM101,2026-11-01,14:00,high,not_started,0,1.5,Room 101,Chapters 1-3
      `.trim();

      const parsed = parseCSVToDeadlines(csv);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe("Chemistry Quiz 3");
      expect(parsed[0].type).toBe("quiz");
      expect(parsed[0].dueDate).toBe("2026-11-01");
      expect(parsed[0].dueTime).toBe("14:00");
      expect(parsed[0].priority).toBe("high");
      expect(parsed[0].estimatedEffortHours).toBe(1.5);
      expect(parsed[0].location).toBe("Room 101");
    });

    it("generates complete JSON backup archive", () => {
      const json = exportAllUserDataJSON({
        deadlines: sampleDeadlines,
        subjects: [sampleSubject],
      });

      const parsed = JSON.parse(json);
      expect(parsed.version).toBe("1.0.0");
      expect(parsed.duebroSchema).toBe("v1");
      expect(parsed.deadlines).toHaveLength(2);
      expect(parsed.subjects).toHaveLength(1);
    });
  });
});
