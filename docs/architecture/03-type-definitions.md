# TypeScript 类型定义结构 v1.0

> 最后更新: 2026-07-01
> 所有类型文件位于 `src/types/`
> 原则: 类型定义的字段名必须与 Prisma schema 的字段名完全一致

---

## 目录结构

```
src/types/
├── index.ts          # Barrel export (统一导出)
├── common.ts         # 通用类型 (分页、响应格式、错误等)
├── user.ts           # 用户相关类型
├── course.ts         # 课程相关类型
├── schedule.ts       # 排期相关类型
├── enrollment.ts     # 报名相关类型
├── order.ts          # 订单相关类型
├── payment.ts        # 支付相关类型
├── attendance.ts     # 考勤相关类型
├── funding.ts        # 资助相关类型 (Phase 2 逻辑, Phase 1 定义类型)
├── certificate.ts    # 证书相关类型 (Phase 3 逻辑, Phase 1 定义类型)
├── notification.ts   # 通知相关类型 (Phase 3 逻辑, Phase 1 定义类型)
└── auth.ts           # 认证相关类型 (JWT payload, login/register DTO)
```

---

## 1. src/types/common.ts

```typescript
// ============ 分页 ============
export interface PaginationParams {
  page?: number;       // 默认 1
  pageSize?: number;   // 默认 20
  sortBy?: string;     // 排序字段
  sortOrder?: 'asc' | 'desc'; // 默认 'desc'
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============ API 响应 ============
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;         // 错误码: e.g., "ORDER_NOT_FOUND", "VALIDATION_ERROR"
    message: string;      // 人类可读的错误信息
    details?: unknown;     // 额外错误详情 (如 Zod 验证错误)
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// ============ 金钱 ============
// 所有金额以分为单位 (整数), 前端转换显示
export type MoneyInCents = number;

// ============ 日期 ============
// 数据库存储 DateTime, API 传输 ISO 8601 字符串
// 前端使用 date-fns 处理
export type ISODateString = string;

// ============ JSON 元数据 ============
// 用于 Prisma 中存储为 String 的 JSON 字段
export interface DiscountDetailItem {
  type: 'funding' | 'coupon' | 'early_bird' | 'group_buy';
  sourceId: string;     // fundingTypeId 或 couponId
  amount: MoneyInCents; // 本项折扣金额(分)
  label: string;        // 展示文本: e.g., "政府技能补贴"
}
export type DiscountDetail = DiscountDetailItem[];

export interface FundingRuleConfig {
  // FundingType 的 rule 字段 (Phase 2)
  conditions?: {
    maxApplicationsPerUser?: number;
    requiredDocuments?: string[];
  };
}

export interface DiscountRuleConfig {
  // DiscountRule 的 ruleConfig 字段
  discountAmount?: MoneyInCents;    // 定额减免
  discountPercentage?: number;      // 百分比折扣
  minOrderAmount?: MoneyInCents;    // 最低消费门槛
  applicableCourses?: string[];     // 适用课程ID列表 (空=全部)
}

// ============ 通用筛选 ============
export interface DateRangeFilter {
  startDate?: ISODateString;
  endDate?: ISODateString;
}

export interface StatusFilter {
  status?: string;
}

export interface SearchFilter {
  search?: string;  // 全文搜索关键词
}
```

---

## 2. src/types/user.ts

```typescript
import type { UserRole, UserStatus } from '@prisma/client';

// ============ 枚举 ============
export type { UserRole, UserStatus };

// ============ 核心实体 ============
export interface User {
  id: string;
  tenantId: string;
  role: UserRole;
  phone: string | null;
  email: string | null;
  displayName: string;
  avatar: string | null;
  parentId: string | null;
  status: UserStatus;
  registeredAt: string;   // ISO 8601
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ DTO: 创建用户 (注册) ============
export interface CreateUserInput {
  phone: string;
  email?: string;
  password: string;
  displayName: string;
  role?: UserRole;        // 默认 learner, 仅 editor 可设置其他角色
  tenantId: string;
}

// ============ DTO: 更新用户 ============
export interface UpdateUserInput {
  displayName?: string;
  email?: string;
  avatar?: string;
  parentId?: string | null;
  status?: UserStatus;
}

// ============ DTO: 用户列表查询 ============
export interface UserListQuery {
  role?: UserRole | UserRole[];
  search?: string;        // 按 displayName/phone/email 搜索
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}

// ============ 学员 360 视图 ============
export interface Profile360 {
  user: User;
  summary: {
    totalOrders: number;
    totalSpent: number;           // 消费总额(分)
    activeEnrollments: number;    // 进行中的课程数
    completedCourses: number;     // 已完成课程数
    certificateCount: number;     // 获得证书数
    attendanceRate: number;       // 出勤率 (0-100)
  };
  recentOrders: OrderSummary[];        // 最近订单
  enrollments: EnrollmentWithDetails[]; // 报名记录
  certificates: CertificateSummary[];   // 证书列表
  attendanceSummary: {                  // 考勤摘要
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
  };
}

// 注意: OrderSummary, EnrollmentWithDetails, CertificateSummary 引用自对应模块类型
// 为避免循环依赖，这些跨模块聚合类型统一定义在 common.ts 或通过 type import
```

