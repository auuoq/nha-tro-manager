import { test, expect } from "@playwright/test";

test.describe("5. 26 SPA Routes Smoke Test", () => {
  const routes = [
    "/login",
    "/change-password",
    "/admin/dashboard",
    "/admin/buildings",
    "/admin/rooms",
    "/admin/tenants",
    "/admin/contracts",
    "/admin/meters",
    "/admin/invoices",
    "/admin/payments",
    "/admin/webhooks/unmatched",
    "/tenant/dashboard",
    "/tenant/contract",
    "/tenant/invoices",
    "/tenant/payments",
    "/401",
    "/403",
    "/404"
  ];

  for (const routePath of routes) {
    test(`Smoke check route: ${routePath}`, async ({ page }) => {
      await page.goto(routePath);
      await expect(page).toHaveTitle(/Nha Tro Manager|Vite/i);
    });
  }
});
