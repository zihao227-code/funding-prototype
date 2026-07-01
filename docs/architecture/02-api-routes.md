# API 路由清单 v1.0 (Phase 1)

> 最后更新: 2026-07-01
> 基准路径: `src/app/api/v1/`
> Phase 1 范围: Auth + UEM + CLS + Billing + CA

---

## 路由结构总览

```
src/app/api/v1/
├── auth/                        # 认证
│   ├── login/route.ts           POST
│   ├── register/route.ts        POST
│   ├── refresh/route.ts         POST
│   └── me/route.ts              GET
│
├── users/                       # UEM - 用户管理
│   ├── route.ts                 GET  (列表)
│   └── [id]/
│       ├── route.ts             GET, PUT
│       └── profile-360/
│           └── route.ts         GET
│
├── courses/                     # CLS - 课程管理
│   ├── route.ts                 GET (列表), POST (创建)
│   └── [id]/
│       ├── route.ts             GET, PUT, DELETE
│       ├── publish/
│       │   └── route.ts         POST
│       ├── archive/
│       │   └── route.ts         POST
│       └── schedules/
│           ├── route.ts         GET (列表), POST (创建排期)
│           └── [scheduleId]/
│               └── route.ts     GET, PUT, DELETE
│
├── schedules/                   # CLS - 排期管理 (顶层操作)
│   ├── route.ts                 GET (全部排期列表)
│   ├── calendar/
│   │   └── route.ts             GET (日历视图)
│   └── [id]/
│       ├── route.ts             GET, PUT, DELETE
│       ├── cancel/
│       │   └── route.ts         POST
│       └── enrollments/
│           └── route.ts         GET (班次学员列表)
│
├── classrooms/                  # CLS - 教室管理
│   ├── route.ts                 GET, POST
│   └── [id]/
│       └── route.ts             GET, PUT, DELETE
│
├── orders/                      # Billing - 订单管理
│   ├── route.ts                 GET (列表), POST (创建)
│   └── [id]/
│       ├── route.ts             GET (详情)
│       ├── pay/
│       │   └── route.ts         POST (发起支付)
│       └── cancel/
│           └── route.ts         POST (取消订单)
│
├── payment/                     # Billing - 支付
│   ├── mock-callback/
│   │   └── route.ts             POST (Mock支付回调)
│   └── status/
│       └── [orderId]/
│           └── route.ts         GET (查询支付状态)
│
└── attendance/                  # CA - 考勤管理
    ├── route.ts                 GET (列表), POST (创建)
    ├── batch/
    │   └── route.ts             POST (批量签到)
    └── [id]/
        ├── route.ts             GET, PUT
        └── roster/
            └── route.ts         GET (某班次花名册)
```

---

## 完整路由清单 (按模块)

### AUTH -- 认证

| # | 方法 | 路径 | 路由文件 | 认证 | 角色 | 说明 |
|---|------|------|--------|------|------|------|
| A1 | `POST` | `/api/v1/auth/login` | `src/app/api/v1/auth/login/route.ts` | 否 | 全部 | 手机号+密码登录，返回 JWT access_token + refresh_token |
| A2 | `POST` | `/api/v1/auth/register` | `src/app/api/v1/auth/register/route.ts` | 否 | 全部 | 学员自助注册 (仅允许 learner 角色) |
| A3 | `POST` | `/api/v1/auth/refresh` | `src/app/api/v1/auth/refresh/route.ts` | 否 | 全部 | 刷新 access_token |
| A4 | `GET`  | `/api/v1/auth/me` | `src/app/api/v1/auth/me/route.ts` | 是 | 全部 | 获取当前登录用户信息 (通过 JWT payload) |

**请求/响应摘要:**

