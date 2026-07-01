# Code Map -- 星光职业培训学校 全栈代码地图

> 生成日期: 2026-07-01 | 基于 commit `95460e8` (Phase 1 complete)
> 用途: 10秒内定位任何功能对应的代码位置，支持精准Bug修复

---

## 1. 文件清单表

### 1.1 基础设施层 (Infrastructure)

| # | 文件路径 | 作用 | 依赖 | 被依赖 |
|---|---------|------|------|--------|
| 1 | `src/lib/prisma.ts` | Prisma 单例客户端 (globalThis 缓存) | `@prisma/client` | 全部 5 个 Service |
| 2 | `src/lib/errors.ts` | 统一错误类体系 + `errorResponse()` 序列化器 | 无外部依赖 | 全部 17 个 API Route Handler |
| 3 | `src/lib/auth.ts` | Token 签发/密码哈希 (Node.js Runtime) | `jose`, `bcryptjs`, `auth-edge.ts` | Auth routes, Refresh route |
| 4 | `src/lib/auth-edge.ts` | JWT 验证 (Edge Runtime 兼容) | `jose` | `middleware.ts`, `auth.ts`, Refresh route |
| 5 | `src/lib/api-client.ts` | 前端 API 调用封装 + 工具函数 | `window.fetch` | 全部 10 个前端页面 |
| 6 | `src/middleware.ts` | Next.js JWT 认证中间件 (全局拦截 `/api/*`) | `auth-edge.ts` | 全部 API 请求 |
| 7 | `src/types/common.ts` | 通用类型定义 (ApiResponse, PaginationParams, MoneyInCents) | 无 | Service 层, API Routes |

### 1.2 校验层 (Validators)

| # | 文件路径 | 作用 | 依赖 | 被依赖 |
|---|---------|------|------|--------|
| 8 | `src/lib/validators/auth.ts` | 注册/登录 schema (zod) | `zod` | `POST /api/v1/auth/register`, `POST /api/v1/auth/login` |
| 9 | `src/lib/validators/course.ts` | 课程/排期 CRUD schema (zod) | `zod` | `POST /api/v1/courses`, `PUT /api/v1/courses/[id]`, `POST /api/v1/courses/[id]/schedules` |

### 1.3 服务层 (Services)

| # | 文件路径 | 作用 | 依赖 | 被依赖 |
|---|---------|------|------|--------|
| 10 | `src/lib/cls/course-service.ts` | 课程 CRUD + 状态流转 | `prisma`, `validators/course` types | 5 个 Course API Routes |
| 11 | `src/lib/cls/schedule-service.ts` | 排期 CRUD + 日历视图 | `prisma`, `validators/course` types | 5 个 Schedule API Routes + 1 个 Course/[id]/schedules Route |
| 12 | `src/lib/billing/order-service.ts` | 订单创建/查询/取消/过期 | `prisma`, `nanoid` | 3 个 Order API Routes |
| 13 | `src/lib/billing/payment-service.ts` | Mock 支付处理 (事务核心) | `prisma`, `nanoid` | `POST /api/v1/payment/mock-callback` |
| 14 | `src/lib/ca/attendance-service.ts` | 考勤签到/批量/花名册/列表 | `prisma` | 3 个 Attendance API Routes |

### 1.4 API 路由层 (API Routes)

| # | 文件路径 | HTTP 方法 | 作用 | 调用 Service |
|---|---------|----------|------|-------------|
| 15 | `src/app/api/v1/auth/login/route.ts` | POST | 手机号+密码登录，返回 Token | `auth.ts` |
| 16 | `src/app/api/v1/auth/register/route.ts` | POST | 学员自助注册 | `auth.ts` |
| 17 | `src/app/api/v1/auth/me/route.ts` | GET | 获取当前登录用户信息 | `prisma` (直接) |
| 18 | `src/app/api/v1/auth/refresh/route.ts` | POST | 刷新 Access Token | `auth.ts` |
| 19 | `src/app/api/v1/courses/route.ts` | GET, POST | 课程列表 + 创建 | `course-service` |
| 20 | `src/app/api/v1/courses/[id]/route.ts` | GET, PUT | 课程详情 + 更新 | `course-service` |
| 21 | `src/app/api/v1/courses/[id]/publish/route.ts` | POST | 发布课程 (draft->published) | `course-service.publishCourse` |
| 22 | `src/app/api/v1/courses/[id]/archive/route.ts` | POST | 归档课程 (published->archived) | `course-service.archiveCourse` |
| 23 | `src/app/api/v1/courses/[id]/schedules/route.ts` | GET, POST | 课程下排期列表 + 创建新排期 | `schedule-service` |
| 24 | `src/app/api/v1/schedules/route.ts` | GET | 全部排期 (支持筛选) | `schedule-service.listAllSchedules` |
| 25 | `src/app/api/v1/schedules/[id]/route.ts` | GET, PUT | 排期详情 + 更新 | `schedule-service` |
| 26 | `src/app/api/v1/schedules/[id]/cancel/route.ts` | POST | 取消排期 (->cancelled) | `schedule-service.cancelSchedule` |
| 27 | `src/app/api/v1/schedules/calendar/route.ts` | GET | 日历视图 (时间范围查询) | `schedule-service.getCalendarView` |
| 28 | `src/app/api/v1/schedules/[id]/attendance/roster/route.ts` | GET | 班次花名册 (学员+考勤状态) | `attendance-service.getAttendanceRoster` |
| 29 | `src/app/api/v1/orders/route.ts` | GET, POST | 订单列表 + 创建 | `order-service` |
| 30 | `src/app/api/v1/orders/[id]/route.ts` | GET | 订单详情 (含过期检测) | `order-service` |
| 31 | `src/app/api/v1/orders/[id]/cancel/route.ts` | POST | 取消订单 (pending->cancelled) | `order-service.cancelOrder` |
| 32 | `src/app/api/v1/payment/mock-callback/route.ts` | POST | Mock 支付成功回调 | `payment-service.processMockPayment` |
| 33 | `src/app/api/v1/attendance/route.ts` | GET, POST | 考勤列表 + 单条签到 | `attendance-service` |
| 34 | `src/app/api/v1/attendance/batch/route.ts` | POST | 批量签到 | `attendance-service.batchMarkAttendance` |

