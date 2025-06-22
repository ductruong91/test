import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { testPatient } from "./helpers/testData";
import { findSimpleScheduleElement } from "./helpers/scheduleHelpers";

test("Tìm schedule element, click và check hiển thị với thông tin khung giờ khám lưu trong testPatient trong file testdata nhưng chỉ check với ngày hôm nay", async ({
  page,
}) => {
  await login(page);
  await page.locator(".flex.aspect-square").click();
  await page
    .getByRole("navigation")
    .locator("div")
    .filter({ hasText: "スケジュール管理" })
    .click();
  await page.getByRole("link", { name: "シフト表（日表示）" }).click();

  const { servicePlanHour, servicePlanMinute, servicePlanDuration, staffName } =
    testPatient;

  console.log(`\n🔍 Tìm schedule với thông tin:`);
  console.log(`   Thời gian: ${servicePlanHour}:${servicePlanMinute}`);
  console.log(`   Duration: ${servicePlanDuration}`);
  console.log(`   Nhân viên: ${staffName}`);

  // Tìm schedule element
  const scheduleElement = await findSimpleScheduleElement(
    page,
    servicePlanHour,
    servicePlanMinute,
    staffName,
    servicePlanDuration
  );

  if (scheduleElement) {
    await expect(scheduleElement).toBeVisible();
    const text = await scheduleElement.textContent();
    const style = await scheduleElement.getAttribute("style");
    console.log(`✅ Tìm thấy schedule element:`);
    console.log(`   Text: "${text?.trim()}"`);
    console.log(`   Style: "${style}"`);

    // Click vào element cuối cùng
    await scheduleElement.last().click();

    console.log("\n🔍 Verifying schedule form information...");

    // --- Chuẩn bị dữ liệu dự kiến ---
    const {
      firstName,
      lastName,
      staffName: expectedStaffName,
      servicePlanYear,
      servicePlanMonth,
      servicePlanDate,
      servicePlanHour,
      servicePlanMinute,
      servicePlanDuration,
    } = testPatient;

    // Tên khách hàng dự kiến
    const expectedCustomerName = `${lastName} ${firstName}`;

    // Chuỗi ngày dự kiến (ví dụ: 2025/06/23 (月))
    const planDate = new Date(
      servicePlanYear,
      servicePlanMonth - 1,
      Number(servicePlanDate)
    );
    const weekDaysJP = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = weekDaysJP[planDate.getDay()];
    const expectedDate = `${String(servicePlanMonth).padStart(
      2,
      "0"
    )}月${String(servicePlanDate).padStart(2, "0")}日(${dayOfWeek})`;

    // Escape parentheses for use in regex
    const expectedDateRegex = expectedDate
      .replace("(", "\\(")
      .replace(")", "\\)");

    // Thời gian bắt đầu và kết thúc dự kiến
    const startTime = `${parseInt(servicePlanHour, 10)}:${servicePlanMinute}`;
    const durationMinutes = parseInt(
      servicePlanDuration.match(/(\d+)/)?.[1] || "0",
      10
    );
    const startDate = new Date(0);
    startDate.setHours(
      parseInt(servicePlanHour, 10),
      parseInt(servicePlanMinute, 10)
    );

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const endTime = `${endDate.getHours()}:${String(
      endDate.getMinutes()
    ).padStart(2, "0")}`;

    // Combine into a time range, as seen in the error log
    const expectedTimeRange = `${startTime}〜${endTime}`;

    // --- Xác thực dữ liệu trên modal ---
    console.log(`   Verifying Customer Name: "${expectedCustomerName}"`);
    const modal = page
      .locator("div:visible")
      .filter({ hasText: expectedCustomerName })
      .last();
    await expect(modal).toBeVisible({ timeout: 10000 });
    console.log("✅ Modal form is visible.");

    console.log(`   Verifying Staff Name: "${expectedStaffName}"`);
    await expect(modal.getByText(expectedStaffName)).toBeVisible();

    // Verify Date and Time together for a unique match, using a regex
    console.log(
      `   Verifying Date and Time Range: "${expectedDate}" and "${expectedTimeRange}"`
    );
    await expect(
      modal.getByText(
        new RegExp(`${expectedDateRegex}\\s+-\\s+${expectedTimeRange}`)
      )
    ).toBeVisible();

    console.log("🎉 All information on the form verified successfully!");
  } else {
    console.log("❌ Không tìm thấy schedule element");
  }
});
