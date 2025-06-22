import { Page, Locator } from "@playwright/test";

export interface ScheduleInfo {
  customerName: string;
  staffName: string;
  time: string;
  duration: string;
  serviceCode?: string;
}

/**
 * Tìm schedule element dựa trên thông tin khách hàng
 */
export async function findScheduleByCustomer(
  page: Page,
  customerName: string
): Promise<Locator | null> {
  const customerLocator = page.locator(`text=${customerName}`);
  const count = await customerLocator.count();

  if (count > 0) {
    return customerLocator.first();
  }
  return null;
}

/**
 * Tìm schedule element dựa trên tên nhân viên
 */
export async function findScheduleByStaff(
  page: Page,
  staffName: string
): Promise<Locator | null> {
  const staffLocator = page.locator(`text=${staffName}`);
  const count = await staffLocator.count();

  if (count > 0) {
    return staffLocator.first();
  }
  return null;
}

/**
 * Tìm schedule element dựa trên thời gian
 */
export async function findScheduleByTime(
  page: Page,
  time: string
): Promise<Locator | null> {
  const timeLocator = page.locator(`text=${time}`);
  const count = await timeLocator.count();

  if (count > 0) {
    return timeLocator.first();
  }
  return null;
}

/**
 * Tìm schedule element dựa trên duration
 */
export async function findScheduleByDuration(
  page: Page,
  duration: string
): Promise<Locator | null> {
  const durationLocator = page.locator(`text=${duration}`);
  const count = await durationLocator.count();

  if (count > 0) {
    return durationLocator.first();
  }
  return null;
}

/**
 * Tìm schedule element chứa đầy đủ thông tin
 */
export async function findScheduleByMultipleCriteria(
  page: Page,
  scheduleInfo: ScheduleInfo
): Promise<Locator | null> {
  const { customerName, staffName, time, duration } = scheduleInfo;

  // Tìm div chứa cả tên khách hàng và thời gian
  const scheduleLocator = page.locator("div", {
    hasText: customerName,
    has: page.locator(`text=${time}`),
  });

  const count = await scheduleLocator.count();
  if (count > 0) {
    return scheduleLocator.first();
  }

  // Fallback: tìm div chứa tên khách hàng và tên nhân viên
  const fallbackLocator = page.locator("div", {
    hasText: customerName,
    has: page.locator(`text=${staffName}`),
  });

  const fallbackCount = await fallbackLocator.count();
  if (fallbackCount > 0) {
    return fallbackLocator.first();
  }

  return null;
}

/**
 * Tìm schedule element trong container cụ thể
 */
export async function findScheduleInContainer(
  page: Page,
  scheduleInfo: ScheduleInfo,
  containerSelector: string
): Promise<Locator | null> {
  const container = page.locator(containerSelector);
  const containerCount = await container.count();

  if (containerCount === 0) {
    return null;
  }

  const scheduleInContainer = container.locator("div", {
    hasText: scheduleInfo.customerName,
  });

  const count = await scheduleInContainer.count();
  if (count > 0) {
    return scheduleInContainer.first();
  }

  return null;
}

/**
 * Tìm schedule element dựa trên data attributes
 */
export async function findScheduleByDataAttributes(
  page: Page,
  scheduleInfo: ScheduleInfo
): Promise<Locator | null> {
  const dataAttributes = [
    "[data-schedule]",
    "[data-appointment]",
    "[data-time]",
    "[data-staff]",
    "[data-customer]",
    "[data-service]",
  ];

  for (const attr of dataAttributes) {
    const attrLocator = page.locator(attr);
    const count = await attrLocator.count();

    if (count > 0) {
      // Kiểm tra xem có element nào chứa thông tin schedule không
      for (let i = 0; i < count; i++) {
        const text = await attrLocator.nth(i).textContent();
        if (text && text.includes(scheduleInfo.customerName)) {
          return attrLocator.nth(i);
        }
      }
    }
  }

  return null;
}

/**
 * Tìm schedule element dựa trên class names
 */
export async function findScheduleByClassNames(
  page: Page,
  scheduleInfo: ScheduleInfo
): Promise<Locator | null> {
  const scheduleClasses = [
    ".schedule",
    ".appointment",
    ".booking",
    ".time-slot",
    ".calendar-event",
    ".schedule-item",
    ".appointment-item",
  ];

  for (const className of scheduleClasses) {
    const classLocator = page.locator(className);
    const count = await classLocator.count();

    if (count > 0) {
      // Kiểm tra xem có element nào chứa thông tin schedule không
      for (let i = 0; i < count; i++) {
        const text = await classLocator.nth(i).textContent();
        if (text && text.includes(scheduleInfo.customerName)) {
          return classLocator.nth(i);
        }
      }
    }
  }

  return null;
}

/**
 * Tìm schedule element dựa trên position (absolute/relative)
 */
