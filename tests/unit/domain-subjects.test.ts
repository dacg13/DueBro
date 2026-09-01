import { describe, it, expect } from "vitest";
import {
  isValidSubjectColor,
  calculateSubjectStats,
  filterActiveSubjects,
} from "@/server/domain/subjects";
import { type Subject } from "@/server/db/schema/subjects";
import { type Deadline } from "@/server/db/schema/deadlines";

describe("Subjects Domain Logic", () => {
  describe("isValidSubjectColor", () => {
    it("accepts curated accessible colors", () => {
      expect(isValidSubjectColor("#5B6EF5")).toBe(true); // Indigo
      expect(isValidSubjectColor("#2DB5A5")).toBe(true); // Teal
      expect(isValidSubjectColor("#E0A030")).toBe(true); // Amber
    });

    it("rejects unapproved random or low contrast colors", () => {
      expect(isValidSubjectColor("#FFFFFF")).toBe(false);
      expect(isValidSubjectColor("#000000")).toBe(false);
      expect(isValidSubjectColor("blue")).toBe(false);
    });
  });

  describe("calculateSubjectStats", () => {
    const fixedNow = new Date("2026-10-15T12:00:00Z");

    const mockDeadlines: Deadline[] = [
      {
        id: "d1",
        userId: "u1",
        subjectId: "sub-1",
        termId: "t1",
        title: "Assignment 1",
        type: "assignment",
        dueDate: "2026-10-18",
        dueTime: null,
        priority: "medium",
        status: "not_started",
        progress: 0,
        estimatedEffortHours: 3,
        location: null,
        notes: null,
        tags: [],
        links: [],
        recurrenceRuleId: null,
        originalOccurrenceDate: null,
        sharedDeadlineId: null,
        completedAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "d2",
        userId: "u1",
        subjectId: "sub-1",
        termId: "t1",
        title: "Assignment 2",
        type: "assignment",
        dueDate: "2026-10-12", // Overdue
        dueTime: null,
        priority: "high",
        status: "not_started",
        progress: 0,
        estimatedEffortHours: 4,
        location: null,
        notes: null,
        tags: [],
        links: [],
        recurrenceRuleId: null,
        originalOccurrenceDate: null,
        sharedDeadlineId: null,
        completedAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "d3",
        userId: "u1",
        subjectId: "sub-1",
        termId: "t1",
        title: "Quiz 1",
        type: "quiz",
        dueDate: "2026-10-10",
        dueTime: null,
        priority: "low",
        status: "completed",
        progress: 100,
        estimatedEffortHours: 1,
        location: null,
        notes: null,
        tags: [],
        links: [],
        recurrenceRuleId: null,
        originalOccurrenceDate: null,
        sharedDeadlineId: null,
        completedAt: new Date(),
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "d4",
        userId: "u1",
        subjectId: "sub-2", // Different subject
        termId: "t1",
        title: "Other Subject Task",
        type: "reading",
        dueDate: "2026-10-16",
        dueTime: null,
        priority: "low",
        status: "not_started",
        progress: 0,
        estimatedEffortHours: 1,
        location: null,
        notes: null,
        tags: [],
        links: [],
        recurrenceRuleId: null,
        originalOccurrenceDate: null,
        sharedDeadlineId: null,
        completedAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("correctly counts open, completed, and overdue deadlines for the specific subject", () => {
      const stats = calculateSubjectStats("sub-1", mockDeadlines, fixedNow);

      expect(stats.totalCount).toBe(3);
      expect(stats.openCount).toBe(2);
      expect(stats.completedCount).toBe(1);
      expect(stats.overdueCount).toBe(1);
      expect(stats.nextUpcomingDeadline?.id).toBe("d1"); // Oct 18 is next upcoming
    });
  });

  describe("filterActiveSubjects", () => {
    it("excludes archived subjects", () => {
      const subjectsList: Subject[] = [
        {
          id: "s1",
          termId: "t1",
          userId: "u1",
          name: "CS101",
          color: "#5B6EF5",
          archived: false,
          archivedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "s2",
          termId: "t1",
          userId: "u1",
          name: "MATH201",
          color: "#2DB5A5",
          archived: true,
          archivedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const active = filterActiveSubjects(subjectsList);
      expect(active.length).toBe(1);
      expect(active[0].id).toBe("s1");
    });
  });
});
