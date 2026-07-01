# 架构决策记录 (ADR) v1.0

> 最后更新: 2026-07-01
> 格式: [ADR 编号] [标题] [状态] [日期]
> 状态: Accepted (已采纳) | Proposed (提议中) | Deprecated (已废弃) | Superseded (已被替代)

---

## 决策列表

| ADR | 标题 | 状态 | 日期 |
|-----|------|------|------|
| ADR-001 | 全栈框架选型: Next.js 14+ App Router | Accepted | 2026-07-01 |
| ADR-002 | 数据库选型: SQLite + Prisma ORM | Accepted | 2026-07-01 |
| ADR-003 | 前端三个路由组设计方案 | Accepted | 2026-07-01 |
| ADR-004 | 购物车方案: 客户端状态 | Accepted | 2026-07-01 |
| ADR-005 | Enrollment 创建时机 | Accepted | 2026-07-01 |
| ADR-006 | 订单超时处理策略 | Accepted | 2026-07-01 |
| ADR-007 | Mock 支付方案 | Accepted | 2026-07-01 |
| ADR-008 | 首个 Editor 创建方案 | Accepted | 2026-07-01 |
| ADR-009 | 课程封面图片方案 | Accepted | 2026-07-01 |
| ADR-010 | 多租户隔离方案 | Accepted | 2026-07-01 |
| ADR-011 | 认证方案: 自建 JWT | Accepted | 2026-07-01 |
| ADR-012 | 金额存储方案: 整数分 | Accepted | 2026-07-01 |
| ADR-013 | 主键方案: cuid() | Accepted | 2026-07-01 |
| ADR-014 | 折扣引擎架构 | Accepted | 2026-07-01 |
| ADR-015 | 通知系统 Phase 1 策略 | Accepted | 2026-07-01 |

---

## ADR-001: 全栈框架选型 -- Next.js 14+ App Router

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
需要选择一个全栈框架，目标用户是不会写代码的BA，由AI辅助生成全部代码。需要在前后端分离架构和全栈框架之间做选择。

### 决策
选择 **Next.js 14+ (App Router)** 作为全栈框架。

### 理由
1. **AI 友好度最高**: GitHub Copilot / Claude / ChatGPT 训练数据中，Next.js + TypeScript 的代码量远超其他全栈框架。
2. **单项目上下文**: AI 在一次对话中就能看到完整数据流 (UI → API → Database)，不需要跨项目理解接口契约。
3. **类型天然共享**: TypeScript 类型定义一处，前后端共享。Server Actions 让前端直接调用后端逻辑。
4. **零跨域配置**: 前后端同源，无需配置 CORS/代理。
5. **shadcn/ui 生态**: 与 Tailwind CSS 深度集成，AI 生成组件代码质量高。
6. **对比 Rails/Django/Laravel**: 动态类型语言的 AI 生成代码缺少类型约束，更容易出错。

### 后果
- 前端必须使用 React (Next.js 的 UI 层)
- 放弃 Spring Boot + React SPA 前后端分离架构
- 架构模式从"微服务"变为"模块化单体"
- 部署复杂度从多个 Docker 容器降为 1 个

---

## ADR-002: 数据库选型 -- SQLite + Prisma ORM

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
原型阶段需要零配置、零运维的数据库。生产环境可迁移到 PostgreSQL。

### 决策
使用 **SQLite** (通过 Prisma ORM 操作)。

### 理由
1. **零配置**: 不需要安装数据库服务、配置端口/用户/密码。
2. **单文件存储**: 数据库就是一个文件，备份=复制文件。
3. **无 Docker 容器依赖**: 不需要独立的数据库容器。
4. **Prisma 完美支持**: Prisma 对 SQLite 的支持非常好。
5. **迁移成本低**: 后续迁移到 PostgreSQL 只需改一行 `datasource` 配置。
6. **本地原型并发足够**: 50-100 并发对 SQLite 的 WAL 模式没压力。

### 后果
- 放弃 PostgreSQL 的高级特性 (JSON 字段、全文索引等)
- 使用 SQLite WAL 模式 (write-ahead logging) 提升并发
- JSON 数据存储在 TEXT 字段中 (Prisma 自动序列化/反序列化)

---

## ADR-003: 前端三个路由组设计方案

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
系统需要三个前端界面: 学员官网 (Website)、管理后台 (Admin Console)、前台工作台 (Desk)。技术方案决定使用 Next.js 单项目，需要规划如何组织三个前端。

