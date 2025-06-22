import { Page } from "@playwright/test";
import { captureRejectionSymbol } from "events";

// Hàm helper để verify table data - có thể sử dụng từ file khác
export async function verifyTableDataForPatient(page: Page, patientData: any) {
  // Lấy thông tin từ patientData
  const firstName = patientData.firstName;
  const lastName = patientData.lastName;
  const firstNameKana = patientData.firstNameKana;
  const lastNameKana = patientData.lastNameKana;
  const address = patientData.address;
  const staffName = patientData.staffName;
  const serviceCode = patientData.serviceCode;
  const servicePlanFrequency = patientData.servicePlanFrequency;
  const servicePlanYear = patientData.servicePlanYear;
  const servicePlanMonth = patientData.servicePlanMonth;
  const servicePlanDate = patientData.servicePlanDate;
  const servicePlanHour = patientData.servicePlanHour;
  const servicePlanMinute = patientData.servicePlanMinute;
  const servicePlanDuration = patientData.servicePlanDuration;
  const gender = patientData.gender;
  const serviceType = patientData.serviceType;
  const insuranceType = patientData.insuranceType;

  // Tính toán ngày thứ trong tuần
  const weekDaysJP = ["日", "月", "火", "水", "木", "金", "土"];
  const planDateObj = new Date(
    servicePlanYear,
    servicePlanMonth - 1,
    Number(servicePlanDate)
  );
  const dayOfWeek = weekDaysJP[planDateObj.getDay()];
  const startTime = `${servicePlanHour}:${servicePlanMinute}`;

  // Tìm và chọn bệnh nhân trong bảng
  // await page
  //   .locator("#layout-header-filter")
  //   .getByRole("button")
  //   .nth(1)
  //   .click();
  await page
    .locator(
      ".flex.items-center.gap-\\[8px\\].max-sm\\:gap-\\[4px\\] > div:nth-child(3) > .rounded"
    )
    .click();

  await page
    .locator("div")
    .filter({ hasText: new RegExp(`^${firstName} ${lastName}$`) })
    .nth(1)
    .click();

  // Lấy thông tin dòng chứa tên bệnh nhân theo đúng data
  const patientRow = page.locator("tr", {
    hasText: `${firstName} ${lastName}`,
  });

  // Lấy số cột của patientRow
  const allCells = patientRow.locator(".px-\\[7px\\].py-\\[8px\\]");
  const cellCount = await allCells.count();
  // console.log("📊 Số cột trong patientRow:", cellCount);
  let currentRow = patientRow;

  do {
    const nextRow = currentRow.locator("xpath=following-sibling::tr[1]");

    const allCellsNextRow = nextRow.locator(".px-\\[7px\\].py-\\[8px\\]");
    const cellCountNextRow = await allCellsNextRow.count();
    if (cellCountNextRow === 0 || cellCountNextRow === cellCount) {
      break;
    } else currentRow = nextRow;
  } while (true);

  // Lưu thông tin từng cột của dòng thông tin đầu tiên này vào biến va in ra
  const firstRowData: string[] = []; //dòng đầu tiên trong bảng show ra khi lọc
  const currentRowData: string[] = []; //dòng cuối cùng trong bảng show ra khi lọc (khong bao gồm 5 cột đầu do bị rowspan)
  // In thông tin từng cột của firstRowData

  for (let col = 0; col < 13; col++) {
    const cell = patientRow.locator(".px-\\[7px\\].py-\\[8px\\]").nth(col);
    const text = await cell.textContent();
    const cellText = text?.trim() || "";
    firstRowData.push(cellText);
    // console.log(`  Cột ${col + 1}: "${cellText}"`);
  }
  // console.log(firstRowData);

  // In thông tin từng cột của nextRowData
  // console.log(`nextRowData`);
  for (let col = 0; col < 13; col++) {
    const cell = currentRow.locator(".px-\\[7px\\].py-\\[8px\\]").nth(col);
    const text = await cell.textContent();
    const cellText = text?.trim() || "";
    currentRowData.push(cellText);
    // console.log(`  Cột ${col + 1}: "${cellText}"`);
  }
  let data: string[] = [];
  console.log(`firstRowData`, firstRowData);
  console.log("currentRowData", currentRowData);
  if (JSON.stringify(firstRowData) === JSON.stringify(currentRowData)) {
    firstRowData.splice(4, 1);
    data = firstRowData;
  } else {
    data = [...firstRowData.slice(0, 4), ...currentRowData.slice(0, 8)];
  }
  // const data = [...firstRowData.slice(0, 4), ...currentRowData.slice(0, 8)];
  console.log("data lay duoc tren man hinh hien thi:", data);

  // Kiểm tra so sánh data đầu vào vs data đầu ra
  console.log("\n🔍 SO SÁNH DATA ĐẦU VÀO VS DATA ĐẦU RA:");

  // Tạo mảng expected data từ test data
  const expectedData = [
    `${firstName} ${lastName}`, // Cột 1: Tên bệnh nhân
    `${firstNameKana} ${lastNameKana}`, // Cột 2: Tên Kana
    gender, // Cột 3: Giới tính
    address, // Cột 4: Địa chỉ
    serviceType, // Cột 5: Loại dịch vụ
    serviceCode, // Cột 6: Mã dịch vụ
    insuranceType, // Cột 7: Loại bảo hiểm
    servicePlanFrequency, // Cột 8: Tần suất
    dayOfWeek, // Cột 9: Thứ
    startTime, // Cột 10: Thời gian bắt đầu
    servicePlanDuration, // Cột 11: Khoảng thời gian
    staffName, // Cột 12: Nhân viên
    "", // Cột 13: (có thể trống)
  ];

  console.log("📋 Expected Data:", expectedData);
  console.log("📋 Actual Data:", data);

  // So sánh từng cột
  const columnNames = [
    "Tên bệnh nhân",
    "Tên Kana",
    "Giới tính",
    "Địa chỉ",
    "Loại dịch vụ",
    "Mã dịch vụ",
    "Loại bảo hiểm",
    "Tần suất",
    "Thứ",
    "Thời gian bắt đầu",
    "Khoảng thời gian",
    "Nhân viên",
    "Cột 13",
  ];

  let matchCount = 0;
  const minLength = Math.min(expectedData.length, data.length);

  for (let i = 0; i < minLength; i++) {
    const expected = expectedData[i];
    const actual = data[i];
    const isMatch = expected === actual;

    if (isMatch) {
      matchCount++;
      console.log(`✅ Cột ${i + 1} (${columnNames[i]}): "${expected}" ✓`);
    } else {
      console.log(
        `❌ Cột ${i + 1} (${
          columnNames[i]
        }): Expected "${expected}", Actual "${actual}" ✗`
      );
    }
  }

  console.log(`\n📊 Kết quả: ${matchCount}/${minLength} cột khớp`);

  if (matchCount === minLength) {
    console.log("🎉 Tất cả dữ liệu khớp hoàn toàn!");
  } else {
    console.log("⚠️ Có sự khác biệt trong dữ liệu!");
  }

  console.log("🎉 Hoàn thành kiểm tra tất cả thông tin trong dòng!");

  return { matchCount, minLength, data, expectedData };
}
