//data cho tìm kiếm lịch đơn giản
export const simpleScheduleTestPatient = {
  username: "ctybcd_1",
  password: "Abcd@123",
  firstName: "cus11-t",
  lastName: "cus11-t",
  firstNameKana: "customer1",
  lastNameKana: "customer1",
  address: "hanoi-caugiay",

  serviceCode: "3",
  servicePlanFrequency: "隔週（周期で繰り返す）",
  // 毎週, ２日おき, ３日おき, 隔週（１４日ごとで繰り返す）, 隔週（周期で繰り返す）,毎月（選択日で繰り返す）, 毎月（周期で繰り返す）, 毎日
  servicePlanYear: 2025,
  servicePlanMonth: 6,
  servicePlanDate: "25",
  servicePlanHour: "09",
  servicePlanMinute: "00",
  servicePlanDuration: "30分",
  registrationType: "既存", // Có thể là "新規" hoặc "既存"
  gender: "女性", //女性, 男性
  serviceType: "リハビリ", // hoặc リハビリ, 看護
  staffName: "staff 3", //tuyf vaof servicetype, nếu là rihabiri thì staff 123, còn nếu là 看護 thì 45678
  insuranceType: "自費", //Loại bảo hiểm có thể là 介護保険, 医療保険, 自費
};

// Dữ liệu test cho các trường hợp khác nhau
export const testCases = {
  // Trường hợp 1: Khách hàng mới, khám buổi sáng
  newPatientMorning: {
    ...simpleScheduleTestPatient,
    firstName: "cus-new-1",
    lastName: "cus-new-1",
    registrationType: "新規",
    servicePlanHour: "09",
    servicePlanMinute: "30",
    servicePlanDuration: "45分",
  },

  // Trường hợp 2: Khách hàng cũ, khám buổi chiều
  existingPatientAfternoon: {
    ...simpleScheduleTestPatient,
    firstName: "cus-exist-1",
    lastName: "cus-exist-1",
    registrationType: "既存",
    servicePlanHour: "14",
    servicePlanMinute: "00",
    servicePlanDuration: "60分",
  },

  // Trường hợp 3: Khám vào cuối tháng
  endOfMonthPatient: {
    ...simpleScheduleTestPatient,
    firstName: "cus-end-1",
    lastName: "cus-end-1",
    servicePlanMonth: 6,
    servicePlanDate: "30",
    servicePlanHour: "16",
    servicePlanMinute: "30",
    servicePlanDuration: "30分",
  },

  // Trường hợp 4: Khám với nhân viên khác
  differentStaffPatient: {
    ...simpleScheduleTestPatient,
    firstName: "cus-staff-1",
    lastName: "cus-staff-1",
    staffName: "staff 9",
    servicePlanHour: "10",
    servicePlanMinute: "15",
    servicePlanDuration: "90分",
  },
};

// Hàm helper để lấy test case theo tên
export function getTestCase(caseName: keyof typeof testCases) {
  return testCases[caseName];
}

// Hàm helper để tạo dữ liệu test tùy chỉnh
export function createCustomTestData(
  overrides: Partial<typeof simpleScheduleTestPatient>
) {
  return {
    ...simpleScheduleTestPatient,
    ...overrides,
  };
}