export async function findScheduleByPosition(
  page: Page,
  scheduleInfo: ScheduleInfo
): Promise<Locator | null> {
  const positionedDivs = page.locator(
    'div[style*="position: absolute"], div[style*="position: relative"]'
  );
  const count = await positionedDivs.count();

  for (let i = 0; i < count; i++) {
    const div = positionedDivs.nth(i);
    const text = await div.textContent();

    if (
      text &&
      (text.includes(scheduleInfo.customerName) ||
        text.includes(scheduleInfo.staffName) ||
        text.includes(scheduleInfo.time) ||
        text.includes(scheduleInfo.duration))
    ) {
      return div;
    }
  }

  return null;
}

/**
 * Tìm schedule element với tất cả các phương pháp
 */
export async function findScheduleElement(
  page: Page,
  scheduleInfo: ScheduleInfo
): Promise<{ locator: Locator | null; method: string }> {
  // Thử các phương pháp theo thứ tự ưu tiên

  // 1. Tìm theo multiple criteria (tên khách hàng + thời gian)
  const multiCriteriaLocator = await findScheduleByMultipleCriteria(
    page,
    scheduleInfo
  );
  if (multiCriteriaLocator) {
    return { locator: multiCriteriaLocator, method: "multiple_criteria" };
  }

  // 2. Tìm theo tên khách hàng
  const customerLocator = await findScheduleByCustomer(
    page,
    scheduleInfo.customerName
  );
  if (customerLocator) {
    return { locator: customerLocator, method: "customer_name" };
  }

  // 3. Tìm theo tên nhân viên
  const staffLocator = await findScheduleByStaff(page, scheduleInfo.staffName);
  if (staffLocator) {
    return { locator: staffLocator, method: "staff_name" };
  }

  // 4. Tìm theo thời gian
  const timeLocator = await findScheduleByTime(page, scheduleInfo.time);
  if (timeLocator) {
    return { locator: timeLocator, method: "time" };
  }

  // 5. Tìm theo data attributes
  const dataAttrLocator = await findScheduleByDataAttributes(
    page,
    scheduleInfo
  );
  if (dataAttrLocator) {
    return { locator: dataAttrLocator, method: "data_attributes" };
  }

  // 6. Tìm theo class names
  const classLocator = await findScheduleByClassNames(page, scheduleInfo);
  if (classLocator) {
    return { locator: classLocator, method: "class_names" };
  }

  // 7. Tìm theo position
  const positionLocator = await findScheduleByPosition(page, scheduleInfo);
  if (positionLocator) {
    return { locator: positionLocator, method: "position" };
  }

  return { locator: null, method: "not_found" };
}

/**
 * Verify schedule element có đầy đủ thông tin
 */
export async function verifyScheduleElement(
  page: Page,
  scheduleInfo: ScheduleInfo
): Promise<{ success: boolean; details: any }> {
  const { locator, method } = await findScheduleElement(page, scheduleInfo);

  if (!locator) {
    return {
      success: false,
      details: { method, error: "Schedule element not found" },
    };
  }

  try {
    await locator.waitFor({ state: "visible", timeout: 5000 });

    const text = await locator.textContent();
    const className = await locator.getAttribute("class");
    const style = await locator.getAttribute("style");

    const details = {
      method,
      text: text?.trim(),
      className,
      style,
      found: true,
    };

    // Kiểm tra xem element có chứa đầy đủ thông tin không
    const hasCustomerName = text?.includes(scheduleInfo.customerName);
    const hasStaffName = text?.includes(scheduleInfo.staffName);
    const hasTime = text?.includes(scheduleInfo.time);
    const hasDuration = text?.includes(scheduleInfo.duration);

    const success = Boolean(
      hasCustomerName && hasStaffName && hasTime && hasDuration
    );

    return {
      success,
      details: {
        ...details,
        hasCustomerName,
        hasStaffName,
        hasTime,
        hasDuration,
      },
    };
  } catch (error) {
    return {
      success: false,
      details: { method, error: error.message },
    };
  }
}

/**
 * Tìm schedule element đơn giản với thông tin cơ bản, trả về lastest element trong cùng 1 khung giờ khám (lịch trình dđược thêm cuối cùng)
 */