### 决策
使用 Next.js **路由组 (Route Groups)** 在一个项目内区分三个前端。

```
src/app/
├── (website)/    # 学员官网: /courses, /checkout, /account, /login
├── (admin)/      # 管理后台: /admin/dashboard, /admin/courses, ...
└── (desk)/       # 前台工作台: /desk, /desk/quick-order, /desk/checkin
```

### 理由
1. **共享组件和类型**: 三个路由组共享 `src/components/` 和 `src/types/`，避免代码重复。
2. **共享 API**: 所有路由组调用同一套 `/api/v1/` 接口。
3. **独立布局**: 每个路由组有独立的 `layout.tsx` (Website: 导航栏+页脚; Admin: 侧边栏+顶栏; Desk: 快捷操作栏)。
4. **AI 友好**: 一个项目中看到所有前端页面，减少上下文切换。
5. **无需独立部署**: 与蓝图推荐的 3 个独立前端项目 (Website + Admin Console + Learning Space) 相比，本方案无需配置 monorepo、无需分别部署。

### 后果
- URL 路径: Website 页面路径以 `/` 开头，Admin 以 `/admin/` 开头，Desk 以 `/desk/` 开头
- 不需要独立的前端项目 (Vite/create-react-app)
- Learning Space (上课系统) 暂不独立路由组，线下课考勤通过 Admin Console 操作

---

## ADR-004: 购物车方案 -- 客户端状态

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
需要考虑购物车是否需要数据库持久化。在真实电商系统中，购物车通常持久化到数据库/Redis。但原型阶段有不同考量。

### 决策
购物车使用 **客户端状态** (localStorage + zustand)，**不建数据库表**。下单时一次性提交多门课程。

### 理由
1. **原型不需跨设备持久化**: 学员通常在单一设备上完成整个购买流程。
2. **简化实现**: 不需要管理购物车表的 CRUD、超时清理、与订单的转换逻辑。
3. **下单即清空**: 成功下单后，清空客户端的购物车状态。
4. **符合 ZUSTAND 模式**: 前端购物车作为一个 client-side store，简单直观。
5. **下单接口支持多 schedule**: `POST /api/v1/orders` 接收 `scheduleIds: string[]`，一次提交多门课程。

### 后果
- 不建 `cart` / `cart_item` 表
- 前后端之间关于"购物车"没有 API (购物车状态仅在客户端)
- 如果后续需要跨设备同步购物车，需重构此设计

---

## ADR-005: Enrollment 创建时机

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
Enrollment (报名记录) 是连接学员和排期的关键实体。需要确定 Enrollment 在哪个时间点创建。

### 决策
**支付成功时自动创建 Enrollment**。退课/退款时标记 Enrollment 状态变更。

### 理由
1. **支付前无占用**: 排期名额通过订单的 `expiresAt` 机制锁定 (15分钟预留)，不提前创建 Enrollment。
2. **支付后即开通权限**: 支付成功 -> 创建 Enrollment(status=active) + 排期 enrolledCount+1。
3. **退款时标记状态**: 退款 -> Enrollment.status 变为 `refunded` / `dropped`。
4. **一个订单可创建多条 Enrollment**: 一个订单包含多个 OrderItem (多个排期)，每个 OrderItem 对应一条 Enrollment。

### 后果
- 排期的 enrolledCount 在支付成功后才增加
- 如果需要在支付前查看"预报名"列表，通过 `Order.status=pending` 关联 OrderItem.scheduleId 即可
- Enrollment 表记录了从购买到可能的退课全生命周期

---

## ADR-006: 订单超时处理策略

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
订单创建后，用户可能不支付。需要一种机制自动释放被锁定的名额。蓝图建议使用定时任务每分钟扫描。

### 决策
采用 **查询时动态判断 + 轻量定时任务** 的混合方案。

**主方案 (查询时判断):**
- 任何查询订单的代码，如果遇到 `status='pending' AND expiresAt < now()`，将其视为 `expired`
- 在 API handler 层统一处理: 查询订单前先调用 `autoExpireOrders(orderId)` 检查

**辅助方案 (定时任务):**
- 如果 Next.js 环境支持 (开发环境默认支持)，使用简单的 `setInterval` 每分钟扫描过期订单
- 生产环境可替换为 Cron Job (如 `node-cron`)
- 扫描逻辑: 查找 `status='pending' AND expiresAt < now()` 的订单，批量更新为 `expired`

