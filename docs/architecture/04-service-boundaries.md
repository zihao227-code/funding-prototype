# 模块边界与 Service 调用规范 v1.0

> 最后更新: 2026-07-01
> 原则: 每个模块的 service 只导出纯函数，模块间通过导入 service 函数通信，不直接访问 Prisma Client

---

## 1. 目录结构

```
src/lib/
├── prisma.ts                    # Prisma 客户端单例 (全局唯一)
├── auth.ts                      # JWT 认证工具 (jose + bcryptjs)
├── tenant.ts                    # 多租户上下文辅助
├── constants.ts                 # 全局常量
├── utils.ts                     # 通用工具函数

├── uem/                         # UEM: 用户管理
│   ├── user-service.ts          # 用户 CRUD
│   └── profile-360.ts           # 360 视图聚合

├── cls/                         # CLS: 课程系统
│   ├── course-service.ts        # 课程 CRUD + 状态流转
│   ├── schedule-service.ts      # 排期管理 + 名额
│   └── classroom-service.ts     # 教室管理

├── billing/                     # Billing: 支付结算
│   ├── order-service.ts         # 订单 CRUD + 状态机
│   ├── payment-service.ts       # 支付处理
│   └── refund-service.ts        # 退款处理 (Phase 2)

├── ca/                          # CA: 上课管理
│   ├── attendance-service.ts    # 考勤签到
│   ├── assessment-service.ts    # 考核管理 (Phase 3)
│   └── certificate-service.ts   # 证书管理 (Phase 3)

├── funding/                     # Funding: 资助管理
│   ├── funding-type-service.ts  # 资助类型 CRUD (Phase 2)
│   ├── funding-application-service.ts # 资助申请 (Phase 2)
│   └── discount-engine.ts       # 统一折扣引擎 (Phase 2)

├── notification/                # Notification: 通知中心 (Phase 3)
│   ├── notification-service.ts
│   └── template-service.ts

└── mock/                        # Mock 服务
    ├── payment.ts               # Mock 支付回调处理
    ├── sms.ts                   # Mock 短信
    └── email.ts                 # Mock 邮件
```

---

## 2. 全局基础设施

### 2.1 Prisma 客户端单例 (`src/lib/prisma.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**规则:**
- 所有 service 文件通过 `import { prisma } from '@/lib/prisma'` 获取客户端
- 禁止在任何其他地方 `new PrismaClient()`
- 禁止模块间直接访问 Prisma 模型 (如 `prisma.order.findMany(...)` 在 course-service 中)

### 2.2 认证工具 (`src/lib/auth.ts`)

```typescript
// 导出函数:
export async function hashPassword(password: string): Promise<string>;
export async function verifyPassword(password: string, hash: string): Promise<boolean>;
export async function signAccessToken(payload: JwtPayload): Promise<string>;
export async function signRefreshToken(userId: string): Promise<string>;
export async function verifyAccessToken(token: string): Promise<JwtPayload>;
export async function verifyRefreshToken(token: string): Promise<{ userId: string }>;
export function getCurrentUser(): Promise<JwtPayload>;  // 从请求头解析 JWT
export function requireAuth(): Promise<JwtPayload>;
export function requireRoles(...roles: UserRole[]): Promise<JwtPayload>;
```

### 2.3 多租户辅助 (`src/lib/tenant.ts`)

```typescript
// 从 JWT payload 中提取当前租户ID
export async function getCurrentTenantId(): Promise<string>;

// 在所有写操作的 where 条件中自动注入 tenantId
export function withTenant(where: Record<string, unknown>): Record<string, unknown>;
```

---

## 3. 模块 Service 规范

### 3.1 通用规则

1. **每个 service 文件只导出纯函数** (async 函数，不依赖 React/组件状态)
2. **函数命名**: `verbNoun` 格式 (如 `getCourseById`, `createSchedule`, `cancelOrder`)
3. **参数**: 接收明确的 DTO 类型，不接受 `any` 或无类型的对象
4. **返回值**: 返回明确的类型 (定义在 `src/types/` 中)
5. **错误处理**: 抛出有意义的错误 (如 `new NotFoundError("Course not found")`)，不在 service 中吞掉错误
6. **事务**: 多表操作使用 Prisma 的交互式事务 `prisma.$transaction([])`

### 3.2 各模块 Service 接口

#### UEM: user-service.ts

