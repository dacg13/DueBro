import { describe, it, expect } from "vitest";
import {
  calculateAvailableCapacity,
  getPriorityMultiplier,
  getExamMultiplier,
  calculateDeadlineRisk,
  detectWorkloadClusters,
} from "@/server/domain/risk";
import { type Deadline } from "@/types";

describe("Risk Engine & Workload Clustering Domain Logic", () => {
  describe("calculateAvailableCapacity", () => {
    // 2026-10-12 is Monday, 2026-10-16 is Friday (5 weekdays: 5 * 2h = 10h)
    it("accumulates weekday capacity correctly", () => {
      const mon = new Date("2026-10-12T00:00:00Z");
      const fri = new Date("2026-10-16T00:00:00Z");
      const cap = calculateAvailableCapacity(mon, fri, 2.0, 4.0);
      expect(cap).toBe(10.0);
    });

    // 2026-10-12 (Mon) to 2026-10-18 (Sun): 5 weekdays (10h) + 2 weekend days (8h) = 18h
    it("accumulates weekend capacity at weekend rate", () => {
      const mon = new Date("2026-10-12T00:00:00Z");
      const sun = new Date("2026-10-18T00:00:00Z");
      const cap = calculateAvailableCapacity(mon, sun, 2.0, 4.0);
      expect(cap).toBe(18.0);
    });

    it("returns minimum fallback capacity if due date is today or past", () => {
      const today = new Date("2026-10-12T12:00:00Z");
      const cap = calculateAvailableCapacity(today, today, 2.0, 4.0);
      expect(cap).toBe(2.0);
    });
  });

  describe("Multipliers", () => {
    it("applies accurate priority multipliers", () => {
      expect(getPriorityMultiplier("low")).toBe(0.8);
      expect(getPriorityMultiplier("medium")).toBe(1.0);
      expect(getPriorityMultiplier("high")).toBe(1.2);
      expect(getPriorityMultiplier("critical")).toBe(1.5);
    });

    it("escalates exam multiplier when within 7 days", () => {
      expect(getExamMultiplier("exam", 3)).toBe(1.5);
      expect(getExamMultiplier("exam", 7)).toBe(1.5);
      expect(getExamMultiplier("exam", 10)).toBe(1.2);
      expect(getExamMultiplier("exam", 20)).toBe(1.0);
    });

    it("does not apply exam multiplier to standard assignments", () => {
      expect(getExamMultiplier("assignment", 3)).toBe(1.0);
    });
  });

  describe("calculateDeadlineRisk Tier Mapping", () => {
    const fixedNow = new Date("2026-10-12T00:00:00Z"); // Monday

    const baseDeadline: Deadline = {
      id: "test-dl",
      userId: "u1",
      subjectId: "s1",
      termId: "t1",
      title: "Test Task",
      type: "assignment",
      dueDate: "2026-10-16", // 5 days (10h capacity)
      dueTime: "23:59",
      priority: "medium", // 1.0x
      status: "not_started",
      progress: 0,
      estimatedEffortHours: 2.0, // 2h / 10h = 0.20 -> Safe (<0.25)
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
    };

    it("assigns 'safe' tier when ratio is low (< 0.25)", () => {
      const res = calculateDeadlineRisk(baseDeadline, { now: fixedNow, dailyCapacityHours: 2.0 });
      expect(res.tier).toBe("safe");
      expect(res.score).toBeLessThan(0.25);
    });

    it("assigns 'low' tier for score between 0.25 and 0.50", () => {
      // 4h effort / 10h cap = 0.40 -> Low
      const dl = { ...baseDeadline, estimatedEffortHours: 4.0 };
      const res = calculateDeadlineRisk(dl, { now: fixedNow, dailyCapacityHours: 2.0 });
      expect(res.tier).toBe("low");
    });

    it("assigns 'medium' tier for score between 0.50 and 0.75", () => {
      // 6h effort / 10h cap = 0.60 -> Medium
      const dl = { ...baseDeadline, estimatedEffortHours: 6.0 };
      const res = calculateDeadlineRisk(dl, { now: fixedNow, dailyCapacityHours: 2.0 });
      expect(res.tier).toBe("medium");
    });

    it("assigns 'high' tier for score between 0.75 and 1.00", () => {
      // 8.5h effort / 10h cap = 0.85 -> High
      const dl = { ...baseDeadline, estimatedEffortHours: 8.5 };
      const res = calculateDeadlineRisk(dl, { now: fixedNow, dailyCapacityHours: 2.0 });
      expect(res.tier).toBe("high");
    });

    it("assigns 'critical' tier when required effort exceeds available capacity (>= 1.00)", () => {
      // 12h effort / 10h cap = 1.20 -> Critical!
      const dl = { ...baseDeadline, estimatedEffortHours: 12.0 };
      const res = calculateDeadlineRisk(dl, { now: fixedNow, dailyCapacityHours: 2.0 });
      expect(res.tier).toBe("critical");
      expect(res.score).toBeGreaterThanOrEqual(1.0);
    });

    it("assigns 'overdue' tier when past due date and incomplete", () => {
      const overdueDl = { ...baseDeadline, dueDate: "2026-10-10" };
      const res = calculateDeadlineRisk(overdueDl, { now: fixedNow });
      expect(res.tier).toBe("overdue");
      expect(res.isOverdue).toBe(true);
    });

    it("assigns 'safe' tier to completed tasks", () => {
      const completedDl = { ...baseDeadline, status: "completed" as const, progress: 100 };
      const res = calculateDeadlineRisk(completedDl, { now: fixedNow });
      expect(res.tier).toBe("safe");
      expect(res.score).toBe(0);
    });
  });

  describe("Workload Clustering Detection", () => {
    const fixedNow = new Date("2026-10-12T00:00:00Z");

    it("triggers a cluster when 3 or more deadlines fall within a 3-day window", () => {
      const clusterDeadlines: Deadline[] = [
        {
          id: "c1",
          userId: "u1",
          subjectId: "s1",
          termId: "t1",
          title: "HW 1",
          type: "assignment",
          dueDate: "2026-10-13",
          dueTime: null,
          priority: "medium",
          status: "not_started",
          progress: 0,
          estimatedEffortHours: 1,
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
          id: "c2",
          userId: "u1",
          subjectId: "s1",
          termId: "t1",
          title: "HW 2",
          type: "assignment",
          dueDate: "2026-10-14",
          dueTime: null,
          priority: "medium",
          status: "not_started",
          progress: 0,
          estimatedEffortHours: 1,
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
          id: "c3",
          userId: "u1",
          subjectId: "s1",
          termId: "t1",
          title: "HW 3",
          type: "assignment",
          dueDate: "2026-10-15",
          dueTime: null,
          priority: "medium",
          status: "not_started",
          progress: 0,
          estimatedEffortHours: 1,
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

      const clusters = detectWorkloadClusters(clusterDeadlines, { now: fixedNow });
      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters[0].deadlineCount).toBe(3);
      expect(clusters[0].isTriggered).toBe(true);
    });

    it("triggers a cluster when total effort in 3 days exceeds 8 hours", () => {
      const heavyDeadlines: Deadline[] = [
        {
          id: "h1",
          userId: "u1",
          subjectId: "s1",
          termId: "t1",
          title: "Major Project",
          type: "project",
          dueDate: "2026-10-13",
          dueTime: null,
          priority: "high",
          status: "not_started",
          progress: 0,
          estimatedEffortHours: 5.0,
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
          id: "h2",
          userId: "u1",
          subjectId: "s1",
          termId: "t1",
          title: "Term Paper",
          type: "assignment",
          dueDate: "2026-10-14",
          dueTime: null,
          priority: "high",
          status: "not_started",
          progress: 0,
          estimatedEffortHours: 4.5,
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
      ]; // 2 deadlines totaling 9.5 hours (>8h)

      const clusters = detectWorkloadClusters(heavyDeadlines, { now: fixedNow });
      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters[0].totalEffortHours).toBe(9.5);
      expect(clusters[0].isTriggered).toBe(true);
    });

    it("does not trigger when workload is below both count and effort thresholds", () => {
      const lightDeadlines: Deadline[] = [
        {
          id: "l1",
          userId: "u1",
          subjectId: "s1",
          termId: "t1",
          title: "Quick Quiz",
          type: "quiz",
          dueDate: "2026-10-13",
          dueTime: null,
          priority: "low",
          status: "not_started",
          progress: 0,
          estimatedEffortHours: 1.0,
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

      const clusters = detectWorkloadClusters(lightDeadlines, { now: fixedNow });
      expect(clusters.length).toBe(0);
    });
  });
});