### 理由
1. **简单可靠**: 不需要 Redis 分布式锁或消息队列。
2. **查询时判断兜底**: 即使定时任务漏执行，查询时也会自动判断过期。
3. **SQLite 兼容**: 单进程内的定时任务在 SQLite 环境下完全够用。
4. **原型阶段**: 15 分钟超时时间对 50-100 并发来说，定时任务每分钟扫描足够处理。

### 后果
- 不引入额外的 Job Queue 中间件
- 订单过期后自动释放: enrolledCount 不变 (因为从未创建 Enrollment)，如果后续 Phase 2 引入 Funding 预占用，需要额外恢复预算

---

## ADR-007: Mock 支付方案

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
原型阶段不需要真实接入微信/支付宝支付，但需要一个看起来真实的支付流程来演示完整的购买闭环。

### 决策
采用 **前端模拟支付UI + 后端Mock回调** 的方案。

**流程:**
```
1. 前端展示逼真的微信/支付宝扫码支付界面 (Tailwind CSS 模拟)
2. 用户点击"模拟支付成功"按钮
3. 调用 POST /api/v1/payment/mock-callback
   Body: { orderId, method: "wechat"|"alipay"|"cash", success: true }
4. 后端处理:
   a. 校验订单状态 = "pending" (乐观锁)
   b. 生成 Mock transactionId: "MOCK_WECHAT_20260701_<nanoid(10)>"
   c. 更新订单状态 -> "paid", 设置 paidAt
   d. 创建 Payment 记录 (status=success)
   e. 为每个 OrderItem 创建 Enrollment (status=active)
   f. 排期 enrolledCount +1
   g. 返回成功 (含 enrollment 列表)
5. 前端跳转到购买成功页面
```

### 理由
1. **UI 逼真**: 用 Tailwind CSS 模拟微信/支付宝扫码界面，Demo 效果好。
2. **后端逻辑真实**: 订单状态机、Enrollment 创建、排期计数等逻辑与真实支付走同一套代码。
3. **transactionId 可辨识**: 所有 Mock 交易的 transactionId 带 `MOCK_` 前缀。
4. **可模拟失败**: 点击"模拟支付失败"可测试订单状态机的失败路径。
5. **无需外部依赖**: 不需要微信/支付宝商户号、SDK、回调配置。

### 后果
- 前端有一个专门的 Mock 支付页面 `src/app/(website)/payment/[orderId]/page.tsx`
- 支付成功后的回调处理逻辑与真实支付一致，只是 transactionId 前缀不同
- 后续接入真实支付时: 替换前端支付页面 + 新增真实回调 handler，其余代码复用

---

## ADR-008: 首个 Editor 创建方案

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P1

### 背景
多租户系统需要一个初始的 Editor (管理员) 账号来管理整个机构。在真实 SaaS 中，通常有租户自助注册流程。

### 决策
**通过种子数据直接插入**。原型阶段不处理租户自助注册流程。

### 理由
1. **原型简化**: 种子数据中直接创建 Tenant + Editor 用户，系统启动即可用。
2. **不需要注册审批流**: 免去租户申请 -> 审核 -> 开通的 SaaS onboarding 流程。
3. **种子数据已覆盖**: Tenant `tenant-001` 星光职业培训学校 + Editor `user-editor` 张校长。
4. **后续再建流程**: 如果需要多租户演示，可在 Admin Console 中手动创建 Tenant + Editor。

### 后果
- `prisma/seed.ts` 中硬编码初始 Editor 凭据
- 前端注册页面 (`/register`) 只开放 learner 角色的注册
- Editor/Desk/Trainer 账号通过 Admin Console 用户管理页面创建

---

## ADR-009: 课程封面图片方案

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P1

### 背景
课程需要封面图片展示。原型阶段需决定是真实文件上传还是使用占位图。

### 决策
Phase 1 使用 **占位图 URL**，不上传真实文件。Phase 3 再加本地上传。

方案:
- 课程创建时，`coverImageUrl` 默认为 `https://placehold.co/600x400?text=课程名称`
- 支持 Editor 手动填写一个 URL (可使用任意在线图片链接)
- Phase 3 通过 `<input type="file">` 上传到 `public/uploads/course-cover/` 并更新 URL

