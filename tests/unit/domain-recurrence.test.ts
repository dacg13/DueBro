import { describe, it, expect } from "vitest";
import {
  generateRecurrenceDates,
  materializeOccurrencesForWindow,
  splitRecurrenceRuleOnEdit,
  splitRecurrenceRuleOnDelete,
} from "@/server/domain/recurrence";
import { type RecurrenceRule, type Deadline } from "@/types";

describe("Recurrence Engine & Materialized Lazy Generation", () => {
  const sampleRule: RecurrenceRule = {
    id: "rule-1",
    userId: "u1",
    frequency: "weekly",
    interval: 1,
    byDay: ["MO"],
    startDate: "2026-10-05", // Monday
    untilDate: "2026-10-31",
    count: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("generateRecurrenceDates", () => {
    it("generates weekly recurring dates for target day within window", () => {
      const windowStart = new Date("2026-10-01T00:00:00Z");
      const windowEnd = new Date("2026-10-31T00:00:00Z");

      const dates = generateRecurrenceDates(sampleRule, windowStart, windowEnd);
      // Mondays in Oct 2026: Oct 5, Oct 12, Oct 19, Oct 26
      expect(dates).toEqual(["2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26"]);
    });

    it("respects biweekly interval (every 2 weeks)", () => {
      const biweeklyRule: RecurrenceRule = {
        ...sampleRule,
        frequency: "biweekly",
        interval: 1, // 1 * 2 weeks
      };
      const windowStart = new Date("2026-10-01T00:00:00Z");
      const windowEnd = new Date("2026-10-31T00:00:00Z");

      const dates = generateRecurrenceDates(biweeklyRule, windowStart, windowEnd);
      // Oct 5, Oct 19
      expect(dates).toEqual(["2026-10-05", "2026-10-19"]);
    });

    it("respects count cap limit", () => {
      const countRule: RecurrenceRule = {
        ...sampleRule,
        untilDate: null,
        count: 2,
      };
      const windowStart = new Date("2026-10-01T00:00:00Z");
      const windowEnd = new Date("2026-11-30T00:00:00Z");

      const dates = generateRecurrenceDates(countRule, windowStart, windowEnd);
      expect(dates).toHaveLength(2);
      expect(dates).toEqual(["2026-10-05", "2026-10-12"]);
    });

    it("skips excluded dates", () => {
      const windowStart = new Date("2026-10-01T00:00:00Z");
      const windowEnd = new Date("2026-10-31T00:00:00Z");

      const dates = generateRecurrenceDates(sampleRule, windowStart, windowEnd, ["2026-10-12"]);
      expect(dates).toEqual(["2026-10-05", "2026-10-19", "2026-10-26"]);
    });
  });

  describe("materializeOccurrencesForWindow", () => {
    const baseDeadline: Omit<Deadline, "id" | "createdAt" | "updatedAt"> = {
      userId: "u1",
      subjectId: "sub-1",
      termId: "term-1",
      title: "Weekly Lab Report",
      type: "lab",
      dueDate: "2026-10-05",
      dueTime: "17:00",
      priority: "medium",
      status: "not_started",
      progress: 0,
      estimatedEffortHours: 2.0,
      location: "Lab 201",
      notes: null,
      tags: ["lab"],
      links: [],
      recurrenceRuleId: "rule-1",
      originalOccurrenceDate: "2026-10-05",
      sharedDeadlineId: null,
      completedAt: null,
      deletedAt: null,
    };

    it("materializes new distinct rows without duplicating existing occurrences", () => {
      const existingOccurrences: Deadline[] = [
        {
          ...baseDeadline,
          id: "dl-existing-1",
          dueDate: "2026-10-05",
          status: "completed", // Occurrence 1 already completed!
          progress: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const now = new Date("2026-10-01T00:00:00Z");
      const newItems = materializeOccurrencesForWindow(
        sampleRule,
        baseDeadline,
        existingOccurrences,
        30,
        now
      );

      // Should materialize Oct 12, Oct 19, Oct 26 (skipping already materialized Oct 5)
      expect(newItems).toHaveLength(3);
      expect(newItems[0].dueDate).toBe("2026-10-12");
      expect(newItems[0].status).toBe("not_started");
      expect(newItems[0].progress).toBe(0);
      expect(newItems[0].recurrenceRuleId).toBe("rule-1");
    });
  });

  describe("Recurrence Rule Splitting ('This and Future' Scope)", () => {
    it("splits rule on edit by truncating old rule and starting new rule", () => {
      const splitResult = splitRecurrenceRuleOnEdit(sampleRule, "2026-10-19", {
        interval: 2, // Changing to biweekly from Oct 19 onwards
      });

      // Old rule truncated to day before Oct 19 -> 2026-10-18
      expect(splitResult.truncatedRule.untilDate).toBe("2026-10-18");

      // New rule starts on Oct 19 with updated interval 2
      expect(splitResult.newRule.startDate).toBe("2026-10-19");
      expect(splitResult.newRule.interval).toBe(2);
    });

    it("splits rule on delete by truncating old rule to day before deletion date", () => {
      const deleteResult = splitRecurrenceRuleOnDelete(sampleRule, "2026-10-19");
      expect(deleteResult.truncatedRule.untilDate).toBe("2026-10-18");
    });
  });
});
