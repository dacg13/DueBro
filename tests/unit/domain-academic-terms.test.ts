import { describe, it, expect } from "vitest";
import {
  validateTermRange,
  isDateWithinTerm,
  resolveCurrentTerm,
} from "@/server/domain/academic-terms";
import { type AcademicTerm } from "@/server/db/schema/academic-terms";

describe("Academic Terms Domain Logic", () => {
  describe("validateTermRange", () => {
    it("returns true when end date is after start date", () => {
      expect(validateTermRange("2026-09-01", "2026-12-20")).toBe(true);
    });

    it("returns true for single day terms", () => {
      expect(validateTermRange("2026-09-01", "2026-09-01")).toBe(true);
    });

    it("returns false when end date precedes start date", () => {
      expect(validateTermRange("2026-12-20", "2026-09-01")).toBe(false);
    });
  });

  describe("isDateWithinTerm", () => {
    const term: AcademicTerm = {
      id: "term-1",
      userId: "u1",
      name: "Fall 2026",
      startDate: "2026-09-01",
      endDate: "2026-12-20",
      isCurrent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("returns true for dates inside the term window", () => {
      expect(isDateWithinTerm("2026-10-15", term)).toBe(true);
      expect(isDateWithinTerm("2026-09-01", term)).toBe(true); // boundary
      expect(isDateWithinTerm("2026-12-20", term)).toBe(true); // boundary
    });

    it("returns false for dates outside the term window", () => {
      expect(isDateWithinTerm("2026-08-30", term)).toBe(false);
      expect(isDateWithinTerm("2026-12-25", term)).toBe(false);
    });
  });

  describe("resolveCurrentTerm", () => {
    const terms: AcademicTerm[] = [
      {
        id: "t1",
        userId: "u1",
        name: "Spring 2026",
        startDate: "2026-01-15",
        endDate: "2026-05-15",
        isCurrent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "t2",
        userId: "u1",
        name: "Fall 2026",
        startDate: "2026-09-01",
        endDate: "2026-12-20",
        isCurrent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("prioritizes the explicitly marked current term", () => {
      const current = resolveCurrentTerm(terms);
      expect(current?.id).toBe("t2");
    });

    it("resolves term by date window if no term is explicitly marked current", () => {
      const unflaggedTerms = terms.map((t) => ({ ...t, isCurrent: false }));
      const current = resolveCurrentTerm(unflaggedTerms, new Date("2026-03-10"));
      expect(current?.id).toBe("t1");
    });
  });
});
