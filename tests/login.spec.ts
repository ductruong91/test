import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

test.describe("Login Page", () => {
  test("should login with valid credentials", async ({ page }) => {
    await login(page);
    // Chờ chuyển trang hoặc xác nhận đăng nhập thành công
    // Ví dụ: kiểm tra có xuất hiện dashboard hoặc user profile
    // Hoặc kiểm tra một thành phần đặc trưng sau đăng nhập
    // await expect(page.getByText('Dashboard')).toBeVisible();
  });
});
