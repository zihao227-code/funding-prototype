# 端到端测试用例

> 版本: v1.0 | 生成日期: 2026-07-01 | 状态: 待审查

---

## 用户旅程 (User Journeys)

### E2E-001: Learner 自助购买全流程

**故事**: 李明（user-learner-1）在官网浏览课程，选择班次，在线支付，查看订单。

| Step | 页面 | 操作 | 预期结果 |
|------|------|------|---------|
| 1 | `/courses` | 访问课程列表 | 看到3门 published 课程卡片，含价格和班次数 |
| 2 | `/courses/course-pm` | 点击 PMP 课程 | 看到课程详情、Funding信息、可选班次 |
| 3 | `/courses/course-pm` | 点击 "立即报名" (sched-pm-01) | cart 存入 localStorage，跳转到 `/checkout` |
| 4 | `/checkout` | 查看订单确认页 | 显示班次标题 + 价格 + 合计 |
| 5 | `/checkout` | 点击 "提交订单" | POST /api/v1/orders 成功，跳转到 `/payment/[orderId]` |
| 6 | `/payment/[orderId]` | 查看模拟支付页 | 订单号 + 金额 + 三种支付方式 |
| 7 | `/payment/[orderId]` | 选择微信支付，点击 "模拟支付成功" | 支付成功，跳转到 `/account/orders` |
| 8 | `/account/orders` | 查看我的订单 | 新订单出现在列表，状态 "已支付" |

**关键验证点**:
- [ ] 未登录时课程列表仅显示 published
- [ ] checkout 需要登录才能 POST /api/v1/orders
- [ ] 支付后 enrolledCount 正确递增
- [ ] 支付后 enrollment 记录已创建
- [ ] 支付后 notification 记录已创建

---

### E2E-002: Admin 课程管理全流程

**故事**: 张校长（user-editor）登录管理后台，创建新课程，添加排期，发布课程。

| Step | 页面 | 操作 | 预期结果 |
|------|------|------|---------|
| 1 | `/login` | 用 13800001001 + password123 + tenant-001 登录 | 跳转到 `/admin` |
| 2 | `/admin` | 查看仪表盘 | 显示3个统计卡片 |
| 3 | `/admin/courses` | 查看课程列表 | 表格显示3门课，含状态标签 |
| 4 | `/admin/courses/new` | 点击 "创建课程" | 跳转到创建表单 |
| 5 | `/admin/courses/new` | 填写 title="测试课程"+type=online+price=100 | 提交成功，跳转到课程编辑页 |
| 6 | `/admin/courses/[id]` | 点击 "添加排期" | 显示排期表单 |
| 7 | `/admin/courses/[id]` | 填写排期信息，确认 | 排期出现在列表中，status=open |
| 8 | `/admin/courses` | 返回课程列表 | 新课程出现，status=draft |
| 9 | `/admin/courses` | 点击 "发布" | 课程状态变为 published |

**关键验证点**:
- [ ] 登录后 localStorage 正确存储 token + user
- [ ] admin layout 侧边栏正确高亮当前页
- [ ] 课程创建后默认 status=draft
- [ ] 排期创建后默认 status=open
- [ ] 发布操作仅对 draft 课程可见

---

### E2E-003: Desk 代购 + 考勤管理全流程

**故事**: 前台小红（user-desk）代学员王芳下单，赵师傅（trainer）管理考勤。

| Step | 页面 | 操作 | 预期结果 |
|------|------|------|---------|
| 1 | `/login` | user-desk (13800001002) 登录 | 跳转 `/admin` |
| 2 | `/admin/orders` | 查看订单列表 | 看到 order-002 (Desk代购) |
| 3 | `/login` | user-trainer (13800001003) 登录 | 跳转 `/admin` |
| 4 | `/admin/attendance/sched-py-01` | 访问考勤花名册 | 看到学员列表 (李明 + 可能的others) |
| 5 | `/admin/attendance/sched-py-01` | 为李明设置 "迟到" | 状态更新成功，刷新列表 |
| 6 | `/admin/attendance/sched-py-01` | 为另一学员设置 "出勤" | 状态更新成功 |

