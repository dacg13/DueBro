import { describe, it, expect } from "vitest";
import { parseQuickCaptureText } from "@/server/domain/quick-capture";

describe("Quick Capture Natural Language Parser", () => {
  const fixedNow = new Date("2026-10-12T10:00:00Z"); // Monday Oct 12, 2026

  it("handles bare-text with zero required fields and creates valid deadline object", () => {
    const res = parseQuickCaptureText("Finish history paper", fixedNow);
    expect(res.cleanTitle).toBe("Finish history paper");
    expect(res.type).toBe("assignment");
    expect(res.priority).toBe("medium");
    expect(res.dueDate).toBeNull();
    expect(res.dueTime).toBeNull();
  });

  it("extracts 'tomorrow' and specific time '5pm'", () => {
    const res = parseQuickCaptureText("Chemistry Lab report tomorrow at 5pm", fixedNow);
    expect(res.dueDate).toBe("2026-10-13"); // Tuesday Oct 13
    expect(res.dueTime).toBe("17:00");
    expect(res.type).toBe("lab");
  });

  it("extracts upcoming weekday 'Friday' and 'midnight'", () => {
    const res = parseQuickCaptureText("Problem set 4 by Friday midnight", fixedNow);
    expect(res.dueDate).toBe("2026-10-16"); // Friday Oct 16
    expect(res.dueTime).toBe("23:59");
    expect(res.type).toBe("assignment");
  });

  it("extracts exam type and critical priority for 'urgent midterm'", () => {
    const res = parseQuickCaptureText("Urgent CS101 midterm exam in 4 days 3h", fixedNow);
    expect(res.type).toBe("exam");
    expect(res.priority).toBe("critical");
    expect(res.dueDate).toBe("2026-10-16");
    expect(res.estimatedEffortHours).toBe(3);
    expect(res.detectedSubjectHint).toBe("CS101");
  });

  it("extracts effort in minutes ('45m') and reading type", () => {
    const res = parseQuickCaptureText("Read chapter 4 of biology textbook 45m", fixedNow);
    expect(res.type).toBe("reading");
    expect(res.estimatedEffortHours).toBe(0.75); // 45 / 60
  });

  it("handles brackets for subject hints e.g. [MATH201]", () => {
    const res = parseQuickCaptureText("[MATH201] Quiz on matrices tomorrow 10am", fixedNow);
    expect(res.type).toBe("quiz");
    expect(res.detectedSubjectHint).toBe("MATH201");
    expect(res.dueDate).toBe("2026-10-13");
    expect(res.dueTime).toBe("10:00");
  });
});
