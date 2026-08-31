import { describe, it, expect } from "vitest";
import {
  getDefaultReminderCadence,
  computeFireAt,
  isWithinQuietHours,
  adjustForQuietHours,
  enforceReminderCap,
  recomputeRemindersOnDueDateChange,
} from "@/server/domain/reminders";
import { type Reminder } from "@/types";

describe("Reminders & Quiet Hours Domain Logic", () => {
  describe("getDefaultReminderCadence", () => {
    it("returns 3 default reminders for exam type (7d, 1d, 2h)", () => {
      const examCadence = getDefaultReminderCadence("exam");
      expect(examCadence).toHaveLength(3);
      expect(examCadence[0].offsetMinutes).toBe(10080); // 7 days
      expect(examCadence[1].offsetMinutes).toBe(1440);  // 1 day
      expect(examCadence[2].offsetMinutes).toBe(120);   // 2 hours
    });

    it("returns 2 default reminders for assignments, projects, labs, and presentations", () => {
      const assignmentCadence = getDefaultReminderCadence("assignment");
      expect(assignmentCadence).toHaveLength(2);
      expect(assignmentCadence[0].offsetMinutes).toBe(1440);
      expect(assignmentCadence[1].offsetMinutes).toBe(120);

      const presentationCadence = getDefaultReminderCadence("presentation");
      expect(presentationCadence).toHaveLength(2);

      const labCadence = getDefaultReminderCadence("lab");
      expect(labCadence).toHaveLength(2);
    });
  });

  describe("computeFireAt", () => {
    it("calculates fireAt timestamp subtracting offset minutes", () => {
      const fireAt = computeFireAt("2026-10-15", "18:00", 120); // 2 hours before 18:00
      expect(fireAt.getHours()).toBe(16);
      expect(fireAt.getMinutes()).toBe(0);
      expect(fireAt.toISOString().split("T")[0]).toBe("2026-10-15");
    });

    it("handles midnight and fallback time calculation (23:59)", () => {
      const fireAt = computeFireAt("2026-10-15", null, 1440); // 1 day before 23:59
      expect(fireAt.getHours()).toBe(23);
      expect(fireAt.getMinutes()).toBe(59);
      expect(fireAt.toISOString().split("T")[0]).toBe("2026-10-14");
    });
  });

  describe("Quiet Hours Conflict Detection & Shifting", () => {
    const quietHours = { start: "22:00", end: "08:00" };

    it("detects when a time falls inside overnight quiet hours", () => {
      const midnight = new Date("2026-10-15T01:30:00");
      const eveningQuiet = new Date("2026-10-15T22:30:00");
      const morningActive = new Date("2026-10-15T09:00:00");

      expect(isWithinQuietHours(midnight, quietHours)).toBe(true);
      expect(isWithinQuietHours(eveningQuiet, quietHours)).toBe(true);
      expect(isWithinQuietHours(morningActive, quietHours)).toBe(false);
    });

    it("shifts fireAt to end of quiet hours (08:00) when deadline is due in afternoon", () => {
      const dueDateTime = new Date("2026-10-15T17:00:00"); // Due at 5 PM
      const fireAtDuringQuiet = new Date("2026-10-15T03:00:00"); // 3 AM

      const adjusted = adjustForQuietHours(fireAtDuringQuiet, dueDateTime, quietHours);
      expect(adjusted.getHours()).toBe(8);
      expect(adjusted.getMinutes()).toBe(0);
    });

    it("shifts fireAt to before quiet hours starts (21:45) when deadline is due early morning", () => {
      const dueDateTime = new Date("2026-10-15T08:30:00"); // Due at 8:30 AM (too close to 8:00 AM)
      const fireAtDuringQuiet = new Date("2026-10-15T06:30:00"); // 6:30 AM

      const adjusted = adjustForQuietHours(fireAtDuringQuiet, dueDateTime, quietHours);
      expect(adjusted.getHours()).toBe(21);
      expect(adjusted.getMinutes()).toBe(45);
    });
  });

  describe("enforceReminderCap", () => {
    it("strictly clamps reminders to maximum 3 per deadline", () => {
      const list = [1, 2, 3, 4, 5];
      const capped = enforceReminderCap(list, 3);
      expect(capped).toHaveLength(3);
      expect(capped).toEqual([1, 2, 3]);
    });
  });

  describe("recomputeRemindersOnDueDateChange", () => {
    const fixedAbsoluteTime = new Date("2026-10-10T15:00:00Z");

    const sampleReminders: Reminder[] = [
      {
        id: "rem-1",
        deadlineId: "dl-1",
        userId: "u1",
        mode: "relative",
        offsetMinutes: 120, // 2h before
        fireAt: new Date("2026-10-15T15:00:00Z"),
        channels: ["push", "email"],
        isDispatched: false,
        createdAt: new Date(),
      },
      {
        id: "rem-2",
        deadlineId: "dl-1",
        userId: "u1",
        mode: "absolute",
        offsetMinutes: null,
        fireAt: fixedAbsoluteTime,
        channels: ["email"],
        isDispatched: false,
        createdAt: new Date(),
      },
    ];

    it("recalculates relative reminders but leaves absolute reminders fixed", () => {
      const updated = recomputeRemindersOnDueDateChange(
        sampleReminders,
        "2026-10-20",
        "18:00",
        { enabled: false, start: "22:00", end: "08:00" }
      );

      // Relative reminder updated to 2 hours before 2026-10-20 18:00 -> 16:00
      expect(updated[0].fireAt.getHours()).toBe(16);
      expect(updated[0].fireAt.getMinutes()).toBe(0);

      // Absolute reminder stays untouched at fixed timestamp
      expect(updated[1].fireAt.getTime()).toBe(fixedAbsoluteTime.getTime());
    });
  });
});
