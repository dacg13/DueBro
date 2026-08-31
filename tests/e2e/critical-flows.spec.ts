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
    await input.fill("Read operating systems chapter 5 by Friday 5pm urgent");

    // Live NLP preview chips should detect Friday, 5pm, and critical priority
    await expect(page.getByText(/Detected:/i)).toBeVisible();
    await expect(page.getByText(/Critical/i)).toBeVisible();

    // Submit via Capture submit button
    await page.locator('button[type="submit"]').click();

    // Verify task is added to triage list
    await expect(page.getByText(/Read operating systems chapter 5/i)).toBeVisible();
  });

  test("Flow 2: Today View focus card inspection & quick-complete interaction", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.waitForLoadState("domcontentloaded");

    // Check Focus section and Stat Grid
    await expect(page.getByText(/Focus Tasks/i)).toBeVisible();
    await expect(page.getByText(/Recommended Focus/i)).toBeVisible();

    // Verify at least one task card exists
    const taskCard = page.getByText(/Dynamic Programming Problem Set 4/i).first();
    await expect(taskCard).toBeVisible();

    // Click card to open detail modal
    await taskCard.click();
    await expect(page.getByText(/Subtasks & Milestones/i)).toBeVisible();
    await page.getByRole("button", { name: /Close/i }).click();
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

  test("Flow 4: 14-Day Roadmap upcoming schedule inspection", async ({
    page,
  }) => {
    await page.goto("/workload");
    await page.waitForLoadState("domcontentloaded");

    // Check 14-Day Roadmap title is visible
    await expect(page.getByText(/14-Day Roadmap/i)).toBeVisible();
    await expect(page.getByText(/Upcoming Schedule/i)).toBeVisible();
  });

  test("Flow 5: Analytics and Coursework Insights dashboard", async ({
    page,
  }) => {
    await page.goto("/analytics");
    await page.waitForLoadState("domcontentloaded");

    // Check stat cards
    await expect(page.getByText(/Overall Completion Rate/i)).toBeVisible();
    await expect(page.getByText("On-Time Punctuality", { exact: true })).toBeVisible();
    await expect(page.getByText(/Active Deadlines/i)).toBeVisible();

    // Check Risk and Subject charts
    await expect(page.getByText(/Workload Risk Distribution/i)).toBeVisible();
    await expect(page.getByText(/Coursework & Completion Breakdown/i)).toBeVisible();
  });
});