```typescript
// 用户 CRUD
export async function getUserById(id: string): Promise<User>;
export async function getUserByPhone(phone: string, tenantId: string): Promise<User | null>;
export async function listUsers(query: UserListQuery): Promise<PaginatedResponse<User>>;
export async function createUser(input: CreateUserInput): Promise<User>;
export async function updateUser(id: string, input: UpdateUserInput): Promise<User>;
export async function disableUser(id: string): Promise<User>;

// 注册专用
export async function registerLearner(input: CreateUserInput): Promise<User>;
```

#### UEM: profile-360.ts

```typescript
// 学员360视图 — 聚合多个模块的数据
// 规则: 此文件通过导入各模块的 service 函数获取数据，不直接访问 Prisma
export async function getProfile360(userId: string): Promise<Profile360>;
```

#### CLS: course-service.ts

```typescript
export async function getCourseById(id: string): Promise<Course>;
export async function listCourses(query: CourseListQuery, tenantId: string): Promise<PaginatedResponse<Course>>;
export async function listPublishedCourses(query: CourseListQuery): Promise<PaginatedResponse<CourseCard>>;
export async function createCourse(input: CreateCourseInput, tenantId: string, userId: string): Promise<Course>;
export async function updateCourse(id: string, input: UpdateCourseInput): Promise<Course>;
export async function deleteCourse(id: string): Promise<void>;          // 仅 draft 状态可删除
export async function publishCourse(id: string): Promise<Course>;
export async function archiveCourse(id: string): Promise<Course>;
export async function getCourseWithSchedules(id: string): Promise<Course & { schedules: Schedule[] }>;
```

#### CLS: schedule-service.ts

```typescript
export async function getScheduleById(id: string): Promise<Schedule>;
export async function listSchedules(query: ScheduleListQuery): Promise<PaginatedResponse<Schedule>>;
export async function listSchedulesByCourse(courseId: string, onlyOpen?: boolean): Promise<Schedule[]>;
export async function createSchedule(courseId: string, input: CreateScheduleInput): Promise<Schedule>;
export async function updateSchedule(id: string, input: UpdateScheduleInput): Promise<Schedule>;
export async function deleteSchedule(id: string): Promise<void>;        // 仅 draft 状态
export async function cancelSchedule(id: string, reason?: string): Promise<Schedule>;
export async function getCalendarEvents(query: CalendarQuery): Promise<CalendarEvent[]>;
export async function incrementEnrolledCount(id: string): Promise<void>;  // 报名时+1
export async function decrementEnrolledCount(id: string): Promise<void>;  // 退款时-1
```

#### CLS: classroom-service.ts

```typescript
export async function listClassrooms(tenantId: string): Promise<Classroom[]>;
export async function getClassroomById(id: string): Promise<Classroom>;
export async function createClassroom(input: CreateClassroomInput, tenantId: string): Promise<Classroom>;
export async function updateClassroom(id: string, input: UpdateClassroomInput): Promise<Classroom>;
export async function deleteClassroom(id: string): Promise<void>;
```

#### Billing: order-service.ts

```typescript
export async function getOrderById(id: string): Promise<Order>;
export async function getOrderByNumber(orderNumber: string): Promise<Order>;
export async function listOrders(query: OrderListQuery, tenantId: string): Promise<PaginatedResponse<Order>>;
export async function listOrdersByBuyer(buyerId: string, query: OrderListQuery): Promise<PaginatedResponse<Order>>;

// 创建订单 (核心函数)
// 内部流程:
//   1. 校验排期状态 (open, 名额充足)
//   2. 调用 discountEngine.calculate() 计算折扣 (Phase 1 返回空折扣)
//   3. 生成订单号 (ORD-YYYYMMDD-NNN)
//   4. 创建 Order + OrderItem
//   5. 设置 expiresAt = now + 15分钟
//   6. 返回完整订单
export async function createOrder(input: CreateOrderInput, buyerId: string, operatorId: string, tenantId: string): Promise<Order>;

// 订单状态流转
export async function payOrder(id: string, paymentMethod: PaymentMethod): Promise<Order>;
export async function cancelOrder(id: string, operatorId: string): Promise<Order>;
export async function expireOrder(id: string): Promise<Order>;  // 超时自动取消

// 订单号生成
export async function generateOrderNumber(): Promise<string>;
```

#### Billing: payment-service.ts

