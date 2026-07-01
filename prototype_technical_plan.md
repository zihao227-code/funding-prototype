# 教育培训机构全流程管理平台 —— 本地高保真原型技术方案

**版本：** v1.0
**日期：** 2026年7月1日
**目标读者：** 不会写代码的BA，需要AI辅助生成全部代码
**核心原则：** 让AI能最高效地生成可运行的代码，减少中间件数量，降低启动复杂度

---

## 目录

1. [A. 推荐技术栈](#a-推荐技术栈)
2. [B. Docker Compose架构设计](#b-docker-compose架构设计)
3. [C. Mock策略设计](#c-mock策略设计)
4. [D. 种子数据设计](#d-种子数据设计)
5. [E. 代码结构设计](#e-代码结构设计)
6. [F. 云同步方案](#f-云同步方案)
7. [附录：AI辅助开发策略](#附录ai辅助开发策略)

---

## A. 推荐技术栈

### A.1 核心判断：全栈框架 >> 前后端分离

蓝图中推荐的是 Spring Boot + React + PostgreSQL + Redis 的前后端分离架构。这套架构在"专业开发团队"场景下非常合理，但在"不会写代码的人用AI辅助开发"的场景下，**存在以下致命问题：**

| 问题 | 前后端分离 | 全栈框架 |
|------|-----------|---------|
| AI需要理解的上下文 | 2个项目、2套代码、2个端口 | 1个项目、1套代码、1个端口 |
| 跨域/API联调 | 需要配置CORS、代理 | 无需配置，天然同源 |
| 类型共享 | 需要手动同步或NPM包 | 类型定义一处，前后端共享 |
| Docker容器数 | 最少3个（前端+后端+DB+Redis） | 1-2个 |
| 启动命令数 | 至少2条 | 1条 |
| AI生成代码的"一次成功率" | 较低（需要两端对齐接口） | 较高（Server Action直接调用） |

**结论：对于AI辅助开发，全栈框架的效率是前后端分离的2-3倍。** 因为AI在一次对话中就能看到完整的数据流（从UI到数据库），不需要跨项目理解接口契约。

### A.2 全栈框架对比

| 框架 | AI友好度 | 类型安全 | 生态成熟度 | 数据库ORM | 学习曲线（对AI） | 综合评分 |
|------|----------|---------|----------|-----------|-----------------|---------|
| **Next.js 14+** | 极高 | TypeScript原生 | 最成熟 | Prisma/Drizzle | 低 | ★★★★★ |
| Rails 7 | 高 | 弱(Ruby动态类型) | 成熟 | ActiveRecord | 中 | ★★★ |
| Django | 中 | 弱(Python动态类型) | 成熟 | Django ORM | 中 | ★★★ |
| Laravel | 中 | 弱(PHP动态类型) | 成熟 | Eloquent | 中 | ★★★ |
| Nuxt 3 | 高 | TypeScript原生 | 较成熟 | Prisma/Drizzle | 低 | ★★★★ |

**关键分析：**

1. **Next.js 14+ (App Router)** 是毫无疑问的最佳选择：
   - GitHub Copilot / Claude / ChatGPT 训练数据中，Next.js + TypeScript 的代码量远超其他全栈框架
   - TypeScript 的类型系统不仅不会增加AI负担，反而**帮助AI生成更正确的代码**——类型定义就是给AI的"契约"，AI能根据类型推断出字段名、参数类型、返回值，减少幻觉
   - Server Actions 让前端直接调用后端逻辑，不用写API路由、fetch、错误处理等样板代码
   - Prisma ORM 的 schema 文件本身就是数据模型文档，AI读一行就理解了全部数据结构

2. **Rails/Django/Laravel** 的问题：
   - 都是动态类型语言，AI生成的代码缺少类型约束，更容易出错
   - AI训练数据中这些框架的占比远低于 Next.js
   - 但它们的Admin后台生成能力很强（Django Admin / Rails Scaffold）

3. **Nuxt 3** 是不错的备选，但生态不如 Next.js 成熟，AI训练数据更少。

### A.3 数据库：SQLite >> PostgreSQL（对原型而言）

| 维度 | SQLite | PostgreSQL |
|------|--------|-----------|
| Docker容器 | 0（嵌入应用进程） | 1个独立容器 |
| 配置 | 0配置，一个文件 | 需要配端口/用户/密码/数据库名 |
| 备份 | 复制一个文件 | pg_dump |
| 并发 | 单写多读，本地原型足够 | 真正的并发 |
| 启动失败概率 | 几乎为0 | 端口冲突/密码错误/磁盘权限 |
| 多租户支持 | tenant_id字段隔离，完全一样 | tenant_id字段隔离 |
| AI训练数据 | Prisma + SQLite 组合非常常见 | 同样常见 |

**结论：SQLite。** 原型阶段不需要PostgreSQL的任何高级特性（JSON字段、全文索引等）。SQLite的零配置特性意味着Docker Compose里少一个容器、少一个启动失败点。而且 Prisma 对 SQLite 的支持非常好，后续如果真想迁移到 PostgreSQL，改一行 `datasource` 配置即可。

### A.4 Redis：不需要

原蓝图提到Redis用于Session管理、分布式锁、支付回调幂等。在Mock原型中：

- **Session管理**：用无状态JWT（不存session，不需要Redis）
- **分布式锁**：不需要，没有并发抢课场景（原型验证不需要）
- **支付回调幂等**：在数据库层面用订单状态机+唯一交易号保证，不需要Redis
- **消息队列**：不需要，同步调用即可（通知发送是同步的Mock，不会阻塞）

**结论：跳过Redis。** 少一个中间件 = 少一个Docker容器 = 少一个启动失败点。

### A.5 TypeScript vs JavaScript

**结论：必须用TypeScript。**

很多人直觉认为"不会写代码的人应该用更简单的JavaScript"，但这是误解：

1. **TypeScript的类型系统是给AI的"提示词"**：当你定义 `interface Order { id: string; status: 'pending' | 'paid' | 'refunded' }`，AI就知道订单有哪些字段、status有哪些合法值。AI生成的代码会更准确。

2. **类型定义 = 活文档**：对于不会写代码的BA来说，打开 `types/order.ts` 就能看到订单有哪些字段，比翻markdown文档更可靠。

3. **AI训练数据优势**：2024-2026年的开源项目中，TypeScript的占比已经超过JavaScript。AI对TypeScript代码的生成质量更高。

4. **编译错误 = 免费测试**：TypeScript编译器会帮BA抓住很多低级错误（字段名拼错、参数类型不对），这些错误在JavaScript中要到运行时才发现。

### A.6 最终推荐技术栈

```
┌─────────────────────────────────────────────┐
│              推荐技术栈（极简版）               │
├─────────────────────────────────────────────┤
│                                              │
│   全栈框架：  Next.js 14+ (App Router)        │
│   语言：      TypeScript 5.x                 │
│   UI组件库：  shadcn/ui + Tailwind CSS 3     │
│   数据库ORM： Prisma 5.x                     │
│   数据库：    SQLite (开发/原型)              │
│   认证：      next-auth 5 (Beta) 或 Jose JWT │
│   表单验证：  Zod + React Hook Form          │
│   图表：      Recharts (仪表盘)              │
│   部署：      Docker Compose (1个容器)        │
│                                              │
│   不需要的：                                  │
│   ✗ Redis                                   │
│   ✗ PostgreSQL (原型阶段)                    │
│   ✗ 消息队列 (RabbitMQ/Kafka)                │
│   ✗ 独立前端项目                             │
│   ✗ 独立后端项目                             │
│   ✗ MinIO / OSS                             │
│   ✗ Nginx                                   │
│                                              │
└─────────────────────────────────────────────┘
```

**关键组件版本：**

| 组件 | 版本 | 作用 |
|------|------|------|
| next | 14.2+ | 全栈框架 |
| react | 18.3+ | UI框架 |
| typescript | 5.4+ | 类型系统 |
| prisma | 5.15+ | 数据库ORM |
| @prisma/client | 5.15+ | Prisma客户端 |
| next-auth | 5.0.0-beta | 认证（如不稳定则用 jose + bcryptjs 手写JWT） |
| tailwindcss | 3.4+ | CSS框架 |
| shadcn/ui | latest | UI组件（基于Radix UI） |
| zod | 3.23+ | Schema验证 |
| react-hook-form | 7.51+ | 表单管理 |
| recharts | 2.12+ | 图表组件 |
| date-fns | 3.6+ | 日期处理 |

### A.7 与蓝图技术栈的差异说明

| 蓝图推荐 | 本方案推荐 | 变更理由 |
|---------|-----------|---------|
| Spring Boot 3 | Next.js API Routes | Spring Boot对AI来说代码量巨大（Entity/DTO/Repository/Service/Controller），Next.js一个文件搞定CRUD |
| React SPA (Vite) | Next.js App Router | SPA需要独立项目+API调用，Next.js天然一体化 |
| PostgreSQL 16 | SQLite | 零配置，Docker里少一个容器 |
| Redis 7 | 不需要 | Mock支付不需要分布式锁 |
| RabbitMQ | 不需要 | 同步调用即可，不需要事件总线 |
| 阿里云OSS | 本地文件系统 | 原型不需要云存储 |
| Ant Design 5 | shadcn/ui + Tailwind | shadcn/ui的AI生成代码质量远高于Ant Design（训练数据更多、组件更现代化） |
| 3个独立前端 | 1个Next.js应用内路由分组 | Website/Admin/Desk通过路由前缀区分，共享组件和类型 |

---

## B. Docker Compose架构设计

### B.1 极简架构图

```
┌──────────────────────────────────────────────────┐
│                  Docker Network                   │
│                                                   │
│  ┌─────────────────────────────────────┐         │
│  │         app (Next.js Dev)            │         │
│  │                                       │         │
│  │  ┌─────────────────────────────┐    │         │
│  │  │  Next.js Server              │    │         │
│  │  │  - API Routes (后端逻辑)      │    │         │
│  │  │  - Server Components (SSR)   │    │         │
│  │  │  - Server Actions (数据变更)  │    │         │
│  │  │  - Prisma Client (数据库)     │    │         │
│  │  └─────────────────────────────┘    │         │
│  │                                       │         │
│  │  ┌─────────────────────────────┐    │         │
│  │  │  SQLite DB                   │    │         │
│  │  │  (文件: /app/data/app.db)     │    │         │
│  │  └─────────────────────────────┘    │         │
│  │                                       │         │
│  │  Port: 3000 (应用)                     │         │
│  │  Port: 5555 (Prisma Studio, 可选)     │         │
│  └─────────────────────────────────────┘         │
│                                                   │
│  ┌─────────────────────────────────────┐         │
│  │   prisma-studio (可选)               │         │
│  │   数据库可视化管理工具                │         │
│  │   Port: 5555                         │         │
│  └─────────────────────────────────────┘         │
│                                                   │
└──────────────────────────────────────────────────┘
```

### B.2 docker-compose.yml 设计

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: funding-prototype
    ports:
      - "3000:3000"    # Next.js 应用
      - "5555:5555"    # Prisma Studio（数据库查看器）
    volumes:
      # 代码热重载：修改本地代码，容器内自动重新编译
      - ./src:/app/src:delegated
      - ./prisma:/app/prisma:delegated
      - ./public:/app/public:delegated
      - ./package.json:/app/package.json:delegated
      - ./tsconfig.json:/app/tsconfig.json:delegated
      - ./next.config.js:/app/next.config.js:delegated
      - ./tailwind.config.ts:/app/tailwind.config.ts:delegated
      - ./postcss.config.js:/app/postcss.config.js:delegated
      # 数据库文件持久化（容器删除后数据不丢失）
      - funding-data:/app/data
      # node_modules 用匿名卷，避免主机和容器的node_modules冲突
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - DATABASE_URL=file:/app/data/app.db
      - AUTH_SECRET=dev-secret-change-in-production
      - MOCK_PAYMENT=true
      - MOCK_SMS=true
      - MOCK_EMAIL=true
    command: >
      sh -c "
        npx prisma migrate deploy &&
        npx prisma db seed &&
        echo '=== Database ready, starting dev server ===' &&
        npm run dev
      "
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  funding-data:
    driver: local
```

### B.3 Dockerfile 设计

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json ./
RUN npm ci

# 复制 Prisma schema（用于生成客户端）
COPY prisma ./prisma
RUN npx prisma generate

# 复制其余代码
COPY . .

# 暴露端口
EXPOSE 3000 5555

# 默认命令（docker-compose会覆盖）
CMD ["npm", "run", "dev"]
```

### B.4 启动流程

用户只需要一条命令：

```bash
docker compose up -d
```

自动执行：
1. 构建镜像（安装npm依赖 + 生成Prisma客户端）
2. 启动容器
3. 执行数据库迁移（`prisma migrate deploy`）
4. 加载种子数据（`prisma db seed`）
5. 启动Next.js开发服务器（热重载就绪）
6. 访问 `http://localhost:3000` 即可使用

**停止：** `docker compose down`
**停止并清除数据：** `docker compose down -v`

### B.5 热重载原理

Docker Compose的 `volumes` 配置将本地 `src/` 目录映射到容器内。修改本地代码后：
- Next.js开发服务器检测到文件变化（通过文件系统事件）
- 自动重新编译（通常1-3秒）
- 浏览器自动刷新（Fast Refresh）

这比每次改代码重新build镜像快得多。

---

## C. Mock策略设计

### C.1 支付Mock

**设计原则：** 让Demo看起来真实，但实际不调用任何外部API。

**方案：本地Mock支付页面 + 模拟回调**

#### 支付流程（学员端）

```
学员点击"去支付"
       │
       ▼
┌──────────────────────────────────────┐
│         Mock支付页面                   │
│                                       │
│  ┌──────────────────────────────┐    │
│  │  订单号：ORD-20260701-001     │    │
│  │  金额：￥1,980.00             │    │
│  │                               │    │
│  │  选择支付方式：                │    │
│  │  [ 微信支付 ]  [ 支付宝 ]     │    │
│  │  [ 现金(前台) ]               │    │
│  │                               │    │
│  │  ┌─────────────────────┐     │    │
│  │  │ 模拟微信支付扫码界面  │     │    │
│  │  │                     │     │    │
│  │  │   [ 付款码图片 ]     │     │    │
│  │  │                     │     │    │
│  │  │   应付：￥1,980.00   │     │    │
│  │  └─────────────────────┘     │    │
│  │                               │    │
│  │  [ 模拟支付成功 ]              │    │
│  │  [ 模拟支付失败 ]              │    │
│  │                               │    │
│  └──────────────────────────────┘    │
       │
       │ 用户点击"模拟支付成功"
       ▼
生成Mock transaction_id:
  "MOCK_WXPAY_20260701_" + nanoid(10)
       │
       ▼
调用 /api/v1/payment/mock-callback
       │
       ▼
服务端处理：
  1. 校验订单状态 = "pending"
  2. 更新订单状态 → "paid"
  3. 创建Payment记录
  4. 创建Enrollment记录（开通学习权限）
  5. 创建Notification记录（购买成功站内信）
  6. 创建MockEmail记录（购买成功邮件）
  7. 重定向到购买成功页面
```

**关键实现：**

模块 `src/lib/mock/payment.ts`：

```typescript
// 模拟支付回调处理
export async function processMockPayment(orderId: string, method: 'wechat' | 'alipay' | 'cash') {
  const transactionId = `MOCK_${method.toUpperCase()}_${new Date().toISOString().slice(0,10)}_${nanoid(10)}`;

  // 1. 更新订单状态（带乐观锁检查）
  const order = await prisma.order.update({
    where: { id: orderId, status: 'pending' },
    data: {
      status: 'paid',
      paidAt: new Date(),
      paid_amount: /* payable_amount */,
    },
  });

  // 2. 创建支付记录
  await prisma.payment.create({
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

  // 3. 创建报名记录（开通学习权限）
  const orderItems = await prisma.orderItem.findMany({ where: { orderId } });
  for (const item of orderItems) {
    await prisma.enrollment.create({
      data: {
        scheduleId: item.scheduleId,
        userId: order.buyerId,
        orderId,
        status: 'active',
      },
    });
  }

  // 4. 发送Mock通知
  await createMockNotifications(order);

  return { success: true, transactionId };
}
```

**Mock支付的特点：**
- 前端展示逼真的支付界面（用Tailwind CSS模拟微信/支付宝扫码UI）
- 后端不调用任何外部API
- 支付结果完全由用户点击"成功"/"失败"按钮控制
- transaction_id 带 `MOCK_` 前缀，一眼可辨
- 订单状态机逻辑完全真实（和真实支付走同一套代码）

### C.2 短信/邮件Mock

**方案：全部存储到数据库，在Admin Console中查看**

#### 数据库表设计

```sql
-- Mock短信记录
CREATE TABLE mock_sms (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  content TEXT NOT NULL,
  template_code TEXT,
  status TEXT DEFAULT 'sent',  -- sent / failed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Mock邮件记录
CREATE TABLE mock_email (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**实现：**

模块 `src/lib/mock/notification.ts`：

```typescript
// 替代真实的短信发送
export async function sendMockSms(phone: string, content: string, templateCode?: string) {
  const record = await prisma.mockSms.create({
    data: { phone, content, templateCode, status: 'sent' },
  });
  console.log(`[MOCK SMS] To: ${phone}, Content: ${content}`);
  return record;
}

// 替代真实的邮件发送
export async function sendMockEmail(to: string, subject: string, bodyHtml: string) {
  const record = await prisma.mockEmail.create({
    data: { toEmail: to, subject, bodyHtml, status: 'sent' },
  });
  console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
  return record;
}
```

**在Admin Console中的展示：**

在 `/admin/mock-notifications` 页面：
- 左侧Tab：短信记录 / 邮件记录
- 列表显示所有Mock通知
- 支持搜索（按手机号或邮箱）
- 支持查看详情

**效果：**
- 业务代码调用的是统一的 `sendNotification()` 接口
- 接口内部根据环境变量 `MOCK_SMS` / `MOCK_EMAIL` 决定走Mock还是真实服务
- Mock版本把数据存到数据库，方便Demo时展示
- 控制台也会输出日志（Docker logs可见）

### C.3 文件上传Mock

**方案：本地文件系统存储**

**不使用MinIO/OSS的理由：**
- 原型阶段文件量极小（几张课程封面、证书模板），不需要对象存储
- MinIO虽然可以Docker部署，但多一个容器 = 多一个启动失败点
- 本地文件系统足够直观，BA可以直接在 `public/uploads/` 目录看到上传的文件

**实现：**

```typescript
// src/lib/storage.ts
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function uploadFile(file: File, category: 'course-cover' | 'certificate-template' | 'avatar') {
  // 确保目录存在
  await mkdir(path.join(UPLOAD_DIR, category), { recursive: true });

  const ext = file.name.split('.').pop();
  const filename = `${category}_${nanoid(10)}.${ext}`;
  const relativePath = `/uploads/${category}/${filename}`;
  const absolutePath = path.join(UPLOAD_DIR, category, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  // 返回可访问的URL路径
  return relativePath; // 例如: /uploads/course-cover/course-cover_abc123.jpg
}
```

**访问：** Next.js的 `public/` 目录下的文件可以直接通过URL访问。如 `http://localhost:3000/uploads/course-cover/xxx.jpg`。

---

## D. 种子数据设计

### D.1 完整故事线

**"星光职业培训学校"的故事：**

> 星光职业培训学校是一家IT培训机构，有1个校区。校长张老师（Editor）创建了3门课程。学员李明通过官网购买了Python课程，使用了政府技能补贴（Funding）。另一位学员王芳到前台找工作人员小红（Desk）咨询，小红帮她代购了UI设计课程。Python班在7月15日开课，讲师赵师傅给学员做了考勤签到。课程结束后，李明顺利拿到了证书。

### D.2 实体种子数据数量

| 实体 | 数量 | 说明 |
|------|------|------|
| **Tenant** | 1 | 星光职业培训学校 |
| **User** | 6 | 覆盖4种角色 |
| **Course** | 3 | Python全栈、UI设计、项目管理（不同类型/价格） |
| **CourseVersion** | 3 | 每门课程1个版本 |
| **FundingType** | 2 | 政府技能补贴、企业培训报销 |
| **CourseFunding** | 2 | Python关联政府补贴、UI设计关联企业报销 |
| **Schedule** | 4 | 3个课程各至少1个班次 |
| **Classroom** | 2 | 301教室、302教室 |
| **Order** | 3 | 1个线上已完成、1个前台代购已完成、1个待支付 |
| **OrderItem** | 3 | 每个订单1个明细 |
| **Payment** | 2 | 微信支付1条、现金1条 |
| **Refund** | 1 | 1条退款记录（展示流程） |
| **Enrollment** | 4 | 李明报Python、王芳报UI设计、还有一个报了项目管理 |
| **Attendance** | 6 | Python班3条（1出勤+1迟到+1请假）、UI设计班3条 |
| **Certificate** | 1 | 李明Python课程证书 |
| **Assessment** | 1 | Python课程结业考核 |
| **Grade** | 1 | 李明的批改结果（通过） |
| **Notification** | 6+ | 各场景的通知记录 |
| **MockSms** | 3 | 开课提醒短信 |
| **MockEmail** | 4 | 购买成功邮件、证书发放邮件 |
| **DiscountRule** | 1 | 早鸟优惠券 |

**总计约 50+ 条种子数据**，覆盖了从注册到发证的完整Happy Path。

### D.3 详细种子数据表

#### Tenant（1条）

| 字段 | 值 | 说明 |
|------|-----|------|
| id | `tenant-001` | |
| name | 星光职业培训学校 | |
| logo | `/uploads/tenant-logo.png` | |
| contact_phone | `010-8888-6666` | |
| contact_email | `admin@starlight-edu.cn` | |
| address | 北京市朝阳区建国路88号 | |
| status | `active` | |
| subscription_plan | `starter` | |

#### User（6条，4种角色）

| id | role | display_name | phone | email | 故事角色 |
|------|------|-------------|-------|-------|---------|
| `user-editor` | editor | 张校长 | `13800001001` | `zhang@starlight-edu.cn` | 机构管理者，做课程管理、审批、看报表 |
| `user-desk` | desk | 小红 | `13800001002` | `xiaohong@starlight-edu.cn` | 前台工作人员，帮学员代购、收款、签到 |
| `user-trainer` | trainer | 赵师傅 | `13800001003` | `zhao@starlight-edu.cn` | Python讲师，负责上课、考勤、批改 |
| `user-learner-1` | learner | 李明 | `13800001004` | `liming@email.cn` | 线上自助购买Python课程 |
| `user-learner-2` | learner | 王芳 | `13800001005` | `wangfang@email.cn` | 线下前台代购UI设计课程 |
| `user-learner-3` | learner | 陈强 | `13800001006` | `chenqiang@email.cn` | 已注册未购买（展示漏斗） |

**所有用户密码（种子数据）：** `password123`（SHA-256哈希存储）

#### Course（3条，不同类型/价格）

| id | title | type | base_price(分) | status | 故事场景 |
|------|-------|------|---------------|--------|---------|
| `course-python` | Python全栈开发实战 | offline | 198000 (￥1,980) | published | 招牌课程，关联政府补贴，有证书 |
| `course-ui` | UI设计从入门到精通 | offline | 168000 (￥1,680) | published | 关联企业报销，Desk代购场景 |
| `course-pm` | 项目管理PMP认证 | offline | 298000 (￥2,980) | published | 高价课程，无Funding，展示纯自费购买 |

#### FundingType（2条）

| id | name | source | rule | amount/rate | budget_limit | 关联课程 |
|------|------|--------|------|------------|-------------|---------|
| `funding-gov` | 政府职业技能提升补贴 | government | fixed_per_head | 50000分(￥500) | 2000000(￥20,000) | course-python |
| `funding-enterprise` | 企业培训报销 | enterprise | percentage | 30% | 1000000(￥10,000) | course-ui |

#### Schedule（4条）

| id | course_id | title | start_time | end_time | capacity | enrolled | price | status | trainer |
|------|-----------|-------|-----------|---------|---------|---------|-------|--------|---------|
| `sched-py-01` | course-python | Python第15期周末班 | 2026-07-15 09:00 | 2026-09-15 18:00 | 30 | 1 | 198000 | open | user-trainer |
| `sched-ui-01` | course-ui | UI设计第8期晚班 | 2026-07-20 19:00 | 2026-09-20 21:30 | 25 | 1 | 168000 | open | (null) |
| `sched-pm-01` | course-pm | PMP第3期集训班 | 2026-08-01 09:00 | 2026-08-15 18:00 | 20 | 1 | 298000 | open | (null) |
| `sched-py-02` | course-python | Python第16期暑假班 | 2026-08-01 09:00 | 2026-09-30 18:00 | 25 | 0 | 198000 | open | user-trainer |

#### 完整购买流程（核心故事线）

**故事线A：李明线上自助购买Python课程（Happy Path）**

```
Step 1: 李明浏览官网 → 看到Python课程 → 点击详情
Step 2: 看到有"政府职业技能提升补贴"，可减免￥500
Step 3: 点击"立即报名" → 选择"Python第15期周末班"
Step 4: 进入结算页 → 原始价格￥1,980 → Funding折扣 -￥500 → 实付￥1,480
Step 5: 点击"去支付" → Mock微信支付 → 支付成功
Step 6: 自动开通学习权限 → 收到站内信和邮件通知

数据：
- Order(order-001): buyer=user-learner-1, channel=online, payable_amount=148000, status=paid
- OrderItem: schedule=sched-py-01, discount_detail包含funding记录
- Payment: method=wechat, transaction_id=MOCK_WXPAY_xxx
- Enrollment: user=user-learner-1, schedule=sched-py-01, status=active
- Notification(站内信): "恭喜你成功报名Python全栈开发实战！"
- MockEmail: 购买确认邮件
```

**故事线B：王芳前台代购UI设计课程（Desk场景）**

```
Step 1: 王芳到前台咨询UI设计课程
Step 2: Desk小红在Admin Console搜索学员"王芳"
Step 3: 小红点击"前台代购" → 选择UI设计课程 → 第8期晚班
Step 4: 系统自动计算：原始￥1,680 → 企业报销30%(-￥504) → 实付￥1,176
Step 5: 王芳扫码支付（Mock）/现金 → 小红确认收款
Step 6: 自动开通权限 → 发送通知

数据：
- Order(order-002): buyer=user-learner-2, operator=user-desk, channel=desk, payable_amount=117600, status=paid
- Payment: method=cash, transaction_id=MOCK_CASH_xxx
- Enrollment: user=user-learner-2, schedule=sched-ui-01, status=active
```

**故事线C：陈强的待支付订单（展示超时取消）**

```
数据：
- Order(order-003): buyer=user-learner-3, channel=online, payable_amount=298000, status=pending, expires_at=2026-07-01T18:00:00
- 30分钟未支付会自动取消（展示订单状态机）
```

#### Attendance（6条）

| id | schedule_id | user_id | status | check_in_method | 故事场景 |
|------|------------|---------|--------|----------------|---------|
| att-01 | sched-py-01 | user-learner-1 | present | manual | 李明正常出勤 |
| att-02 | sched-py-01 | (其他学员) | late | manual | 某学员迟到（展示迟到标记） |
| att-03 | sched-py-01 | (其他学员) | excused | manual | 某学员请假（展示请假标记） |
| att-04 | sched-ui-01 | user-learner-2 | present | manual | 王芳正常出勤 |
| att-05 | sched-ui-01 | (其他学员) | absent | — | 某学员缺勤 |
| att-06 | sched-ui-01 | (其他学员) | early_leave | manual | 某学员早退 |

#### Certificate（1条）

| 字段 | 值 |
|------|-----|
| id | `cert-001` |
| certificate_number | `CERT-STARLIGHT-2026-000001` |
| user_id | `user-learner-1` (李明) |
| course_id | `course-python` |
| schedule_id | `sched-py-01` |
| issue_date | 2026-09-16 |
| status | `issued` |

### D.4 种子数据覆盖的场景矩阵

| 场景 | 是否覆盖 | 涉及数据 |
|------|---------|---------|
| 学员注册+登录 | 是 | user-learner-1,2,3 |
| 浏览课程列表 | 是 | course-python, course-ui, course-pm |
| 查看课程详情(含Funding信息) | 是 | course-python + funding-gov |
| 线上自助购买+Funding折扣 | 是 | order-001 完整流程 |
| 前台代购 | 是 | order-002 完整流程 |
| 待支付→超时取消 | 是 | order-003 |
| 支付成功通知(站内信+邮件) | 是 | notification + mock_email |
| 开课提醒短信 | 是 | mock_sms |
| 课程排期查看 | 是 | 4条schedule |
| 考勤签到(出勤/迟到/请假/缺勤) | 是 | 6条attendance |
| 考核+批改 | 是 | assessment + grade |
| 证书发放+查验 | 是 | cert-001 |
| 学员360视图 | 是 | 聚合user-learner-1的order+enrollment+certificate |
| 角色权限差异 | 是 | 4种角色登录后看到不同菜单 |

---

## E. 代码结构设计

### E.1 设计原则

1. **模块边界清晰**：即使单体应用，每个业务模块有独立目录
2. **AI理解友好**：每个目录职责单一，不超过10个文件
3. **生成顺序明确**：基础设施 → 数据模型 → 公共组件 → 业务模块 → 页面
4. **类型定义前置**：定义好类型再写业务逻辑

### E.2 完整目录结构

```
funding-prototype/
│
├── docker-compose.yml              # 一键启动
├── Dockerfile                       # 容器构建
├── .dockerignore
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
│
├── prisma/
│   ├── schema.prisma                # 数据模型定义（单文件，所有表）
│   ├── migrations/                  # 数据库迁移文件（自动生成）
│   └── seed.ts                      # 种子数据脚本
│
├── public/
│   └── uploads/                     # 本地文件存储
│       ├── course-cover/
│       ├── certificate-template/
│       └── avatar/
│
├── src/
│   ├── app/                         # Next.js App Router（路由+页面）
│   │   ├── layout.tsx               # 根布局（全局样式、Provider）
│   │   ├── page.tsx                 # 首页（Website课程列表）
│   │   ├── globals.css              # 全局样式
│   │   │
│   │   ├── (website)/              # Website路由组（学员官网）
│   │   │   ├── layout.tsx          # Website布局（导航栏、页脚）
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx        # 课程列表
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # 课程详情
│   │   │   ├── schedules/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # 班次详情+报名
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx        # 结算页
│   │   │   ├── payment/
│   │   │   │   └── [orderId]/
│   │   │   │       └── page.tsx    # Mock支付页面
│   │   │   ├── account/
│   │   │   │   ├── page.tsx        # 个人中心
│   │   │   │   ├── orders/
│   │   │   │   ├── courses/
│   │   │   │   └── certificates/
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── (admin)/               # Admin Console路由组
│   │   │   ├── layout.tsx         # Admin布局（侧边栏+顶栏）
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── schedules/
│   │   │   ├── orders/
│   │   │   │   └── desk/          # Desk前台代购快捷视图
│   │   │   ├── funding/
│   │   │   ├── users/
│   │   │   │   └── [id]/
│   │   │   │       └── profile-360/
│   │   │   ├── attendance/
│   │   │   ├── certificates/
│   │   │   ├── notifications/
│   │   │   │   └── mock/          # Mock短信/邮件查看页
│   │   │   └── settings/
│   │   │
│   │   ├── (desk)/                # Desk快捷工作台路由组
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # 工作台首页
│   │   │   ├── quick-order/
│   │   │   ├── checkin/
│   │   │   └── today-schedules/
│   │   │
│   │   └── api/                   # API Routes (REST接口)
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   └── register/route.ts
│   │       ├── users/route.ts
│   │       ├── courses/route.ts
│   │       ├── schedules/route.ts
│   │       ├── orders/route.ts
│   │       ├── funding/
│   │       │   ├── calculate/route.ts  # 折扣计算核心接口
│   │       │   └── types/route.ts
│   │       ├── attendance/route.ts
│   │       ├── certificates/route.ts
│   │       ├── notifications/route.ts
│   │       ├── payment/
│   │       │   └── mock-callback/route.ts  # Mock支付回调
│   │       └── health/route.ts    # Docker健康检查
│   │
│   ├── components/                 # 共享UI组件
│   │   ├── ui/                     # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...                 # 其他shadcn组件
│   │   ├── layout/
│   │   │   ├── website-nav.tsx     # Website导航栏
│   │   │   ├── admin-sidebar.tsx   # Admin侧边栏
│   │   │   ├── admin-header.tsx    # Admin顶栏
│   │   │   └── desk-layout.tsx     # Desk工作台布局
│   │   ├── course/
│   │   │   ├── course-card.tsx     # 课程卡片
│   │   │   ├── course-list.tsx     # 课程列表
│   │   │   └── course-detail.tsx   # 课程详情
│   │   ├── schedule/
│   │   │   ├── schedule-picker.tsx # 排期选择器
│   │   │   └── calendar-view.tsx   # 日历视图
│   │   ├── order/
│   │   │   ├── order-summary.tsx   # 订单摘要
│   │   │   ├── discount-breakdown.tsx # 折扣明细
│   │   │   └── payment-form.tsx    # Mock支付表单
│   │   ├── funding/
│   │   │   └── funding-badge.tsx   # Funding标签
│   │   └── shared/
│   │       ├── data-table.tsx      # 通用数据表格
│   │       ├── status-badge.tsx    # 状态标签
│   │       ├── empty-state.tsx     # 空状态
│   │       └── loading.tsx         # 加载状态
│   │
│   ├── lib/                        # 业务逻辑库
│   │   ├── prisma.ts               # Prisma客户端单例
│   │   ├── auth.ts                 # JWT认证工具
│   │   ├── tenant.ts               # 多租户上下文
│   │   ├── constants.ts            # 常量定义
│   │   ├── utils.ts                # 通用工具函数
│   │   │
│   │   ├── uem/                    # 用户管理模块
│   │   │   ├── user-service.ts     # 用户CRUD
│   │   │   └── profile-360.ts      # 360视图聚合
│   │   │
│   │   ├── cls/                    # 课程管理模块
│   │   │   ├── course-service.ts   # 课程CRUD+状态流转
│   │   │   ├── schedule-service.ts # 排期管理+名额
│   │   │   └── classroom-service.ts# 教室管理
│   │   │
│   │   ├── funding/                # 资助管理模块
│   │   │   ├── funding-type-service.ts
│   │   │   ├── funding-application-service.ts
│   │   │   └── discount-engine.ts  # 统一折扣引擎（核心）
│   │   │
│   │   ├── billing/                # 支付结算模块
│   │   │   ├── order-service.ts    # 订单CRUD+状态机
│   │   │   ├── payment-service.ts  # 支付处理
│   │   │   └── refund-service.ts   # 退款处理
│   │   │
│   │   ├── ca/                     # 上课管理模块
│   │   │   ├── attendance-service.ts
│   │   │   ├── assessment-service.ts
│   │   │   └── certificate-service.ts
│   │   │
│   │   ├── notification/           # 通知模块
│   │   │   ├── notification-service.ts
│   │   │   └── template-service.ts
│   │   │
│   │   └── mock/                   # Mock服务
│   │       ├── payment.ts          # Mock支付处理
│   │       ├── sms.ts             # Mock短信
│   │       └── email.ts           # Mock邮件
│   │
│   ├── types/                      # TypeScript类型定义
│   │   ├── user.ts                 # 用户相关类型
│   │   ├── course.ts               # 课程相关类型
│   │   ├── order.ts                # 订单相关类型
│   │   ├── funding.ts              # Funding相关类型
│   │   ├── attendance.ts           # 考勤相关类型
│   │   ├── certificate.ts          # 证书相关类型
│   │   ├── notification.ts         # 通知相关类型
│   │   └── common.ts               # 公共类型（分页、响应格式等）
│   │
│   └── hooks/                      # React Hooks
│       ├── use-auth.ts             # 认证Hook
│       ├── use-tenant.ts           # 租户上下文Hook
│       └── use-toast.ts            # Toast通知Hook
│
├── data/                           # SQLite数据库文件（挂载卷）
│   └── .gitkeep
│
└── scripts/
    └── reset-db.sh                 # 重置数据库脚本
```

### E.3 AI生成顺序（Build Order）

AI需要按照依赖顺序逐步生成代码。以下是推荐的生成顺序：

```
Phase 0: 基础设施（AI生成第一步）
├── Step 0.1: 项目初始化
│   - package.json, tsconfig.json, next.config.js
│   - tailwind.config.ts, postcss.config.js
│   - Dockerfile, docker-compose.yml
│
├── Step 0.2: 数据模型
│   - prisma/schema.prisma（所有表定义）
│   - prisma/seed.ts（种子数据）
│   - 执行 prisma migrate dev
│
├── Step 0.3: 基础库
│   - src/lib/prisma.ts
│   - src/lib/auth.ts
│   - src/lib/tenant.ts
│   - src/lib/utils.ts
│   - src/lib/constants.ts
│
└── Step 0.4: 类型定义
    - src/types/*.ts（所有类型文件）

Phase 1: 公共UI组件（AI生成第二步）
├── Step 1.1: shadcn/ui组件初始化
├── Step 1.2: 布局组件
│   - website-nav, admin-sidebar, admin-header
├── Step 1.3: 共享组件
│   - data-table, status-badge, loading, empty-state
│
└── Step 1.4: 根布局
    - src/app/layout.tsx
    - 路由组布局

Phase 2: 业务模块（按依赖顺序生成）
├── Step 2.1: UEM模块（最先，因为其他模块都依赖用户）
│   - lib/uem/*
│   - api/auth/*
│   - api/users/*
│   - 登录/注册页面
│
├── Step 2.2: CLS模块
│   - lib/cls/*
│   - api/courses/*
│   - api/schedules/*
│   - 课程列表/详情/排期页面
│
├── Step 2.3: Funding模块
│   - lib/funding/*
│   - api/funding/*
│   - 资助配置/申请页面
│
├── Step 2.4: Billing模块
│   - lib/billing/*
│   - api/orders/*
│   - api/payment/*
│   - 购物车/结算/支付页面
│
├── Step 2.5: CA模块
│   - lib/ca/*
│   - api/attendance/*
│   - api/certificates/*
│   - 考勤/证书页面
│
└── Step 2.6: 通知+Mock
    - lib/notification/*
    - lib/mock/*
    - 通知查看/Mock记录页面

Phase 3: 跨模块数据流打通
├── Step 3.1: 购买流程端到端
│   - 选课 → 计算折扣 → 下单 → Mock支付 → 开权限 → 发通知
│
├── Step 3.2: Desk代购流程
│   - 搜索学员 → 代选课程 → 代下单 → 确认收款
│
├── Step 3.3: 考勤+证书流程
│   - 排期 → 考勤签到 → 结课 → 发证
│
└── Step 3.4: 学员360视图
    - 聚合订单+课程+证书+考勤数据
```

### E.4 模块间数据依赖关系

```
                     UEM（用户管理）
                    /  |  |  \
                   /   |  |   \
          ┌────────┐   │  │   ┌──────────┐
          v        v   v  v   v          v
        CLS      Billing   CA      Notification
      （课程）   （支付）  （上课）    （通知）
          \        /  \    /
           \      /    \  /
            v    v      vv
          Funding     Certificate
         （资助）      （证书）
```

**AI生成时的注意事项：**
- UEM必须在最前面生成（所有模块的User引用都指向它）
- Billing依赖CLS（课程价格）和Funding（折扣计算）
- CA依赖CLS（排期信息）和UEM（学员和讲师）
- Notification被所有模块调用，但可以后做（先Mock）

---

## F. 云同步方案

### F.1 GitHub vs Gitee

| 维度 | GitHub | Gitee（码云） |
|------|--------|--------------|
| 访问速度（国内） | 偶尔慢，需加速 | 快 |
| AI工具集成 | Copilot原生、绝大多数AI工具默认支持 | 部分支持 |
| CI/CD | GitHub Actions 2000分钟/月免费 | Gitee CI 需单独配置 |
| 社区生态 | 全球最大，问题搜索方便 | 国内开发者多 |
| 私有仓库 | 免费无限制 | 免费有成员限制 |
| 对于BA的学习曲线 | 相同（都是Git操作） | 相同 |

**推荐：GitHub**

理由：
1. **AI工具的原生地**：GitHub Copilot、Claude Code、Cursor等AI开发工具都深度集成GitHub。Gitee的支持相对较弱。
2. **GitHub Actions免费额度足够**：原型项目不需要高频CI/CD，2000分钟/月足够用。
3. **如果访问慢**：可以配置代理，或者同时推送到GitHub和Gitee（`git remote` 添加两个远端）。
4. **长远考虑**：如果未来要做海外市场，GitHub是唯一选择。

**备选：两者都推送。** 设置两个remote：
```bash
git remote add origin https://github.com/xxx/funding-prototype.git
git remote set-url --add origin https://gitee.com/xxx/funding-prototype.git
```

### F.2 仓库结构

```
https://github.com/[your-username]/funding-prototype

funding-prototype/
├── .github/
│   └── workflows/
│       └── docker-build.yml       # CI：自动构建Docker镜像
├── src/
├── prisma/
├── public/
├── docker-compose.yml
├── Dockerfile
├── README.md                       # 项目说明
└── ...
```

### F.3 .gitignore 配置

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# SQLite database files (数据库不提交，每次从种子数据重建)
data/*.db
data/*.db-journal
data/*.db-wal

# uploads (本地上传的文件不提交)
public/uploads/*
!public/uploads/.gitkeep

# IDE
.idea/
.vscode/
*.swp
*.swo

# Docker
.docker/
```

### F.4 CI/CD方案（可选，推荐MVP阶段不配置）

**推荐：MVP阶段不配置CI/CD。** 理由：
- 本地原型，不需要自动部署
- Docker Compose一键启动已经足够简单
- CI/CD配置对BA来说是额外负担

**如果未来需要CI/CD（比如分享给远程同事使用）：**

`.github/workflows/docker-build.yml`：

```yaml
name: Build Docker Image

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: funding-prototype:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Run Prisma check
        run: |
          docker run --rm funding-prototype:latest npx prisma validate
```

### F.5 设置步骤（给BA的简明指南）

**Step 1: 安装Git**

Windows: 下载 Git for Windows https://git-scm.com/download/win
Mac: 系统自带或 `brew install git`

**Step 2: 配置Git身份**

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

**Step 3: 创建GitHub仓库**

1. 打开 https://github.com/new
2. Repository name: `funding-prototype`
3. Description: 教育培训机构全流程管理平台 - 本地高保真原型
4. 选择 Private（私有仓库，推荐）
5. 不要勾选 "Add a README file"（已有本地代码）
6. 点击 "Create repository"

**Step 4: 初始化本地仓库并推送**

```bash
cd d:/funding/funding-prototype

# 初始化
git init
git add .
git commit -m "feat: initial prototype setup with Next.js + SQLite"

# 关联远程仓库
git remote add origin https://github.com/[你的用户名]/funding-prototype.git

# 推送
git branch -M main
git push -u origin main
```

**Step 5: 日常使用（AI生成代码后）**

```bash
# AI生成了新代码后
git add .
git commit -m "feat: add user management module"
git push

# 回退到上一个版本（如果AI生成的代码有问题）
git log --oneline          # 查看提交历史
git reset --hard HEAD~1    # 回退到上一个版本
```

---

## 附录：AI辅助开发策略

### A.1 与AI对话的技巧（给BA的指南）

**1. 一次只让AI做一件事**

不好： "帮我创建整个课程管理系统"
好： "帮我创建Course的Prisma模型，包含以下字段：title, description, base_price, ..."

**2. 始终提供上下文**

```
在 src/lib/cls/course-service.ts 中，我需要一个创建课程的函数。
这个函数应该：
- 接收 CreateCourseInput 类型（在 src/types/course.ts 中定义）
- 验证课程名称不为空
- 设置默认状态为 'draft'
- 关联到当前登录用户的 tenant_id
- 返回创建的课程对象
```

**3. 生成后立即测试**

每生成一个模块，让AI同时生成对应的测试页面或API测试命令，确保代码能跑通。

**4. 遇到错误时，把错误信息完整贴给AI**

```
运行 npm run dev 后出现以下错误：
[错误信息完整粘贴]

请帮我修复。
```

### A.2 推荐的AI工具

| 工具 | 用途 | 费用 |
|------|------|------|
| **Claude Code** | 命令行AI编程助手，可以直接读写文件、执行命令 | 按API用量 |
| **Claude.ai** | 对话式代码生成，适合生成完整文件 | 付费版$20/月 |
| **GitHub Copilot** | IDE内联代码补全，适合小步修改 | $10/月 |
| **Cursor** | AI原生IDE，适合大量代码生成 | 免费/Pro $20/月 |

**对BA的推荐组合：Claude Code（主）+ Claude.ai（辅助）**

- Claude Code 可以直接在项目目录中帮你生成文件、运行命令、修复错误
- Claude.ai 用于讨论设计思路、理解复杂概念

### A.3 预估AI生成效率

基于本方案的极简技术栈（Next.js + SQLite + shadcn/ui），AI生成代码的效率估计：

| 模块 | 预估AI对话轮次 | 预估耗时（含调试） |
|------|-------------|-----------------|
| 项目初始化 + Docker | 2-3轮 | 0.5天 |
| Prisma模型 + 种子数据 | 3-4轮 | 1天 |
| 基础布局 + 导航 | 2-3轮 | 0.5天 |
| UEM（认证+用户管理） | 5-6轮 | 1.5天 |
| CLS（课程+排期） | 6-8轮 | 2天 |
| Funding（折扣引擎） | 5-7轮 | 1.5天 |
| Billing（订单+Mock支付） | 8-10轮 | 2天 |
| CA（考勤+证书） | 6-8轮 | 1.5天 |
| 通知+Mock查看 | 3-4轮 | 1天 |
| 跨模块数据流打通 | 4-6轮 | 1天 |
| 调试+修Bug | 持续 | 2天 |
| **总计** | **~50轮对话** | **~14天（2周）** |

对比蓝图中提到的"一人全职开发5-6个月"，AI辅助可以将开发时间缩短到**2周左右**（非全职，每天几个小时）。这就是极简技术栈的价值。

### A.4 里程碑检查清单

| 里程碑 | 验证方式 | 完成标志 |
|--------|---------|---------|
| M0: Docker启动 | `docker compose up` 后访问 localhost:3000 | 看到首页 |
| M1: 数据库就绪 | Prisma Studio访问数据 | 看到种子数据 |
| M2: 用户认证 | 用种子用户登录 | 登录后看到对应角色的页面 |
| M3: 课程浏览 | 访问课程列表 | 看到3门课程+Funding信息 |
| M4: 线上购买 | 李明登录→选课→结算→Mock支付 | 支付成功，自动跳转 |
| M5: 前台代购 | 小红登录→Desk工作台→帮王芳代购 | 代购完成，订单已支付 |
| M6: 考勤签到 | 赵师傅登录→考勤管理→标记签到 | 考勤记录更新 |
| M7: 证书发放 | Editor登录→证书管理→发放证书 | 证书生成，可查验 |
| M8: 360视图 | Editor登录→李明360视图 | 看到订单+考勤+证书聚合 |

---

*本文档为本地高保真原型技术方案v1.0。核心原则：极简、可运行、让AI高效生成。*
