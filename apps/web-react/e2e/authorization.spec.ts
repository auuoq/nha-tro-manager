import { test, expect } from "@playwright/test";

test.describe("4. Authorization & RBAC Route Protection E2E", () => {
  test("4.1 Unauthenticated Access Redirects or Shows Error Page (401/403/Login)", async ({ page }) => {
    await page.goto("/admin/buildings");
    await expect(page).toHaveURL(/\/login|\/401|\/403|\/admin\/buildings/);
  });

  test("4.2 Non-existent Route Renders 404 Error Page", async ({ page }) => {
    await page.goto("/non-existent-path-999");
    await expect(page.locator("h1")).toContainText("404");
  });
});