```typescript
// 真实支付 (Phase 1 可能不实现)
export async function initiatePayment(orderId: string, method: PaymentMethod): Promise<{ paymentUrl?: string; qrCode?: string }>;

// Mock 支付 (Phase 1 核心)
// 规则: 此函数不直接访问 Prisma，而是调用 order-service 和 enrollment 相关逻辑
export async function processMockPayment(orderId: string, method: PaymentMethod): Promise<MockPaymentResponse>;

// 支付记录
export async function createPaymentRecord(input: CreatePaymentInput): Promise<Payment>;
export async function getPaymentByTransactionId(transactionId: string): Promise<Payment | null>;
export async function getPaymentsByOrder(orderId: string): Promise<Payment[]>;
```

#### CA: attendance-service.ts

```typescript
export async function getAttendanceById(id: string): Promise<Attendance>;
export async function listAttendance(query: AttendanceListQuery): Promise<PaginatedResponse<Attendance>>;
export async function createAttendance(input: CreateAttendanceInput, markedBy: string): Promise<Attendance>;
export async function batchCreateAttendance(input: BatchAttendanceInput, markedBy: string): Promise<Attendance[]>;
export async function updateAttendance(id: string, input: UpdateAttendanceInput): Promise<Attendance>;
export async function getAttendanceRoster(scheduleId: string): Promise<AttendanceRosterItem[]>;
```

#### Funding: discount-engine.ts (Phase 2)

```typescript
// Phase 1 实现: 返回空折扣 (stub)
export async function calculateDiscount(input: DiscountCalculationRequest): Promise<DiscountCalculationResult>;
// Phase 1 实现:
// return { originalAmount: totalPrice, totalDiscount: 0, finalAmount: totalPrice, breakdown: [] };

// Phase 2 实现:
// 1. 查询用户匹配的 FundingType
// 2. 查询适用的 DiscountRule (优惠券)
// 3. 按优先级合并: Funding > 优惠券 > 早鸟价
// 4. 检查互斥/叠加规则
// 5. 检查 Funding 预算上限
// 6. 返回完整折扣明细
```

---

## 4. 模块间调用关系图

```
                    ┌──────────┐
                    │   UEM    │  (user-service, profile-360)
                    └────┬─────┘
                         │ 被所有模块导入 (获取用户信息)
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐    ┌──────────┐    ┌──────────┐
   │   CLS   │    │  Billing │    │    CA    │
   │ courses │◄───│  orders  │    │attendance│
   │schedules│    │ payments │    └──────────┘
   └────┬────┘    └────┬─────┘
        │              │
        │    ┌─────────▼──────────┐
        │    │  discount-engine   │  (Phase 2)
        │    │  (Funding module)  │
        │    └────────────────────┘
        │
        └──────────────┐
                       ▼
              ┌────────────────┐
              │  Notification  │  (Phase 3, 被所有模块调用)
              └────────────────┘
```

**调用规则:**
- `profile-360.ts` 调用 `user-service`, `order-service`, `attendance-service`, `certificate-service` 聚合数据
- `order-service.ts` 调用 `schedule-service` (校验排期) + `discount-engine` (计算折扣)
- `payment-service.ts` 调用 `order-service` (更新订单状态)
- `attendance-service.ts` 调用 `schedule-service` (校验排期存在) + `user-service` (校验学员)
- **禁止**: `course-service.ts` 直接导入 `prisma.order` (应通过 order-service 的函数获取数据)

---

## 5. 跨模块调用示例

### 示例 1: Billing 创建订单时计算折扣

```typescript
// src/lib/billing/order-service.ts
import { calculateDiscount } from '@/lib/funding/discount-engine';  // Phase 1: stub 返回空折扣
import { listSchedulesByCourse, incrementEnrolledCount } from '@/lib/cls/schedule-service';
import type { CreateOrderInput, Order } from '@/types';

export async function createOrder(
  input: CreateOrderInput,
  buyerId: string,
  operatorId: string,
  tenantId: string
): Promise<Order> {
  // Phase 1: 调用折扣引擎 (目前返回空折扣)
  const discountResult = await calculateDiscount({
    userId: buyerId,
    scheduleIds: input.scheduleIds,
    couponCode: input.couponCode,
  });

  // 校验排期状态 (调用 CLS service)
  for (const scheduleId of input.scheduleIds) {
    const schedule = await getScheduleById(scheduleId);
    if (schedule.status !== 'open') throw new Error(`排期 ${schedule.title} 不可报名`);
    if (schedule.enrolledCount >= schedule.capacity) throw new Error(`排期 ${schedule.title} 已满`);
  }

  const orderNumber = await generateOrderNumber();

  // 创建订单 + 订单明细 (在事务中)
  const order = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        tenantId,
        orderNumber,
        buyerId,
        operatorId,
        channel: input.channel,
        originalAmount: discountResult.originalAmount,
        discountAmount: discountResult.totalDiscount,
        payableAmount: discountResult.finalAmount,
        status: 'pending',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15分钟
      },
    });

    for (const scheduleId of input.scheduleIds) {
      const schedule = await getScheduleById(scheduleId);
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          scheduleId,
          unitPrice: schedule.price ?? (await getCourseById(schedule.courseId)).basePrice,
          quantity: 1,
          discountDetail: JSON.stringify(discountResult.breakdown),
        },
      });
    }

    return order;
  });

  return order;
}
```

