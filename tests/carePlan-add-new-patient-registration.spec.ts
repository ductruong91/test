import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { testPatient } from "./helpers/testData";
import { verifyTableDataForPatient } from "./helpers/verifyTableData";

test("test tạo thêm mới lịch khám(thêm người dùng)", async ({ page }) => {
  // Biến lưu thông tin đăng nhập và thông tin bệnh nhân
  const username = testPatient.username;
  const password = testPatient.password;
  const firstName = testPatient.firstName;
  const lastName = testPatient.lastName;
  const firstNameKana = testPatient.firstNameKana;
  const lastNameKana = testPatient.lastNameKana;
  const address = testPatient.address;
  const staffName = testPatient.staffName;
  const serviceCode = testPatient.serviceCode;
  const servicePlanFrequency = testPatient.servicePlanFrequency;
  const servicePlanYear = testPatient.servicePlanYear;
  const servicePlanMonth = testPatient.servicePlanMonth; // Tháng 6
  const servicePlanDate = testPatient.servicePlanDate;
  const servicePlanHour = testPatient.servicePlanHour;
  const servicePlanMinute = testPatient.servicePlanMinute;
  const servicePlanDuration = testPatient.servicePlanDuration;
  const registrationType: string = testPatient.registrationType; // Có thể là "新規" hoặc "既存"
  const gender = testPatient.gender; // Giới tính
  const serviceType = testPatient.serviceType; // Loại dịch vụ
  const insuranceType = testPatient.insuranceType; // Loại bảo hiểm có thể là 介護保険, 医療保険, 自費
  // Xác định index theo insuranceType
  const insuranceTypeIndex =
    insuranceType === "介護保険" ? 0 : insuranceType === "医療保険" ? 1 : 2;
  // Tính toán ngày thứ trong tuần
  const weekDaysJP = ["日", "月", "火", "水", "木", "金", "土"];
  const planDateObj = new Date(
    servicePlanYear,
    servicePlanMonth - 1,
    Number(servicePlanDate)
  );
  const dayOfWeek = weekDaysJP[planDateObj.getDay()];
  console.log(planDateObj, dayOfWeek);

  const startTime = `${servicePlanHour}:${servicePlanMinute}`; // Thời gian bắt đầu

  await login(page);
  await page.locator(".flex.aspect-square").click();
  await page
    .locator("div")
    .filter({ hasText: /^サービス計画管理$/ })
    .click();
  await page.getByRole("link", { name: "サービス計画（リスト）" }).click();
  await page.getByRole("button", { name: "利用者を追加" }).click();

  if (registrationType === "既存") {
    await page
      .locator("div")
      .filter({ hasText: new RegExp(`^${registrationType}$`) })
      .getByRole("radio")
      .click();
    // Click vào ô chọn danh sách người dùng
    await page
      .locator("div")
      .filter({ hasText: /^利用者を探す$/ })
      .click();
    // Chọn khách hàng có tên firstName+lastName
    await page
      .getByRole("listitem")
      .filter({ hasText: `${firstName} ${lastName}` })
      .click();
  } else {
    // Chọn option 新規
    await page
      .locator("div")
      .filter({ hasText: new RegExp(`^${registrationType}$`) })
      .getByRole("radio")
      .click();
    await page.locator('input[name="firstName"]').click();
    await page.locator('input[name="firstName"]').fill(firstName);
    await page.locator('input[name="lastName"]').click();
    await page.locator('input[name="lastName"]').fill(lastName);
    await page.locator('input[name="firstNameKana"]').click();
    await page.locator('input[name="firstNameKana"]').fill(firstNameKana);
    await page.locator('input[name="lastNameKana"]').click();
    await page.locator('input[name="lastNameKana"]').fill(lastNameKana);

    // Click theo giới tính
    if (gender === "男性") {
      await page
        .locator("div")
        .filter({ hasText: /^男性$/ })
        .getByRole("radio")
        .check(); // Nam
    } else if (gender === "女性") {
      await page
        .locator("div")
        .filter({ hasText: /^女性$/ })
        .getByRole("radio")
        .check(); // Nữ
    }

    await page.locator('input[name="address"]').click();
    await page.locator('input[name="address"]').fill(address);
  }
  let locatorForServiceType = "";
  if (serviceType === "看護") {
    await page.getByRole("checkbox").first().check();
    if (insuranceType === "介護保険") {
      await page
        .locator('input[name="servicePlans.nursing.0.insurance"]')
        .first()
        .check();
    } else if (insuranceType === "医療保険") {
      await page
        .locator('input[name="servicePlans.nursing.0.insurance"]')
        .nth(1)
        .check();
    } else if (insuranceType === "自費") {
      await page
        .locator('input[name="servicePlans.nursing.0.insurance"]')
        .nth(2)
        .check();
    }
  } else if (serviceType === "リハビリ") {
    await page.getByRole("checkbox").nth(1).check();
    if (insuranceType === "介護保険") {
      await page
        .locator('input[name="servicePlans.rihabili.0.insurance"]')
        .first()
        .check();
    } else if (insuranceType === "医療保険") {
      await page
        .locator('input[name="servicePlans.rihabili.0.insurance"]')
        .nth(1)
        .check();
    } else if (insuranceType === "自費") {
      await page
        .locator('input[name="servicePlans.rihabili.0.insurance"]')
        .nth(2)
        .check();
    }
  }

  await page
    .locator("div")
    .filter({ hasText: /^未定$/ })
    .nth(1)
    .click();

  const items = await page.getByRole("listitem").allTextContents();
  console.log("Tất cả listitem:", items);
  await page
    .getByRole("listitem")
    .filter({ hasText: servicePlanFrequency })
    .click();

  await page.locator(".\\!text-\\[12px\\].w-full.\\!outline-1").click();
  await page.getByText(servicePlanDate, { exact: true }).click();
  await page.getByRole("textbox", { name: "サービスコード" }).click();
  await page.getByRole("listitem").filter({ hasText: serviceCode }).click();
  await page
    .locator("div")
    .filter({ hasText: /^未定$/ })
    .first()
    .click();
  await page.locator('[data-time-hour-item="' + servicePlanHour + '"]').click();
  await page
    .locator('[data-time-minute-item="' + servicePlanMinute + '"]')
    .click();
  await page.getByRole("button", { name: "設定" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^未定$/ })
    .click();
  await page
    .getByRole("list")
    .getByText(servicePlanDuration, { exact: true })
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^担当スタッフ$/ })
    .nth(1)
    .click();
  await page.getByRole("listitem").filter({ hasText: staffName }).click();
  await page.getByRole("button", { name: "登録する" }).click();

  //kiểm tra lần 1(tháng hiện tại), click vào ô search r chọn người dùng
  // Kiểm tra lần 1 (tháng hiện tại)
  console.log("\n🔍 KIỂM TRA LẦN 1 (THÁNG HIỆN TẠI):");
  await verifyTableDataForPatient(page, testPatient);

  //kiểm tra lần 2(tháng hiện tại+1), , click next month
  await page
    .locator("#layout-header-filter")
    .getByRole("button")
    .nth(1)
    .click();

  // Kiểm tra lần 1 (tháng hiện tại)
  console.log("\n🔍 KIỂM TRA LẦN 2 (THÁNG HIỆN TẠI):");
  await verifyTableDataForPatient(page, testPatient);

  //kiểm tra lần 3(tháng hiện tại+2), click next month
  await page
    .locator("#layout-header-filter")
    .getByRole("button")
    .nth(1)
    .click();
  // Kiểm tra lần 1 (tháng hiện tại)
  console.log("\n🔍 KIỂM TRA LẦN 3 (THÁNG HIỆN TẠI):");
  await verifyTableDataForPatient(page, testPatient);
});