**关键验证点**:
- [ ] Desk 代购订单 buyer != operator
- [ ] 考勤花名册仅显示该排期的 active enrollment
- [ ] 考勤 upsert 逻辑（重复标记应更新而非报错）

---

## 状态机测试

### E2E-SM-001: 订单状态机 (6 状态)

**初始**: 创建订单 (POST /api/v1/orders) -> pending

| # | 转换 | 触发操作 | 前置条件 | 后置条件 |
|---|------|---------|---------|---------|
| SM-ORD-1 | pending -> paid | POST /api/v1/payment/mock-callback | order exists, status=pending | status=paid, paidAt set, enrollment created |
| SM-ORD-2 | pending -> cancelled | POST /api/v1/orders/[id]/cancel | status=pending | status=cancelled |
| SM-ORD-3 | pending -> expired | GET /api/v1/orders/[id] (auto) | status=pending, expiresAt < now | status=expired |
| SM-ORD-4 | paid -> partial_refunded | (Phase 2: Refund API) | status=paid | status=partial_refunded |
| SM-ORD-5 | paid -> refunded | (Phase 2: Refund API) | status=paid | status=refunded |
| SM-ORD-6 | 验证 cancelled 不可支付 | POST mock-callback to cancelled order | status=cancelled | 400 error |
| SM-ORD-7 | 验证 expired 不可取消 | POST cancel to expired order | status=expired | 400 error |
| SM-ORD-8 | 验证 paid 不可取消 | POST cancel to paid order | status=paid | 400 error |

### E2E-SM-002: 课程状态流转 (3 状态)

| # | 转换 | 触发操作 | 前置条件 | 后置条件 |
|---|------|---------|---------|---------|
| SM-CLS-1 | draft -> published | POST /api/v1/courses/[id]/publish | status=draft | status=published, publishedAt set |
| SM-CLS-2 | published -> archived | POST /api/v1/courses/[id]/archive | status=published | status=archived, archivedAt set |
| SM-CLS-3 | 验证 published 不可再次发布 | POST publish to published course | status=published | 400 error |
| SM-CLS-4 | 验证 archived 可否再次发布 | POST publish to archived course | status=archived | 400 error (implied by "draft only" check) |
| SM-CLS-5 | 验证 draft 不可直接归档 | POST archive to draft course | status=draft | 200 (archiveCourse 无状态检查) |

### E2E-SM-003: 排期状态流转 (5 状态)

| # | 转换 | 触发操作 | 前置条件 | 后置条件 |
|---|------|---------|---------|---------|
| SM-SCH-1 | (创建时) -> open | POST /api/v1/courses/[id]/schedules | 新建 | status=open |
| SM-SCH-2 | open -> cancelled | POST /api/v1/schedules/[id]/cancel | status=open | status=cancelled, reason stored |
| SM-SCH-3 | 验证 cancelled 不可再报名 | createOrder with cancelled schedule | status=cancelled | 400 error |
| SM-SCH-4 | 验证可重复取消 | cancel already-cancelled schedule | status=cancelled | 200 (无状态检查) |

---

## 权限边界测试

### E2E-ACL-001: Role-based Access Control

| # | 角色 | 操作 | 预期结果 |
|---|------|------|---------|
| ACL-1 | Learner | POST /api/v1/courses (创建课程) | 401 (middleware rejects) |
| ACL-2 | Learner | POST /api/v1/courses/[id]/publish | 401 |
| ACL-3 | Learner | POST /api/v1/courses/[id]/archive | 401 |
| ACL-4 | Editor | GET /api/v1/orders (查看全部订单) | 200, 看到所有订单 |
| ACL-5 | Learner | GET /api/v1/orders (查看订单) | 200, 仅看到自己的订单 |
| ACL-6 | Learner | GET /api/v1/orders?userId=other-user | 200, 仍仅看到自己的 (后端截断) |
| ACL-7 | Editor | POST /api/v1/attendance (标记考勤) | 201 |
| ACL-8 | Learner | POST /api/v1/attendance | 201 (理论上学生可以签到) |
| ACL-9 | Unauthenticated | GET /api/v1/auth/me | 401 |
| ACL-10 | Unauthenticated | GET /api/v1/courses | 200 (公开读取) |

