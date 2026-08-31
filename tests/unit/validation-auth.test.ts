import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema, profileSchema } from "@/lib/validation/auth";

describe("Auth Validation Schemas", () => {
  it("validates correct login credentials", () => {
    const valid = { email: "student@mit.edu", password: "securepassword123" };
    expect(loginSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    const invalid = { email: "not-an-email", password: "securepassword123" };
    const result = loginSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects short passwords under 6 characters", () => {
    const invalid = { email: "student@mit.edu", password: "123" };
    const result = loginSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates signup matching passwords", () => {
    const valid = {
      name: "Jane Doe",
      email: "jane@mit.edu",
      password: "strongpassword123",
      confirmPassword: "strongpassword123",
    };
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched confirm passwords on signup", () => {
    const mismatched = {
      name: "Jane Doe",
      email: "jane@mit.edu",
      password: "strongpassword123",
      confirmPassword: "differentpassword",
    };
    const result = signupSchema.safeParse(mismatched);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords do not match");
    }
  });

  it("validates profile study capacities within reasonable ranges", () => {
    const valid = {
      name: "Alex",
      timezone: "America/New_York",
      dailyCapacityHours: 3.5,
      weekendCapacityHours: 5.0,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    };
    expect(profileSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects unrealistic daily capacities over 16 hours", () => {
    const excessive = {
      name: "Alex",
      timezone: "America/New_York",
      dailyCapacityHours: 20.0,
      weekendCapacityHours: 5.0,
    };
    expect(profileSchema.safeParse(excessive).success).toBe(false);
  });
});
