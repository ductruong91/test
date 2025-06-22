import { test } from "@playwright/test";
import { calculateAppointmentDates } from "./helpers/frequencyHelper";
import { testPatient } from "./helpers/testData";

test(" check cac ngày se được check với ngày bắt đầu và chu kì with current test data", async () => {
  console.log("🚀 Starting frequency logic test...");

  const {
    servicePlanFrequency,
    servicePlanYear,
    servicePlanMonth,
    servicePlanDate,
  } = testPatient;

  // Test với dữ liệu hiện tại
  const dates = calculateAppointmentDates(
    servicePlanFrequency,
    servicePlanYear,
    servicePlanMonth,
    Number(servicePlanDate),
    3 // 3 months
  );

  dates.forEach((date, index) => {
    // Show all dates
    const weekDaysJP = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = weekDaysJP[date.getDay()];
    const weekPosition = Math.ceil(date.getDate() / 7);
    console.log(
      `   ${
        index + 1
      }. ${date.toLocaleDateString()} (${dayOfWeek}) - Week ${weekPosition}`
    );
  });

  console.log("\n📊 Test Result Summary:");
  console.log(`   Frequency String: "${servicePlanFrequency}"`);
  console.log(`   Total Dates Generated: ${dates.length}`);
  console.log(
    `   Start Date: ${servicePlanYear}/${servicePlanMonth}/${servicePlanDate}`
  );
  console.log(`   Duration: 3 months`);
});

test("Test all frequency types", async () => {
  console.log("🚀 Starting all frequency types test...");

  const { servicePlanYear, servicePlanMonth, servicePlanDate } = testPatient;

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

  testFrequencies.forEach((freq) => {
    console.log(`\n🔍 Testing: "${freq}"`);
    console.log("-".repeat(40));

    const dates = calculateAppointmentDates(
      freq,
      servicePlanYear,
      servicePlanMonth,
      Number(servicePlanDate),
      3 // 3 months
    );

    console.log(`   Generated ${dates.length} dates:`);
    dates.forEach((date, index) => {
      // Show all dates
      const weekDaysJP = ["日", "月", "火", "水", "木", "金", "土"];
      const dayOfWeek = weekDaysJP[date.getDay()];
      const weekPosition = Math.ceil(date.getDate() / 7);
      console.log(
        `   ${
          index + 1
        }. ${date.toLocaleDateString()} (${dayOfWeek}) - Week ${weekPosition}`
      );
    });
  });

  console.log("\n✅ All frequency tests completed!");
});
