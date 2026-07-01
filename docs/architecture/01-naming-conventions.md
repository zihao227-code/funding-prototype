# 命名规范与编码约定 v1.0

> 适用范围: 教育培训机构全流程管理平台全部代码
> 最后更新: 2026-07-01
> 原则: 所有 AI 生成的代码必须严格遵守本文档定义的命名规范，确保全局一致性。

---

## 1. 文件与目录命名

### 1.1 目录名

| 场景 | 规范 | 示例 |
|------|------|------|
| 模块目录 | `kebab-case` | `src/lib/user-management/` |
| Next.js 路由目录 | `kebab-case` 或 `[param]` | `src/app/(website)/courses/[id]/` |
| 组件目录 | `kebab-case` | `src/components/course/` |
| 类型目录 | 全小写单数 | `src/types/` |
| 库目录 | 小写缩写 | `src/lib/uem/`, `src/lib/cls/` |

### 1.2 文件名

| 文件类型 | 规范 | 示例 |
|---------|------|------|
| React 组件文件 | `kebab-case.tsx` | `course-card.tsx`, `status-badge.tsx` |
| Service/库文件 | `kebab-case.ts` | `course-service.ts`, `order-service.ts` |
| 类型定义文件 | `kebab-case.ts` | `course.ts`, `common.ts` |
| Next.js 路由文件 | 保留字 | `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx` |
| 配置文件 | 框架约定 | `package.json`, `tailwind.config.ts`, `tsconfig.json` |
| Prisma 文件 | 小写 | `schema.prisma`, `seed.ts` |
| 文档文件 | `NN-kebab-case.md` (带序号) | `01-naming-conventions.md`, `05-design-decisions.md` |

**禁止:**
- 禁止使用 PascalCase 命名非组件文件（如 `CourseService.ts`）
- 禁止使用 snake_case 命名 TypeScript 文件（如 `course_service.ts`）
- 禁止在文件名中使用空格或中文

---

## 2. 代码命名

### 2.1 TypeScript / JavaScript

| 元素 | 规范 | 示例 |
|------|------|------|
| 变量 | `camelCase` | `const userId = "..."` |
| 函数 | `camelCase` | `function getCourseById() {}` |
| 箭头函数 | `camelCase` | `const calculateDiscount = () => {}` |
| 常量 (编译时常量) | `UPPER_CASE` | `const MAX_RETRY_COUNT = 3` |
| 类 | `PascalCase` | `class DiscountEngine {}` |
| 接口 | `PascalCase` | `interface CreateOrderInput {}` |
| 类型别名 | `PascalCase` | `type OrderStatus = "pending" \| ...` |
| 泛型参数 | 单个大写字母或 `PascalCase` | `<T>`, `<TData>` |
| 枚举 | `PascalCase` | `enum UserRole {}` |
| 枚举成员 | `snake_case` (Prisma 约束) | `UserRole.editor`, `OrderStatus.partial_refunded` |

### 2.2 React 组件

| 元素 | 规范 | 示例 |
|------|------|------|
| 组件定义 | `PascalCase` | `function CourseCard() {}` |
| 组件文件 | `kebab-case.tsx` | `course-card.tsx` |
| Props 接口 | `{ComponentName}Props` | `interface CourseCardProps {}` |
| Hooks (自定义) | `use` 前缀 + `camelCase` | `useAuth()`, `useTenant()` |
| Hooks 文件 | `kebab-case.ts` | `use-auth.ts` |
| Context | `PascalCase` | `AuthContext`, `TenantContext` |

### 2.3 Prisma

| 元素 | 规范 | 示例 |
|------|------|------|
| 表名 | `snake_case` | `funding_application`, `order_item` |
| 字段名 | `camelCase` | `createdAt`, `basePrice`, `tenantId` |
| 枚举类型名 | `PascalCase` | `OrderStatus`, `UserRole` |
| 枚举值 | `snake_case` | `partial_refunded`, `fixed_per_head` |
| 外键字段 | `${referencedTable}Id` (camelCase) | `scheduleId`, `fundingTypeId` |
| 索引名 | Prisma 自动生成 | (不手动命名) |
| 关系名 | `PascalCase` | `OrderBuyer`, `CourseFunding` |

**表名规则:**
- 用 snake_case 单数（如 `tenant`, `user`, `order`）
- 关联表用 snake_case（如 `course_funding`）
- 不使用前缀（如 `t_user`, `tb_order`）

### 2.4 Zod Schema

| 元素 | 规范 | 示例 |
|------|------|------|
| Schema 变量 | `{name}Schema` (camelCase) | `const createOrderSchema = z.object({...})` |
| 推断类型 | `{Name}Input` / `{Name}` | `type CreateOrderInput = z.infer<typeof createOrderSchema>` |

---

## 3. API 路由命名

### 3.1 URL 路径