export async function findSimpleScheduleElement(
  page: Page,
  hour: string,
  minute: string,
  staffName: string,
  duration?: string
): Promise<Locator | null> {
  const time = `${hour}:${minute}`;

  // Tính toán top position: (giờ bắt đầu * 60 + phút) * 87 / 60
  const startHour = parseInt(hour) - 7;
  const startMinute = parseInt(minute);
  const totalMinutes = startHour * 60 + startMinute;
  const topPx = (totalMinutes * 87) / 60;

  // Tính toán height nếu có duration
  let heightPx = 0;
  if (duration) {
    const durationMatch = duration.match(/(\d+)/);
    const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 0;
    heightPx = (durationMinutes * 87) / 60;
  }

  console.log(`🔍 Tìm element với:`);
  console.log(`   Top: ${topPx}px`);
  console.log(`   Height: ${heightPx}px`);
  console.log(`   Staff: ${staffName}`);

  // Bước 1: Tìm cột của staff
  const staffColumn = page.locator("div", { hasText: staffName });
  const staffColumnCount = await staffColumn.count();
  console.log(
    `Tìm thấy ${staffColumnCount} element chứa staff name "${staffName}"`
  );

  if (staffColumnCount === 0) {
    console.log("❌ Không tìm thấy cột staff");
    return null;
  }

  // Bước 2: Tìm element event trong cột staff với top position
  for (let i = 0; i < staffColumnCount; i++) {
    const column = staffColumn.nth(i);

    // Tìm element con có style top trong cột này
    const eventInColumn = column.locator(
      `div[style*="top: ${topPx}px"][style*="height: ${heightPx}px"]`
    );
    const eventCount = await eventInColumn.count();

    if (eventCount > 0) {
      console.log(
        `✅ Tìm thấy ${eventCount} event trong cột staff ${
          i + 1
        } với top=${topPx}px va height=${heightPx}px`
      );
      return eventInColumn.last();
    }

    // Fallback: tìm với top gần đúng
    const flexibleEventInColumn = column.locator(
      `div[style*="top: ${Math.floor(topPx)}"]`
    );
    const flexibleEventCount = await flexibleEventInColumn.count();

    if (flexibleEventCount > 0) {
      console.log(
        `✅ Tìm thấy ${flexibleEventCount} event trong cột staff ${
          i + 1
        } với top gần ${topPx}px`
      );
      return flexibleEventInColumn.last();
    }
  }

  // Fallback: tìm tất cả div có top position và chứa staff name
  const allEventsWithStaff = page.locator(`div[style*="top: ${topPx}px"]`, {
    hasText: staffName,
  });

  const allEventsCount = await allEventsWithStaff.count();
  if (allEventsCount > 0) {
    console.log(
      `✅ Tìm thấy ${allEventsCount} event với top=${topPx}px và chứa staff name`
    );
    return allEventsWithStaff.last();
  }

  console.log("❌ Không tìm thấy event nào trong cột staff");
  return null;
}

//trả về tất cả element tìm được với cùng 1 khung giờ khám
export async function findAllSimpleScheduleElement(
  page: Page,
  hour: string,
  minute: string,
  staffName: string,
  duration?: string
): Promise<Locator | null> {
  const time = `${hour}:${minute}`;

  // Tính toán top position: (giờ bắt đầu * 60 + phút) * 87 / 60
  const startHour = parseInt(hour) - 7;
  const startMinute = parseInt(minute);
  const totalMinutes = startHour * 60 + startMinute;
  const topPx = (totalMinutes * 87) / 60;

  // Tính toán height nếu có duration
  let heightPx = 0;
  if (duration) {
    const durationMatch = duration.match(/(\d+)/);
    const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 0;
    heightPx = (durationMinutes * 87) / 60;
  }

  console.log(`🔍 Tìm element với:`);
  console.log(`   Top: ${topPx}px`);
  console.log(`   Height: ${heightPx}px`);
  console.log(`   Staff: ${staffName}`);

  // Bước 1: Tìm cột của staff
  const staffColumn = page.locator("div", { hasText: staffName });
  const staffColumnCount = await staffColumn.count();
  console.log(
    `Tìm thấy ${staffColumnCount} element chứa staff name "${staffName}"`
  );

  if (staffColumnCount === 0) {
    console.log("❌ Không tìm thấy cột staff");
    return null;
  }

  // Bước 2: Tìm element event trong cột staff với top position
  for (let i = 0; i < staffColumnCount; i++) {
    const column = staffColumn.nth(i);

    // Tìm element con có style top trong cột này
    const eventInColumn = column.locator(
      `div[style*="top: ${topPx}px"][style*="height: ${heightPx}px"]`
    );
    const eventCount = await eventInColumn.count();

    if (eventCount > 0) {
      console.log(
        `✅ Tìm thấy ${eventCount} event trong cột staff ${
          i + 1
        } với top=${topPx}px va height=${heightPx}px`
      );
      return eventInColumn;
    }

    // Fallback: tìm với top gần đúng
    const flexibleEventInColumn = column.locator(
      `div[style*="top: ${Math.floor(topPx)}"]`
    );
    const flexibleEventCount = await flexibleEventInColumn.count();

    if (flexibleEventCount > 0) {
      console.log(
        `✅ Tìm thấy ${flexibleEventCount} event trong cột staff ${
          i + 1
        } với top gần ${topPx}px`
      );
      return flexibleEventInColumn;
    }
  }

  // Fallback: tìm tất cả div có top position và chứa staff name
  const allEventsWithStaff = page.locator(`div[style*="top: ${topPx}px"]`, {
    hasText: staffName,
  });

  const allEventsCount = await allEventsWithStaff.count();
  if (allEventsCount > 0) {
    console.log(
      `✅ Tìm thấy ${allEventsCount} event với top=${topPx}px và chứa staff name`
    );
    return allEventsWithStaff;
  }

  console.log("❌ Không tìm thấy event nào trong cột staff");
  return null;
}
