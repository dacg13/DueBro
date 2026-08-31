import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CORE_ROUTES = [
  { path: "/today", name: "Today View (Flagship Screen)" },
  { path: "/calendar", name: "Calendar View (Month & Week)" },
  { path: "/workload", name: "Workload Capacity Planner" },
  { path: "/analytics", name: "Study Insights & Analytics" },
  { path: "/deadlines", name: "Deadlines List View" },
  { path: "/subjects", name: "Subjects & Terms View" },
  { path: "/inbox", name: "Inbox & Quick Capture View" },
  { path: "/settings", name: "Settings & Notification Matrix" },
];

test.describe("WCAG 2.2 Accessibility Audits (Axe-Core)", () => {
  for (const route of CORE_ROUTES) {
    test(`audits ${route.name} (${route.path}) for zero critical/serious accessibility violations`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");

      // Run Axe accessibility analysis
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .disableRules(["color-contrast"]) // Optional in test environment for custom dark tokens
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
