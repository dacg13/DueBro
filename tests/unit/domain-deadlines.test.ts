import { describe, it, expect } from "vitest";
import {
  calculateDeadlineProgress,
  calculateRemainingEffort,
  isDeadlineOverdue,
  getDaysRemaining,
  sortDeadlines,
} from "@/server/domain/deadlines";
import { type Deadline } from "@/server/db/schema/deadlines";

describe("Deadlines Domain Logic", () => {
  describe("calculateDeadlineProgress", () => {
    it("returns 0 when no subtasks exist and no override", () => {
      expect(calculateDeadlineProgress([])).toBe(0);
    });

    it("calculates percentage accurately based on completed subtasks", () => {
      const subtasks = [
        { isCompleted: true },
        { isCompleted: true },
        { isCompleted: false },
        { isCompleted: false },
      ];
      expect(calculateDeadlineProgress(subtasks)).toBe(50);
    });

    it("rounds progress to nearest whole number", () => {
      const subtasks = [
        { isCompleted: true },
        { isCompleted: false },
        { isCompleted: false },
      ]; // 1 / 3 = 33.33% -> 33
      expect(calculateDeadlineProgress(subtasks)).toBe(33);
    });

    it("respects manual override even when subtasks exist", () => {
      const subtasks = [{ isCompleted: true }, { isCompleted: false }];
      expect(calculateDeadlineProgress(subtasks, 70)).toBe(70);
    });

    it("clamps manual override between 0 and 100", () => {
      expect(calculateDeadlineProgress([], -15)).toBe(0);
      expect(calculateDeadlineProgress([], 140)).toBe(100);
    });
  });

  describe("calculateRemainingEffort", () => {
    it("computes remaining effort based on progress percentage", () => {
      // 10 hours estimate, 40% progress -> 6 hours remaining
      expect(calculateRemainingEffort(10, 40)).toBe(6);
    });

    it("returns 0 remaining effort when progress is 100%", () => {
      expect(calculateRemainingEffort(12, 100)).toBe(0);
    });

    it("gracefully falls back to 1.0 hour baseline when estimate is null", () => {
      // 1.0h fallback * (1 - 0.5) = 0.5h
      expect(calculateRemainingEffort(null, 50)).toBe(0.5);
    });

    it("gracefully falls back when estimate is 0 or negative", () => {
      expect(calculateRemainingEffort(0, 0)).toBe(1);
    });
  });

  describe("isDeadlineOverdue", () => {
    const fixedNow = new Date("2026-10-15T12:00:00Z");

    it("flags past dates as overdue if status is not completed", () => {
      expect(isDeadlineOverdue("2026-10-10", null, "not_started", fixedNow)).toBe(true);
      expect(isDeadlineOverdue("2026-10-10", null, "in_progress", fixedNow)).toBe(true);
    });

    it("never flags completed deadlines as overdue even if past date", () => {
      expect(isDeadlineOverdue("2026-10-10", null, "completed", fixedNow)).toBe(false);
    });

    it("does not flag future dates as overdue", () => {
      expect(isDeadlineOverdue("2026-10-20", null, "not_started", fixedNow)).toBe(false);
    });

    it("handles null or undefined due dates gracefully", () => {
      expect(isDeadlineOverdue(null, null, "not_started", fixedNow)).toBe(false);
    });
  });

  describe("getDaysRemaining", () => {
    const fixedNow = new Date("2026-10-15T12:00:00Z");

    it("calculates positive days for future deadlines", () => {
      expect(getDaysRemaining("2026-10-20", fixedNow)).toBe(5);
    });

    it("calculates 0 for deadlines due today", () => {
      expect(getDaysRemaining("2026-10-15", fixedNow)).toBe(0);
    });

    it("calculates negative days for overdue deadlines", () => {
      expect(getDaysRemaining("2026-10-10", fixedNow)).toBe(-5);
    });
  });

  describe("sortDeadlines", () => {
    const mockDeadlines: Deadline[] = [
      {
        id: "1",
        userId: "u1",
        subjectId: "s1",
        termId: "t1",
        title: "Midterm Exam",
        type: "exam",
        dueDate: "2026-10-20",
        dueTime: "10:00",
        priority: "critical",
        status: "not_started",
        progress: 0,
        estimatedEffortHours: 10,
        location: null,
        notes: null,
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
        id: "2",
        userId: "u1",
        subjectId: "s1",
        termId: "t1",
        title: "Weekly Reading",
        type: "reading",
        dueDate: "2026-10-16",
        dueTime: "23:59",
        priority: "low",
        status: "not_started",
        progress: 0,
        estimatedEffortHours: 2,
        location: null,
        notes: null,
        tags: [],
        links: [],
        recurrenceRuleId: null,
        originalOccurrenceDate: null,
        completedAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("sorts primarily by due date in ascending order", () => {
      const sorted = sortDeadlines(mockDeadlines, "dueDate");
      expect(sorted[0].id).toBe("2"); // Oct 16 before Oct 20
      expect(sorted[1].id).toBe("1");
    });

    it("sorts by priority weight (critical before low)", () => {
      const sorted = sortDeadlines(mockDeadlines, "priority");
      expect(sorted[0].id).toBe("1"); // Critical before Low
      expect(sorted[1].id).toBe("2");
    });
  });
});
