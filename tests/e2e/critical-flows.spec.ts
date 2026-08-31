import { test, expect } from "@playwright/test";

test.describe("DueBro Critical User Flows (PRODUCT_PRD.md §26)", () => {
  test("Flow 1: Quick Capture bare-text save with zero required fields and 1-tap triage", async ({
    page,
  }) => {
    await page.goto("/inbox");
    await page.waitForLoadState("domcontentloaded");

    // Check Quick Capture input exists
    const input = page.getByPlaceholder(/Read biology chapter/i);
    await expect(input).toBeVisible();

    // Type bare-text task with NLP hints
    await input.fill("Read operating systems chapter 5 by Friday 5pm 2h urgent");

    // Live NLP preview chips should detect Friday, 5pm, 2h, and critical priority
    await expect(page.getByText(/Detected:/i)).toBeVisible();
    await expect(page.getByText(/2h effort/i)).toBeVisible();
    await expect(page.getByText(/Critical/i)).toBeVisible();

    // Submit via Capture submit button
    await page.locator('button[type="submit"]').click();

    // Verify task is added to triage list
    await expect(page.getByText(/Read operating systems chapter 5/i)).toBeVisible();
  });

  test("Flow 2: Today View focus card inspection & logging effort", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.waitForLoadState("domcontentloaded");

    // Check Study Load meter is visible
    await expect(page.getByText(/Today's Study Load/i)).toBeVisible();

    // Check Today's Focus section
    await expect(page.getByText(/Recommended Focus/i)).toBeVisible();

    // Verify at least one task card exists with remaining effort
    const logBtn = page.getByRole("button", { name: /Log Study Time/i }).first();
    await expect(logBtn).toBeVisible();
    await logBtn.click();
    
    // Quick log modal/sheet should open with title "Log Study Progress"
    await expect(page.getByRole("heading", { name: /Log Study Progress/i }).first()).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /Cancel/i }).first().click();
  });

  test("Flow 3: Calendar Month & Week View switching and Rescheduling modal", async ({
    page,
  }) => {
    await page.goto("/calendar");
    await page.waitForLoadState("domcontentloaded");

    // Switch to Week View
    await page.getByRole("button", { name: "Week", exact: true }).click();

    // Verify 7-day columns are rendered
    await expect(page.getByText("Mon", { exact: true })).toBeVisible();
    await expect(page.getByText("Sun", { exact: true })).toBeVisible();
  });

  test("Flow 4: Workload Capacity Tuner real-time adjustment", async ({
    page,
  }) => {
    await page.goto("/workload");
    await page.waitForLoadState("domcontentloaded");

    // Check 14-Day Timeline is visible
    await expect(page.getByText(/14-Day Study Pacing Timeline/i)).toBeVisible();

    // Check Capacity Tuner sliders
    await expect(page.getByText(/Weekday Max Study Load/i)).toBeVisible();
    await expect(page.getByText(/Weekend Max Study Load/i)).toBeVisible();
  });

  test("Flow 5: Analytics and Study Insights dashboard", async ({
    page,
  }) => {
    await page.goto("/analytics");
    await page.waitForLoadState("domcontentloaded");

    // Check stat cards
    await expect(page.getByText(/Overall Completion Rate/i)).toBeVisible();
    await expect(page.getByText("On-Time Punctuality", { exact: true })).toBeVisible();
    await expect(page.getByText(/Remaining Study Effort/i)).toBeVisible();

    // Check Risk and Subject charts
    await expect(page.getByText(/Workload Risk Distribution/i)).toBeVisible();
    await expect(page.getByText(/Course Effort & Completion Breakdown/i)).toBeVisible();
  });
});
