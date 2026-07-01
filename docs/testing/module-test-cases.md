# 单模块测试用例

> 版本: v1.0 | 生成日期: 2026-07-01 | 状态: 待审查

---

## 1. Auth 模块

### 1.1 POST /api/v1/auth/register

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| AUTH-001 | 正常注册 | phone=13800009999, password=test123, displayName=测试学员, tenantId=tenant-001 | 201, 返回 accessToken + refreshToken + user, role=learner |
| AUTH-002 | 手机号已存在 | phone=13800001001 (种子数据已有) | 409, code=PHONE_EXISTS |
| AUTH-003 | 缺少必填字段 | 不传 displayName | 422, code=VALIDATION_FAILED |
| AUTH-004 | 手机号格式错误 | phone=123 | 422, 手机号格式不正确 |
| AUTH-005 | 密码过短 | password=123 | 422, 密码至少6位 |
| AUTH-006 | 邮箱格式错误 | email=invalid | 422, 邮箱格式不正确 |

### 1.2 POST /api/v1/auth/login

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| AUTH-007 | 正常登录 | phone=13800001001, password=password123, tenantId=tenant-001 | 200, 返回 accessToken + refreshToken + user |
| AUTH-008 | 密码错误 | phone=13800001001, password=wrong | 401, code=INVALID_CREDENTIALS |
| AUTH-009 | 用户不存在 | phone=13800009999, password=test123, tenantId=tenant-001 | 401, code=INVALID_CREDENTIALS |
| AUTH-010 | 缺少 tenantId | phone=13800001001, password=password123 | 422, 缺少机构ID |
| AUTH-011 | 缺少 phone | password=password123, tenantId=tenant-001 | 422 |

### 1.3 POST /api/v1/auth/refresh

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| AUTH-012 | 正常刷新 | 有效 refreshToken | 200, 返回新 accessToken |
| AUTH-013 | Token 无效 | 伪造的 refreshToken | 401, INVALID_TOKEN |
| AUTH-014 | 用户已禁用 | 禁用用户后刷新 | 401, USER_NOT_FOUND |
| AUTH-015 | 缺少 token | body={} | 422, 缺少refreshToken |

### 1.4 GET /api/v1/auth/me

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| AUTH-016 | 正常获取 | 有效 JWT | 200, 返回用户信息含 tenantName |
| AUTH-017 | 无认证 | 不传 Authorization header | 401, UNAUTHORIZED |
| AUTH-018 | Token 过期 | 过期 JWT | 401 |
| AUTH-019 | 用户不存在 | JWT 中 userId 查不到 | 404, USER_NOT_FOUND |

---

## 2. Courses 模块

### 2.1 GET /api/v1/courses

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| CLS-001 | 公开访问（未登录） | 无 Authorization | 200, 仅返回 status=published 课程 |
| CLS-002 | Admin 访问 | JWT (role=editor) | 200, 返回全部课程含 draft |
| CLS-003 | 按分类筛选 | ?category=IT技术 | 200, 仅返回 IT技术 分类 |
| CLS-004 | 分页 | ?page=1&pageSize=2 | 200, 返回第1页2条 |
| CLS-005 | 空列表 | 无课程数据 | 200, data=[], total=0 |

### 2.2 POST /api/v1/courses

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| CLS-006 | 正常创建 (Editor) | title=新课程, basePrice=0 | 201, status=draft, 含 coverImageUrl |
| CLS-007 | 无认证创建 | 不传 JWT | 401 |
| CLS-008 | Learner 尝试创建 | JWT (role=learner) | 401 (middleware拒绝非公开POST) |
| CLS-009 | 缺少标题 | 不传 title | 422 |
| CLS-010 | basePrice 为负数 | basePrice=-100 | 422, 价格不能为负 |
| CLS-011 | 超长标题 | title=101字符 | 422 |

### 2.3 GET /api/v1/courses/[id]

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| CLS-012 | 正常获取 | course-python | 200, 含 schedules + courseFundings + creator |
| CLS-013 | 不存在的课程 | non-existent-id | 404, Course not found |
| CLS-014 | 跨租户访问 | 其他租户的课程ID | 404 (查不到) |