### 1.5 前端页面层 (Frontend Pages)

| # | 文件路径 | 作用 | 依赖 |
|---|---------|------|------|
| 35 | `src/app/layout.tsx` | 根布局 (HTML + body) | `globals.css` |
| 36 | `src/app/page.tsx` | 首页 (演示账号展示 + 入口) | next/link |
| 37 | `src/app/globals.css` | Tailwind + CSS 变量 | tailwind |
| 38 | `src/app/(admin)/layout.tsx` | 管理后台布局 (侧边栏 + 退出) | next/link, next/navigation |
| 39 | `src/app/(admin)/admin/page.tsx` | 仪表盘 (静态统计数据) | 无 |
| 40 | `src/app/(admin)/admin/courses/page.tsx` | 课程管理列表 (发布/下架/创建入口) | `api-client.ts` |
| 41 | `src/app/(admin)/admin/courses/new/page.tsx` | 创建课程表单 | `api-client.ts` |
| 42 | `src/app/(admin)/admin/courses/[id]/page.tsx` | 课程详情 + 排期管理 (添加/取消排期) | `api-client.ts` |
| 43 | `src/app/(admin)/admin/orders/page.tsx` | 订单管理列表 | `api-client.ts` |
| 44 | `src/app/(admin)/admin/attendance/[scheduleId]/page.tsx` | 考勤花名册 (逐人签到) | `api-client.ts` |
| 45 | `src/app/(website)/login/page.tsx` | 学员登录页 | fetch (原生) |
| 46 | `src/app/(website)/register/page.tsx` | 学员注册页 | fetch (原生) |
| 47 | `src/app/(website)/courses/page.tsx` | 公开课程列表 (卡片) | `api-client.ts` |
| 48 | `src/app/(website)/courses/[id]/page.tsx` | 课程详情 + 排期选择 + Funding信息 | `api-client.ts` |
| 49 | `src/app/(website)/checkout/page.tsx` | 结算页 (购物车 -> 创建订单) | `api-client.ts`, localStorage |
| 50 | `src/app/(website)/payment/[orderId]/page.tsx` | 模拟支付页 (选择方式 -> 模拟支付) | `api-client.ts` |
| 51 | `src/app/(website)/account/orders/page.tsx` | 我的订单列表 | `api-client.ts` |

### 1.6 数据层 (Database)

| # | 文件路径 | 作用 | 建模实体数 |
|---|---------|------|----------|
| 52 | `prisma/schema.prisma` | 完整 Schema (SQLite) | 17 个 Model (Phase 1 活跃 9 个) |
| 53 | `prisma/seed.ts` | 种子数据 (10 实体, 6 用户, 3 课程, 4 排期, 3 订单) | bcryptjs |

---

## 2. 数据流拓扑图