---

## 错误场景测试

### E2E-ERR-001: 4xx Error Responses

| # | 场景 | 操作 | 预期 HTTP | 预期 code |
|---|------|------|----------|-----------|
| ERR-1 | 不存在的课程 | GET /api/v1/courses/non-existent | 404 | NOT_FOUND |
| ERR-2 | 不存在的排期 | GET /api/v1/schedules/non-existent | 404 | NOT_FOUND |
| ERR-3 | 不存在的订单 | GET /api/v1/orders/non-existent | 404 | NOT_FOUND |
| ERR-4 | 注册缺少 displayName | POST /api/v1/auth/register (无name) | 422 | VALIDATION_FAILED |
| ERR-5 | 登录密码错误 | POST /api/v1/auth/login (wrong pwd) | 401 | INVALID_CREDENTIALS |
| ERR-6 | 缺少 Authorization | GET /api/v1/auth/me (no token) | 401 | UNAUTHORIZED |
| ERR-7 | 无效 Token | GET /api/v1/auth/me (Bearer fake) | 401 | UNAUTHORIZED |
| ERR-8 | 下单空排期 | POST /api/v1/orders {scheduleIds:[]} | 422 | VALIDATION_FAILED |
| ERR-9 | 手机号重复注册 | POST /api/v1/auth/register (existing phone) | 409 | PHONE_EXISTS |
| ERR-10 | 支付时缺少 orderId | POST /api/v1/payment/mock-callback {} | 422 | VALIDATION_FAILED |

### E2E-ERR-002: 5xx / 业务异常

| # | 场景 | 操作 | 预期 |
|---|------|------|------|
| ERR-11 | 已支付订单再支付 | POST mock-callback to paid order | 400, "订单状态为 paid，无法支付" |
| ERR-12 | 已取消订单再取消 | POST cancel to cancelled order | 400, "订单状态为 cancelled，无法取消" |
| ERR-13 | 发布非 draft 课程 | POST publish to published course | 400, "无法发布状态为 published 的课程" |
| ERR-14 | 满班排期下单 | createOrder with full schedule | 400, "排期已满班" |

---

## 种子数据故事线验证

### E2E-SEED-001: 故事线A — 已支付订单 (order-001)

| Step | 验证点 | 预期 |
|------|--------|------|
| 1 | GET /api/v1/orders/order-001 | status=paid, paidAmount=198000, buyer=user-learner-1 |
| 2 | 检查 enrollment | enrollment-001: scheduleId=sched-py-01, userId=user-learner-1, status=active |
| 3 | 检查 payment | payment-001: method=wechat, amount=198000, status=success |
| 4 | 检查 schedule enrolledCount | sched-py-01 enrolledCount >= 1 |
| 5 | Learner 查看自己的订单 | GET /api/v1/orders (as 李明) -> 能看到 order-001 |

### E2E-SEED-002: 故事线B — Desk 代购订单 (order-002)

| Step | 验证点 | 预期 |
|------|--------|------|
| 1 | GET /api/v1/orders/order-002 | channel=desk, buyerId=user-learner-2, operatorId=user-desk |
| 2 | 验证 buyer != operator | 王芳是买方，小红是操作员 |
| 3 | 对比 online vs desk 渠道 | order-001 channel=online, order-002 channel=desk |

### E2E-SEED-003: 故事线C — 过期订单 (order-003)

| Step | 验证点 | 预期 |
|------|--------|------|
| 1 | GET /api/v1/orders/order-003 | status=expired, paidAmount=0 |
| 2 | 验证无 enrollment | 过期订单不应有关联 enrollment |
| 3 | 验证无 payment | 过期订单不应有支付记录 |
| 4 | 验证不可取消 | POST cancel -> 400 error |

---