### 2.4 PUT /api/v1/courses/[id]

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| CLS-015 | 正常更新标题 | {title: "新标题"} | 200, title已更新 |
| CLS-016 | 无认证 | 不传 JWT | 401 |
| CLS-017 | 不存在课程 | non-existent-id | 200 (Prisma会报错) |

### 2.5 POST /api/v1/courses/[id]/publish

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| CLS-018 | draft -> published | 现有 draft 课程 | 200, status=published, publishedAt 已设置 |
| CLS-019 | 非 draft 发布 | 已 published 的课程 | 400, "无法发布状态为 published 的课程" |
| CLS-020 | 课程不存在 | non-existent-id | 404 |
| CLS-021 | 无认证 | 不传 JWT | 401 |

### 2.6 POST /api/v1/courses/[id]/archive

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| CLS-022 | 正常归档 | published课程 | 200, status=archived, archivedAt 已设置 |
| CLS-023 | 无认证 | 不传 JWT | 401 |

---

## 3. Schedules 模块

### 3.1 GET /api/v1/schedules

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| SCH-001 | 全部排期 | 无参数 | 200, 包含全部排期含课程信息 |
| SCH-002 | 按状态筛选 | ?status=open | 200, 仅返回 open 排期 |
| SCH-003 | 按课程筛选 | ?courseId=course-python | 200, 仅返回该课程排期 |
| SCH-004 | 日期范围 | ?startDate=2026-07-01&endDate=2026-08-01 | 200 |

### 3.2 GET /api/v1/schedules/[id]

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| SCH-005 | 正常获取 | sched-py-01 | 200, 含 course/classroom/trainer |
| SCH-006 | 不存在 | non-existent-id | 404 |

### 3.3 PUT /api/v1/schedules/[id]

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| SCH-007 | 更新排期 | {capacity: 35} | 200, capacity已更新 |
| SCH-008 | 无认证 | 不传 JWT | 401 |

### 3.4 POST /api/v1/schedules/[id]/cancel

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| SCH-009 | 正常取消 | {reason: "讲师请假"} | 200, status=cancelled, 含 cancellationReason |
| SCH-010 | 无reason取消 | body={} | 200, status=cancelled, reason为null |

### 3.5 GET /api/v1/courses/[id]/schedules

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| SCH-011 | 获取课程排期 | course-python | 200, 返回该课程全部排期 |
| SCH-012 | 课程无排期 | 新创建的课程 | 200, [] |

### 3.6 POST /api/v1/courses/[id]/schedules

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| SCH-013 | 正常创建排期 | 完整 schedule 数据 | 201, status=open |
| SCH-014 | 缺少时间 | 不传 startTime | 422 |
| SCH-015 | capacity=0 | capacity=0 | 422, 容量至少为1 |

### 3.7 GET /api/v1/schedules/calendar

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| SCH-016 | 默认范围 | 无参数 | 200, 今天~30天后的排期，不含cancelled |
| SCH-017 | 自定义范围 | ?start=2026-08-01&end=2026-08-31 | 200 |

---

## 4. Orders 模块

### 4.1 GET /api/v1/orders

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| ORD-001 | Admin 查看全部 | JWT (role=editor) | 200, 返回全部订单 |
| ORD-002 | Learner 查看自己的 | JWT (role=learner, userId=user-learner-1) | 200, 仅返回自己的订单 |
| ORD-003 | 按状态筛选 | ?status=paid | 200, 仅返回已支付订单 |
| ORD-004 | 按渠道筛选 | ?channel=desk | 200, 仅返回Desk渠道订单 |
| ORD-005 | 无认证 | 不传 JWT | 401 |

### 4.2 POST /api/v1/orders

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| ORD-006 | 正常下单 | {scheduleIds: ["sched-pm-01"], channel: "online"} | 201, status=pending, expiresAt 为15分钟后 |
| ORD-007 | 空 scheduleIds | {scheduleIds: []} | 422, 请选择至少一个班次 |
| ORD-008 | 已满班排期 | fully booked schedule | 400/500, "排期已满班" |
| ORD-009 | cancelled 排期 | cancelled schedule | 400/500, "排期已关闭" |
| ORD-010 | 不存在的排期 | non-existent-id | 400/500, "排期不存在" |
| ORD-011 | 无认证 | 不传 JWT | 401 |

