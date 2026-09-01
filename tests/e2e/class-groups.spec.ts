import { test, expect } from "@playwright/test";

test.describe("Class Groups & Shared Deadlines E2E Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Disable splash animation in tests
    await page.addInitScript(() => {
      sessionStorage.setItem("duebro_splash_seen", "true");
    });
  });

  test("Flow 1: Settings page includes Friends & Study Network and Two-Tier Notification Matrix", async ({
    page,
  }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Verify Friends & Study Network section exists
    await expect(page.getByText(/Friends & Study Network/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /Manage Friends/i })).toBeVisible();

    // Verify two distinct notification rows exist (Fix #5)
    await expect(page.getByText("Shared Deadline Added", { exact: true })).toBeVisible();
    await expect(page.getByText("Shared Deadline Edited", { exact: true })).toBeVisible();

    // Click Manage Friends -> FriendsManagerDialog opens
    await page.getByRole("button", { name: /Manage Friends/i }).click();
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Friends & Study Network" })).toBeVisible();

    // Check tabs
    await expect(page.getByRole("button", { name: "Friends", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Requests", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Friend", exact: true })).toBeVisible();

    // Switch to Add Friend tab
    await page.getByRole("button", { name: "Add Friend", exact: true }).click();
    await expect(page.getByPlaceholder(/friend@university.edu/i)).toBeVisible();
  });

  test("Flow 2: Subject Detail Modal contains 'Share with Classmates' action and opens Create Class Group Dialog", async ({
    page,
  }) => {
    await page.goto("/subjects");
    await page.waitForLoadState("networkidle");

    // Click on a subject card to open Subject Detail
    const subjectCard = page.getByText(/CS101 Algorithms/i).first();
    await subjectCard.scrollIntoViewIfNeeded();
    await expect(subjectCard).toBeVisible({ timeout: 10000 });
    await subjectCard.click();

    // Check "Share with Classmates" button exists in header (Fix #4)
    const shareBtn = page.getByRole("button", { name: /Share with Classmates/i });
    await expect(shareBtn).toBeVisible({ timeout: 5000 });

    // Click Share with Classmates -> Create Class Group dialog opens
    await shareBtn.click();
    await expect(page.getByRole("heading", { name: "Create Class Group" })).toBeVisible();
    await expect(page.getByLabel(/Group Name/i)).toBeVisible();
    await expect(page.getByLabel(/Your Subject for this Class/i)).toBeVisible();
  });
});
