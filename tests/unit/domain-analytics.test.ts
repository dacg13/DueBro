import { describe, it, expect } from "vitest";
import { calculateStudyAnalytics } from "@/server/domain/analytics";
import { type Deadline, type Subject } from "@/types";

describe("Academic & Study Workload Analytics Engine (V1.5)", () => {
  const fixedNow = new Date("2026-10-12T10:00:00Z"); // Monday

  const sampleSubjects: Subject[] = [
    {
      id: "sub-1",
      termId: "term-1",
      userId: "u1",
      name: "CS101",
      color: "#5B6EF5",
      archived: false,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "sub-2",
      termId: "term-1",
      userId: "u1",
      name: "MATH201",
      color: "#2DB5A5",
      archived: false,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const sampleDeadlines: Deadline[] = [
    {
      id: "dl-1",
      userId: "u1",
      subjectId: "sub-1",
      termId: "term-1",
      title: "Completed Problem Set (On Time)",
      type: "assignment",
      dueDate: "2026-10-10",
      dueTime: "23:59",
      priority: "high",
      status: "completed",
      progress: 100,
      estimatedEffortHours: 4.0,
      location: null,
      notes: null,
      tags: [],
      links: [],
      recurrenceRuleId: null,
      originalOccurrenceDate: null,
      sharedDeadlineId: null,
      completedAt: new Date("2026-10-09T18:00:00Z"), // Completed before due date
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "dl-2",
      userId: "u1",
      subjectId: "sub-1",
      termId: "term-1",
      title: "Completed Lab (Late)",
      type: "lab",
      dueDate: "2026-10-05",
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
      sharedDeadlineId: null,
      completedAt: new Date("2026-10-07T12:00:00Z"), // Completed after due date
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "dl-3",
      userId: "u1",
      subjectId: "sub-2",
      termId: "term-1",
      title: "Active Midterm Exam (Critical Risk)",
      type: "exam",
      dueDate: "2026-10-14", // In 2 days
      dueTime: "10:00",
      priority: "critical",
      status: "in_progress",
      progress: 50,
      estimatedEffortHours: 6.0,
      location: "Hall B",
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
      id: "dl-4",
      userId: "u1",
      subjectId: "sub-2",
      termId: "term-1",
      title: "Overdue Quiz",
      type: "quiz",
      dueDate: "2026-10-01", // In past
      dueTime: "23:59",
      priority: "high",
      status: "not_started",
      progress: 0,
      estimatedEffortHours: 2.0,
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

  it("handles empty deadline array with safe zero states", () => {
    const res = calculateStudyAnalytics([], sampleSubjects, fixedNow);
    expect(res.totalDeadlines).toBe(0);
    expect(res.completionRatePercent).toBe(0);
    expect(res.onTimeRatePercent).toBe(100);
  });

  it("accurately computes overall completion rate and on-time percentage", () => {
    const res = calculateStudyAnalytics(sampleDeadlines, sampleSubjects, fixedNow);

    expect(res.totalDeadlines).toBe(4);
    expect(res.completedDeadlines).toBe(2);
    expect(res.activeDeadlines).toBe(2);
    expect(res.overdueDeadlines).toBe(1);

    // 2 / 4 = 50%
    expect(res.completionRatePercent).toBe(50);

    // 1 on-time out of 2 completed = 50%
    expect(res.onTimeRatePercent).toBe(50);
  });

  it("computes total effort, completed effort, and remaining effort hours", () => {
    const res = calculateStudyAnalytics(sampleDeadlines, sampleSubjects, fixedNow);

    // Total: 4h + 2h + 6h + 2h = 14h
    expect(res.totalEffortHours).toBe(14);

    // Completed: 4h (100%) + 2h (100%) + 3h (50% of 6h) = 9h
    expect(res.completedEffortHours).toBe(9);

    // Remaining: 14 - 9 = 5h
    expect(res.remainingEffortHours).toBe(5);
  });

  it("breaks down course study workload for each subject", () => {
    const res = calculateStudyAnalytics(sampleDeadlines, sampleSubjects, fixedNow);

    const cs101 = res.subjectSummaries.find((s) => s.subjectId === "sub-1");
    const math201 = res.subjectSummaries.find((s) => s.subjectId === "sub-2");

    expect(cs101?.totalTasks).toBe(2);
    expect(cs101?.completedTasks).toBe(2);
    expect(cs101?.completionRatePercent).toBe(100);

    expect(math201?.totalTasks).toBe(2);
    expect(math201?.completedTasks).toBe(0);
    expect(math201?.remainingHours).toBe(5);
  });
});