---

## 3. src/types/course.ts

```typescript
import type { CourseType, CourseStatus } from '@prisma/client';

// ============ 枚举 ============
export type { CourseType, CourseStatus };

// ============ 核心实体 ============
export interface Course {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  category: string | null;
  type: CourseType;
  basePrice: number;          // 分
  status: CourseStatus;
  publishedAt: string | null;
  archivedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // 聚合字段 (非数据库字段，API返回时填充)
  creator?: { id: string; displayName: string };
  scheduleCount?: number;
  fundingCount?: number;
}

// ============ DTO: 创建课程 ============
export interface CreateCourseInput {
  title: string;
  description?: string;
  coverImageUrl?: string;
  category?: string;
  type?: CourseType;
  basePrice: number;          // 分
}

// ============ DTO: 更新课程 ============
export interface UpdateCourseInput {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  category?: string;
  type?: CourseType;
  basePrice?: number;
}

// ============ DTO: 课程列表查询 ============
export interface CourseListQuery {
  status?: CourseStatus | CourseStatus[];
  category?: string;
  type?: CourseType;
  search?: string;            // 按 title/description 搜索
  sortBy?: 'createdAt' | 'basePrice' | 'title';
  page?: number;
  pageSize?: number;
}

// ============ Website 课程卡片 (精简版, 不含草稿课程) ============
export interface CourseCard {
  id: string;
  title: string;
  coverImageUrl: string | null;
  category: string | null;
  type: CourseType;
  basePrice: number;          // 分
  scheduleCount: number;      // 可选排期数
  fundingLabels: string[];    // 关联资助标签: e.g., ["政府技能补贴"]
  earliestSchedule?: string;  // 最早开课日期
}
```

---

## 4. src/types/schedule.ts

```typescript
import type { ScheduleStatus } from '@prisma/client';

// ============ 枚举 ============
export type { ScheduleStatus };

// ============ 核心实体 ============
export interface Schedule {
  id: string;
  courseId: string;
  classroomId: string | null;
  trainerId: string | null;
  title: string;
  startTime: string;          // ISO 8601
  endTime: string;
  capacity: number;
  enrolledCount: number;
  registrationDeadline: string | null;
  price: number | null;       // 分, null = 使用课程 basePrice
  meetingLink: string | null;
  status: ScheduleStatus;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  // 聚合字段
  course?: { id: string; title: string; basePrice: number };
  classroom?: { id: string; name: string } | null;
  trainer?: { id: string; displayName: string } | null;
}

// ============ DTO: 创建排期 ============
export interface CreateScheduleInput {
  title: string;
  startTime: string;          // ISO 8601
  endTime: string;
  capacity?: number;
  registrationDeadline?: string;
  price?: number;             // 分, 不填则用课程 basePrice
  classroomId?: string;
  trainerId?: string;
  meetingLink?: string;
}

// ============ DTO: 更新排期 ============
export interface UpdateScheduleInput {
  title?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  registrationDeadline?: string;
  price?: number;
  classroomId?: string | null;
  trainerId?: string | null;
  meetingLink?: string | null;
}

// ============ 日历视图 ============
export interface CalendarQuery {
  start: string;    // ISO 8601 日期
  end: string;      // ISO 8601 日期
  courseId?: string;
  status?: ScheduleStatus;
}

export interface CalendarEvent {
  id: string;
  title: string;
  courseTitle: string;
  start: string;    // ISO 8601
  end: string;
  status: ScheduleStatus;
  enrolledCount: number;
  capacity: number;
  classroomName?: string;
}
```

