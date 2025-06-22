import { testPatient } from "./testData";

/**
 * Hàm tổng hợp để tính toán ngày dựa trên chu kì khám
 */
function calculateAppointmentDates(
  frequencyStr: string,
  startYear: number,
  startMonth: number,
  startDate: number,
  months: number
): Date[] {
  const dates: Date[] = [];
  const startDateObj = new Date(startYear, startMonth - 1, startDate);

  // Tính ngày kết thúc: cùng ngày nhưng tháng cộng thêm 3
  const endYear = startYear + Math.floor((startMonth - 1 + months) / 12);
  const endMonth = ((startMonth - 1 + months) % 12) + 1;
  const endDate = new Date(endYear, endMonth - 1, startDate);

  let dateCount = 0;
  const maxDates = 100; // Added for safety

  console.log(`🔍 Processing frequency: "${frequencyStr}"`);
  console.log(`📅 Start date: ${startDateObj.toLocaleDateString()}`);
  console.log(`📅 End date: ${endDate.toLocaleDateString()}`);
  console.log(`📅 Duration: ${months} months`);

  // Chuẩn hóa chuỗi tần suất
  const normalized = frequencyStr.replace(/[０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xff10 + 0x30)
  );

  // Xử lý các trường hợp đặc biệt
  if (normalized.includes("毎月（選択日で繰り返す）")) {
    console.log(`   → Monthly (same day of month)`);
    let currentDate = new Date(startDateObj);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      // Tăng tháng, giữ nguyên ngày
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  } else if (normalized.includes("毎月（周期で繰り返す）")) {
    console.log(`   → Monthly (same week position)`);
    // Tìm ngày trong tuần và vị trí tuần trong tháng
    const dayOfWeek = startDateObj.getDay();
    const weekPosition = Math.ceil(startDate / 7);

    let currentDate = new Date(startDateObj);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));

      // Tăng tháng
      currentDate.setMonth(currentDate.getMonth() + 1);
      // Đặt về ngày 1 của tháng mới
      currentDate.setDate(1);

      // Tìm ngày trong tuần thứ weekPosition
      let foundDate = false;
      let weekCount = 0;
      let tempDate = new Date(currentDate);

      while (tempDate.getMonth() === currentDate.getMonth()) {
        if (tempDate.getDay() === dayOfWeek) {
          weekCount++;
          if (weekCount === weekPosition) {
            currentDate.setDate(tempDate.getDate());
            foundDate = true;
            break;
          }
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }

      // Nếu không tìm thấy, sử dụng ngày cuối cùng của tháng
      if (!foundDate) {
        currentDate.setDate(0); // Ngày cuối của tháng trước
      }
    }
  } else if (normalized.includes("隔週（周期で繰り返す）")) {
    console.log(`   → Bi-weekly (same week position)`);
    const dayOfWeek = startDateObj.getDay();
    const weekPosition = Math.ceil(startDate / 7);
    const isOddWeek = weekPosition % 2 === 1; // Kiểm tra tuần lẻ hay chẵn

    console.log(
      `   → Looking for ${
        dayOfWeek === 0
          ? "Sunday"
          : dayOfWeek === 1
          ? "Monday"
          : dayOfWeek === 2
          ? "Tuesday"
          : dayOfWeek === 3
          ? "Wednesday"
          : dayOfWeek === 4
          ? "Thursday"
          : dayOfWeek === 5
          ? "Friday"
          : "Saturday"
      } in ${isOddWeek ? "odd" : "even"} weeks`
    );

    // Tìm tất cả các ngày từ start date đến end date
    let tempDate = new Date(startDateObj);

    while (tempDate <= endDate && dateCount < maxDates) {
      // Kiểm tra xem ngày hiện tại có phải là ngày cần tìm không
      if (tempDate.getDay() === dayOfWeek) {
        const currentWeekPosition = Math.ceil(tempDate.getDate() / 7);
        const currentWeekIsOdd = currentWeekPosition % 2 === 1;

        // Chỉ lấy ngày có cùng tính chất lẻ/chẵn
        if (currentWeekIsOdd === isOddWeek) {
          dates.push(new Date(tempDate));
          dateCount++;
        }
      }

      // Tăng 1 ngày
      tempDate.setDate(tempDate.getDate() + 1);
    }
  } else if (normalized.includes("毎週")) {
    console.log(`   → Weekly (7 days)`);
    let currentDate = new Date(startDateObj);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }
  } else if (normalized.includes("毎日")) {
    console.log(`   → Daily (1 day)`);
    let currentDate = new Date(startDateObj);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (normalized.includes("隔週")) {
    console.log(`   → Bi-weekly (14 days)`);
    let currentDate = new Date(startDateObj);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 14);
    }
  } else {
    // Tìm số trong chuỗi (ví dụ: ２日おき, ３日おき)
    const match = normalized.match(/([0-9]+)/);
    if (match) {
      const days = parseInt(match[1], 10);
      console.log(`   → Every ${days} days`);

      let currentDate = new Date(startDateObj);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + days);
      }
    } else {
      console.log(`   → Default: Daily (1 day)`);
      let currentDate = new Date(startDateObj);

      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }

  return dates;
}