## 审查补充

> 审查人: 测试架构师 | 审查日期: 2026-07-01

### 遗漏的端到端测试用例

#### 用户旅程补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| E2E-004 | Learner 订单超时未支付见过期 | 创建订单后等待15分钟或手动触发 expire，刷新查看 status=expired |
| E2E-005 | Learner 在支付页取消订单 | 在 /payment/[orderId] 点 "取消订单"，确认跳转回课程列表 |
| E2E-006 | Admin 批量考勤 | 在考勤花名册逐个设置状态后确认全部已保存 |
| E2E-007 | Learner 注册后立即下单 | 注册返回 token 后不再手动登录，直接查看课程并下单 |
| E2E-008 | Admin 编辑课程基本信息 | 在 /admin/courses/[id] 修改 title/description (当前页面只管理排期，无课程编辑表单) |
| E2E-009 | Token 过期自动路由到登录 | accessToken 24h 过期后，apiClient 返回 401 自动跳转 /login |
| E2E-010 | refreshToken 刷新流程 | accessToken 过期后，用 refreshToken 调 /api/v1/auth/refresh 获取新 token |

#### 状态机补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| SM-ORD-9 | pending -> expired 批量转换 | 验证 expireOverdueOrders 批量更新多个过期订单 |
| SM-ORD-10 | paid -> partial_refunded -> refunded | Phase 2 退款状态机完整链路 |
| SM-CLS-6 | draft -> archived (直接归档) | archiveCourse 当前无状态检查，draft 可直接归档 |
| SM-CLS-7 | archived -> published (不允许) | publishCourse 仅允许 draft->published |
| SM-SCH-5 | open -> full | enrolledCount >= capacity 时状态应变为 full (当前代码未实现自动转换) |
| SM-SCH-6 | open -> completed | endTime 已过时应自动/手动标记 completed |

#### 权限边界补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| ACL-11 | Desk 能否创建课程 | middleware 不区分 editor/desk/trainer，任何含有效 JWT 的非 GET 请求均可通过 |
| ACL-12 | Trainer 能否管理订单 | trainer 角色在 middleware 层面与 editor 权限相同 |
| ACL-13 | Learner 查看其他用户订单 | 验证 URL 参数 ?userId=other-user 被后端截断未生效 |
| ACL-14 | 未登录访问 /admin 路径 | admin layout 应重定向到 /login |
| ACL-15 | Learner 访问 /admin 路径 | Learner 登录后手动输入 /admin URL |
| ACL-16 | 有效 token 但 role 不在 header | middleware 注入 headers，验证下游路由正确读取 x-user-role |

#### 错误场景补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| ERR-15 | 超长输入字段 | title > 100 chars, description > 5000 chars 的 Zod 边界 |
| ERR-16 | SQL注入尝试 | 在搜索/筛选参数中注入 SQL (Prisma 参数化查询应安全) |
| ERR-17 | XSS 尝试 | 在课程描述中注入 script 标签 |
| ERR-18 | 并发冲突 | 两个用户同时对最后一个名额下单 |
| ERR-19 | 数据库连接失败 | Prisma 连接断开时 errorResponse 返回 500 |
| ERR-20 | 非法 JSON body | POST 请求 body 不是合法 JSON |
| ERR-21 | Content-Type 错误 | POST 请求不带 application/json header |

#### 种子数据利用补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| SEED-007 | 种子用户密码统一验证 | 所有6个种子用户均可用 password123 登录 |
| SEED-008 | 验证 sched-py-01 enrolledCount | enrolledCount=1 (李明), 但 att-02/att-03 给王芳和陈强也在这个班有考勤记录 -- enrollment 与 attendance 可能不一致 |
| SEED-009 | 验证 sched-ui-01 enrolledCount | enrolledCount=1 (王芳), 但 att-04/att-05/att-06 给三个人都有考勤 -- 数据一致性检查 |
| SEED-010 | 验证教室容量 | classroom-301 capacity=30, sched-py-01 capacity=30 -- 排期容量 vs 教室容量关系 |