---

## 5. src/types/enrollment.ts

```typescript
import type { EnrollmentStatus } from '@prisma/client';

// ============ 枚举 ============
export type { EnrollmentStatus };

// ============ 核心实体 ============
export interface Enrollment {
  id: string;
  scheduleId: string;
  userId: string;
  orderId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  updatedAt: string;
  // 聚合字段
  user?: { id: string; displayName: string; phone: string | null };
  schedule?: { id: string; title: string; courseId: string };
}

// ============ 扩展 (含关联详情, 用于360视图和学员列表) ============
export interface EnrollmentWithDetails extends Enrollment {
  schedule: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    course: {
      id: string;
      title: string;
    };
  };
  order: {
    id: string;
    orderNumber: string;
    payableAmount: number;
  };
}

// ============ 班次报名列表项 ============
export interface EnrollmentRosterItem {
  enrollmentId: string;
  userId: string;
  displayName: string;
  phone: string | null;
  enrolledAt: string;
  attendanceStatus?: string;  // 最新考勤状态 (可选)
}
```

---

## 6. src/types/order.ts

```typescript
import type { OrderStatus, Channel } from '@prisma/client';
import type { DiscountDetail } from './common';

// ============ 枚举 ============
export type { OrderStatus, Channel };

// ============ 核心实体 ============
export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;         // e.g., "ORD-20260701-001"
  buyerId: string;
  operatorId: string;
  channel: Channel;
  originalAmount: number;      // 分
  discountAmount: number;      // 分
  payableAmount: number;       // 分
  paidAmount: number;          // 分
  status: OrderStatus;
  expiresAt: string | null;    // ISO 8601
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  // 聚合
  buyer?: { id: string; displayName: string };
  operator?: { id: string; displayName: string };
  orderItems?: OrderItem[];
  payments?: PaymentSummary[];
}

// ============ 订单明细 ============
export interface OrderItem {
  id: string;
  orderId: string;
  scheduleId: string;
  unitPrice: number;           // 分
  quantity: number;
  discountDetail: DiscountDetail | null;
  createdAt: string;
  // 聚合
  schedule?: {
    id: string;
    title: string;
    courseId: string;
    course?: { id: string; title: string };
  };
}

// ============ DTO: 创建订单 ============
export interface CreateOrderInput {
  scheduleIds: string[];       // 可多选 (购物车合并下单)
  channel: Channel;            // online / desk
  couponCode?: string;         // 可选优惠券码
  fundingApplicationIds?: string[]; // 可选: 预批准的资助申请ID
}

// ============ DTO: 订单列表查询 ============
export interface OrderListQuery {
  status?: OrderStatus | OrderStatus[];
  channel?: Channel;
  buyerId?: string;
  dateRange?: { start: string; end: string };
  search?: string;             // 按 orderNumber 搜索
  page?: number;
  pageSize?: number;
}

// ============ 订单摘要 (用于360视图和列表) ============
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  payableAmount: number;
  channel: Channel;
  createdAt: string;
  itemCount: number;
}

// ============ 前端购物车 (客户端状态) ============
export interface CartItem {
  scheduleId: string;
  scheduleTitle: string;
  courseId: string;
  courseTitle: string;
  unitPrice: number;
  quantity: number;
}

// 注意: 购物车不建数据库表，存储在客户端 localStorage/zustand
```

---

## 7. src/types/payment.ts

```typescript
import type { PaymentMethod, PaymentStatus } from '@prisma/client';

// ============ 枚举 ============
export type { PaymentMethod, PaymentStatus };

// ============ 核心实体 ============
export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  transactionId: string;       // MOCK_ 前缀表示Mock支付
  amount: number;              // 分
  currency: string;            // 默认 "CNY"
  status: PaymentStatus;
  callbackRaw: string | null;  // JSON
  paidAt: string | null;
  createdAt: string;
}

// ============ 支付摘要 ============
export interface PaymentSummary {
  id: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
}

// ============ Mock 支付 ============
export interface MockPaymentRequest {
  orderId: string;
  method: PaymentMethod;       // wechat / alipay / cash
  success: boolean;            // true=模拟成功, false=模拟失败
}

export interface MockPaymentResponse {
  success: true;
  transactionId: string;       // e.g., "MOCK_WECHAT_20260701_abc123"
  orderStatus: string;         // "paid"
  enrollments: Array<{
    id: string;
    scheduleId: string;
    scheduleTitle: string;
    courseTitle: string;
  }>;
  payment: PaymentSummary;
}

// ============ 订单状态查询 ============
export interface PaymentStatusResponse {
  orderId: string;
  orderStatus: string;
  payment?: PaymentSummary;
}
```

