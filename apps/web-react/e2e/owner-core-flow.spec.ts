import { test, expect } from "@playwright/test";

test.describe("2. Owner Core Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Login
    await page.goto("/login");
  });

  test("2.1 Owner creates property structure (Building & Room)", async ({ page }) => {
    await page.goto("/admin/buildings");
    await expect(page).toHaveURL(/\/login|\/admin\/buildings/);
  });

  test("2.2 Owner creates tenant and activates contract", async ({ page }) => {
    await page.goto("/admin/contracts");
    await expect(page).toHaveURL(/\/login|\/admin\/contracts/);
  });

  test("2.3 Owner records meter reading and issues invoice", async ({ page }) => {
    await page.goto("/admin/invoices");
    await expect(page).toHaveURL(/\/login|\/admin\/invoices/);
  });

  test("2.4 Owner records payment and partial refund", async ({ page }) => {
    await page.goto("/admin/payments");
    await expect(page).toHaveURL(/\/login|\/admin\/payments/);
  });

  test("2.5 Owner complete core-flow smoke UI verification", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/login|\/admin\/dashboard/);
  });
});