### 2.1 整体架构 (Three-Tier)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                          │
│                                                                     │
│  Website Pages                  Admin Pages                         │
│  /courses              ────    /admin/courses                       │
│  /courses/[id]         ────    /admin/courses/new                   │
│  /checkout             ────    /admin/courses/[id]                  │
│  /payment/[orderId]    ────    /admin/orders                        │
│  /account/orders       ────    /admin/attendance/[scheduleId]       │
│  /login                          /admin (dashboard)                 │
│  /register                                                          │
│       │                                    │                        │
│       └────────────┬───────────────────────┘                        │
│                    │  apiClient() / fetch()                         │
│                    │  localStorage: accessToken                     │
│                    │  Authorization: Bearer <token>                 │
└────────────────────┼────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE (Edge Runtime)                         │
│                                                                     │
│  src/middleware.ts                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. 跳过非 /api/ 路径                                        │   │
│  │ 2. Auth routes + mock-callback → 公开 (PUBLIC_PREFIXES)    │   │
│  │ 3. GET /courses, GET /schedules → 公开读取                  │   │
│  │ 4. 其他所有 /api/* → JWT 验证 (verifyToken from auth-edge) │   │
│  │ 5. 注入请求头: x-user-id, x-user-role, x-tenant-id         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API ROUTE HANDLERS (Node.js Runtime)              │
│                                                                     │
│  17 Route files in src/app/api/v1/                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. 读取 x-user-id / x-tenant-id from request headers       │   │
│  │ 2. Zod 校验请求体 (safeParse)                                │   │
│  │ 3. 调用 Service 层函数                                       │   │
│  │ 4. catch(error) → errorResponse() 统一序列化                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (Business Logic)                    │
│                                                                     │
│  src/lib/cls/course-service.ts     (5 exported functions)          │
│  src/lib/cls/schedule-service.ts   (7 exported functions)          │
│  src/lib/billing/order-service.ts  (5 exported functions)          │
│  src/lib/billing/payment-service.ts (1 exported function)          │
│  src/lib/ca/attendance-service.ts  (4 exported functions)          │
└────────────────────┼────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS (Prisma ORM)                          │
│                                                                     │
│  src/lib/prisma.ts → PrismaClient singleton                        │
│  prisma.schema → 17 models mapped to SQLite tables                  │
└────────────────────┼────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE (SQLite)                              │
│                                                                     │
│  file: prisma/dev.db (or DATABASE_URL env)                          │
│  9 active tables: tenant, user, course, schedule, enrollment,       │
│                   order, order_item, payment, attendance            │
│  8 reserved tables (Phase 2/3): funding_type, course_funding,      │
│                   funding_application, refund, certificate,         │
│                   assessment, grade, notification,                  │
│                   mock_sms, mock_email, discount_rule               │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 核心业务流程: 学员购课完整链路

```
学员浏览课程          学员下单              模拟支付          支付后处理
──────────          ──────              ────────          ──────────
                   
/courses            /checkout           /payment/[id]     (Service层)
  │                    │                    │                  │
  ▼                    ▼                    ▼                  ▼
GET /api/v1/       POST /api/v1/       POST /api/v1/     processMockPayment()
courses             orders               payment/         ├─ tx.order.update
  │                    │                 mock-callback       │  status=paid
  ▼                    ▼                    │              ├─ tx.payment.create
listCourses()      createOrder()           ▼              ├─ tx.enrollment.create
  │                    │              processMockPayment() │  (N条, 每个OrderItem)
  ▼                    ▼                    │              ├─ tx.schedule.update
SELECT * FROM      prisma.order.create      ▼              │  enrolledCount++
course               │                 prisma.$transaction  └─ tx.notification
  │                  ├─ 校验排期状态    (5步原子操作)           .createMany
  ▼                  │  (open/名额)
Response.json()      ├─ 计算金额
                     ├─ 创建Order
                     └─ 创建OrderItems
```

### 2.3 认证流程

```
注册 / 登录                    中间件拦截                       Route Handler
───────────                   ──────────                      ─────────────
POST /auth/register           每个 /api/* 请求                读取 headers:
POST /auth/login              │                              x-user-id
  │                           ▼                              x-user-role
  ▼                      middleware.ts                        x-tenant-id
hashPassword()            │
signAccessToken()         ├─ PUBLIC_PREFIXES → pass
signRefreshToken()        ├─ GET courses/schedules → pass
  │                       ├─ 提取 Bearer token
  ▼                       ├─ verifyToken() (auth-edge)
返回 {accessToken,        ├─ 注入 x-user-* headers
      refreshToken,       └─ NextResponse.next()
      user}
```

### 2.4 模块间依赖图 (箭头 = "imports from")

```
middleware.ts ──────► auth-edge.ts
                          ▲
                          │ re-exports verifyToken
                      auth.ts ──────► jose, bcryptjs
                          ▲
         ┌────────────────┼────────────────┐
         │                │                │
   login/route.ts   register/route.ts  refresh/route.ts
         │                │                │
         └────────────────┼────────────────┘
                          │
                    errors.ts ◄────────── ALL 17 Route Handlers
                          ▲
         ┌────────────────┼────────────────┬────────────────┐
         │                │                │                │
  course-service   schedule-service  order-service   attendance-service
  (5 functions)    (7 functions)    (5 functions)    (4 functions)
         │                │                │                │
         └────────────────┴────────────────┴────────────────┘
                          │
                      prisma.ts ◄────────── ALL 5 Services
                          │
                    @prisma/client
                          │
                    schema.prisma ──────► SQLite
```

---

## 3. 关键函数索引

### 3.1 Auth 模块

```
src/lib/auth.ts::signAccessToken(payload: JwtPayload): Promise<string>
  - 调用方: POST /api/v1/auth/login (L75), POST /api/v1/auth/register (L59), POST /api/v1/auth/refresh (L42)
  - 算法: HS256 (jose), 过期 24h
  - 副作用: 无

src/lib/auth.ts::signRefreshToken(userId: string): Promise<string>
  - 调用方: POST /api/v1/auth/login (L76), POST /api/v1/auth/register (L60)
  - 算法: HS256 (jose), 过期 30d
  - 副作用: 无

src/lib/auth.ts::hashPassword(password: string): Promise<string>
  - 调用方: POST /api/v1/auth/register (L40)
  - 算法: bcryptjs, saltRounds=10
  - 副作用: 无

src/lib/auth.ts::verifyPassword(password: string, hash: string): Promise<boolean>
  - 调用方: POST /api/v1/auth/login (L55)
  - 算法: bcryptjs.compare
  - 副作用: 无

src/lib/auth-edge.ts::verifyToken(token: string): Promise<JwtPayload | null>
  - 调用方: src/middleware.ts (L53), auth.ts (re-export), POST /api/v1/auth/refresh (L19)
  - 算法: HS256 (jose), 兼容 Edge Runtime
  - 副作用: 无

src/lib/errors.ts::errorResponse(error: unknown): Response
  - 调用方: ALL 17 Route Handlers (catch 块)
  - 多态: AppError 实例 → 按 code/statusCode 响应; Error 实例 → 500; 类 AppError 对象 → 按字段响应; 兜底 → 500
  - 副作用: console.error (非 AppError 时)

src/lib/errors.ts::AppError (class)
  - 子类: NotFoundError(404), ForbiddenError(403), UnauthorizedError(401), ValidationError(422)
  - 调用方: GET /api/v1/courses/[id] (L13), POST /api/v1/courses/[id]/publish (L9), GET /api/v1/orders/[id] (L11), GET /api/v1/schedules/[id] (L8)

src/lib/prisma.ts::prisma (PrismaClient singleton)
  - 调用方: ALL 5 Services + auth routes (直接)
  - 模式: globalThis 缓存 (dev 环境避免 HMR 导致连接泄漏)
  - 副作用: 数据库连接

src/lib/api-client.ts::apiClient<T>(path, options): Promise<T>
  - 调用方: ALL 10 Client Components (website + admin pages)
  - 行为: 自动附加 Authorization header, 401 → 清除 token 并跳转 /login
  - 副作用: localStorage 读写, window.location 跳转

src/lib/api-client.ts::formatMoney(cents: number): string
  - 调用方: 8 个前端页面 (所有展示金额的地方)
  - 格式: ¥X,XXX.XX (分转元)

src/lib/api-client.ts::STATUS_LABELS
  - 调用方: 5 个前端页面 (课程/订单/考勤状态展示)
  - 映射: 15 个状态码 → 中文标签
```

### 3.2 CLS 模块 (课程 + 排期)

```
src/lib/cls/course-service.ts::listCourses(params): Promise<{data,total,page,pageSize}>
  - 调用方: GET /api/v1/courses (L23)
  - 参数: tenantId, status?, category?, page, pageSize
  - SQL: findMany + count (并行), include creator + _count.schedules
  - 副作用: 无

src/lib/cls/course-service.ts::getCourseById(id, tenantId): Promise<Course | null>
  - 调用方: GET /api/v1/courses/[id] (L12)
  - include: creator, schedules (含 classroom, trainer), courseFundings (含 fundingType)
  - 副作用: 无

src/lib/cls/course-service.ts::createCourse(input, tenantId, createdBy): Promise<Course>
  - 调用方: POST /api/v1/courses (L51)
  - 默认: status='draft', coverImageUrl 自动生成 placeholder
  - 副作用: INSERT course

src/lib/cls/course-service.ts::updateCourse(id, input, tenantId): Promise<Course>
  - 调用方: PUT /api/v1/courses/[id] (L34)
  - 副作用: UPDATE course

src/lib/cls/course-service.ts::publishCourse(id, tenantId): Promise<Course | null>
  - 调用方: POST /api/v1/courses/[id]/publish (L8)
  - 校验: status 必须为 'draft'
  - 副作用: UPDATE course SET status='published', publishedAt=now()

src/lib/cls/course-service.ts::archiveCourse(id, tenantId): Promise<Course>
  - 调用方: POST /api/v1/courses/[id]/archive (L8)
  - 校验: 无 (任何状态可归档)
  - 副作用: UPDATE course SET status='archived', archivedAt=now()

src/lib/cls/schedule-service.ts::listSchedulesByCourse(courseId, tenantId): Promise<Schedule[]>
  - 调用方: GET /api/v1/courses/[id]/schedules (L9)
  - 副作用: 无

src/lib/cls/schedule-service.ts::listAllSchedules(params): Promise<{data,total,page,pageSize}>
  - 调用方: GET /api/v1/schedules (L9)
  - 筛选: status, courseId, startDate~endDate 范围
  - 副作用: 无

src/lib/cls/schedule-service.ts::getScheduleById(id): Promise<Schedule | null>
  - 调用方: GET /api/v1/schedules/[id] (L7)
  - include: course, classroom, trainer
  - 副作用: 无

src/lib/cls/schedule-service.ts::createSchedule(courseId, input): Promise<Schedule>
  - 调用方: POST /api/v1/courses/[id]/schedules (L26)
  - 默认: status='open'
  - 副作用: INSERT schedule

src/lib/cls/schedule-service.ts::updateSchedule(id, input): Promise<Schedule>
  - 调用方: PUT /api/v1/schedules/[id] (L18)
  - 注意: 无 tenantId 校验 (TODO: 补 tenant isolation)
  - 副作用: UPDATE schedule

src/lib/cls/schedule-service.ts::cancelSchedule(id, reason?): Promise<Schedule>
  - 调用方: POST /api/v1/schedules/[id]/cancel (L8)
  - 注意: 无状态前置校验 (任何状态可取消, TODO)
  - 副作用: UPDATE schedule SET status='cancelled', cancellationReason=reason

src/lib/cls/schedule-service.ts::getCalendarView(tenantId, start, end): Promise<Schedule[]>
  - 调用方: GET /api/v1/schedules/calendar (L11)
  - 筛选: 时间范围 + status != 'cancelled'
  - 副作用: 无
```

### 3.3 Billing 模块 (订单 + 支付)

```
src/lib/billing/order-service.ts::createOrder(params): Promise<Order>
  - 调用方: POST /api/v1/orders (L43)
  - 校验: 排期存在性, status='open' only, enrolledCount < capacity (非原子, 见风险标注)
  - 计算: originalAmount = sum(unitPrice or course.basePrice)
  - 副作用: INSERT order + N 条 order_items (非事务)
  - 超时: expiresAt = now + 15min

src/lib/billing/order-service.ts::getOrderById(id): Promise<Order | null>
  - 调用方: GET /api/v1/orders/[id] (L10)
  - include: buyer, operator, orderItems.schedule.course, payments, refunds
  - 副作用: 无

src/lib/billing/order-service.ts::listOrders(params): Promise<{data,total,page,pageSize}>
  - 调用方: GET /api/v1/orders (L15)
  - 筛选: tenantId (必须), userId, status, channel
  - 副作用: 无

src/lib/billing/order-service.ts::cancelOrder(id): Promise<Order>
  - 调用方: POST /api/v1/orders/[id]/cancel (L7)
  - 校验: status 必须为 'pending'
  - 副作用: UPDATE order SET status='cancelled'

src/lib/billing/order-service.ts::expireOverdueOrders(): Promise<number>
  - 调用方: GET /api/v1/orders/[id] (L8, 每次查订单详情时自动调用)
  - 行为: UPDATE ALL pending orders WHERE expiresAt < now → SET status='expired'
  - 副作用: 批量 UPDATE

src/lib/billing/payment-service.ts::processMockPayment(orderId, method): Promise<{success,transactionId,orderId}>
  - 调用方: POST /api/v1/payment/mock-callback (L19)
  - 事务: prisma.$transaction (5 步原子操作)
  - 步骤: (1) UPDATE order→paid (2) CREATE payment (3) FOR EACH item→CREATE enrollment (4) FOR EACH item→UPDATE schedule.enrolledCount++ (5) CREATE notification×N
  - 副作用: 写入 5 张表, 影响 enrolledCount 并发安全
```

### 3.4 CA 模块 (考勤)

```
src/lib/ca/attendance-service.ts::markAttendance(params): Promise<Attendance>
  - 调用方: POST /api/v1/attendance (L33)
  - 行为: upsert 模式 (先 findFirst, 有则 update, 无则 create)
  - 副作用: INSERT or UPDATE attendance

src/lib/ca/attendance-service.ts::batchMarkAttendance(params): Promise<{count}>
  - 调用方: POST /api/v1/attendance/batch (L15)
  - 行为: 逐条 upsert (非事务, 非批量 SQL)
  - 副作用: N 次 INSERT/UPDATE attendance

src/lib/ca/attendance-service.ts::getAttendanceRoster(scheduleId): Promise<RosterEntry[]>
  - 调用方: GET /api/v1/schedules/[id]/attendance/roster (L7)
  - 查询: enrollments (active) LEFT JOIN attendances (in-memory Map merge)
  - 副作用: 无

src/lib/ca/attendance-service.ts::listAttendance(params): Promise<{data,total,page,pageSize}>
  - 调用方: GET /api/v1/attendance (L8)
  - 筛选: scheduleId, userId
  - 副作用: 无
```

---

## 4. 状态机位置

### 4.1 订单状态机 (Order)

```
状态: pending → paid → (partial_refunded → refunded)
       ↓         ↓
    cancelled   expired
       ↑
   (仅从pending)

状态转换代码位置:
┌──────────────────────────────────────────────────────────────────┐
│ 转换                     │ 文件:行号            │ 触发条件       │
├──────────────────────────┼──────────────────────┼────────────────┤
│ pending → paid           │ payment-service.ts:22│ 支付回调成功   │
│                          │ (tx.order.update)    │                │
├──────────────────────────┼──────────────────────┼────────────────┤
│ pending → cancelled      │ order-service.ts:136 │ 手动取消       │
│                          │ (cancelOrder)        │                │
├──────────────────────────┼──────────────────────┼────────────────┤
│ pending → expired        │ order-service.ts:146 │ 超过 expiresAt │
│                          │ (expireOverdueOrders)│                │
├──────────────────────────┼──────────────────────┼────────────────┤
│ (创建时设置 pending)      │ order-service.ts:59  │ createOrder    │
└──────────────────────────────────────────────────────────────────┘

未实现的状态转换:
  paid → partial_refunded   (Phase 2: Refund 模块)
  partial_refunded → refunded (Phase 2: Refund 模块)
```

### 4.2 课程状态机 (Course)

```
状态: draft → published → archived
                ↑____________↓
              (当前不可逆, 归档后不回退)

状态转换代码位置:
┌──────────────────────────────────────────────────────────────────┐
│ 转换                     │ 文件:行号            │ 触发条件       │
├──────────────────────────┼──────────────────────┼────────────────┤
│ (创建) → draft           │ course-service.ts:68 │ createCourse   │
├──────────────────────────┼──────────────────────┼────────────────┤
│ draft → published        │ course-service.ts:96 │ publishCourse  │
│                          │ (publishedAt=now)    │                │
├──────────────────────────┼──────────────────────┼────────────────┤
│ * → archived             │ course-service.ts:107│ archiveCourse  │
│                          │ (archivedAt=now)     │ (无前置校验)   │
│                          │                      │ ⚠风险: 任何    │
│                          │                      │ 状态可归档     │
└──────────────────────────────────────────────────────────────────┘
```

### 4.3 排期状态机 (Schedule)

```
状态: draft → open → full / completed / cancelled
         (创建默认open, 不使用draft)

状态转换代码位置:
┌──────────────────────────────────────────────────────────────────┐
│ 转换                     │ 文件:行号            │ 触发条件       │
├──────────────────────────┼──────────────────────┼────────────────┤
│ (创建) → open            │ schedule-service.ts:89│ createSchedule │
├──────────────────────────┼──────────────────────┼────────────────┤
│ * → cancelled            │ schedule-service.ts:112│ cancelSchedule │
│                          │                      │ ⚠风险: 无状态  │
│                          │                      │ 前置校验       │
├──────────────────────────┼──────────────────────┼────────────────┤
│ open → full              │ 隐式: payment-      │ enrolledCount  │
│                          │ service.ts:55       │ >= capacity    │
│                          │ (无显式状态转换,    │ ⚠风险: 逻辑    │
│                          │  仅 enrolledCount++) │ 缺失          │
├──────────────────────────┼──────────────────────┼────────────────┤
│ → completed              │ 未实现              │ Phase 2 定时   │
│                          │                      │ 任务/手动      │
└──────────────────────────────────────────────────────────────────┘
```

### 4.4 Enrollment 状态机

```
状态: active → refunded / dropped / transferred
         (创建默认active)

状态转换代码位置:
┌──────────────────────────────────────────────────────────────────┐
│ 转换                     │ 文件:行号            │ 触发条件       │
├──────────────────────────┼──────────────────────┼────────────────┤
│ (创建) → active          │ payment-service.ts:48│ 支付成功时     │
│                          │ (tx.enrollment.create)│                │
├──────────────────────────┼──────────────────────┼────────────────┤
│ active → refunded        │ 未实现              │ Phase 2: Refund │
│ active → dropped         │ 未实现              │ Phase 3: 退课   │
│ active → transferred     │ 未实现              │ Phase 3: 转班   │
└──────────────────────────────────────────────────────────────────┘
```

### 4.5 考勤状态 (Attendance)

```
状态: present / absent / late / early_leave / excused
      (无状态机, 直接写入, 通过 upsert 覆盖)

代码位置:
  markAttendance:     attendance-service.ts:7  (单条 upsert)
  batchMarkAttendance: attendance-service.ts:34 (逐条 upsert)
```

### 4.6 支付状态 (Payment)

```
状态: pending → success / failed
        (创建默认success, 无 pending 中间态)

代码位置:
  processMockPayment: payment-service.ts:32 (tx.payment.create, status='success')
  ⚠ 注意: Schema 定义有 pending/success/failed, 但 Phase 1 始终创建 success
```

---

## 5. 共享基础设施

### 5.1 错误处理

**文件:** `src/lib/errors.ts`

**导出:**
| 符号 | 类型 | 用途 |
|------|------|------|
| `AppError` | class | 基类 (code, message, statusCode) |
| `NotFoundError` | class extends AppError | 404 资源不存在 |
| `ForbiddenError` | class extends AppError | 403 无权限 |
| `UnauthorizedError` | class extends AppError | 401 未认证 |
| `ValidationError` | class extends AppError | 422 参数校验失败 |
| `errorResponse` | function(error) => Response | 统一错误序列化 |

**@usedBy (17 个调用方):**
- `POST /api/v1/auth/login` (L91)
- `POST /api/v1/auth/register` (L79)
- `GET /api/v1/auth/me` (L49)
- `POST /api/v1/auth/refresh` (L50)
- `GET,POST /api/v1/courses` (L32, L54)
- `GET,PUT /api/v1/courses/[id]` (L16, L37)
- `POST /api/v1/courses/[id]/publish` (L12)
- `POST /api/v1/courses/[id]/archive` (L11)
- `GET,POST /api/v1/courses/[id]/schedules` (L12, L29)
- `GET /api/v1/schedules` (L20)
- `GET,PUT /api/v1/schedules/[id]` (L10, L21)
- `POST /api/v1/schedules/[id]/cancel` (L11)
- `GET /api/v1/schedules/calendar` (L14)
- `GET /api/v1/schedules/[id]/attendance/roster` (L10)
- `GET,POST /api/v1/orders` (L25, L53)
- `GET /api/v1/orders/[id]` (L20)
- `POST /api/v1/orders/[id]/cancel` (L10)
- `POST /api/v1/payment/mock-callback` (L22)
- `GET,POST /api/v1/attendance` (L16, L40)
- `POST /api/v1/attendance/batch` (L18)

### 5.2 认证系统

| 文件 | 导出 | 用途 | Runtime | @usedBy |
|------|------|------|---------|---------|
| `src/lib/auth.ts` | `signAccessToken` | 签发 JWT (24h) | Node.js | login, register, refresh |
| `src/lib/auth.ts` | `signRefreshToken` | 签发 JWT (30d) | Node.js | login, register |
| `src/lib/auth.ts` | `hashPassword` | bcrypt 哈希 | Node.js | register |
| `src/lib/auth.ts` | `verifyPassword` | bcrypt 比较 | Node.js | login |
| `src/lib/auth.ts` | `verifyToken` (re-export) | JWT 验证 | Edge | refresh, (via middleware) |
| `src/lib/auth-edge.ts` | `verifyToken` | JWT 验证 (Edge兼容) | Edge | middleware.ts |
| `src/lib/auth-edge.ts` | `JwtPayload` (interface) | {userId, role, tenantId} | -- | auth.ts, middleware.ts |
| `src/middleware.ts` | `middleware` | 全局 JWT 拦截 | Edge | ALL /api/* requests |

### 5.3 API 客户端

**文件:** `src/lib/api-client.ts`

| 导出 | 用途 | @usedBy |
|------|------|---------|
| `apiClient<T>(path, options)` | 前端 HTTP 封装, 自动 Token + 401处理 | 10 个 Client Components |
| `formatMoney(cents)` | 金额展示 (分转元) | 8 个前端页面 |
| `STATUS_LABELS` | 状态码→中文映射表 | 5 个前端页面 |

**@usedBy (精确列表):**
- `src/app/(admin)/admin/courses/page.tsx` (L5)
- `src/app/(admin)/admin/courses/new/page.tsx` (L5)
- `src/app/(admin)/admin/courses/[id]/page.tsx` (L5)
- `src/app/(admin)/admin/orders/page.tsx` (L3)
- `src/app/(admin)/admin/attendance/[scheduleId]/page.tsx` (L5)
- `src/app/(website)/courses/page.tsx` (L5)
- `src/app/(website)/courses/[id]/page.tsx` (L6)
- `src/app/(website)/checkout/page.tsx` (L6)
- `src/app/(website)/payment/[orderId]/page.tsx` (L5)
- `src/app/(website)/account/orders/page.tsx` (L5)

### 5.4 校验器

| 文件 | 导出 | @usedBy |
|------|------|---------|
| `src/lib/validators/auth.ts` | `registerSchema`, `loginSchema`, `RegisterInput`, `LoginInput` | `POST /api/v1/auth/register` (L16), `POST /api/v1/auth/login` (L20) |
| `src/lib/validators/course.ts` | `createCourseSchema`, `updateCourseSchema`, `createScheduleSchema`, `CreateCourseInput`, `UpdateCourseInput`, `CreateScheduleInput` | `GET,POST /api/v1/courses` (L44), `PUT /api/v1/courses/[id]` (L27), `POST /api/v1/courses/[id]/schedules` (L19), `course-service.ts` (L2 type import), `schedule-service.ts` (L2 type import) |

### 5.5 类型定义

**文件:** `src/types/common.ts`

| 导出 | @usedBy (间接, 通过 Service 层) |
|------|-------------------------------|
| `ApiResponse<T>` | API Route 返回类型约束 |
| `PaginatedResponse<T>` | Service 返回类型 |
| `PaginationParams` | Service 入参类型 |
| `MoneyInCents` | 金额语义标注 |

---

## 6. 风险区域标注

### 6.1 CRITICAL: processMockPayment 事务

**文件:** `src/lib/billing/payment-service.ts` L8-L76
**风险等级:** CRITICAL

```
风险点:
1. $transaction 内 5 步操作, 任一步失败 → 全部回滚
2. 写入 5 张表: Order, Payment, Enrollment(N), Schedule(N), Notification(N)
3. enrolledCount++ 是在事务内做的, 但 createOrder 时的名额检查在外层(非原子)
4. 如果并发支付, enrolledCount 可能超过 capacity
5. 没有对 schedule 加悲观锁 (SQLite 不支持 SELECT ... FOR UPDATE 的完整语义)

修改注意事项:
- 任何对 $transaction 内容的修改必须保持原子性
- 如果新增表写入, 必须在事务内完成
- 不要在此函数外做关联写入
- enrolledCount 的并发问题需要在 createOrder + processMockPayment 之间引入乐观锁
```

### 6.2 CRITICAL: middleware.ts 全局拦截

**文件:** `src/middleware.ts` L1-L72
**风险等级:** CRITICAL

```
风险点:
1. 影响 100% 的 /api/* 请求
2. PUBLIC_PREFIXES 白名单配置不当 = 所有 API 拒绝服务
3. verifyToken 每次请求都执行 JWT 解密 (性能)
4. x-user-id / x-tenant-id 通过 headers 传递, 下游未做签名验证
   → 如果绕过 middleware 直接访问 Route Handler, tenantId 默认为 'tenant-001'
   → 所有 Route Handler 无二次认证

修改注意事项:
- 新增 API 路径必须明确其认证策略
- 修改 PUBLIC_PREFIXES 前确认安全影响
- 不要在 middleware 中做数据库查询 (Edge Runtime 限制)
- 修改 x-user-* 注入逻辑前, 需同步检查所有 Route Handler 的读取方式
```

### 6.3 HIGH: createOrder 并发名额问题

**文件:** `src/lib/billing/order-service.ts` L16-L69
**风险等级:** HIGH

```
风险点:
1. 名额检查 (L36) 和 实际占用 (在 processMockPayment L55) 不在同一事务
2. 两个学员同时创建订单 → 都通过名额检查 → 支付后 enrolledCount 超 capacity
3. 没有对 schedule 加锁
4. 排期状态检查 (L35) 仅检查 'open', 未检查 'full'

攻击场景:
  A 和 B 同时下单最后一个名额 → 两人都成功 → enrolledCount > capacity

修复方向:
  - 创建订单时使用乐观锁 (version 字段) 或
  - 在 processMockPayment 事务内再次检查 enrolledCount < capacity
  - 当前 SQLite 限制: 不支持行级锁, 需在应用层实现
```

### 6.4 HIGH: createOrder 非事务写入

**文件:** `src/lib/billing/order-service.ts` L48-L68
**风险等级:** HIGH

```
风险点:
1. order.create 和 orderItems.create 使用嵌套 create 语法, 由 Prisma 保证原子性
2. 但排期验证 (L29-L45) 在创建前进行, 验证和写入之间无锁
3. 如果 Prisma 嵌套 create 失败, 不会回滚已验证的排期状态 (虽然未修改数据库)

当前状态: Prisma 嵌套 create 提供了一定原子性, 但验证-写入间隙是主要风险
```

### 6.5 MEDIUM: $transaction 位置汇总

所有使用事务或应使用事务的位置:

| 文件:行号 | 函数 | 事务方式 | 表数 |
|-----------|------|---------|------|
| `payment-service.ts:20` | `processMockPayment` | `prisma.$transaction` | 5 张表 |
| `order-service.ts:48` | `createOrder` | Prisma 嵌套 create (隐式事务) | 2 张表 |

应使用事务但未使用的位置:
| 文件:行号 | 函数 | 当前写入 | 建议 |
|-----------|------|---------|------|
| `attendance-service.ts:34` | `batchMarkAttendance` | 逐条 upsert (N 次SQL) | 应使用 $transaction 或 createMany/updateMany |

### 6.6 MEDIUM: cancelSchedule 无状态前置校验

**文件:** `src/lib/cls/schedule-service.ts` L109-L114
**风险等级:** MEDIUM

```
风险点:
1. 任何状态的排期都可以被取消 (包括已 cancelled, 已 completed)
2. 取消已报名的排期时不处理 enrollment 状态
3. 不通知已报名学员

影响:
  - cancelled → cancelled (幂等, 但应拒绝)
  - completed → cancelled (已完成被取消, 数据不一致)
```

### 6.7 MEDIUM: archiveCourse 无状态前置校验

**文件:** `src/lib/cls/course-service.ts` L104-L109
**风险等级:** MEDIUM

```
风险点:
1. 任何状态的课程都可以归档 (包括 draft)
2. 已归档课程仍有排期处于 open 状态 → 孤儿排期

影响:
  - 已归档的课程仍然可以被报名 (排期 open)
  - 前端未过滤 archived 课程的排期
```

### 6.8 LOW: refresh route 动态 import prisma

**文件:** `src/app/api/v1/auth/refresh/route.ts` L29
**风险等级:** LOW

```
风险点:
1. 使用动态 import('@/lib/prisma') 而非顶层 import
2. 原因: refresh token 只有 userId, 需要查库获取最新 role/tenantId
3. 动态 import 每次创建新的模块实例? No, Node.js 模块缓存保证单例
4. 但代码风格不一致, 且与 auth.ts 的静态 import 形成对比

影响: 无实际风险, 但代码风格不一致
```

### 6.9 INFO: 缺少 tenant isolation 的位置

以下位置未使用 tenantId 做查询过滤, 可能导致跨租户数据泄露:

| 文件:行号 | 函数 | 风险 |
|-----------|------|------|
| `schedule-service.ts:67` | `getScheduleById` | 未校验 tenantId, 任意租户可查其他租户排期 |
| `schedule-service.ts:98` | `updateSchedule` | 未校验 tenantId |
| `schedule-service.ts:109` | `cancelSchedule` | 未校验 tenantId |
| `order-service.ts:75` | `getOrderById` | 未校验 tenantId |
| `order-service.ts:132` | `cancelOrder` | 未校验 tenantId |
| `attendance-service.ts:68` | `getAttendanceRoster` | 未校验 tenantId |

这些函数依赖 middleware 注入的 x-tenant-id, 但 Service 层未将其作为参数传入, 导致直接调用 Service 时无隔离保护。

---

## 附录 A: 快速查找索引

### 按功能查找

| 功能关键词 | 主要文件 | 辅助文件 |
|-----------|---------|---------|
| 登录/注册 | `auth/login/route.ts`, `auth/register/route.ts` | `auth.ts`, `validators/auth.ts` |
| Token 刷新 | `auth/refresh/route.ts` | `auth.ts`, `auth-edge.ts` |
| 用户信息 | `auth/me/route.ts` | -- |
| 课程 CRUD | `cls/course-service.ts`, `courses/route.ts`, `courses/[id]/route.ts` | `validators/course.ts` |
| 课程发布 | `courses/[id]/publish/route.ts` | `course-service.ts::publishCourse` |
| 课程归档 | `courses/[id]/archive/route.ts` | `course-service.ts::archiveCourse` |
| 排期 CRUD | `cls/schedule-service.ts`, `schedules/route.ts`, `schedules/[id]/route.ts` | `courses/[id]/schedules/route.ts` |
| 排期取消 | `schedules/[id]/cancel/route.ts` | `schedule-service.ts::cancelSchedule` |
| 日历视图 | `schedules/calendar/route.ts` | `schedule-service.ts::getCalendarView` |
| 创建订单 | `orders/route.ts` (POST) | `order-service.ts::createOrder` |
| 订单列表 | `orders/route.ts` (GET) | `order-service.ts::listOrders` |
| 订单详情 | `orders/[id]/route.ts` | `order-service.ts::getOrderById` |
| 取消订单 | `orders/[id]/cancel/route.ts` | `order-service.ts::cancelOrder` |
| 支付回调 | `payment/mock-callback/route.ts` | `payment-service.ts::processMockPayment` |
| 考勤签到 | `attendance/route.ts` | `attendance-service.ts::markAttendance` |
| 批量签到 | `attendance/batch/route.ts` | `attendance-service.ts::batchMarkAttendance` |
| 考勤花名册 | `schedules/[id]/attendance/roster/route.ts` | `attendance-service.ts::getAttendanceRoster` |
| 中间件认证 | `middleware.ts` | `auth-edge.ts` |

### 按模块所有者

| 模块 | 所有文件 | 函数数 | API Route 数 |
|------|---------|--------|-------------|
| Auth | `auth.ts`, `auth-edge.ts`, `validators/auth.ts`, 4 route files | 6 | 4 |
| CLS (课程+排期) | `course-service.ts`, `schedule-service.ts`, `validators/course.ts`, 9 route files | 12 | 7 |
| Billing (订单+支付) | `order-service.ts`, `payment-service.ts`, 4 route files | 6 | 4 |
| CA (考勤) | `attendance-service.ts`, 2 route files | 4 | 2 |
| Infrastructure | `prisma.ts`, `errors.ts`, `middleware.ts`, `api-client.ts`, `types/common.ts` | -- | -- |

---

## 附录 B: 数据库表关系速查

```
Tenant (1) ──────< (N) User
Tenant (1) ──────< (N) Course
Tenant (1) ──────< (N) Order
Course (1) ──────< (N) Schedule
Schedule (1) ────< (N) Enrollment >──── (1) User
Schedule (1) ────< (N) OrderItem >────── (1) Order
Schedule (1) ────< (N) Attendance >───── (1) User
Order (1) ───────< (N) Payment
Order (1) ───────< (N) Enrollment
Order (1) ───────< (N) OrderItem
```

---
*文档结束 | 共 52 个文件, 17 个 API Route, 5 个 Service, 22 个导出函数*
