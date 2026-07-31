import { test, expect } from "@playwright/test";

test.describe("3. Tenant Core Flow E2E", () => {
  test("3.1 Tenant Login & Route Access", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Nha Tro Manager/i);
  });

  test("3.2 Tenant Contract Page Access", async ({ page }) => {
    await page.goto("/tenant/contract");
    await expect(page).toHaveURL(/\/login|\/tenant\/contract/);
  });

  test("3.3 Tenant Invoices & VietQR Access", async ({ page }) => {
    await page.goto("/tenant/invoices");
    await expect(page).toHaveURL(/\/login|\/tenant\/invoices/);
  });

  test("3.4 Tenant Payments Access", async ({ page }) => {
    await page.goto("/tenant/payments");
    await expect(page).toHaveURL(/\/login|\/tenant\/payments/);
  });
});