| 规则 | 说明 |
|------|------|
| 版本前缀 | 所有 API 使用 `/api/v1/` 前缀 |
| 资源名 | 复数 kebab-case (如 `/api/v1/courses`) |
| 嵌套资源 | `/[parent]/[parentId]/[child]` (如 `/api/v1/courses/[id]/schedules`) |
| 动态参数 | `[id]` (Next.js 约定) |
| 操作动作 | HTTP 方法 + 路径后缀 (如 `POST .../publish`, `POST .../cancel`) |

### 3.2 路由文件

```
src/app/api/v1/[resource]/route.ts          集合操作 (GET列表, POST创建)
src/app/api/v1/[resource]/[id]/route.ts     单体操作 (GET, PUT, DELETE)
src/app/api/v1/[resource]/[id]/[action]/route.ts  动作操作 (POST)
```

---

## 4. 数据库命名

### 4.1 主键

| 规则 | 示例 |
|------|------|
| 统一使用 `id` | `id String @id @default(cuid())` |
| 不使用自增整数 | (SQLite + 分布式友好) |

### 4.2 时间戳

| 规则 | 示例 |
|------|------|
| 创建时间 | `createdAt DateTime @default(now())` |
| 更新时间 | `updatedAt DateTime @updatedAt` |
| 业务时间 | 描述性名称 (如 `paidAt`, `publishedAt`, `refundedAt`) |

### 4.3 外键

| 规则 | 示例 |
|------|------|
| 命名格式 | `${referencedTable}Id` (camelCase) |
| 类型 | `String` (因为主键是 cuid 字符串) |

### 4.4 多租户

| 规则 | 示例 |
|------|------|
| 字段名 | `tenantId String` |
| 每一张业务表 | 必须包含 `tenantId` |

---

## 5. 状态值与枚举

### 5.1 命名规则

- 数据库/Prisma 枚举值: `snake_case`
- TypeScript 中引用: 通过 Prisma 生成的枚举类型，保持 snake_case
- 前端展示: 通过映射函数转换为中文展示 (如 `"partial_refunded"` -> `"部分退款"`)

### 5.2 状态值表

| 域 | 枚举类型 | 值列表 |
|----|---------|--------|
| 用户角色 | `UserRole` | `editor`, `desk`, `trainer`, `learner` |
| 用户状态 | `UserStatus` | `active`, `disabled` |
| 租户状态 | `TenantStatus` | `active`, `suspended`, `expired` |
| 课程状态 | `CourseStatus` | `draft`, `pending_review`, `published`, `archived` |
| 排期状态 | `ScheduleStatus` | `draft`, `open`, `full`, `cancelled`, `completed` |
| 报名状态 | `EnrollmentStatus` | `active`, `transferred`, `refunded`, `dropped` |
| 订单状态 | `OrderStatus` | `pending`, `paid`, `partial_refunded`, `refunded`, `cancelled`, `expired` |
| 支付状态 | `PaymentStatus` | `pending`, `success`, `failed` |
| 退款状态 | `RefundStatus` | `pending`, `approved`, `processed`, `rejected` |
| 考勤状态 | `AttendanceStatus` | `present`, `absent`, `late`, `early_leave`, `excused` |
| 资助来源 | `FundingSource` | `government`, `enterprise`, `scholarship`, `nonprofit` |
| 证书状态 | `CertificateStatus` | `issued`, `revoked` |
| 考核状态 | `AssessmentStatus` | `draft`, `open`, `closed` |
| 折扣类型 | `DiscountType` | `coupon`, `group_buy`, `early_bird`, `flash_sale` |

---

## 6. 模块缩写

| 全称 | 缩写 | 目录 | 说明 |
|------|------|------|------|
| User Engagement Management | `uem` | `src/lib/uem/` | 用户管理 |
| Course & Learning System | `cls` | `src/lib/cls/` | 课程系统 |
| Billing | `billing` | `src/lib/billing/` | 支付结算 |
| Classroom & Attendance | `ca` | `src/lib/ca/` | 上课管理 |
| Funding | `funding` | `src/lib/funding/` | 资助管理 |
| Notification | `notification` | `src/lib/notification/` | 通知中心 |

---

## 7. Git 约定

| 项 | 规范 |
|----|------|
| 分支名 | `feature/[module]`, `fix/[description]`, `phase/[N]` |
| Commit 消息 | [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:` |

---

## 8. 快速检查表

在代码审查/AI生成代码后，逐项检查:

- [ ] 文件名是否使用 `kebab-case`？
- [ ] React 组件是否使用 `PascalCase` 命名？
- [ ] 函数/变量是否使用 `camelCase`？
- [ ] 类型/接口是否使用 `PascalCase`？
- [ ] API 路径是否以 `/api/v1/` 开头？
- [ ] 数据库表名是否为 `snake_case`？
- [ ] 数据库字段名是否为 `camelCase`？
- [ ] 枚举值是否为 `snake_case`？
- [ ] 每张业务表是否包含 `tenantId`, `createdAt`, `updatedAt` 字段？
- [ ] 主键是否使用 `String @id @default(cuid())`？
- [ ] 金额字段是否以"分"为单位（整数类型）？