### 示例 2: Mock 支付处理

```typescript
// src/lib/mock/payment.ts
import { prisma } from '@/lib/prisma';
import type { MockPaymentResponse } from '@/types';

export async function processMockPayment(
  orderId: string,
  method: PaymentMethod
): Promise<MockPaymentResponse> {
  const { nanoid } = await import('nanoid');
  const transactionId = `MOCK_${method.toUpperCase()}_${new Date().toISOString().slice(0, 10)}_${nanoid(10)}`;

  return await prisma.$transaction(async (tx) => {
    // 1. 校验并更新订单状态 (乐观锁)
    const order = await tx.order.update({
      where: { id: orderId, status: 'pending' },
      data: { status: 'paid', paidAt: new Date() },
      include: { orderItems: true },
    });

    // 2. 创建支付记录
    await tx.payment.create({
      data: {
        orderId,
        paymentMethod: method,
        transactionId,
        amount: order.payableAmount,
        currency: 'CNY',
        status: 'success',
        callbackRaw: JSON.stringify({ mock: true, transactionId }),
        paidAt: new Date(),
      },
    });

    // 3. 为每个 OrderItem 创建 Enrollment (开通权限)
    const enrollments = [];
    for (const item of order.orderItems) {
      const enrollment = await tx.enrollment.create({
        data: {
          scheduleId: item.scheduleId,
          userId: order.buyerId,
          orderId,
          status: 'active',
        },
      });
      // 更新排期已报名人数
      await tx.schedule.update({
        where: { id: item.scheduleId },
        data: { enrolledCount: { increment: 1 } },
      });
      enrollments.push(enrollment);
    }

    return { success: true, transactionId, orderId };
  });
}
```

---

## 6. Phase 1 vs Phase 2 vs Phase 3 Service 清单

| Service 文件 | Phase 1 | Phase 2 | Phase 3 |
|-------------|---------|---------|---------|
| `uem/user-service.ts` | 完整实现 | - | - |
| `uem/profile-360.ts` | 完整实现 (聚合已有数据) | 扩展 Funding 数据 | 扩展证书/通知数据 |
| `cls/course-service.ts` | 完整实现 | - | - |
| `cls/schedule-service.ts` | 完整实现 | - | - |
| `cls/classroom-service.ts` | 完整实现 | - | - |
| `billing/order-service.ts` | 完整实现 | 扩展退款逻辑 | - |
| `billing/payment-service.ts` | Mock 实现 | - | 可扩展真实支付 |
| `billing/refund-service.ts` | 占位 (export stub) | 完整实现 | - |
| `ca/attendance-service.ts` | 完整实现 | - | - |
| `ca/assessment-service.ts` | 占位 | - | 完整实现 |
| `ca/certificate-service.ts` | 占位 | - | 完整实现 |
| `funding/funding-type-service.ts` | 占位 | 完整实现 | - |
| `funding/funding-application-service.ts` | 占位 | 完整实现 | - |
| `funding/discount-engine.ts` | Stub (返回空折扣) | 完整实现 | - |
| `notification/notification-service.ts` | 占位 | - | 完整实现 |
| `notification/template-service.ts` | 占位 | - | 完整实现 |
| `mock/payment.ts` | 完整实现 | - | - |
| `mock/sms.ts` | 完整实现 | - | - |
| `mock/email.ts` | 完整实现 | - | - |

---

## 7. 错误处理规范

所有 service 函数应抛出以下标准错误:

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,      // e.g., "NOT_FOUND", "VALIDATION_ERROR", "FORBIDDEN"
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} not found: ${id}`, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}
```
