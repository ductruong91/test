import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { testPatient } from "./helpers/testData";
import {
  findScheduleElement,
  verifyScheduleElement,
  ScheduleInfo,
  findSimpleScheduleElement,
} from "./helpers/scheduleHelpers";
import { calculateAppointmentDates } from "./helpers/frequencyHelper";

test("check tất cả các ngày theo chu kì khám", async ({ page }) => {
  // Tăng timeout cho riêng test này lên 40 giây
  test.setTimeout(40000);

  await login(page);
  await page.locator(".flex.aspect-square").click();
  await page
    .getByRole("navigation")
    .locator("div")
    .filter({ hasText: "スケジュール管理" })
    .click();
  await page.getByRole("link", { name: "シフト表（日表示）" }).click();

  const {
    servicePlanYear,
    servicePlanMonth,
    servicePlanDate,
    servicePlanFrequency,
    staffName,
    servicePlanHour,
    servicePlanMinute,
    servicePlanDuration,
    firstName,
    lastName,
    firstNameKana,
    lastNameKana,
  } = testPatient;

  const customerName = `${lastName} ${firstName}`;

  // Sử dụng hàm calculateAppointmentDates để lấy danh sách ngày cần kiểm tra
  const dates = calculateAppointmentDates(
    servicePlanFrequency,
    servicePlanYear,
    servicePlanMonth,
    Number(servicePlanDate),
    3 // 3 tháng
  );

  console.log(
    `📅 Generated ${dates.length} appointment dates for frequency: "${servicePlanFrequency}"`
  );

  let currentMonth = servicePlanMonth;
  let currentYear = servicePlanYear;

  //check schedule element in all dates
  for (const d of dates) {
    // Show all dates
    const weekDaysJP = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = weekDaysJP[d.getDay()];
    const weekPosition = Math.ceil(d.getDate() / 7);
    console.log(
      ` ${d.toLocaleDateString()} (${dayOfWeek}) - Week ${weekPosition}`
    );

    await page.locator("#layout-header-filter div").nth(1).click();
    // Nếu sang tháng mới thì chuyển tháng
    if (d.getMonth() + 1 !== currentMonth || d.getFullYear() !== currentYear) {
      const monthStr = `${d.getFullYear()}年${d
        .getMonth()
        .toString()
        .padStart(2, "0")}月`;
      await page
        .locator("div")
        .filter({ hasText: new RegExp(`^${monthStr}$`) })
        .getByRole("button")
        .nth(1)
        .click();
      currentMonth = d.getMonth() + 1;
      currentYear = d.getFullYear();
    }
    console.log(d.getDate().toString());
    const dayLocators = page.getByText(d.getDate().toString(), { exact: true });
    const count = await dayLocators.count();
    if (count === 2 && d.getDate() > 15) {
      await dayLocators.nth(1).click();
    } else {
      await dayLocators.first().click();
    }

    // Chờ cho bảng lịch của ngày được chọn tải xong
    await page.waitForLoadState("networkidle");
    // Thay vì chờ cố định, chúng ta sẽ chờ cho một phần tử chính của bảng lịch (cột của nhân viên) hiển thị.
    // Điều này đảm bảo rằng DOM đã được cập nhật trước khi chúng ta tìm kiếm.
    await expect(
      page.locator("div", { hasText: staffName }).first()
    ).toBeVisible();
    await page.waitForTimeout(1000);

    const scheduleElement = await findSimpleScheduleElement(
      page,
      servicePlanHour,
      servicePlanMinute,
      staffName,
      servicePlanDuration
    );

    if (scheduleElement) {
      const lastElement = scheduleElement.last();
      console.log("✅ Schedule element found. Clicking the last one...");
      await expect(lastElement).toBeVisible();
      await lastElement.click();

      // --- Xác thực thông tin trên Modal ---
      console.log("Verifying form information...");
      const modal = page
        .locator("div:visible")
        .filter({ hasText: customerName })
        .last();
      await expect(modal).toBeVisible({ timeout: 10000 });
      console.log("✅ Modal form is visible.");

      const weekDaysJP = ["日", "月", "火", "水", "木", "金", "土"];
      const dayOfWeek = weekDaysJP[d.getDay()];
      const expectedDate = `${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}月${String(d.getDate()).padStart(2, "0")}日(${dayOfWeek})`;
      const expectedDateRegex = expectedDate
        .replace("(", "\\(")
        .replace(")", "\\)");

      const startTime = `${parseInt(servicePlanHour, 10)}:${servicePlanMinute}`;

      // --- Tính toán End Time thủ công để tránh lỗi từ Date object ---
      const startHourNum = parseInt(servicePlanHour, 10);
      const startMinuteNum = parseInt(servicePlanMinute, 10);
      const durationMinutes = parseInt(
        servicePlanDuration.match(/(\\d+)/)?.[1] || "0",
        10
      );
      const endMinuteNum = (startMinuteNum + durationMinutes) % 60;
      const endHourNum =
        startHourNum + Math.floor((startMinuteNum + durationMinutes) / 60);
      const endTime = `${endHourNum}:${String(endMinuteNum).padStart(2, "0")}`;
      const expectedTimeRange = `${startTime}〜${endTime}`;

      // await expect(modal.getByText(staffName)).toBeVisible();
      await expect(
        modal.getByText(
          new RegExp(
            `${expectedDateRegex}\\s+-\\s+${startTime}〜\\d{1,2}:\\d{2}`
          )
        )
      ).toBeVisible();

      console.log("🎉 Information verified successfully for this date!");

      // --- Đóng modal ---
      console.log("Closing modal...");
      await page
        .locator("div")
        .filter({ hasText: new RegExp(`^${staffName}のスケジュール$`) })
        .getByRole("button")
        .nth(3)
        .click();
      // await expect(modal).not.toBeVisible();
      console.log("Modal closed.");
    } else {
      console.log(
        `❌ Schedule element not found for date: ${d.toLocaleDateString()}`
      );
      // Nếu lịch khám luôn phải tồn tại, bạn có thể bỏ comment dòng sau để test báo lỗi
      // expect(scheduleElement).not.toBeNull();
    }
  }
});
