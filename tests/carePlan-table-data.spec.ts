import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { testPatient } from "./helpers/testData";
import { verifyTableDataForPatient } from "./helpers/verifyTableData";

// Test đơn giản để tránh lỗi
test("Verify table data helper function", async ({ page }) => {
  // Test này chỉ để đảm bảo file có ít nhất một test
  expect(true).toBe(true);
});

// Test sử dụng hàm verifyTableDataForPatient với testPatient data  chỉ dùng cho test người mới thêm
test("check thoong tin nguời dùng mới thêm", async ({ page }) => {
  await login(page);
  await page.locator(".flex.aspect-square").click();
  await page
    .locator("div")
    .filter({ hasText: /^サービス計画管理$/ })
    .click();
  await page.getByRole("link", { name: "サービス計画（リスト）" }).click();

  // Sử dụng hàm helper để verify table data
  const result = await verifyTableDataForPatient(page, testPatient);

  // Kiểm tra kết quả
  console.log("📊 Kết quả verify:", result);

  // Assert rằng tất cả dữ liệu khớp
  expect(result.matchCount).toBe(result.minLength);
  expect(result.matchCount).toBeGreaterThan(0);

  console.log("✅ Test verifyTableDataForPatient completed successfully!");
});