```typescript
// POST /api/v1/auth/login
// Body: { phone: string; password: string }
// Response: { accessToken: string; refreshToken: string; user: { id, displayName, role, tenantId } }

// POST /api/v1/auth/register
// Body: { phone: string; email?: string; password: string; displayName: string; tenantId: string }
// Response: { id: string; displayName: string; role: "learner" }

// POST /api/v1/auth/refresh
// Body: { refreshToken: string }
// Response: { accessToken: string }

// GET /api/v1/auth/me
// Headers: Authorization: Bearer <accessToken>
// Response: { id, displayName, role, phone, email, avatar, tenantId, tenantName }
```

---

### UEM -- 用户管理

| # | 方法 | 路径 | 路由文件 | 认证 | 角色 | 说明 |
|---|------|------|--------|------|------|------|
| U1 | `GET`  | `/api/v1/users` | `src/app/api/v1/users/route.ts` | 是 | editor, desk | 用户列表 (分页/搜索/角色筛选) |
| U2 | `GET`  | `/api/v1/users/[id]` | `src/app/api/v1/users/[id]/route.ts` | 是 | editor, desk, learner(本人) | 用户详情 |
| U3 | `PUT`  | `/api/v1/users/[id]` | `src/app/api/v1/users/[id]/route.ts` | 是 | editor, desk, learner(本人) | 更新用户信息 |
| U4 | `GET`  | `/api/v1/users/[id]/profile-360` | `src/app/api/v1/users/[id]/profile-360/route.ts` | 是 | editor, desk, learner(本人) | 学员360视图 (聚合订单/课程/证书/考勤) |

**Query 参数 (U1 列表):**
```
?role=learner&search=李明&page=1&pageSize=20&status=active
```

---

### CLS -- 课程系统

#### 课程

| # | 方法 | 路径 | 路由文件 | 认证 | 角色 | 说明 |
|---|------|------|--------|------|------|------|
| C1 | `GET`  | `/api/v1/courses` | `src/app/api/v1/courses/route.ts` | 否(Website) | 全部 | 课程列表。Website: 仅 published；Admin: 全部 (含 filter) |
| C2 | `POST` | `/api/v1/courses` | `src/app/api/v1/courses/route.ts` | 是 | editor | 创建课程 |
| C3 | `GET`  | `/api/v1/courses/[id]` | `src/app/api/v1/courses/[id]/route.ts` | 否(Website) | 全部 | 课程详情。Website: 仅 published；Admin: 全部 |
| C4 | `PUT`  | `/api/v1/courses/[id]` | `src/app/api/v1/courses/[id]/route.ts` | 是 | editor | 编辑课程 |
| C5 | `DELETE` | `/api/v1/courses/[id]` | `src/app/api/v1/courses/[id]/route.ts` | 是 | editor | 删除课程 (仅 draft 状态可删除) |
| C6 | `POST` | `/api/v1/courses/[id]/publish` | `src/app/api/v1/courses/[id]/publish/route.ts` | 是 | editor | 发布课程 (draft/pending_review -> published) |
| C7 | `POST` | `/api/v1/courses/[id]/archive` | `src/app/api/v1/courses/[id]/archive/route.ts` | 是 | editor | 下架/归档课程 (published -> archived) |

#### 排期 (课程子资源)

| # | 方法 | 路径 | 路由文件 | 认证 | 角色 | 说明 |
|---|------|------|--------|------|------|------|
| C8 | `GET`  | `/api/v1/courses/[id]/schedules` | `.../courses/[id]/schedules/route.ts` | 否(Website) | 全部 | 某课程的全部排期。Website: 仅 open；Admin: 全部 |
| C9 | `POST` | `/api/v1/courses/[id]/schedules` | `.../courses/[id]/schedules/route.ts` | 是 | editor | 为课程创建排期/班次 |

#### 排期 (顶层操作)