### 理由
1. **零配置**: 不需要文件存储服务 (MinIO/OSS)，不需要文件处理库 (sharp)。
2. **占位图服务可用**: `placehold.co` 是免费服务，支持自定义尺寸和文字。
3. **字段预留**: `coverImageUrl` 字段类型为 `String?`，后续切换为真实 URL 无需改数据库。
4. **Demo 效果可接受**: 占位图展示清晰，不影响原型演示。

### 后果
- 课程封面不是真实图片，但课程详情页整体 Layout 不受影响
- `public/uploads/` 目录先建好，Phase 3 直接使用

---

## ADR-010: 多租户隔离方案

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
系统需要支持多个培训机构使用 (多租户)，每个机构的数据必须隔离。

### 决策
采用 **共享数据库 + tenant_id 字段隔离** 方案。

**实现细节:**
1. 所有业务表包含 `tenantId String` 字段
2. 种子数据统一使用 `tenant-001` (星光职业培训学校)
3. API 层通过 JWT payload 获取当前用户的 `tenantId`
4. 所有数据库查询自动注入 `tenantId` 过滤条件
5. 用户在登录/注册时必须提供 `tenantId`

### 理由
1. **MVP 最简单**: 不需要 PostgreSQL Schema 分片或独立数据库。
2. **开发效率高**: 不需要复杂的租户路由逻辑。
3. **AI 友好**: Prisma 查询中加一个 `where: { tenantId }` 即可。
4. **可迁移**: 后期如果租户规模增长，可迁移到 PostgreSQL Schema 分片 (参考 Canvas Switchman)。

### 后果
- 开发者必须确保每条查询都带 `tenantId`
- 通过 `src/lib/tenant.ts` 的 `withTenant()` 辅助函数强制注入
- API handler 的请求验证中间件确保 `tenantId` 存在

---

## ADR-011: 认证方案 -- 自建 JWT

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
需要用户认证和会话管理。技术方案文档中评估了 next-auth 和自建 JWT 两种方案。

### 决策
使用 **自建 JWT** (jose + bcryptjs)，不使用 next-auth。

### 理由
1. **减少依赖**: next-auth 5 是 Beta 版本，API 不稳定。自建 JWT 只有 2 个依赖 (jose + bcryptjs)。
2. **完全控制**: JWT payload 可以自定义 `tenantId`, `role` 等业务字段。
3. **无状态**: 不需要 Redis 存储 session。
4. **AI 友好**: JWT 签名/验证逻辑简单明了，AI 生成的代码不容易出错。
5. **原型够用**: Access Token (15分钟) + Refresh Token (7天) 的双 Token 模式在原型阶段足够。

### 实现:
```typescript
// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-in-production');

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(secret);
}
```

### 后果
- 放弃了 next-auth 的内置 Provider (Google/GitHub OAuth)
- 需要手动实现: 登录/注册/刷新 Token/密码哈希/Token 验证中间件
- Access Token 存储在客户端内存 (不存 localStorage 防 XSS)

---

## ADR-012: 金额存储方案 -- 整数分

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
系统涉及大量金额计算 (课程价格、折扣、支付、退款)。需要确定金额的存储和计算方案。

### 决策
所有金额字段使用 **整数 (Int)，单位为分 (cents)**。

- 数据库: `Int @default(0)` (如 `basePrice`, `payableAmount`)
- TypeScript 类型: `type MoneyInCents = number`
- 前端展示: 通过工具函数转换: `formatMoney(198000) => "¥1,980.00"`
- API 传输: 整数 (JSON number)

### 理由
1. **避免浮点数精度问题**: JavaScript 的浮点数精度在金额计算中容易出现 `0.1 + 0.2 = 0.30000000000000004` 问题。
2. **数据库友好**: SQLite 的 INTEGER 类型适合整数运算，无精度损失。
3. **行业最佳实践**: Stripe、微信支付、支付宝等主流支付系统都使用整数分。
4. **计算简单**: 加减法不会丢失精度。

### 后果
- 前端需要 `formatMoney()` 和 `parseMoney()` 工具函数
- 所有涉及金额的输入/输出都需要转换
- API 接口文档需要明确标注 "单位: 分"

---

## ADR-013: 主键方案 -- cuid()

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P0

### 背景
需要选择所有表的主键生成策略。可选方案: 自增整数、UUID v4、cuid。