### 4.3 GET /api/v1/orders/[id]

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| ORD-012 | 正常查看 | order-001 | 200, 含 buyer/operator/orderItems/payments/refunds |
| ORD-013 | 不存在 | non-existent-id | 404 |
| ORD-014 | 已过期 pending 订单 | order-003 (已标记expired) | 200, status=expired (动态判断) |

### 4.4 POST /api/v1/orders/[id]/cancel

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| ORD-015 | 取消 pending 订单 | pending order | 200, status=cancelled |
| ORD-016 | 取消已支付订单 | order-001 (paid) | 400/500, "订单状态为 paid，无法取消" |
| ORD-017 | 取消已过期订单 | order-003 (expired) | 400/500, "订单状态为 expired，无法取消" |

---

## 5. Payment 模块

### 5.1 POST /api/v1/payment/mock-callback

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| PAY-001 | 微信支付 | {orderId: pending-order, method: "wechat"} | 200, success=true, 创建Enrollment+Payment+Notification |
| PAY-002 | 支付宝 | {orderId: pending-order, method: "alipay"} | 200, success=true |
| PAY-003 | 现金支付 | {orderId: pending-order, method: "cash"} | 200, success=true |
| PAY-004 | 缺少 orderId | body={} | 422, 缺少 orderId |
| PAY-005 | 订单不存在 | orderId=non-existent | 400/500, 订单不存在 |
| PAY-006 | 已支付订单 | orderId=order-001 (paid) | 400/500, "订单状态为 paid，无法支付" |
| PAY-007 | 支付后 enrolledCount 递增 | pending order with sched-py-01 | enrolledCount 增加1 |
| PAY-008 | 支付后创建通知 | pending order | notification 表有新记录 |

---

## 6. Attendance 模块

### 6.1 GET /api/v1/attendance

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| ATT-001 | 按排期查询 | ?scheduleId=sched-py-01 | 200, 返回该排期考勤记录 |
| ATT-002 | 按用户查询 | ?userId=user-learner-1 | 200, 返回该用户所有考勤 |
| ATT-003 | 分页 | ?page=1&pageSize=10 | 200 |

### 6.2 POST /api/v1/attendance

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| ATT-004 | 标记出勤 | {scheduleId, userId, status:"present"} | 201, 考勤记录已创建 |
| ATT-005 | 标记缺勤 | {scheduleId, userId, status:"absent"} | 201 |
| ATT-006 | 缺少必填字段 | {scheduleId} | 422 |
| ATT-007 | 覆盖已有考勤 | upsert 已存在的记录 | 200/201, 状态更新 |
| ATT-008 | 无认证 | 不传 JWT | 401 |

### 6.3 POST /api/v1/attendance/batch

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| ATT-009 | 批量标记 | {scheduleId, records: [{userId, status}, ...]} | 200, {count: N} |
| ATT-010 | 缺少 records | {scheduleId} | 422 |
| ATT-011 | records 非数组 | {scheduleId, records: "invalid"} | 422 |

### 6.4 GET /api/v1/schedules/[id]/attendance/roster

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| ATT-012 | 正常花名册 | sched-py-01 (有 enrollment) | 200, 返回学员列表含考勤状态 |
| ATT-013 | 无报名排期 | sched-pm-01 (enrolledCount=0) | 200, [] |
| ATT-014 | 无认证 | 不传 JWT | 401 |

---

## 7. 中间件 (Middleware)

| ID | 测试场景 | 输入 | 预期结果 |
|----|---------|------|---------|
| MW-001 | 公开路由不拦截 | GET /api/v1/courses (无token) | 通过 |
| MW-002 | POST 公开路由不拦截 | POST /api/v1/auth/login | 通过 |
| MW-003 | 非公开 GET 需认证 | GET /api/v1/auth/me (无token) | 401 |
| MW-004 | 非公开 POST 需认证 | POST /api/v1/attendance (无token) | 401 |
| MW-005 | 无效 Token | Authorization: Bearer fake | 401, Token无效 |
| MW-006 | 有效 Token 注入 Header | 有效 JWT | 通过, x-user-id/role/tenantId 已注入 |
| MW-007 | 非 API 路径跳过 | GET /courses | 正常通过 |