| # | 方法 | 路径 | 路由文件 | 认证 | 角色 | 说明 |
|---|------|------|--------|------|------|------|
| S1 | `GET`  | `/api/v1/schedules` | `src/app/api/v1/schedules/route.ts` | 是 | editor, trainer | 全部排期列表 (支持筛选状态/课程/时间范围) |
| S2 | `GET`  | `/api/v1/schedules/calendar` | `src/app/api/v1/schedules/calendar/route.ts` | 否 | 全部 | 日历视图 (Query: ?start=...&end=...) |
| S3 | `GET`  | `/api/v1/schedules/[id]` | `src/app/api/v1/schedules/[id]/route.ts` | 否(Website) | 全部 | 排期详情 |
| S4 | `PUT`  | `/api/v1/schedules/[id]` | `src/app/api/v1/schedules/[id]/route.ts` | 是 | editor | 编辑排期 |
| S5 | `DELETE` | `/api/v1/schedules/[id]` | `src/app/api/v1/schedules/[id]/route.ts` | 是 | editor | 删除排期 (仅 draft 状态可删除) |
| S6 | `POST` | `/api/v1/schedules/[id]/cancel` | `src/app/api/v1/schedules/[id]/cancel/route.ts` | 是 | editor | 取消排期 (open -> cancelled, 含通知已报名学员) |
| S7 | `GET`  | `/api/v1/schedules/[id]/enrollments` | `src/app/api/v1/schedules/[id]/enrollments/route.ts` | 是 | editor, trainer | 查看班次已报名学员列表 |

#### 教室

| # | 方法 | 路径 | 路由文件 | 认证 | 角色 | 说明 |
|---|------|------|--------|------|------|------|
| R1 | `GET`  | `/api/v1/classrooms` | `src/app/api/v1/classrooms/route.ts` | 是 | editor | 教室列表 |
| R2 | `POST` | `/api/v1/classrooms` | `src/app/api/v1/classrooms/route.ts` | 是 | editor | 创建教室 |
| R3 | `GET`  | `/api/v1/classrooms/[id]` | `src/app/api/v1/classrooms/[id]/route.ts` | 是 | editor | 教室详情 |
| R4 | `PUT`  | `/api/v1/classrooms/[id]` | `src/app/api/v1/classrooms/[id]/route.ts` | 是 | editor | 编辑教室 |
| R5 | `DELETE` | `/api/v1/classrooms/[id]` | `src/app/api/v1/classrooms/[id]/route.ts` | 是 | editor | 删除教室 |

---

### Billing -- 支付结算

| # | 方法 | 路径 | 路由文件 | 认证 | 角色 | 说明 |
|---|------|------|--------|------|------|------|
| B1 | `POST` | `/api/v1/orders` | `src/app/api/v1/orders/route.ts` | 是 | learner, desk | 创建订单 (统一入口)。Body: { scheduleIds, channel } |
| B2 | `GET`  | `/api/v1/orders` | `src/app/api/v1/orders/route.ts` | 是 | editor, desk, learner(本人) | 订单列表。Editor/Desk: 全机构; Learner: 仅自己 |
| B3 | `GET`  | `/api/v1/orders/[id]` | `src/app/api/v1/orders/[id]/route.ts` | 是 | editor, desk, learner(本人) | 订单详情 (含 orderItems + payments) |
| B4 | `POST` | `/api/v1/orders/[id]/pay` | `src/app/api/v1/orders/[id]/pay/route.ts` | 是 | learner, desk | 发起支付。Body: { paymentMethod }。返回跳转/扫码信息 |
| B5 | `POST` | `/api/v1/orders/[id]/cancel` | `src/app/api/v1/orders/[id]/cancel/route.ts` | 是 | learner(本人), desk, editor | 取消订单 (仅 pending 状态) |
| B6 | `POST` | `/api/v1/payment/mock-callback` | `src/app/api/v1/payment/mock-callback/route.ts` | 否 | 全部 | Mock 支付回调。Body: { orderId, method, success } |
| B7 | `GET`  | `/api/v1/payment/status/[orderId]` | `src/app/api/v1/payment/status/[orderId]/route.ts` | 是 | learner, desk | 查询支付状态 |

**关键接口签名:**

