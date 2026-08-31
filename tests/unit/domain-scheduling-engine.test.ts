import { describe, it, expect } from "vitest";
import { generateDeterministicSchedule } from "@/server/domain/scheduling-engine";
import { type Deadline } from "@/types";

describe("Smart Planning & Scheduling Engine (V1.5)", () => {
  const startDate = new Date("2026-10-12T00:00:00Z"); // Monday

  const sampleDeadline: Deadline = {
    id: "dl-1",
    userId: "u1",
    subjectId: "sub-cs101",
    termId: "term-1",
    title: "Algorithms Problem Set",
    type: "assignment",
    dueDate: "2026-10-15", // Thursday (4 lead days: Mon, Tue, Wed, Thu)
    dueTime: "23:59",
    priority: "medium",
    status: "not_started",
    progress: 0,
    estimatedEffortHours: 4.0,
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

  it("distributes 4.0h effort deterministically across available lead days before due date", () => {
    const result = generateDeterministicSchedule([sampleDeadline], {
      startDate,
      daysToPlan: 7,
      weekdayCapacityHours: 2.0,
      weekendCapacityHours: 4.0,
    });

    expect(result.totalEffortAllocated).toBe(4.0);
    expect(result.shortfalls).toHaveLength(0);

    // Should allocate across Monday, Tuesday, Wednesday, Thursday
    const plannedDaysWithChunks = result.dailyPlans.filter((p) => p.chunks.length > 0);
    expect(plannedDaysWithChunks.length).toBeGreaterThanOrEqual(2);

    // No allocation should happen after Thursday Oct 15
    const postDueAllocations = result.dailyPlans
      .filter((p) => p.date > "2026-10-15")
      .reduce((sum, p) => sum + p.allocatedHours, 0);
    expect(postDueAllocations).toBe(0);
  });

  it("respects higher weekend study capacity", () => {
    const weekendDeadline: Deadline = {
      ...sampleDeadline,
      id: "dl-wknd",
      dueDate: "2026-10-18", // Sunday
      estimatedEffortHours: 6.0,
    };

    const result = generateDeterministicSchedule([weekendDeadline], {
      startDate,
      daysToPlan: 7,
      weekdayCapacityHours: 2.0,
      weekendCapacityHours: 4.0,
    });

    const satPlan = result.dailyPlans.find((p) => p.dayName === "Saturday");
    const sunPlan = result.dailyPlans.find((p) => p.dayName === "Sunday");

    expect(satPlan?.capacityHours).toBe(4.0);
    expect(sunPlan?.capacityHours).toBe(4.0);
    expect(result.totalEffortAllocated).toBe(6.0);
  });

  it("prioritizes critical tasks over medium/low tasks during capacity allocation", () => {
    const criticalExam: Deadline = {
      ...sampleDeadline,
      id: "dl-exam",
      title: "Midterm Exam",
      priority: "critical",
      dueDate: "2026-10-13", // Tuesday (2 lead days: Mon, Tue = 4h total capacity)
      estimatedEffortHours: 3.5,
    };

    const lowHw: Deadline = {
      ...sampleDeadline,
      id: "dl-low",
      title: "Optional Reading",
      priority: "low",
      dueDate: "2026-10-13",
      estimatedEffortHours: 2.0,
    };

    const result = generateDeterministicSchedule([lowHw, criticalExam], {
      startDate,
      daysToPlan: 7,
      weekdayCapacityHours: 2.0, // Mon=2h, Tue=2h (total 4.0h available)
    });

    // Critical exam gets its 3.5h allocated first
    const examAllocated = result.dailyPlans
      .flatMap((p) => p.chunks)
      .filter((c) => c.deadlineId === "dl-exam")
      .reduce((sum, c) => sum + c.allocatedHours, 0);

    expect(examAllocated).toBe(3.5);

    // Low task receives remaining 0.5h capacity and flags shortfall for remaining 1.5h
    expect(result.shortfalls).toHaveLength(1);
    expect(result.shortfalls[0].deadlineId).toBe("dl-low");
    expect(result.shortfalls[0].shortfallHours).toBeCloseTo(1.5, 1);
  });

  it("handles workload shortfall case when effort exceeds cumulative capacity", () => {
    const massiveProject: Deadline = {
      ...sampleDeadline,
      id: "dl-massive",
      title: "Final Capstone Project",
      priority: "high",
      dueDate: "2026-10-13", // 2 weekdays = 4.0h capacity max
      estimatedEffortHours: 10.0, // Needs 10.0h!
    };

    const result = generateDeterministicSchedule([massiveProject], {
      startDate,
      daysToPlan: 7,
      weekdayCapacityHours: 2.0,
    });

    expect(result.totalEffortAllocated).toBe(4.0); // 2.0h Mon + 2.0h Tue
    expect(result.shortfalls).toHaveLength(1);
    expect(result.shortfalls[0].deadlineId).toBe("dl-massive");
    expect(result.shortfalls[0].requiredEffortHours).toBe(10.0);
    expect(result.shortfalls[0].allocatedHours).toBe(4.0);
    expect(result.shortfalls[0].shortfallHours).toBe(6.0);
    expect(result.totalShortfallHours).toBe(6.0);
  });
});