---

## 8. src/types/attendance.ts

```typescript
import type { AttendanceStatus, CheckInMethod } from '@prisma/client';

// ============ 枚举 ============
export type { AttendanceStatus, CheckInMethod };

// ============ 核心实体 ============
export interface Attendance {
  id: string;
  scheduleId: string;
  userId: string;
  status: AttendanceStatus;
  checkInMethod: CheckInMethod;
  checkInTime: string | null;
  checkOutTime: string | null;
  markedBy: string | null;
  createdAt: string;
  // 聚合
  user?: { id: string; displayName: string; phone: string | null };
  schedule?: { id: string; title: string };
  marker?: { id: string; displayName: string } | null;
}

// ============ DTO: 创建签到 ============
export interface CreateAttendanceInput {
  scheduleId: string;
  userId: string;
  status: AttendanceStatus;
  checkInMethod?: CheckInMethod;
  checkInTime?: string;
}

// ============ DTO: 批量签到 ============
export interface BatchAttendanceInput {
  scheduleId: string;
  records: Array<{
    userId: string;
    status: AttendanceStatus;
  }>;
  checkInMethod?: CheckInMethod;
}

// ============ 花名册条目 ============
export interface AttendanceRosterItem {
  userId: string;
  displayName: string;
  phone: string | null;
  enrollmentStatus: string;
  attendanceStatus: AttendanceStatus | null;
  checkInTime: string | null;
  checkInMethod: CheckInMethod | null;
}

// ============ DTO: 考勤查询 ============
export interface AttendanceListQuery {
  scheduleId?: string;
  userId?: string;
  status?: AttendanceStatus;
  dateRange?: { start: string; end: string };
  page?: number;
  pageSize?: number;
}
```

---

## 9. src/types/funding.ts (Phase 2 逻辑, Phase 1 定义类型)

```typescript
import type {
  FundingSource,
  CalculationRule,
  FundingApplicationStatus,
} from '@prisma/client';

// ============ 枚举 ============
export type { FundingSource, CalculationRule, FundingApplicationStatus };

// ============ 核心实体 ============
export interface FundingType {
  id: string;
  tenantId: string;
  name: string;
  source: FundingSource;
  calculationRule: CalculationRule;
  amountOrRate: number;       // 定额(分) 或 比例(百分数)
  maxAmount: number | null;   // 上限(分)
  budgetLimit: number;        // 资金池上限(分)
  budgetUsed: number;         // 已使用(分)
  effectiveFrom: string;
  effectiveTo: string;
  status: string;             // active / expired / depleted
  createdAt: string;
  updatedAt: string;
}

export interface CourseFunding {
  id: string;
  courseId: string;
  fundingTypeId: string;
  applicable: boolean;
  createdAt: string;
}

export interface FundingApplication {
  id: string;
  fundingTypeId: string;
  userId: string;
  orderId: string;
  amountApplied: number;
  amountApproved: number | null;
  status: FundingApplicationStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ 折扣引擎 ============
export interface DiscountCalculationRequest {
  userId: string;
  scheduleIds: string[];      // 购买的排期
  couponCode?: string;
  fundingApplicationIds?: string[];
}

export interface DiscountBreakdownItem {
  type: 'funding' | 'coupon' | 'early_bird';
  sourceId: string;           // fundingTypeId 或 discountRuleId
  sourceName: string;         // 展示名称
  amount: number;             // 本项折扣金额(分)
}

export interface DiscountCalculationResult {
  originalAmount: number;     // 折前总价(分)
  totalDiscount: number;      // 总折扣(分)
  finalAmount: number;        // 最终应付(分)
  breakdown: DiscountBreakdownItem[];
}
```

---

## 10. src/types/certificate.ts (Phase 3 逻辑, Phase 1 定义类型)