### 决策
统一使用 **`String @id @default(cuid())`**。

### 理由
1. **分布式友好**: 不依赖数据库自增序列，便于未来分布式扩展。
2. **长度适中**: cuid 比 UUID 短 (约 25 字符 vs 36 字符)，URL 更友好。
3. **时间排序**: cuid 包含时间戳信息，天然按创建时间大致排序。
4. **Prisma 原生支持**: `@default(cuid())` 不需要额外库。
5. **安全**: 不暴露记录总数 (自增 ID 会暴露)。

### 后果
- 种子数据需要预设一些友好的 ID (如 `tenant-001`, `user-editor`, `course-python`)
- 索引比自增整数略大 (正常)

---

## ADR-014: 折扣引擎架构

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P1

### 背景
系统需要统一的折扣计算，包括 Funding 资助折扣、优惠券折扣、早鸟折扣等。需要设计折扣引擎的架构。

### 决策
所有折扣计算统一收敛到 **`src/lib/funding/discount-engine.ts`**。

**Phase 1 实现 (Stub):**
```typescript
export async function calculateDiscount(input: DiscountCalculationRequest): Promise<DiscountCalculationResult> {
  let originalAmount = 0;
  for (const scheduleId of input.scheduleIds) {
    const schedule = await getScheduleById(scheduleId);
    const course = await getCourseById(schedule.courseId);
    originalAmount += schedule.price ?? course.basePrice;
  }
  return {
    originalAmount,
    totalDiscount: 0,
    finalAmount: originalAmount,
    breakdown: [],  // Phase 1: 空折扣
  };
}
```

**Phase 2 实现:**
1. Funding 折扣 (优先级最高, 先计算)
2. 优惠券折扣 (检查互斥/叠加规则)
3. 早鸟/限时折扣
4. 合并计算 + 检测是否超过 100% 折扣

### 理由
1. **单一入口**: Order 创建时只调用一个函数，不关心内部如何组合多种折扣。
2. **易于扩展**: 新增折扣类型时，只需在 `discount-engine.ts` 中增加计算逻辑。
3. **解耦**: Billing 模块不直接了解 Funding/Coupon 的具体规则。
4. **退款可复用**: 退款时反方向调用引擎，可精确恢复各折扣来源的金额/额度。

### 后果
- Phase 1 虽然折扣引擎返回空折扣，但调用接口已经存在，Order 创建流程完整
- Phase 2 只需替换 `calculateDiscount` 的实现，无需修改 Order 创建流程

---

## ADR-015: 通知系统 Phase 1 策略

**状态:** Accepted
**日期:** 2026-07-01
**优先级:** P1

### 背景
蓝图定义了 8 个必须的触发点 (购买成功、开课提醒、超时提醒等)，需要设计 Phase 1 的通知策略。

### 决策
Phase 1 **不实现独立通知中心**。通知数据直接写入数据库表，在 Admin Console 中查看。

**简化方案:**
- Mock 支付成功时: 直接创建 Notification 记录 (站内信)
- 不做邮件/短信真实发送: 写入 `MockEmail` / `MockSms` 表供查看
- Admin Console 中 `/admin/notifications/mock` 页面展示所有 Mock 通知记录
- Phase 3 再实现完整的通知中心 (模板/路由规则/多渠道)

### 理由
1. **聚焦核心链路**: Phase 1 的首要目标是打通"创建课程->下单->支付->开权限->考勤"这条核心链路。通知是辅助功能。
2. **数据已落库**: 虽然通知不会真实发送，但数据已记录在 Notification/MockSms/MockEmail 表中，方便 Demo 展示。
3. **调用接口预留**: 支付成功等关键节点已经留有创建通知记录的代码，Phase 3 只需替换为 `notificationService.send()` 调用。

### 后果
- Phase 1 不会收到真实的短信/邮件 (但可以在 Admin Console 看到记录)
- 站立信 (Notification 表) 在 Phase 1 可用于 Website 个人中心展示"我的消息"
- 通知模板和路由规则在 Phase 3 实现

---

## 附录: 决策修订历史

| 日期 | 修订内容 |
|------|---------|
| 2026-07-01 | 初始版本，记录 15 条关键架构决策 |

---

*本文档遵循 [Michael Nygard 的 ADR 格式](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)。每项决策记录背景、决策内容、理由和后果，便于后续开发者理解"我们当时为什么这么做"。*
