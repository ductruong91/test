# Schedule Locator Methods

Tài liệu này mô tả các phương pháp tìm schedule elements trong calendar mà không cần dựa vào `top` và `height` CSS properties.

## Tại sao không nên dùng top/height?

- **Không ổn định**: Giá trị pixel có thể thay đổi khi layout thay đổi
- **Khó maintain**: Cần tính toán chính xác pixel cho từng thời gian
- **Không semantic**: Không dựa trên ý nghĩa của dữ liệu
- **Break khi responsive**: Có thể không hoạt động trên màn hình khác nhau

## Các phương pháp thay thế

### 1. Tìm theo Text Content

```typescript
// Tìm theo tên khách hàng
const customerLocator = page.locator(`text=${customerName}`);

// Tìm theo tên nhân viên
const staffLocator = page.locator(`text=${staffName}`);

// Tìm theo thời gian
const timeLocator = page.locator(`text=${time}`);

// Tìm theo duration
const durationLocator = page.locator(`text=${duration}`);
```

### 2. Tìm theo Multiple Criteria

```typescript
// Tìm div chứa cả tên khách hàng và thời gian
const scheduleLocator = page.locator('div', {
  hasText: customerName,
  has: page.locator(`text=${time}`)
});

// Tìm div chứa tên khách hàng và nhân viên
const scheduleLocator2 = page.locator('div', {
  hasText: customerName,
  has: page.locator(`text=${staffName}`)
});
```

### 3. Tìm theo Data Attributes

```typescript
// Tìm theo data attributes nếu có
const dataAttributes = [
  '[data-schedule]',
  '[data-appointment]',
  '[data-time]',
  '[data-staff]',
  '[data-customer]',
  '[data-service]'
];

for (const attr of dataAttributes) {
  const attrLocator = page.locator(attr);
  // Kiểm tra xem có chứa thông tin schedule không
}
```

### 4. Tìm theo Class Names

```typescript
// Tìm theo class names có thể liên quan đến schedule
const scheduleClasses = [
  '.schedule',
  '.appointment',
  '.booking',
  '.time-slot',
  '.calendar-event',
  '.schedule-item',
  '.appointment-item'
];

for (const className of scheduleClasses) {
  const classLocator = page.locator(className);
  // Kiểm tra xem có chứa thông tin schedule không
}
```

### 5. Tìm theo Position (Absolute/Relative)

```typescript
// Tìm tất cả div có position absolute hoặc relative
const positionedDivs = page.locator('div[style*="position: absolute"], div[style*="position: relative"]');

// Lọc ra những div có chứa thông tin schedule
for (let i = 0; i < count; i++) {
  const div = positionedDivs.nth(i);
  const text = await div.textContent();
  
  if (text && (
    text.includes(customerName) || 
    text.includes(staffName) || 
    text.includes(time) ||
    text.includes(duration)
  )) {
    // Đây là schedule element
  }
}
```

### 6. Tìm trong Container cụ thể

```typescript
// Tìm container chính của calendar
const calendarContainers = [
  '[data-testid="calendar"]',
  '.calendar',
  '.schedule-calendar',
  '.calendar-container',
  '.schedule-grid'
];

for (const container of calendarContainers) {
  const containerLocator = page.locator(container);
  
  // Tìm schedule items trong container này
  const scheduleInContainer = containerLocator.locator('div', {
    hasText: customerName
  });
}
```

### 7. Tìm theo Role/Aria Attributes

```typescript
// Tìm theo role hoặc aria attributes
const roleLocators = [
  '[role="gridcell"]',
  '[role="button"]',
  '[aria-label*="schedule"]',
  '[aria-label*="appointment"]',
  '[aria-label*="booking"]'
];

for (const roleLocator of roleLocators) {
  const elements = page.locator(roleLocator);
  // Kiểm tra xem có element nào chứa thông tin schedule không
}
```

## Sử dụng Helper Functions

### Import Helper Functions

```typescript
import { 
  findScheduleElement, 
  verifyScheduleElement, 
  ScheduleInfo 
} from "./helpers/scheduleHelpers";
```

### Tạo Schedule Info

```typescript
const scheduleInfo: ScheduleInfo = {
  customerName: `${lastNameKana} ${firstNameKana}`,
  staffName: staffName,
  time: `${hour}:${minute}`,
  duration: duration
};
```

### Tìm Schedule Element

```typescript
// Tìm với tất cả các phương pháp
const { locator, method } = await findScheduleElement(page, scheduleInfo);

if (locator) {
  console.log(`Tìm thấy bằng phương pháp: ${method}`);
  await expect(locator).toBeVisible();
} else {
  console.log("Không tìm thấy schedule element");
}
```

### Verify Schedule Element

```typescript
// Verify thông tin chi tiết
const result = await verifyScheduleElement(page, scheduleInfo);

if (result.success) {
  console.log("Schedule element có đầy đủ thông tin!");
} else {
  console.log("Schedule element thiếu một số thông tin");
}
```

## Ưu điểm của các phương pháp này

1. **Semantic**: Dựa trên ý nghĩa của dữ liệu
2. **Stable**: Ít bị ảnh hưởng bởi thay đổi layout
3. **Maintainable**: Dễ bảo trì và cập nhật
4. **Flexible**: Có thể kết hợp nhiều phương pháp
5. **Readable**: Code dễ đọc và hiểu
6. **Robust**: Hoạt động tốt trên nhiều màn hình khác nhau

## Best Practices

1. **Ưu tiên text content**: Tìm theo text content trước
2. **Kết hợp nhiều tiêu chí**: Sử dụng multiple criteria để tăng độ chính xác
3. **Fallback methods**: Có phương pháp dự phòng khi phương pháp chính không hoạt động
4. **Scope properly**: Tìm trong container cụ thể thay vì toàn bộ page
5. **Verify results**: Kiểm tra xem element tìm được có đúng không
6. **Log details**: Ghi log chi tiết để debug

## Ví dụ sử dụng

Xem file `tests/schedule-locator-methods.spec.ts` để có ví dụ chi tiết về cách sử dụng từng phương pháp. 