```typescript
import type { CertificateStatus } from '@prisma/client';

// ============ 枚举 ============
export type { CertificateStatus };

// ============ 核心实体 ============
export interface Certificate {
  id: string;
  tenantId: string;
  certificateNumber: string;  // e.g., "CERT-STARLIGHT-2026-000001"
  userId: string;
  courseId: string;
  scheduleId: string;
  issueDate: string;
  expiryDate: string | null;
  templateId: string | null;
  metadataJson: string | null;
  status: CertificateStatus;
  revokedAt: string | null;
  revokedBy: string | null;
  revokeReason: string | null;
  createdAt: string;
}

// ============ 证书摘要 (用于360视图) ============
export interface CertificateSummary {
  id: string;
  certificateNumber: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  status: CertificateStatus;
}

// ============ 证书查验 (公开API) ============
export interface CertificateVerificationResult {
  valid: boolean;
  certificateNumber: string;
  holderName: string;
  courseTitle: string;
  issueDate: string;
  expiryDate: string | null;
  status: string;
  revokedAt?: string;
  revokeReason?: string;
}
```

---

## 11. src/types/notification.ts (Phase 3 逻辑, Phase 1 定义类型)

```typescript
import type { NotificationChannel, NotificationSendStatus } from '@prisma/client';

// ============ 枚举 ============
export type { NotificationChannel, NotificationSendStatus };

// ============ 核心实体 ============
export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  eventType: string;          // e.g., "purchase_success", "course_reminder"
  title: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  channel: NotificationChannel;
  sendStatus: NotificationSendStatus;
  createdAt: string;
}

// ============ 事件类型常量 ============
export const NotificationEventType = {
  PURCHASE_SUCCESS: 'purchase_success',
  COURSE_REMINDER: 'course_reminder',
  PAYMENT_TIMEOUT: 'payment_timeout',
  REFUND_NOTICE: 'refund_notice',
  COURSE_CANCELLED: 'course_cancelled',
  CERTIFICATE_ISSUED: 'certificate_issued',
  DESK_PURCHASE: 'desk_purchase',
  NEW_ORDER_EDITOR: 'new_order_editor',
} as const;
export type NotificationEventType = typeof NotificationEventType[keyof typeof NotificationEventType];

// ============ Mock 消息 ============
export interface MockSms {
  id: string;
  phone: string;
  content: string;
  templateCode: string | null;
  status: string;
  createdAt: string;
}

export interface MockEmail {
  id: string;
  toEmail: string;
  subject: string;
  bodyHtml: string;
  status: string;
  createdAt: string;
}
```

---

## 12. src/types/auth.ts

```typescript
import type { UserRole } from '@prisma/client';

// ============ JWT Payload ============
export interface JwtPayload {
  sub: string;            // userId
  tenantId: string;
  role: UserRole;
  displayName: string;
  iat?: number;           // issued at
  exp?: number;           // expiration
}

// ============ 登录/注册 DTO ============
export interface LoginInput {
  phone: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    displayName: string;
    role: UserRole;
    tenantId: string;
    tenantName: string;
    avatar: string | null;
  };
}

export interface RegisterInput {
  phone: string;
  email?: string;
  password: string;
  displayName: string;
  tenantId: string;
}

export interface RegisterResponse {
  id: string;
  displayName: string;
  role: UserRole;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
```

---

## 13. src/types/index.ts (Barrel Export)

```typescript
// 统一导出所有类型, 方便其他模块导入:
// import type { Order, CreateOrderInput, OrderStatus } from '@/types';

export type * from './common';
export type * from './user';
export type * from './course';
export type * from './schedule';
export type * from './enrollment';
export type * from './order';
export type * from './payment';
export type * from './attendance';
export type * from './funding';
export type * from './certificate';
export type * from './notification';
export type * from './auth';
```

---

## 类型一致性检查清单

在编写 API handler 或 service 函数时:

- [ ] DTO 的字段名是否与 Prisma schema 的字段名完全一致 (camelCase)?
- [ ] 金额字段是否使用 `number` (分) 而非 `string` 或浮点数?
- [ ] 日期字段是否使用 `string` (ISO 8601) 而非 `Date` 对象?
- [ ] 枚举类型是否直接从 `@prisma/client` re-export?
- [ ] 所有类型是否已加入 `src/types/index.ts`?
- [ ] 跨模块聚合类型 (如 `Profile360`, `EnrollmentWithDetails`) 的引用是否正确?
