import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { simpleScheduleTestPatient } from "./helpers/testData";
import { findAllSimpleScheduleElement } from "./helpers/scheduleHelpers";

test("Tìm và check thông tin trong ngày khám đầu tiên với thông tin ngày khám và giờ khám lưu tại simpleScheduleTestPatient trong file testdata", async ({
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

  // --- Chọn đúng ngày và tháng trước khi tìm schedule element ---
  const { servicePlanYear, servicePlanMonth, servicePlanDate } =
    simpleScheduleTestPatient;

  console.log(
    `\n📅 Đang chọn ngày: ${servicePlanYear}/${servicePlanMonth}/${servicePlanDate}`
  );

  // Sử dụng cùng logic như trong schedule-calendar-date-selection.spec.ts
  await page.locator("#layout-header-filter div").nth(1).click();

  // Tạo date object để kiểm tra tháng và năm
  const targetDate = new Date(
    servicePlanYear,
    servicePlanMonth - 1,
    Number(servicePlanDate)
  );
  const currentMonth = servicePlanMonth;
  const currentYear = servicePlanYear;

  // Nếu sang tháng mới thì chuyển tháng
  if (
    targetDate.getMonth() + 1 !== currentMonth ||
    targetDate.getFullYear() !== currentYear
  ) {
    const monthStr = `${targetDate.getFullYear()}年${servicePlanMonth}月`;
    await page
      .locator("div")
      .filter({ hasText: new RegExp(`^${monthStr}$`) })
      .getByRole("button")
      .nth(1)
      .click();
  }

  // Chọn ngày
  console.log(`   Chọn ngày ${servicePlanDate}`);
  const dayLocators = page.getByText(servicePlanDate.toString(), {
    exact: true,
  });
  const count = await dayLocators.count();
  if (count === 2 && Number(servicePlanDate) > 15) {
    await dayLocators.nth(1).click();
  } else {
    await dayLocators.first().click();
  }

  // Đợi calendar cập nhật
  await page.waitForLoadState("networkidle");
  console.log("✅ Đã chọn đúng ngày và tháng");

  const { servicePlanHour, servicePlanMinute, servicePlanDuration, staffName } =
    simpleScheduleTestPatient;

  console.log(`\n🔍 Tìm schedule với thông tin:`);
  console.log(`   Thời gian: ${servicePlanHour}:${servicePlanMinute}`);
  console.log(`   Duration: ${servicePlanDuration}`);
  console.log(`   Nhân viên: ${staffName}`);

  // Tìm schedule element
  const scheduleElements = await findAllSimpleScheduleElement(
    page,
    servicePlanHour,
    servicePlanMinute,
    staffName,
    servicePlanDuration
  );

  if (scheduleElements) {
    // Đếm số lượng element tìm được
    const elementCount = await scheduleElements.count();
    console.log(`✅ Tìm thấy ${elementCount} schedule elements`);

    if (elementCount > 0) {
      // Kiểm tra tất cả các element tìm được
      for (let i = 0; i < elementCount; i++) {
        const currentElement = scheduleElements.nth(i);
        await expect(currentElement).toBeVisible();

        const text = await currentElement.textContent();
        const style = await currentElement.getAttribute("style");
        console.log(`\n📋 Element ${i + 1}/${elementCount}:`);
        console.log(`   Text: "${text?.trim()}"`);
        console.log(`   Style: "${style}"`);
      }

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
        serviceType,
        servicePlanFrequency,
        address,
      } = simpleScheduleTestPatient;

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

      // Chuẩn bị chu kì khám dự kiến (ví dụ: ２日おき(土))
      const expectedFrequency = `${servicePlanFrequency}(${dayOfWeek})`;

      let foundCorrectForm = false;

      // Click vào từng element và kiểm tra form
      for (let i = 0; i < elementCount; i++) {
        console.log(
          `\n🔍 Checking form for element ${i + 1}/${elementCount}...`
        );

        const currentElement = scheduleElements.nth(i);
        await currentElement.click();

        try {
          // Tìm modal form
          const modal = page
            .locator("div:visible")
            .filter({ hasText: expectedCustomerName })
            .last();

          // Kiểm tra từng thông tin trong form
          let formIsCorrect = true;
          const errors: string[] = [];

          // Check Customer Name
          try {
            await expect(modal.getByText(expectedCustomerName)).toBeVisible({
              timeout: 3000,
            });
            console.log(`   ✅ Customer Name: "${expectedCustomerName}"`);
          } catch {
            formIsCorrect = false;
            errors.push("Customer Name not found");
          }

          // Check Staff Name
          try {
            await expect(modal.getByText(expectedStaffName)).toBeVisible({
              timeout: 3000,
            });
            console.log(`   ✅ Staff Name: "${expectedStaffName}"`);
          } catch {
            formIsCorrect = false;
            errors.push("Staff Name not found");
          }

          // Check Date and Time
          try {
            await expect(
              modal.getByText(
                new RegExp(`${expectedDateRegex}\\s+-\\s+${expectedTimeRange}`)
              )
            ).toBeVisible({ timeout: 3000 });
            console.log(
              `   ✅ Date and Time: "${expectedDate}" and "${expectedTimeRange}"`
            );
          } catch {
            formIsCorrect = false;
            errors.push("Date and Time not found");
          }

          // Check Service Type
          try {
            await expect(modal.getByText(serviceType)).toBeVisible({
              timeout: 3000,
            });
            console.log(`   ✅ Service Type: "${serviceType}"`);
          } catch {
            formIsCorrect = false;
            errors.push("Service Type not found");
          }

          // Check Frequency
          try {
            await expect(modal.getByText(expectedFrequency)).toBeVisible({
              timeout: 3000,
            });
            console.log(`   ✅ Frequency: "${expectedFrequency}"`);
          } catch {
            formIsCorrect = false;
            errors.push("Frequency not found");
          }

          // Check Address
          try {
            await expect(modal.getByText(address)).toBeVisible({
              timeout: 3000,
            });
            console.log(`   ✅ Address: "${address}"`);
          } catch {
            formIsCorrect = false;
            errors.push("Address not found");
          }

          if (formIsCorrect) {
            console.log(`🎉 Form ${i + 1} contains all correct information!`);
            foundCorrectForm = true;
            break; // Tìm thấy form đúng, thoát khỏi loop
          } else {
            console.log(`❌ Form ${i + 1} has errors: ${errors.join(", ")}`);
          }
        } catch (error) {
          console.log(`❌ Error checking form ${i + 1}: ${error.message}`);
        }

        // Đóng modal bằng nút đóng form
        try {
          await page
            .locator("div")
            .filter({
              hasText: new RegExp(`^${expectedStaffName}のスケジュール$`),
            })
            .getByRole("button")
            .nth(3)
            .click();
          await page.waitForTimeout(500);
        } catch {
          // Fallback: thử đóng bằng Escape nếu không tìm thấy nút
          try {
            await page.keyboard.press("Escape");
            await page.waitForTimeout(500);
          } catch {
            // Ignore if modal is not open
          }
        }
      }

      if (foundCorrectForm) {
        console.log(
          "🎉 Test PASSED: Found at least one form with correct information!"
        );
      } else {
        console.log("❌ Test FAILED: No form contains all correct information");
        throw new Error("No form contains all correct information");
      }
    } else {
      console.log("❌ Không tìm thấy schedule element");
    }
  } else {
    console.log("❌ Không tìm thấy schedule element");
  }
});