/**
 * Test function để kiểm tra logic
 */
export function testFrequencyLogic() {
  console.log("🧪 Testing Frequency Logic");
  console.log("=".repeat(50));

  const {
    servicePlanFrequency,
    servicePlanYear,
    servicePlanMonth,
    servicePlanDate,
  } = testPatient;

  console.log(`📋 Test Data:`);
  console.log(`   Frequency: "${servicePlanFrequency}"`);
  console.log(
    `   Start Date: ${servicePlanYear}/${servicePlanMonth}/${servicePlanDate}`
  );
  console.log("");

  // Test calculateAppointmentDates
  console.log("📅 Testing calculateAppointmentDates:");
  const dates = calculateAppointmentDates(
    servicePlanFrequency,
    servicePlanYear,
    servicePlanMonth,
    Number(servicePlanDate),
    3 // 3 months
  );

  console.log(`   Generated ${dates.length} dates:`);
  dates.forEach((date, index) => {
    const weekDaysJP = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = weekDaysJP[date.getDay()];
    const weekPosition = Math.ceil(date.getDate() / 7);
    console.log(
      `   ${
        index + 1
      }. ${date.toLocaleDateString()} (${dayOfWeek}) - Week ${weekPosition}`
    );
  });

  console.log("");
  console.log("✅ Frequency logic test completed!");

  return {
    dates,
    frequencyString: servicePlanFrequency,
  };
}

/**
 * Test với các tần suất khác nhau
 */
export function testAllFrequencies() {
  console.log("🧪 Testing All Frequency Types");
  console.log("=".repeat(50));

  const testFrequencies = [
    "毎週",
    "２日おき",
    "３日おき",
    "毎日",
    "隔週（１４日ごとで繰り返す）",
    "隔週（周期で繰り返す）",
    "毎月（選択日で繰り返す）",
    "毎月（周期で繰り返す）",
  ];

  const { servicePlanYear, servicePlanMonth, servicePlanDate } = testPatient;

  testFrequencies.forEach((freq) => {
    console.log(`\n🔍 Testing: "${freq}"`);
    console.log("-".repeat(30));

    const dates = calculateAppointmentDates(
      freq,
      servicePlanYear,
      servicePlanMonth,
      Number(servicePlanDate),
      3 // 3 months for testing
    );

    console.log(`   Generated ${dates.length} dates:`);
    dates.slice(0, 5).forEach((date, index) => {
      // Show first 5 dates
      const weekDaysJP = ["日", "月", "火", "水", "木", "金", "土"];
      const dayOfWeek = weekDaysJP[date.getDay()];
      const weekPosition = Math.ceil(date.getDate() / 7);
      console.log(
        `   ${
          index + 1
        }. ${date.toLocaleDateString()} (${dayOfWeek}) - Week ${weekPosition}`
      );
    });

    if (dates.length > 5) {
      console.log(`   ... and ${dates.length - 5} more dates`);
    }
  });

  console.log("\n✅ All frequency tests completed!");
}

// Export function for use in other files
export { calculateAppointmentDates };