---

## 审查补充

> 审查人: 测试架构师 | 审查日期: 2026-07-01

### 遗漏的单元测试用例

#### Schedules 模块补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| SCH-018 | 取消已取消的排期 | schedule-service.cancelSchedule 无状态检查，可重复取消 |
| SCH-019 | 排期状态流转: draft->open(创建时即open) | 验证新建排期 init 状态始终为 "open" 而非 "draft" |
| SCH-020 | updateSchedule 更新 startTime/endTime | PUT route 没有 Zod 校验，需验证任意参数更新 |
| SCH-021 | calendar 默认参数边界 | 无参数时 start/end 默认值是否正确计算 |

#### Orders 模块补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| ORD-018 | 同一排期重复下单 | scheduleId 在不同订单中重复出现是否允许 |
| ORD-019 | 多排期同时下单 (bulk order) | 创建订单含2个 scheduleIds |
| ORD-020 | orderNumber 格式 | 验证格式 `ORD-YYYYMMDD-{8位大写}` |
| ORD-021 | 订单过期自动标记 (expireOverdueOrders) | timeout task 或查询时触发转换 pending->expired |
| ORD-022 | Desk 代购 (channel=desk) | buyerId != operatorId 的场景 |
| ORD-023 | listOrders Learner 隔离 | 验证 Learner-A 看不到 Learner-B 的订单 |

#### Payment 模块补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| PAY-009 | 支付事务原子性 | $transaction 中某步失败时整体回滚 |
| PAY-010 | 同一订单重复支付 | 第一次支付后再次调用 mock-callback |
| PAY-011 | paymentMethod 不传默认值 | 不传 method 时默认 "wechat" |

#### Attendance 模块补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| ATT-015 | checkInMethod 默认值 | 不传 checkInMethod 时默认 "manual" |
| ATT-016 | 非报名学员签到 | userId 不在 enrollment 中是否可以签到 |
| ATT-017 | 五种考勤状态全覆盖 | present/absent/late/early_leave/excused |
| ATT-018 | batchMarkAttendance 部分记录已存在 | 批量含新增+覆盖混合场景 |

#### Course 模块补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| CLS-024 | 创建课程 auto coverImageUrl | 验证 placeholder URL 含 encodeURIComponent(title) |
| CLS-025 | 从 archived 再发布 | 验证 publishCourse 仅允许 draft->published 转换 |
| CLS-026 | updateCourse 跨租户 | 更新其他租户课程（Prisma update where 含 tenantId） |

#### Auth 模块补充
| ID | 测试场景 | 理由 |
|----|---------|------|
| AUTH-020 | 重复注册同租户同手机号 | 验证 unique constraint [tenantId, phone] |
| AUTH-021 | 跨租户同手机号注册 | 不同 tenantId 相同 phone 应允许 |
| AUTH-022 | refresh 时用户 role 变更 | refresh token 签发后用户 role 被修改，刷新后 accessToken 含最新 role |
| AUTH-023 | 已注册用户注册时返回 409 | 区分 409 vs 422 vs 500 |

#### 种子数据 Stories 利用
| ID | 测试场景 | 理由 |
|----|---------|------|
| SEED-001 | 故事线A 验证: order-001 total=198000 | paidAmount=payableAmount=originalAmount |
| SEED-002 | 故事线A 验证: enrollment-001 状态 active | 已支付订单应有关联报名记录 |
| SEED-003 | 故事线B 验证: order-002 operatorId != buyerId | Desk代购: operator=user-desk, buyer=user-learner-2 |
| SEED-004 | 故事线B 验证: payment cash + enrollment | 现金支付 + UI课报名 |
| SEED-005 | 故事线C 验证: order-003 status=expired | 过期订单不自动创建 enrollment |
| SEED-006 | 故事线C 验证: order-003 paidAmount=0 | 过期订单金额未支付 |
