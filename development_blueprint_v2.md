# 教育培训机构全流程管理平台 —— 开发蓝图 v2.0

**版本：** v2.0
**日期：** 2026年7月1日
**基于：** v1.0蓝图 + 三Agent深度审查 + 3阶段务实规划
**用途：** 本地高保真原型开发执行手册

---

## 目录

1. [项目定位与目标](#1-项目定位与目标)
2. [三阶段开发计划](#2-三阶段开发计划)
3. [技术架构](#3-技术架构)
4. [数据模型](#4-数据模型)
5. [API设计](#5-api设计)
6. [业务流程](#6-业务流程)
7. [角色权限矩阵](#7-角色权限矩阵)
8. [前端路由结构](#8-前端路由结构)
9. [开发规范](#9-开发规范)
10. [种子数据设计](#10-种子数据设计)
11. [环境搭建与启动](#11-环境搭建与启动)

---

## 1. 项目定位与目标

### 1.1 一句话定位

> 线下培训机构的数字化经营原型系统，覆盖「课程创建→学员购买→上课考勤→结课」全链路，内置资助管理(Funding)差异化能力。

### 1.2 项目性质

- **类型**：本地高保真原型系统
- **受众**：自己演示使用，不给真实用户
- **运行方式**：本地 `npm run dev` 启动，单进程包含前后端
- **数据**：SQLite数据库 + 预置种子数据，完整演示全流程

### 1.3 核心原则

1. **核心链路优先**：先让数据从头流到尾，再做分支场景
2. **Funding是护城河**：Phase 2深度实现，不是占位
3. **单用户演示**：不考虑并发、高可用、生产安全
4. **Mock外部服务**：支付、短信、邮件全部本地模拟
5. **种子数据驱动**：每个Phase结束时，种子数据能独立跑通全部场景

### 1.4 角色定义

| 角色 | 职责 | Phase 1 |
|------|------|---------|
| **Editor** | 机构管理者。创建课程、排期、发布、查看报表 | ✅ |
| **Trainer** | 教师。查看课表、考勤签到、批改考核 | ✅ |
| **Learner** | 学员。浏览课程、下单购买、查看个人中心 | ✅ |
| **Desk** | 前台柜员。代购、收款、签到 | Phase 3 |

---

## 2. 三阶段开发计划

### 阶段总览

```
Phase 1: 核心链路打通 (当前)
  注册 → 创建课程 → 发布排期 → 学员浏览下单 → Mock支付 → 开通权限 → 上课考勤 → 结课
  
Phase 2: Funding + 退款
  配置资助协议 → 下单时自动计算折扣 → 开课前支持退款退课

Phase 3: 其余完善
  Desk代购、证书管理、通知中心、数据分析、工单
```

### 2.1 Phase 1 —— 核心链路打通

**目标**：一个学员可以从官网浏览课程、下单支付、开始上课、考勤签到、完成课程。整个数据流完整通畅。

#### Phase 1 模块范围

| 模块 | 做什么 | 不做什么 |
|------|--------|---------|
| **UEM** | 注册（手机号+邮箱）、登录（JWT）、4角色权限、学员档案CRUD | 家长绑定、审计日志、360视图 |
| **CLS** | 课程CRUD、排期CRUD、课程发布/下架、排期日历 | 课程版本管理、教室资源冲突检测、审核流程 |
| **Billing** | 统一订单创建、订单状态机（6状态）、Mock支付、自动开通权限 | 退款、真实支付、对账、优惠券 |
| **CA** | 考勤签到（手动标记+批量）、课程花名册 | 考核批改、证书、Trainer备课 |

#### Phase 1 前端范围

| 应用 | 路由组 | 核心页面 |
|------|--------|---------|
| **Website** | `(website)` | 首页课程列表、课程详情、排期选择、结算页、Mock支付页、个人中心、我的课程、我的订单 |
| **Admin** | `(admin)` | 课程管理（CRUD+排期）、订单管理、学员管理、考勤花名册 |

#### Phase 1 验收标准

准备种子数据覆盖以下故事线，无需手动操作数据库即可演示：

1. **J1 - 线上自助购买**：Learner Zhang San 浏览官网 → 注册 → 选择Python课程 → 下单 → Mock支付 → 自动开通权限
2. **J2 - 课程创建发布**：Editor 创建课程 → 设置排期 → 发布 → 学员端可见
3. **J3 - 上课考勤**：Trainer 查看课表 → 打开花名册 → 批量标记考勤（出勤/迟到/请假/缺勤）
4. **J4 - 订单超时**：创建订单后15分钟不支付 → 自动取消 → 释放名额（可选演示）

### 2.2 Phase 2 —— Funding + 退款

**目标**：Funding折扣引擎工作正常，学员购买时自动计算资助折扣。支持开课前退款。

#### Phase 2 新增模块

| 模块 | 做什么 |
|------|--------|
| **Funding** | 资助类型CRUD、课程关联资助、资格条件配置、折扣计算引擎 |
| **退款** | 退款申请→审批→执行（全额/部分退款）、名额释放、权限回收 |

#### Phase 2 验收标准

1. **J5 - Funding折扣购买**：Editor配置"政府补贴￥500"→关联Python课程→Learner下单时自动显示折扣明细→实付金额正确扣减
2. **J6 - Funding预算耗尽**：预算用完后，Learner看到"资助已用完"，需付全价
3. **J7 - 退款流程**：Learner申请退款→Editor审批→退款到账→名额释放→权限回收

### 2.3 Phase 3 —— 其余完善

| 模块 | 做什么 |
|------|--------|
| **Desk** | 前台工作台：快速下单（搜索学员→选课→收款→确认）、签到办理、今日课表 |
| **证书** | 证书模板、发放（唯一编号）、公开查验API、撤销 |
| **考核** | 创建考核/作业、批改、结果判定（通过/不通过） |
| **通知** | 站内信+Mock短信/邮件查看页 |
| **360视图** | 学员多维度数据聚合展示 |

---

## 3. 技术架构

### 3.1 技术栈

```
全栈框架  → Next.js 14+ (App Router)
语言      → TypeScript 5.x
UI组件库  → shadcn/ui + Tailwind CSS 3
数据库ORM → Prisma 5.x
数据库    → SQLite（开发/原型）
认证      → jose + bcryptjs（自建JWT）
表单验证  → Zod + React Hook Form
图表      → Recharts（Phase 3仪表盘）
```

### 3.2 不需要的中间件

```
✗ Redis        — 无需分布式锁/缓存
✗ PostgreSQL   — SQLite完全足够原型阶段
✗ 消息队列      — 同步调用即可
✗ Docker       — npm run dev 直接启动
✗ MinIO/OSS    — 本地文件系统/占位图
✗ Nginx        — Next.js自带服务
```

### 3.3 架构图

```
┌──────────────────────────────────────────┐
│        Next.js 单进程应用 (Port 3000)       │
│                                            │
│  ┌──────────────────────────────────┐     │
│  │  App Router (路由 + 页面)          │     │
│  │  ├── (website)/   学员官网         │     │
│  │  ├── (admin)/     管理后台         │     │
│  │  └── api/         API路由          │     │
│  ├──────────────────────────────────┤     │
│  │  Server Components / Server Actions│     │
│  │  (服务端渲染 + 数据变更)           │     │
│  ├──────────────────────────────────┤     │
│  │  src/lib/ (业务逻辑层)              │     │
│  │  ├── uem/       用户管理           │     │
│  │  ├── cls/       课程系统           │     │
│  │  ├── billing/   支付结算           │     │
│  │  ├── funding/   资助管理(P2)       │     │
│  │  ├── ca/        上课管理           │     │
│  │  └── mock/      Mock服务           │     │
│  ├──────────────────────────────────┤     │
│  │  Prisma Client → SQLite            │     │
│  │  (data/app.db 单文件数据库)        │     │
│  └──────────────────────────────────┘     │
└──────────────────────────────────────────┘
```

### 3.4 项目目录结构

```
funding-prototype/
├── prisma/
│   ├── schema.prisma          # 数据模型（单文件，所有表）
│   └── seed.ts                # 种子数据
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   ├── globals.css        # 全局样式
│   │   ├── (website)/         # Website路由组
│   │   ├── (admin)/           # Admin路由组
│   │   ├── (desk)/            # Desk路由组(P3)
│   │   └── api/               # API路由
│   ├── components/            # 共享UI组件
│   │   ├── ui/                # shadcn/ui基础组件
│   │   └── ...                # 业务组件
│   ├── lib/                   # 业务逻辑
│   │   ├── prisma.ts          # Prisma单例
│   │   ├── auth.ts            # JWT认证
│   │   ├── uem/               # 用户模块
│   │   ├── cls/               # 课程模块
│   │   ├── billing/           # 支付模块
│   │   ├── funding/           # 资助模块(P2)
│   │   ├── ca/                # 上课模块
│   │   └── mock/              # Mock服务
│   ├── types/                 # TypeScript类型
│   └── hooks/                 # React Hooks
├── data/                      # SQLite数据库文件
├── public/uploads/            # 本地上传文件
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### 3.5 模块间调用规则

```
规则1: 每个模块的 lib service 只导出纯函数
规则2: 模块间通过导入 service 函数通信，不直接访问 Prisma
规则3: 同步调用（原型不需要事件总线/消息队列）

示例：
  billing/order-service.ts
    → 导入 funding/discount-engine.ts 的 calculateDiscount()
    → 导入 cls/schedule-service.ts 的 lockSpot()
    → 返回完整的订单对象
```

---

## 4. 数据模型

> 完整Prisma Schema见 `prisma/schema.prisma`。此处仅列出核心实体关系和关键字段。

### 4.1 实体关系图

```
Tenant
  ├── 1:N ── User (role: editor/desk/trainer/learner)
  │           ├── 1:N ── Order (buyer)
  │           │           ├── 1:N ── OrderItem
  │           │           ├── 1:N ── Payment
  │           │           └── 1:N ── Refund
  │           ├── 1:N ── Enrollment
  │           ├── 1:N ── FundingApplication
  │           └── 1:N ── Attendance
  │
  ├── 1:N ── Course
  │           ├── 1:N ── Schedule
  │           │           ├── 1:N ── Enrollment
  │           │           └── 1:N ── Attendance
  │           ├── 1:N ── CourseFunding (N:M → FundingType)
  │           └── 1:N ── Assessment
  │                       └── 1:N ── Grade
  ├── 1:N ── FundingType
  │           └── 1:N ── CourseFunding
  ├── 1:N ── Certificate
  ├── 1:N ── DiscountRule
  └── 1:N ── Classroom
```

### 4.2 关键设计决策

#### 购物车：客户端状态，不建表

购物车数据存在客户端（localStorage 或 zustand）。学员在Website加课程→进入结算页→一次性创建订单。原型阶段不需要跨设备同步购物车。

#### Enrollment：支付成功时创建

订单支付成功后，后端自动为每个OrderItem创建对应的Enrollment记录：
```
Order.paid → 创建 Enrollment { userId, scheduleId, orderId, status: 'active' }
         → schedule.enrolledCount += 1
```

#### 订单超时：查询时动态判断

不依赖定时任务。查询订单时，对 `status='pending'` 的订单检查 `expiresAt < now()`，如果过期则返回 `status='expired'`（不修改数据库，下次update时才改）。

#### 多租户：预留字段，种子数据固定

所有表预留 `tenantId` 字段。原型阶段全部数据使用 `tenant-001`。API层从JWT payload获取tenantId。

#### 课程封面：占位图URL

Phase 1不实现文件上传。封面使用 `https://placehold.co/600x400?text=Course+Name`。Phase 3再加本地上传。

#### 首个管理员账户：种子数据直接插入

`user-editor` 在 `seed.ts` 中直接创建，跳过注册流程。

---

## 5. API设计

### 5.1 全局规范

- **URL前缀**：`/api/v1/`
- **请求/响应格式**：JSON
- **认证**：`Authorization: Bearer <JWT>`（除登录/注册外全部需要）
- **分页**：`?page=1&pageSize=20`
- **错误格式**：`{ error: { code: string, message: string } }`
- **成功响应**：直接返回数据或 `{ data: ..., total?: number }`（分页）

### 5.2 核心API清单

#### Auth（认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 注册 |
| POST | `/api/v1/auth/login` | 登录，返回JWT |
| POST | `/api/v1/auth/refresh` | 刷新Token |

#### Users（用户管理）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/users` | 用户列表（分页/筛选） |
| GET | `/api/v1/users/search?q=&by=phone|name` | 搜索用户（Desk代购用） |
| GET | `/api/v1/users/[id]` | 用户详情 |
| PUT | `/api/v1/users/[id]` | 更新用户 |
| GET | `/api/v1/users/me` | 当前登录用户信息 |

#### Courses（课程）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/courses` | 课程列表（Website只返回published） |
| POST | `/api/v1/courses` | 创建课程 |
| GET | `/api/v1/courses/[id]` | 课程详情 |
| PUT | `/api/v1/courses/[id]` | 更新课程 |
| POST | `/api/v1/courses/[id]/publish` | 发布课程 |
| POST | `/api/v1/courses/[id]/archive` | 下架课程 |

#### Schedules（排期）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/schedules?courseId=&startDate=&endDate=` | 排期列表 |
| POST | `/api/v1/schedules` | 创建排期 |
| GET | `/api/v1/schedules/[id]` | 排期详情（含剩余名额） |
| PUT | `/api/v1/schedules/[id]` | 更新排期 |
| POST | `/api/v1/schedules/[id]/cancel` | 取消排期 |
| GET | `/api/v1/schedules/[id]/roster` | 班次花名册 |

#### Orders（订单）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/orders` | 订单列表 |
| POST | `/api/v1/orders` | 创建订单 |
| GET | `/api/v1/orders/[id]` | 订单详情（含折扣明细） |
| POST | `/api/v1/orders/[id]/cancel` | 取消订单 |

#### Payment（支付 — Mock）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/payment/mock-callback` | Mock支付回调 |

#### Attendance（考勤）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/attendance?scheduleId=` | 某班次考勤列表 |
| POST | `/api/v1/attendance` | 单条签到 |
| POST | `/api/v1/attendance/batch` | 批量签到 |

### 5.3 折扣计算API

折扣计算统一入口在Billing模块（不在Funding模块），Phase 1先返回空折扣：

```
POST /api/v1/discounts/calculate  (Phase 1: 返回空数组，Phase 2: 调用Funding引擎)
```

---

## 6. 业务流程

> 以下仅列出Phase 1核心流程。完整18条流程见v1.0蓝图，Phase 2/3逐步激活。

### F1. 课程创建与发布

```
Editor登录Admin → 创建课程(草稿) → 填写信息 → 创建排期 → 发布课程
→ Website课程列表可见

状态: draft → published → archived
```

### F2. 线上自助购买

```
Learner浏览Website → 点击课程 → 查看详情/排期 → 选择班次 → 进入结算
→ 创建订单(status=pending, expiresAt=now+15min) → Mock支付 → 支付成功
→ 创建Enrollment + 更新schedule.enrolledCount → 跳转购买成功页

状态: pending → paid / expired / cancelled
```

### F3. 上课与考勤

```
Trainer登录 → 查看课表 → 打开某班次花名册 → 批量标记签到
→ 考勤状态: present/absent/late/early_leave/excused

结课: Editor/Schedule状态标记为completed
```

### F4. 订单超时

```
订单创建后15分钟未支付 → 下次查询或手动触发 → 状态变为expired
→ 释放schedule名额(enrolledCount -= 1，仅对status=pending的订单)
```

---

## 7. 角色权限矩阵

### 7.1 路由级权限（Phase 1）

| 路由组 | Editor | Trainer | Learner | Desk(P3) |
|--------|--------|---------|---------|----------|
| `(website)` 公开页面 | ✅ | ✅ | ✅ | ✅ |
| `(website)/account/*` | — | — | ✅(自己) | — |
| `(admin)/*` | ✅ | ✅(受限) | — | — |
| `(desk)/*` | — | — | — | P3 |

### 7.2 操作级权限（Phase 1，精简版）

| 操作 | Editor | Trainer | Learner |
|------|--------|---------|---------|
| 创建/编辑/发布课程 | ✅ | — | — |
| 管理排期 | ✅ | — | — |
| 查看已发布课程 | ✅ | ✅ | ✅ |
| 创建订单 | ✅ | — | ✅(自己) |
| 查看订单 | ✅(全部) | — | ✅(自己) |
| Mock支付 | ✅ | — | ✅(自己) |
| 考勤签到 | ✅ | ✅(自己的班) | — |
| 查看考勤 | ✅(全部) | ✅(自己的班) | ✅(自己) |
| 管理学员 | ✅ | — | — |

---

## 8. 前端路由结构

### Website `(website)` — `/`

```
/                          首页（课程列表+搜索）
/courses/[id]              课程详情（介绍/排期/关联资助）
/schedules/[id]            班次详情+报名
/checkout                  结算页（含折扣明细展示）
/payment/[orderId]         Mock支付页面
/login                     登录
/register                  注册
/account                   个人中心
/account/orders            我的订单
/account/courses           我的课程
```

### Admin `(admin)` — `/admin`

```
/admin                     仪表盘
/admin/courses             课程管理列表
/admin/courses/new         创建课程
/admin/courses/[id]        编辑课程
/admin/courses/[id]/schedules  排期管理
/admin/schedules/calendar  排期日历
/admin/orders              订单列表
/admin/orders/[id]         订单详情
/admin/users               学员列表
/admin/users/[id]          学员详情
/admin/attendance          考勤管理
/admin/attendance/[scheduleId]  班次花名册
```

### Desk `(desk)` — `/desk`（Phase 3）

```
/desk                      前台工作台
/desk/quick-order          快速下单
/desk/checkin              签到办理
/desk/today-schedules      今日课表
```

---

## 9. 开发规范

### 9.1 命名规范

| 类别 | 规范 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `course-service.ts` |
| React组件 | PascalCase | `CourseCard.tsx` |
| 函数/变量 | camelCase | `getCourseById` |
| 类型/接口 | PascalCase | `CreateCourseInput` |
| API路由 | kebab-case目录 | `mock-callback/route.ts` |
| 数据库表 | snake_case | `funding_application` |
| 数据库字段 | camelCase | `basePrice` |
| Prisma枚举值 | snake_case | `partial_refunded` |
| 主键 | cuid()字符串 | `id: String @id @default(cuid())` |

### 9.2 代码组织

- 每个 `src/lib/<module>/` 目录不超过10个文件
- 每个 service 文件只导出纯函数
- 类型定义集中在 `src/types/`
- API路由只做参数校验和调用service，不写业务逻辑
- 表单纯函式用 Zod schema 定义，集中在 `src/lib/validators/`

### 9.3 Git提交规范

```
feat: 新功能
fix: 修复
refactor: 重构
docs: 文档
chore: 杂项

示例：
feat: add course creation API and admin page
fix: order status not updating on mock payment
```

---

## 10. 种子数据设计

### 10.1 故事设定

> **"星光职业培训学校"** 是北京市朝阳区一家IT培训机构。校长张老师管理课程和排期，讲师赵师傅负责Python教学。学员李明通过官网自助购买Python课程，学员王芳来校咨询后由前台小红（P3）代购UI课程。

### 10.2 Phase 1 种子数据量

| 实体 | 数量 | 说明 |
|------|------|------|
| Tenant | 1 | 星光职业培训学校（id: `tenant-001`） |
| User | 6 | Editor×1, Trainer×1, Learner×3, Desk×1(P3用) |
| Course | 3 | Python全栈(￥1980)、UI设计(￥1680)、PMP认证(￥2980) |
| Schedule | 4 | 3门课程各至少1个班次 |
| Classroom | 2 | 301教室、302教室 |
| Order | 3 | 线上已支付、线下已支付(P3)、待支付超时 |
| OrderItem | 3 | 每个订单1条明细 |
| Payment | 2 | Mock微信支付、Mock现金(P3) |
| Enrollment | 3 | 对应已支付的订单 |
| Attendance | 6 | Python班3条、UI设计班3条 |

### 10.3 默认账号

| 角色 | 手机号 | 密码 | 姓名 |
|------|--------|------|------|
| Editor | 13800001001 | password123 | 张校长 |
| Trainer | 13800001003 | password123 | 赵师傅 |
| Learner | 13800001004 | password123 | 李明 |
| Learner | 13800001005 | password123 | 王芳 |
| Learner | 13800001006 | password123 | 陈强 |
| Desk | 13800001002 | password123 | 小红 |

---

## 11. 环境搭建与启动

### 11.1 前置条件

```bash
# 已具备 ✅
Node.js ≥ 18.x    (当前: v24.17.0)
npm               (当前: 11.13.0)
Git               (当前: 2.54.0)

# 不需要
✗ Docker (SQLite嵌入运行)
✗ Java   (Next.js替代Spring Boot)
```

### 11.2 首次启动

```bash
# 1. 进入项目目录
cd d:/funding/funding-prototype

# 2. 安装依赖
npm install

# 3. 初始化数据库（生成Prisma客户端 + 创建SQLite + 运行迁移）
npx prisma migrate dev --name init

# 4. 加载种子数据
npx prisma db seed

# 5. 启动开发服务器
npm run dev

# 6. 打开浏览器访问
# Website:  http://localhost:3000
# Admin:    http://localhost:3000/admin
# 数据库:   npx prisma studio  (打开 http://localhost:5555)
```

### 11.3 日常开发

```bash
npm run dev          # 启动（热重载，改代码自动刷新）
npx prisma studio    # 查看/修改数据库
npx prisma db seed   # 重新加载种子数据（会清空已有数据）
```

### 11.4 重置数据库

```bash
# 删除SQLite文件
rm data/app.db
# 或者
del data\app.db

# 重新迁移 + 种子数据
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 附录A：v2.0相比v1.0的主要变更

| 变更 | v1.0 | v2.0 |
|------|------|------|
| 技术栈 | Spring Boot + React + PostgreSQL | **Next.js + SQLite（单项目）** |
| 前端数 | 3个独立应用 | **1个项目内3个路由组** |
| 中间件 | Redis + RabbitMQ + OSS | **全部移除** |
| 开发阶段 | 4 Phase (P0/P1/P2/P3) | **3 Phase（核心→Funding→完善）** |
| Desk角色 | Phase 1 | **Phase 3** |
| 外部内容 | 竞品分析/定价/ICP/合规 | **全部移除** |
| 支付 | 真实微信/支付宝 | **Mock模拟** |
| 部署 | 阿里云ECS | **本地 npm run dev** |
| 蓝图定位 | 面对投资/团队的产品文档 | **面对AI生成的执行手册** |
| P0问题 | 12个阻塞问题 | **全部解决（见附录B）** |

## 附录B：v1.0审查P0问题解决记录

| # | P0问题 | 解决方式 |
|---|--------|---------|
| 1 | 支付策略矛盾 | Mock支付，`POST /api/v1/payment/mock-callback` |
| 2 | Funding范围不一致 | 明确Phase 2做完整Funding |
| 3 | 考勤归属矛盾 | 考勤在Phase 1（属于CA模块） |
| 4 | Enrollment实体缺失 | 已加入数据模型，支付成功时创建 |
| 5 | UEM 360聚合路径缺失 | Phase 3实现，Phase 1预留接口 |
| 6 | 订单状态机缺expired | 新增expired状态，查询时动态判断 |
| 7 | 课程状态不一致 | 统一为 draft→published→archived（去掉pending_review） |
| 8 | 缺少登录API | 新增 `/api/v1/auth/login`、`/register`、`/refresh` |
| 9 | 有购物车路由没API | 客户端购物车（localStorage），不建API |
| 10 | 折扣计算两个入口 | 统一入口 `POST /api/v1/discounts/calculate`（Billing模块） |
| 11 | 首个Editor创建 | 种子数据直接插入 `user-editor` |
| 12 | 缺少安装部署文档 | 第11章：环境搭建与启动 |

---

*本文档为开发蓝图v2.0，定位为务实可执行的开发手册。架构细节以 `docs/architecture/` 下的设计文档为准。*
