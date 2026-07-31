import { test, expect } from "@playwright/test";

test.describe("1. Authentication Flow", () => {
  test("1.1 Load Login Page & UI Title", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Nha Tro Manager/i);
    await expect(page.locator("h3")).toContainText("Đăng nhập");
  });

  test("1.2 Login with Invalid Credentials shows Error Message", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[type='tel']", "0999999999");
    await page.fill("input[type='password']", "WrongPassword123");
    await page.click("button[type='submit']");
    await expect(page.locator("body")).toContainText(/không chính xác|không hợp lệ|không đúng|thất bại|error/i);
  });
});
