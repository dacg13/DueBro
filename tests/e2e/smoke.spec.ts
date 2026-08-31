import { test, expect } from "@playwright/test";

test("smoke test - homepage loads", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await expect(page.getByRole("heading", { name: /DueBro/i }).first()).toBeVisible();
});