```typescript
// POST /api/v1/orders
// Body: { scheduleIds: string[]; channel: "online" | "desk"; couponCode?: string }
// Response: { id, orderNumber, originalAmount, discountAmount, payableAmount, expiresAt, status }

// POST /api/v1/payment/mock-callback
// Body: { orderId: string; method: "wechat" | "alipay" | "cash"; success: boolean }
// Response: { success: true; transactionId: string; enrollments: [...]; payment: {...} }
//          | { success: false; error: string }
```

---

### CA -- 上课管理

| # | 方法 | 路径 | 路由文件 | 认证 | 角色 | 说明 |
|---|------|------|--------|------|------|------|
| T1 | `GET`  | `/api/v1/attendance` | `src/app/api/v1/attendance/route.ts` | 是 | editor, desk, trainer, learner(本人) | 考勤记录列表 (支持筛选排期/学员/日期) |
| T2 | `POST` | `/api/v1/attendance` | `src/app/api/v1/attendance/route.ts` | 是 | trainer, desk | 单条签到。Body: { scheduleId, userId, status, checkInMethod } |
| T3 | `POST` | `/api/v1/attendance/batch` | `src/app/api/v1/attendance/batch/route.ts` | 是 | trainer, desk | 批量签到。Body: { scheduleId, records: [{ userId, status }] } |
| T4 | `GET`  | `/api/v1/attendance/[id]` | `src/app/api/v1/attendance/[id]/route.ts` | 是 | editor, trainer | 单条考勤详情 |
| T5 | `PUT`  | `/api/v1/attendance/[id]` | `src/app/api/v1/attendance/[id]/route.ts` | 是 | trainer, editor | 修改考勤状态 |
| T6 | `GET`  | `/api/v1/attendance/[scheduleId]/roster` | `src/app/api/v1/attendance/[scheduleId]/roster/route.ts` | 是 | trainer, desk, editor | 某班次全部学员的花名册+考勤状态。注意: `[scheduleId]` 是动态参数，实为 `[id]` 的子路由重命名 |

**更正:** T6 的实际路由结构应为:

| T6 | `GET`  | `/api/v1/schedules/[id]/attendance/roster` | `src/app/api/v1/schedules/[id]/attendance/roster/route.ts` | 是 | trainer, desk, editor | 某班次的考勤花名册 (学员列表+每人考勤状态) |

---

## 认证说明

| 标记 | 含义 |
|------|------|
| **"是"** | 必须在请求头携带 `Authorization: Bearer <accessToken>` |
| **"否"** | 公开接口，无需认证 |
| **"否(Website)"** | Website 公开接口，不强制认证；但在 Admin Console 调用时需认证 |

## 角色权限控制

每个 API 路由在 Route Handler 内部执行角色校验:

```typescript
// src/lib/auth.ts
export function requireRoles(...roles: UserRole[]) { ... }
export function requireAuth() { ... }
export function requireSelfOrRoles(userId: string, ...roles: UserRole[]) { ... }
```

## Phase 1 路由统计

| 模块 | 路由数量 |
|------|---------|
| Auth | 4 |
| UEM | 4 |
| CLS (Courses) | 7 |
| CLS (Schedules + Classrooms) | 10 |
| Billing | 7 |
| CA | 6 |
| **总计** | **38** |

## Phase 2-3 预留路由 (不在 Phase 1 实现)

以下路由文件可先创建占位 (返回 501 Not Implemented)，Phase 2/3 再填充实现:

```
# Phase 2 预留
POST   /api/v1/funding-types/...                 # 资助类型管理
POST   /api/v1/funding/calculate                  # 折扣引擎
POST   /api/v1/funding/applications/...            # 资助申请
POST   /api/v1/orders/[id]/refund                  # 退款
GET    /api/v1/discounts/coupons                   # 优惠券

# Phase 3 预留
POST   /api/v1/certificates/...                   # 证书管理
GET    /api/v1/certificates/verify/[number]        # 证书查验 (公开)
POST   /api/v1/assessments/...                    # 考核管理
POST   /api/v1/assessments/[id]/grade              # 批改
GET    /api/v1/notifications/...                   # 站内信
POST   /api/v1/notifications/send                  # 发送通知
```
