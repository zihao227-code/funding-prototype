# 单模块测试用例 -- 教育培训机构全流程管理平台 Phase 1

> 版本: v1.0 | 测试环境: http://localhost:3000 | 数据库: SQLite
> 种子数据: 1租户(tenant-001) / 6用户 / 3课程 / 4排期 / 3订单 / 6考勤
>
> 通用约定:
> - 密码统一: `password123`
> - 机构ID: `tenant-001`
> - 价格单位: 分（cents），前端展示时除以 100，前端表单输入单位为元
> - JWT accessToken 有效期 24h，refreshToken 有效期 30d
> - 受保护 API 需 `Authorization: Bearer <accessToken>`

---

## 1. Auth 模块（注册、登录、JWT、获取当前用户）

### 1.1 注册 — Happy Path

#### TC-AUTH-001: 新学员注册
- **前置条件**: 无
- **步骤**:
  1. 访问 `/register`
  2. 填写 phone=`13900001001`, displayName=`测试学员`, password=`test123`, tenantId=`tenant-001`
  3. 点击"注册"
- **预期**:
  - HTTP 201, 返回 `{ accessToken, refreshToken, user }`
  - user.role 强制为 `learner`
  - 浏览器跳转到 `/courses`
  - localStorage 存储 accessToken, refreshToken, user
- **测试数据**: phone=13900001001, name=测试学员, password=test123, tenantId=tenant-001, email 留空

#### TC-AUTH-002: 注册时填写 email（可选字段验证）
- **前置条件**: 无
- **步骤**: 填写 email=`test@example.com`（其余同 TC-AUTH-001）
- **预期**: HTTP 201, 返回的 user.email=`test@example.com`

### 1.2 注册 — 边界条件

#### TC-AUTH-003: 手机号为空
- **前置条件**: 无
- **步骤**: POST `/api/v1/auth/register` 不传 phone 字段
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`, details.phone 包含必填错误

#### TC-AUTH-004: 手机号格式不合法（含字母）
- **前置条件**: 无
- **步骤**: phone=`abc12345678`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-AUTH-005: 手机号过短（< 11 位）
- **前置条件**: 无
- **步骤**: phone=`12345`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-AUTH-006: 手机号超长（> 15 位）
- **前置条件**: 无
- **步骤**: phone=`1234567890123456`（16 位）
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-AUTH-007: 密码过短（5 位，< 6）
- **前置条件**: 无
- **步骤**: password=`12`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`, details.password 包含长度错误

#### TC-AUTH-008: 密码超长（> 100 位）
- **前置条件**: 无
- **步骤**: password=101 个字符
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-AUTH-009: displayName 为空
- **前置条件**: 无
- **步骤**: displayName=`""`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-AUTH-010: displayName 超长（> 50 位）
- **前置条件**: 无
- **步骤**: displayName=51 个字符
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-AUTH-011: tenantId 为空
- **前置条件**: 无
- **步骤**: tenantId=`""`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-AUTH-012: email 格式不合法
- **前置条件**: 无
- **步骤**: email=`not-an-email`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`, details.email 包含格式错误

### 1.3 注册 — 异常场景

#### TC-AUTH-013: 手机号已注册（同一租户）
- **前置条件**: 种子数据中 13800001001 已在 tenant-001 注册
- **步骤**: POST `/api/v1/auth/register`, phone=`13800001001`, tenantId=`tenant-001`
- **预期**: HTTP 409, error.code=`PHONE_EXISTS`, message="该手机号已注册"

#### TC-AUTH-014: 重复注册 — 不区分大小写验证
- **前置条件**: 某手机号已注册
- **步骤**: 同一手机号 + 同一 tenantId 再次注册
- **预期**: HTTP 409, PHONE_EXISTS（唯一约束为 `[tenantId, phone]`）

### 1.4 登录 — Happy Path

#### TC-AUTH-015: 学员登录
- **前置条件**: 种子数据用户 李明 (13800001004)
- **步骤**:
  1. 访问 `/login`
  2. 填写 phone=`13800001004`, password=`password123`, tenantId=`tenant-001`
  3. 点击"登录"
- **预期**:
  - HTTP 200, 返回 `{ accessToken, refreshToken, user }`
  - user.role=`learner`
  - user.lastLoginAt 更新为当前时间
  - 跳转到 `/courses`
  - localStorage 存储 token 和 user
- **测试数据**: phone=13800001004, password=password123, tenantId=tenant-001

#### TC-AUTH-016: Editor 登录（跳转 /admin）
- **前置条件**: 种子数据用户 张校长 (13800001001)
- **步骤**: phone=`13800001001`, password=`password123`
- **预期**:
  - HTTP 200, user.role=`editor`
  - 跳转到 `/admin`
- **测试数据**: phone=13800001001, password=password123

#### TC-AUTH-017: Trainer 登录
- **前置条件**: 种子数据用户 赵师傅 (13800001003)
- **步骤**: phone=`13800001003`, password=`password123`
- **预期**:
  - HTTP 200, user.role=`trainer`
  - 跳转到 `/courses`（非 editor/admin 角色统一跳转）
- **测试数据**: phone=13800001003, password=password123

#### TC-AUTH-018: Desk 登录
- **前置条件**: 种子数据用户 小红 (13800001002)
- **步骤**: phone=`13800001002`, password=`password123`
- **预期**:
  - HTTP 200, user.role=`desk`
  - 跳转到 `/admin`（desk 视为员工角色）
- **测试数据**: phone=13800001002, password=password123

### 1.5 登录 — 边界条件

#### TC-AUTH-019: phone 为空
- **前置条件**: 无
- **步骤**: POST `/api/v1/auth/login`, phone=`""`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-AUTH-020: password 为空
- **前置条件**: 无
- **步骤**: POST `/api/v1/auth/login`, password=`""`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-AUTH-021: tenantId 缺失
- **前置条件**: 无
- **步骤**: body 中不传 tenantId
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`, message="缺少机构ID(tenantId)"

### 1.6 登录 — 异常场景

#### TC-AUTH-022: 密码错误
- **前置条件**: 16800001001 存在
- **步骤**: phone=`13800001001`, password=`wrongpassword`
- **预期**: HTTP 401, error.code=`INVALID_CREDENTIALS`, message="手机号或密码错误"

#### TC-AUTH-023: 手机号不存在
- **前置条件**: 无
- **步骤**: phone=`00000000000`, password=`password123`
- **预期**: HTTP 401, error.code=`INVALID_CREDENTIALS`（与密码错误返回相同，防止用户枚举）

#### TC-AUTH-024: 用户已禁用
- **前置条件**: 手动将某用户 status 设为 `disabled`（数据库操作）
- **步骤**: 用该用户手机号登录
- **预期**: HTTP 401, INVALID_CREDENTIALS（查询条件含 `status: 'active'`，禁用后查询不到）

### 1.7 获取当前用户 — Happy Path

#### TC-AUTH-025: 获取当前登录用户信息
- **前置条件**: 持有有效 accessToken
- **步骤**: GET `/api/v1/auth/me`, Header: `Authorization: Bearer <token>`
- **预期**:
  - HTTP 200
  - 返回 `{ id, displayName, role, phone, email, avatar, tenantId, lastLoginAt, tenantName }`
  - tenantName=`星光职业培训学校`

### 1.8 获取当前用户 — 异常场景

#### TC-AUTH-026: 无 Token
- **前置条件**: 无
- **步骤**: GET `/api/v1/auth/me` 不带 Authorization header
- **预期**: HTTP 401, error.code=`UNAUTHORIZED`, message="未提供认证Token"

#### TC-AUTH-027: Token 已过期
- **前置条件**: 使用过期 accessToken（例如超 24h）
- **步骤**: 携带过期 token
- **预期**: HTTP 401, error.code=`UNAUTHORIZED`, message="Token无效或已过期"

#### TC-AUTH-028: Token 被篡改
- **前置条件**: 将有效 token 尾部字符修改
- **步骤**: 携带篡改后的 token
- **预期**: HTTP 401, error.code=`UNAUTHORIZED`

#### TC-AUTH-029: 用户不存在（token 有效但 userId 已删）
- **前置条件**: 删除 userId 对应的用户记录
- **步骤**: 携带该用户签发但尚未过期的 token
- **预期**: HTTP 404, error.code=`USER_NOT_FOUND`

### 1.9 Token 刷新

#### TC-AUTH-030: 正常刷新 Token
- **前置条件**: 持有有效 refreshToken
- **步骤**: POST `/api/v1/auth/refresh`, body: `{ refreshToken }`
- **预期**:
  - HTTP 200
  - 返回新 `{ accessToken, refreshToken }`
  - 新 accessToken 中仍包含原 userId, role, tenantId

#### TC-AUTH-031: refreshToken 无效
- **前置条件**: 无
- **步骤**: POST `/api/v1/auth/refresh`, body: `{ refreshToken: "fake-token" }`
- **预期**: HTTP 401, UNAUTHORIZED

---

## 2. CLS 模块（课程 CRUD + 排期管理 + 发布/下架）

### 2.1 课程列表 — Happy Path

#### TC-CLS-001: 游客（未登录）浏览课程列表
- **前置条件**: 种子数据有 3 个已发布课程
- **步骤**: GET `/api/v1/courses` 不带 token；或访问 `/courses`
- **预期**:
  - HTTP 200, 返回 `{ data, total, page, pageSize }`
  - data 仅包含 status=`published` 的课程（3 条）
  - 每条包含 `{ id, title, basePrice, status, type, _count: { schedules } }`
- **测试数据**: 无需认证

#### TC-CLS-002: 已登录用户查看全部课程（含 draft）
- **前置条件**: Editor 登录
- **步骤**: GET `/api/v1/courses` 带 Bearer token
- **预期**: HTTP 200, data 包含所有状态的课程（draft + published + archived）

#### TC-CLS-003: 按 status 筛选
- **前置条件**: Editor 登录
- **步骤**: GET `/api/v1/courses?status=draft`
- **预期**: HTTP 200, 仅返回 status=`draft` 的课程

#### TC-CLS-004: 按 category 筛选
- **前置条件**: 种子数据有 category=`IT技术` 的课程
- **步骤**: GET `/api/v1/courses?category=IT技术`
- **预期**: HTTP 200, data 仅包含 category=`IT技术` 的课程

#### TC-CLS-005: 分页查询
- **前置条件**: 有 > 2 条课程
- **步骤**: GET `/api/v1/courses?page=1&pageSize=2`
- **预期**: HTTP 200, page=1, pageSize=2, data 长度 <= 2, total 为总数

### 2.2 课程详情 — Happy Path

#### TC-CLS-006: 查看课程详情（含排期 + 资助信息）
- **前置条件**: course-python 存在
- **步骤**: GET `/api/v1/courses/course-python`；或访问 `/courses/course-python`
- **预期**:
  - HTTP 200
  - 返回 `{ id, title, description, type, basePrice, category, status, creator, schedules[], courseFundings[] }`
  - creator.displayName=`张校长`
  - schedules 按 startTime 升序排列，含 classroom.name, trainer.displayName

### 2.3 课程详情 — 异常场景

#### TC-CLS-007: 课程不存在
- **前置条件**: 无
- **步骤**: GET `/api/v1/courses/non-existent-id`
- **预期**: HTTP 404, error.code=`NOT_FOUND`, message="Course not found: non-existent-id"

### 2.4 创建课程 — Happy Path

#### TC-CLS-008: Editor 创建新课程
- **前置条件**: Editor 已登录
- **步骤**:
  1. 访问 `/admin/courses/new`
  2. 填写 title=`Python进阶实战`, type=`offline`, basePrice=`199`, category=`IT技术`
  3. description=`深入学习Python高级特性`
  4. 点击"创建"
- **预期**:
  - HTTP 201, 返回创建的课程对象
  - status 自动设为 `draft`
  - coverImageUrl 自动生成（placehold.co 占位图，含 encodeURIComponent(title)）
  - basePrice 存储为 19900 分（前端表单输入 199 元，乘以 100 发送）
  - 浏览器跳转到 `/admin/courses/{新课程 id}`
- **测试数据**: title=Python进阶实战, basePrice=199 (前端元), type=offline, category=IT技术

#### TC-CLS-009: 创建课程 — description 留空（可选字段）
- **前置条件**: Editor 登录
- **步骤**: 不填 description
- **预期**: HTTP 201, description=null

#### TC-CLS-010: 创建课程 — category 留空（可选字段）
- **前置条件**: Editor 登录
- **步骤**: 不填 category
- **预期**: HTTP 201, category=null

#### TC-CLS-011: 创建课程 — basePrice=0（免费课程）
- **前置条件**: Editor 登录
- **步骤**: basePrice=`0`
- **预期**: HTTP 201, basePrice=0

#### TC-CLS-012: 创建课程 — type=online
- **前置条件**: Editor 登录
- **步骤**: type=`online`
- **预期**: HTTP 201, type=`online`

#### TC-CLS-013: 创建课程 — type=hybrid
- **前置条件**: Editor 登录
- **步骤**: type=`hybrid`
- **预期**: HTTP 201, type=`hybrid`

### 2.5 创建课程 — 边界条件

#### TC-CLS-014: title 为空
- **前置条件**: Editor 登录
- **步骤**: POST `/api/v1/courses`, title=`""`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-CLS-015: title 超长（> 100 字符）
- **前置条件**: Editor 登录
- **步骤**: title=101 个字符
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-CLS-016: description 超长（> 5000 字符）
- **前置条件**: Editor 登录
- **步骤**: description=5001 个字符
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-CLS-017: basePrice 为负数
- **前置条件**: Editor 登录
- **步骤**: basePrice=`-1`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`（Zod 校验 >= 0）

#### TC-CLS-018: type 为非法值
- **前置条件**: Editor 登录
- **步骤**: type=`virtual`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`（仅允许 online | offline | hybrid）

#### TC-CLS-019: coverImageUrl 非合法 URL
- **前置条件**: Editor 登录
- **步骤**: coverImageUrl=`not-a-url`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

### 2.6 创建课程 — 异常场景

#### TC-CLS-020: 未登录创建课程
- **前置条件**: 无 token
- **步骤**: POST `/api/v1/courses`
- **预期**: HTTP 401, error.code=`UNAUTHORIZED`

### 2.7 更新课程 — Happy Path

#### TC-CLS-021: 更新课程标题与描述
- **前置条件**: 有 draft 课程，Editor 登录
- **步骤**: PUT `/api/v1/courses/{id}`, body: `{ title: "新标题", description: "新描述" }`
- **预期**: HTTP 200, 课程字段已更新，其他字段不变

#### TC-CLS-022: 部分更新（仅传一个字段）
- **前置条件**: 已创建课程
- **步骤**: PUT `/api/v1/courses/{id}`, body: `{ title: "仅改标题" }`
- **预期**: HTTP 200, 仅 title 更新，description/basePrice/type 不变

### 2.8 更新课程 — 异常场景

#### TC-CLS-023: 更新不存在的课程
- **前置条件**: Editor 登录
- **步骤**: PUT `/api/v1/courses/non-existent`, body: `{ title: "test" }`
- **预期**: HTTP 500, INTERNAL_ERROR（当前实现 Prisma 报错返回 500）

### 2.9 课程发布 — Happy Path

#### TC-CLS-024: 发布 draft 课程（draft -> published）
- **前置条件**: 有 draft 课程
- **步骤**:
  1. 在 `/admin/courses` 列表中找到 draft 课程
  2. 点击"发布"
  3. 或 POST `/api/v1/courses/{id}/publish`
- **预期**:
  - HTTP 200, status 变为 `published`, publishedAt 设置为当前时间
  - 课程列表刷新后显示绿色"已发布"标签

### 2.10 课程发布 — 异常场景

#### TC-CLS-025: 发布已发布课程（重复发布）
- **前置条件**: 课程 status=`published`
- **步骤**: POST `/api/v1/courses/{id}/publish`
- **预期**: HTTP 500, message 包含 "无法发布状态为 "published" 的课程"

#### TC-CLS-026: 发布已归档课程
- **前置条件**: 课程 status=`archived`
- **步骤**: POST `/api/v1/courses/{id}/publish`
- **预期**: HTTP 500, 报错（publish 仅允许 draft）

#### TC-CLS-027: 发布不存在的课程
- **前置条件**: Editor 登录
- **步骤**: POST `/api/v1/courses/non-existent/publish`
- **预期**: HTTP 404, error.code=`NOT_FOUND`

### 2.11 课程归档 — Happy Path

#### TC-CLS-028: 归档已发布课程（published -> archived）
- **前置条件**: 课程 status=`published`
- **步骤**:
  1. 在 `/admin/courses` 列表找到已发布课程
  2. 点击"下架"，确认对话框
  3. 或 POST `/api/v1/courses/{id}/archive`
- **预期**:
  - HTTP 200, status 变为 `archived`, archivedAt 设置
  - 课程从游客列表消失（仅返回 published 课程）

#### TC-CLS-029: 从 draft 直接归档（draft -> archived）
- **前置条件**: 课程 status=`draft`
- **步骤**: POST `/api/v1/courses/{id}/archive`
- **预期**: HTTP 200, status=`archived`（archive 无状态前置校验）

### 2.12 课程状态流转总结

```
draft ──publish──> published ──archive──> archived
  │                                          ^
  └──────────────archive─────────────────────┘
```

- publish: 仅允许 draft -> published
- archive: 任意状态均可（draft / published -> archived）
- 无 unpublish / unarchive 操作

### 2.13 排期管理 — Happy Path

#### TC-CLS-030: 为课程添加排期
- **前置条件**: 有课程，Editor 登录
- **步骤**:
  1. 访问 `/admin/courses/{id}` 课程编辑页
  2. 点击"+ 添加排期"
  3. 填写 title=`第5期暑期集训`, startTime=`2026-08-01T09:00`, endTime=`2026-08-15T17:00`, capacity=`30`
  4. 点击"确认添加"
- **预期**:
  - HTTP 201, 返回排期对象
  - status 自动设为 `open`
  - enrolledCount=`0`
  - 排期出现在课程编辑页列表中
- **测试数据**: title=第5期暑期集训, startTime=2026-08-01T09:00, endTime=2026-08-15T17:00, capacity=30

#### TC-CLS-031: 添加排期 — 填写 price 覆盖基准价
- **前置条件**: Editor 登录
- **步骤**: 排期 price=`2500`（前端元，后端存储 250000 分）
- **预期**: HTTP 201, price=250000

#### TC-CLS-032: 添加排期 — 不填 price（使用课程 basePrice）
- **前置条件**: Editor 登录
- **步骤**: price 留空
- **预期**: HTTP 201, price=null（下单时回退到 course.basePrice）

#### TC-CLS-033: 添加排期 — 填写 classroomId 和 trainerId
- **前置条件**: 有教室和讲师
- **步骤**: 传入 classroomId 和 trainerId
- **预期**: HTTP 201, 关联教室和讲师

### 2.14 排期管理 — 边界条件

#### TC-CLS-034: title 为空
- **前置条件**: Editor 登录
- **步骤**: POST `/api/v1/courses/{id}/schedules`, title=`""`
- **预期**: HTTP 422, VALIDATION_FAILED

#### TC-CLS-035: 缺少 startTime
- **前置条件**: Editor 登录
- **步骤**: body 不传 startTime
- **预期**: HTTP 422, VALIDATION_FAILED

#### TC-CLS-036: 缺少 endTime
- **前置条件**: Editor 登录
- **步骤**: body 不传 endTime
- **预期**: HTTP 422, VALIDATION_FAILED

#### TC-CLS-037: capacity 为 0
- **前置条件**: Editor 登录
- **步骤**: capacity=`0`
- **预期**: HTTP 422, VALIDATION_FAILED（Zod 校验 1-999）

#### TC-CLS-038: capacity 超过 999
- **前置条件**: Editor 登录
- **步骤**: capacity=`1000`
- **预期**: HTTP 422, VALIDATION_FAILED

#### TC-CLS-039: price 为负数
- **前置条件**: Editor 登录
- **步骤**: price=`-100`
- **预期**: HTTP 422, VALIDATION_FAILED

#### TC-CLS-040: meetingLink 非合法 URL
- **前置条件**: Editor 登录
- **步骤**: meetingLink=`not-a-url`
- **预期**: HTTP 422, VALIDATION_FAILED

#### TC-CLS-041: 前端未填写 startTime/endTime 直接提交
- **前置条件**: Editor 在管理页面
- **步骤**: 点击"确认添加"但 startTime 和 endTime 均为空
- **预期**: 前端弹窗 alert("请填写班次名称和时间")，不发送请求

### 2.15 查看排期列表

#### TC-CLS-042: 查看某课程的全部排期
- **前置条件**: course-python 有 2 个排期
- **步骤**: GET `/api/v1/courses/course-python/schedules`
- **预期**: HTTP 200, 返回 2 个排期，按 startTime 升序，含 classroom/trainer 信息

#### TC-CLS-043: 查看课程（无排期）
- **前置条件**: 新建课程尚未添加排期
- **步骤**: GET `/api/v1/courses/{新课程id}/schedules`
- **预期**: HTTP 200, 返回空数组 `[]`

### 2.16 查看排期详情

#### TC-CLS-044: 查看排期详情
- **前置条件**: sched-py-01 存在
- **步骤**: GET `/api/v1/schedules/sched-py-01`
- **预期**: HTTP 200, 包含 course.title, classroom.name, trainer.displayName

#### TC-CLS-045: 排期不存在
- **前置条件**: 无
- **步骤**: GET `/api/v1/schedules/non-existent`
- **预期**: HTTP 404, NOT_FOUND

### 2.17 排期取消 — Happy Path

#### TC-CLS-046: 取消 open 排期
- **前置条件**: 课程编辑页，有 open 排期，Editor 登录
- **步骤**:
  1. 点击排期行的"取消"
  2. 确认对话框
  3. 或 POST `/api/v1/schedules/{id}/cancel`, body: `{ reason: "讲师请假" }`
- **预期**:
  - HTTP 200, status 变为 `cancelled`, cancellationReason=`讲师请假`
  - 前端页面刷新后显示状态为 cancelled

#### TC-CLS-047: 取消排期 — 不带原因
- **前置条件**: Editor 登录, 有 open 排期
- **步骤**: POST `/api/v1/schedules/{id}/cancel`, body: `{}`（不传 reason）
- **预期**: HTTP 200, status=`cancelled`, cancellationReason=null

### 2.18 排期取消 — 异常场景

#### TC-CLS-048: 取消不存在的排期
- **前置条件**: Editor 登录
- **步骤**: POST `/api/v1/schedules/non-existent/cancel`
- **预期**: HTTP 500, INTERNAL_ERROR

### 2.19 更新排期

#### TC-CLS-049: 更新排期容量
- **前置条件**: Editor 登录, 排期存在
- **步骤**: PUT `/api/v1/schedules/{id}`, body: `{ capacity: 40 }`
- **预期**: HTTP 200, capacity 更新为 40

### 2.20 排期日历

#### TC-CLS-050: 查看排期日历（默认 30 天）
- **前置条件**: 有 4 个排期（种子数据）
- **步骤**: GET `/api/v1/schedules/calendar`
- **预期**: HTTP 200, 返回未来 30 天内的排期，排除 cancelled 状态

#### TC-CLS-051: 自定义日期范围
- **前置条件**: 有排期在 8 月
- **步骤**: GET `/api/v1/schedules/calendar?start=2026-08-01&end=2026-08-31`
- **预期**: HTTP 200, 仅返回 8 月区间内的排期

#### TC-CLS-052: 所有排期列表（含筛选）
- **前置条件**: 无
- **步骤**: GET `/api/v1/schedules?status=open`
- **预期**: HTTP 200, 仅返回 open 状态排期，分页 + 含课程信息

---

## 3. Billing 模块（下单、Mock 支付、订单状态机）

### 3.1 创建订单 — Happy Path

#### TC-BILL-001: 学员在线下单
- **前置条件**: Learner 李明登录，sched-py-02 为 open 且有容量
- **步骤**:
  1. 访问 `/courses/course-python`
  2. 在"Python第16期暑假班"点击"立即报名"
  3. 浏览器跳转到 `/checkout`，显示订单确认信息
  4. 点击"提交订单"
- **预期**:
  - HTTP 201, 返回 `{ id, orderNumber, status, payableAmount, expiresAt }`
  - status=`pending`
  - orderNumber 格式: `ORD-YYYYMMDD-{8位随机字符}`
  - payableAmount = 排期 price ?? 课程 basePrice（分）
  - expiresAt = 创建时间 + 15 分钟
  - 跳转到 `/payment/{orderId}`
  - localStorage cart 被清除
- **测试数据**: scheduleId=sched-py-02

#### TC-BILL-002: Desk 代购下单（operator != buyer）
- **前置条件**: 小红 (desk) 登录
- **步骤**: POST `/api/v1/orders`, body: `{ scheduleIds: ["sched-pm-01"], channel: "desk" }`
- **预期**:
  - HTTP 201
  - buyerId = 当前用户（desk），但实际上应由前端传入...（当前实现 buyerId = operatorId = x-user-id）
- **说明**: 当前 Phase 1 实现中 buyer 和 operator 均为当前登录用户

#### TC-BILL-003: 多排期下单（多个 scheduleIds）
- **前置条件**: Learner 登录
- **步骤**: POST `/api/v1/orders`, body: `{ scheduleIds: ["sched-py-02", "sched-pm-01"] }`
- **预期**:
  - HTTP 201
  - orderItems 包含 2 条记录
  - payableAmount = 两个排期价格之和

### 3.2 创建订单 — 边界条件

#### TC-BILL-004: scheduleIds 为空数组
- **前置条件**: Learner 登录
- **步骤**: POST `/api/v1/orders`, body: `{ scheduleIds: [] }`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`, message="请选择至少一个班次"

#### TC-BILL-005: scheduleIds 缺失
- **前置条件**: Learner 登录
- **步骤**: POST `/api/v1/orders`, body: `{}`
- **预期**: HTTP 422, error.code=`VALIDATION_FAILED`

#### TC-BILL-006: cart 为空时访问 checkout
- **前置条件**: 无 cart 数据
- **步骤**: 直接访问 `/checkout`
- **预期**: 自动跳转到 `/courses`

### 3.3 创建订单 — 异常场景

#### TC-BILL-007: 排期不存在
- **前置条件**: Learner 登录
- **步骤**: scheduleIds=`["non-existent-id"]`
- **预期**: HTTP 500, message 包含 "排期 non-existent-id 不存在"

#### TC-BILL-008: 排期已关闭（cancelled）
- **前置条件**: 有 cancelled 排期
- **步骤**: 向 cancelled 排期下单
- **预期**: HTTP 500, message 包含 "已关闭"

#### TC-BILL-009: 排期已满班（enrolledCount >= capacity）
- **前置条件**: 某排期 enrolledCount = capacity（如 30/30）
- **步骤**: 向满班排期下单
- **预期**: HTTP 500, message 包含 "已满班"

#### TC-BILL-010: 未登录下单
- **前置条件**: 无 token
- **步骤**: POST `/api/v1/orders`
- **预期**: HTTP 401, UNAUTHORIZED

### 3.4 价格计算规则

#### TC-BILL-011: 排期有独立价格，使用排期价格
- **前置条件**: 排期 price=250000 (2500元), 课程 basePrice=198000 (1980元)
- **步骤**: 下单该排期
- **预期**: unitPrice=250000, payableAmount=250000

#### TC-BILL-012: 排期无价格，使用课程基准价
- **前置条件**: 排期 price=null, 课程 basePrice=198000
- **步骤**: 下单该排期
- **预期**: unitPrice=198000, payableAmount=198000

#### TC-BILL-013: 免费课程（basePrice=0）
- **前置条件**: 课程 basePrice=0
- **步骤**: 下单
- **预期**: payableAmount=0, order 创建成功

### 3.5 订单查询 — Happy Path

#### TC-BILL-014: 学员查看自己的订单
- **前置条件**: 李明登录，已有 order-001 (paid)
- **步骤**: 访问 `/account/orders` 或 GET `/api/v1/orders`
- **预期**:
  - HTTP 200, `{ data, total, page, pageSize }`
  - data 仅包含 buyerId=李明 的订单（角色过滤）
  - 每条含 orderNumber, createdAt, payableAmount, status

#### TC-BILL-015: Editor 查看全部订单
- **前置条件**: 张校长登录
- **步骤**: 访问 `/admin/orders` 或 GET `/api/v1/orders`
- **预期**: HTTP 200, data 包含全部租户订单（可含其他参数过滤）

#### TC-BILL-016: 按状态筛选订单
- **前置条件**: Editor 登录
- **步骤**: GET `/api/v1/orders?status=paid`
- **预期**: HTTP 200, 仅返回 paid 状态订单

#### TC-BILL-017: 按渠道筛选订单
- **前置条件**: Editor 登录
- **步骤**: GET `/api/v1/orders?channel=desk`
- **预期**: HTTP 200, 仅返回 desk 渠道订单

#### TC-BILL-018: 按用户筛选订单（Editor 权限）
- **前置条件**: Editor 登录
- **步骤**: GET `/api/v1/orders?userId=user-learner-1`
- **预期**: HTTP 200, 仅返回 user-learner-1 的订单

#### TC-BILL-019: 学员尝试查看其他用户订单
- **前置条件**: 李明(learner) 登录
- **步骤**: GET `/api/v1/orders?userId=user-learner-2`
- **预期**: HTTP 200, 但 data 仍仅为李明自己的订单（后端强制截断 userId = x-user-id）

### 3.6 订单查询 — 异常场景

#### TC-BILL-020: 查看不存在的订单详情
- **前置条件**: 已登录
- **步骤**: GET `/api/v1/orders/non-existent`
- **预期**: HTTP 404, NOT_FOUND, message="Order not found: non-existent"

#### TC-BILL-021: 查看订单详情（含完整关联）
- **前置条件**: order-001 存在
- **步骤**: GET `/api/v1/orders/order-001`
- **预期**:
  - HTTP 200
  - 返回 buyer, operator, orderItems（含 schedule.course）, payments, refunds
  - 自动触发 expireOverdueOrders

### 3.7 订单状态机 — pending -> paid

#### TC-BILL-022: 模拟支付成功（微信）
- **前置条件**: 创建 pending 订单（如 sched-pm-01 下单）
- **步骤**:
  1. 访问 `/payment/{orderId}`
  2. 默认选择"微信支付"
  3. 点击"模拟支付成功"
- **预期**:
  - HTTP 200, `{ success: true, transactionId, orderId }`
  - transactionId 格式: `MOCK_WECHAT_{12位随机字符}`
  - 订单 status=`paid`, paidAmount=payableAmount, paidAt 设置
  - Payment 记录创建: method=`wechat`, amount=payableAmount, status=`success`
  - Enrollment 记录创建: userId=buyerId, status=`active`
  - 排期 enrolledCount 递增 1
  - Notification 创建: eventType=`purchase_success`, channel=`in_app`
  - 跳转到 `/account/orders`
- **测试数据**: method=wechat

#### TC-BILL-023: 模拟支付成功（支付宝）
- **前置条件**: pending 订单
- **步骤**: 选择"支付宝"，点击"模拟支付成功"
- **预期**: 同 TC-BILL-022, transactionId 格式: `MOCK_ALIPAY_{随机12位}`

#### TC-BILL-024: 模拟支付成功（现金）
- **前置条件**: pending 订单
- **步骤**: 选择"现金"，点击"模拟支付成功"
- **预期**: 同 TC-BILL-022, transactionId 格式: `MOCK_CASH_{随机12位}`

#### TC-BILL-025: 支付不选方式（默认 wechat）
- **前置条件**: pending 订单
- **步骤**: POST `/api/v1/payment/mock-callback`, body: `{ orderId }`（不传 method）
- **预期**: HTTP 200, method 默认 `wechat`

### 3.8 订单状态机 — pending -> cancelled

#### TC-BILL-026: 取消 pending 订单
- **前置条件**: 创建 pending 订单，停留在支付页面
- **步骤**:
  1. 在 `/payment/{orderId}` 点击"取消订单"
  2. 确认 `confirm('确认取消该订单？取消后无法恢复。')`
  3. 或 POST `/api/v1/orders/{id}/cancel`
- **预期**:
  - HTTP 200, status=`cancelled`
  - 前端 alert("订单已取消")
  - 跳转到 `/courses`
  - 不会创建 Enrollment

#### TC-BILL-027: 在"我的订单"页取消 pending 订单
- **前置条件**: 有 pending 订单，学员登录
- **步骤**: 在 `/account/orders` 订单卡片点击"取消"
- **预期**: 订单 status=`cancelled`, 列表刷新

### 3.9 订单状态机 — pending -> expired

#### TC-BILL-028: 订单自动过期
- **前置条件**: 有 pending 订单且 expiresAt 已过期
- **步骤**: GET `/api/v1/orders/{id}` 触发 expireOverdueOrders
- **预期**:
  - 过期订单 status 被批量更新为 `expired`
  - 页面显示 status=`expired`

#### TC-BILL-029: 过期订单 GET 时动态判断
- **前置条件**: pending 订单 expiresAt < now，但尚未触发批量更新
- **步骤**: GET `/api/v1/orders/{id}`
- **预期**: HTTP 200, 返回订单 status=`expired`（仅显示层判断，并未持久化）

### 3.10 订单状态机 — 非法转换（业务规则防御）

#### TC-BILL-030: 取消已支付订单（应拒绝）
- **前置条件**: 订单 status=`paid`
- **步骤**: POST `/api/v1/orders/{id}/cancel`
- **预期**: HTTP 500, message 包含 "订单状态为 "paid"，无法取消"

#### TC-BILL-031: 取消已过期订单（应拒绝）
- **前置条件**: 订单 status=`expired`
- **步骤**: POST `/api/v1/orders/{id}/cancel`
- **预期**: HTTP 500, message 包含 "无法取消"

#### TC-BILL-032: 对已支付订单再次支付（幂等防护）
- **前置条件**: 订单 status=`paid`
- **步骤**: POST `/api/v1/payment/mock-callback`, body: `{ orderId }`
- **预期**: HTTP 500, message 包含 "订单状态为 "paid"，无法支付"

#### TC-BILL-033: 对已取消订单支付（应拒绝）
- **前置条件**: 订单 status=`cancelled`
- **步骤**: POST `/api/v1/payment/mock-callback`, body: `{ orderId }`
- **预期**: HTTP 500, message 包含 "无法支付"

### 3.11 支付回调 — 异常场景

#### TC-BILL-034: 缺少 orderId
- **前置条件**: 无
- **步骤**: POST `/api/v1/payment/mock-callback`, body: `{}`
- **预期**: HTTP 422, VALIDATION_FAILED, message="缺少 orderId"

#### TC-BILL-035: 订单不存在
- **前置条件**: 无
- **步骤**: POST `/api/v1/payment/mock-callback`, body: `{ orderId: "non-existent" }`
- **预期**: HTTP 500, message 包含 "订单不存在"

#### TC-BILL-036: 支付回调无需认证（公开端点）
- **前置条件**: 无 token
- **步骤**: POST `/api/v1/payment/mock-callback` 不带 Authorization header（待支付 orderId）
- **预期**: HTTP 200, 支付成功（该端点在中声明为 PUBLIC_PREFIX）

### 3.12 支付事务原子性

#### TC-BILL-037: 支付事务中部分操作失败的原子性验证
- **前置条件**: pending 订单
- **步骤**: 模拟支付过程中 enrollment 创建失败（如 scheduleId+userId 违反唯一约束）
- **预期**: 整体事务回滚，订单状态仍为 pending，无 Payment/Enrollment/Notification 产生
- **说明**: 依赖 Prisma `$transaction` 实现

---

## 4. CA 模块（考勤签到）

### 4.1 花名册 — Happy Path

#### TC-CA-001: 查看排期的花名册
- **前置条件**: sched-py-01 有活跃 enrollment（李明已报名），Trainer 登录
- **步骤**:
  1. 访问 `/admin/attendance/sched-py-01`
  2. 或 GET `/api/v1/schedules/sched-py-01/attendance/roster`
- **预期**:
  - HTTP 200
  - 返回学员列表，每条包含 `{ userId, displayName, phone, attendance: { status, checkInTime } | null }`
  - 仅返回 status=`active` 的 enrollment 用户
- **测试数据**: scheduleId=sched-py-01

#### TC-CA-002: 花名册无学员（排期无人报名）
- **前置条件**: sched-pm-01 (enrolledCount=0)，Trainer 登录
- **步骤**: GET `/api/v1/schedules/sched-pm-01/attendance/roster`
- **预期**: HTTP 200, 返回空数组 `[]`, 页面显示 "该班次暂无所属学员"

### 4.2 花名册 — 异常场景

#### TC-CA-003: 未认证访问花名册
- **前置条件**: 无 token
- **步骤**: GET `/api/v1/schedules/{id}/attendance/roster`
- **预期**: HTTP 401, UNAUTHORIZED

### 4.3 标记考勤（单条）— Happy Path

#### TC-CA-004: 标记出勤（present）
- **前置条件**: Trainer/Editor 登录，李明在 sched-py-01 有 enrollment
- **步骤**:
  1. 在花名册页面，李明的行下拉框选择"出勤"
  2. 或 POST `/api/v1/attendance`, body: `{ scheduleId: "sched-py-01", userId: "user-learner-1", status: "present" }`
- **预期**:
  - HTTP 201
  - 返回考勤记录: status=`present`, checkInMethod=`manual`, checkInTime=当前时间
  - markedBy=操作者 userId
  - 页面刷新后显示绿色"出勤"标签
- **测试数据**: scheduleId=sched-py-01, userId=user-learner-1, status=present

#### TC-CA-005: 标记缺勤（absent）
- **前置条件**: Trainer 登录
- **步骤**: status=`absent`
- **预期**: HTTP 201, status=`absent`, 页面显示红色"缺勤"标签

#### TC-CA-006: 标记迟到（late）
- **前置条件**: Trainer 登录
- **步骤**: status=`late`
- **预期**: HTTP 201, status=`late`, 页面显示黄色标签

#### TC-CA-007: 标记请假（excused）
- **前置条件**: Trainer 登录
- **步骤**: status=`excused`
- **预期**: HTTP 201, status=`excused`, 页面显示黄色标签

#### TC-CA-008: 标记早退（early_leave）
- **前置条件**: Trainer 登录
- **步骤**: status=`early_leave`
- **预期**: HTTP 201, status=`early_leave`, 页面显示黄色标签

### 4.4 标记考勤 — Upsert 行为

#### TC-CA-009: 修改已有考勤记录（present -> absent）
- **前置条件**: 李明已标记为 present
- **步骤**: 再次 POST 标记 status=`absent`
- **预期**:
  - HTTP 201
  - 更新已有记录（不创建重复记录）
  - status=`absent`, checkInTime 更新为新时间
  - 数据库仅一条记录（`[scheduleId, userId]` 为事实上的业务唯一键）

### 4.5 标记考勤 — 异常场景

#### TC-CA-010: 缺少必填字段
- **前置条件**: Trainer 登录
- **步骤**: POST `/api/v1/attendance`, body 缺 scheduleId 或 userId 或 status
- **预期**: HTTP 422, VALIDATION_FAILED, message="缺少必填字段(scheduleId/userId/status)"

#### TC-CA-011: 未认证标记考勤
- **前置条件**: 无 token
- **步骤**: POST `/api/v1/attendance`
- **预期**: HTTP 401, UNAUTHORIZED

### 4.6 批量考勤 — Happy Path

#### TC-CA-012: 批量标记两个学员
- **前置条件**: Trainer 登录，两个学员在排期中有 enrollment
- **步骤**: POST `/api/v1/attendance/batch`, body:
  ```json
  { "scheduleId": "sched-py-01",
    "records": [
      { "userId": "user-learner-1", "status": "present" },
      { "userId": "user-learner-2", "status": "absent" }
    ]
  }
  ```
- **预期**:
  - HTTP 200, `{ count: 2 }`
  - 两个学员的考勤记录已创建/更新
  - checkInMethod 均为 `manual`，checkInTime 均为当前时间

#### TC-CA-013: 批量考勤含新增和覆盖混合
- **前置条件**: 学员A 已有考勤(absent)，学员B 无考勤
- **步骤**: 批量标记 A 为 present, B 为 late
- **预期**: HTTP 200, `{ count: 2 }`, A 更新为 present, B 新建为 late

### 4.7 批量考勤 — 异常场景

#### TC-CA-014: 缺少 records 字段
- **前置条件**: Trainer 登录
- **步骤**: POST `/api/v1/attendance/batch`, body: `{ scheduleId: "sched-py-01" }`
- **预期**: HTTP 422, VALIDATION_FAILED, message="缺少必填字段(scheduleId/records)"

#### TC-CA-015: records 不是数组
- **前置条件**: Trainer 登录
- **步骤**: body: `{ scheduleId: "x", records: "string" }`
- **预期**: HTTP 422, VALIDATION_FAILED

#### TC-CA-016: records 为空数组
- **前置条件**: Trainer 登录
- **步骤**: records=`[]`
- **预期**: HTTP 200, `{ count: 0 }`

### 4.8 考勤查询

#### TC-CA-017: 按排期查询全部考勤
- **前置条件**: sched-py-01 有 6 条考勤记录（种子数据）
- **步骤**: GET `/api/v1/attendance?scheduleId=sched-py-01`
- **预期**: HTTP 200, `{ data: [...], total: 6, page, pageSize }`

#### TC-CA-018: 按用户查询考勤
- **前置条件**: 李明有多条考勤
- **步骤**: GET `/api/v1/attendance?userId=user-learner-1`
- **预期**: HTTP 200, data 包含该用户所有考勤记录

#### TC-CA-019: 分页查询考勤
- **前置条件**: 有 > 10 条考勤记录
- **步骤**: GET `/api/v1/attendance?page=1&pageSize=5`
- **预期**: HTTP 200, page=1, pageSize=5, data 长度 <= 5

---

## 附录: 模块接口速查表

### API 端点总览

| 方法 | 路径 | 认证 | 模块 | 用途 |
|------|------|------|------|------|
| POST | `/api/v1/auth/register` | 公开 | Auth | 注册学员 |
| POST | `/api/v1/auth/login` | 公开 | Auth | 登录 |
| POST | `/api/v1/auth/refresh` | 公开 | Auth | 刷新 Token |
| GET | `/api/v1/auth/me` | JWT | Auth | 获取当前用户 |
| GET | `/api/v1/courses` | 公开 GET | CLS | 课程列表 |
| POST | `/api/v1/courses` | JWT | CLS | 创建课程 |
| GET | `/api/v1/courses/[id]` | JWT | CLS | 课程详情 |
| PUT | `/api/v1/courses/[id]` | JWT | CLS | 更新课程 |
| POST | `/api/v1/courses/[id]/publish` | JWT | CLS | 发布课程 |
| POST | `/api/v1/courses/[id]/archive` | JWT | CLS | 归档课程 |
| GET | `/api/v1/courses/[id]/schedules` | JWT | CLS | 课程排期列表 |
| POST | `/api/v1/courses/[id]/schedules` | JWT | CLS | 添加排期 |
| GET | `/api/v1/schedules` | 公开 GET | CLS | 全部排期列表 |
| GET | `/api/v1/schedules/calendar` | 公开 GET | CLS | 排期日历 |
| GET | `/api/v1/schedules/[id]` | JWT | CLS | 排期详情 |
| PUT | `/api/v1/schedules/[id]` | JWT | CLS | 更新排期 |
| POST | `/api/v1/schedules/[id]/cancel` | JWT | CLS | 取消排期 |
| GET | `/api/v1/orders` | JWT | Billing | 订单列表 |
| POST | `/api/v1/orders` | JWT | Billing | 创建订单 |
| GET | `/api/v1/orders/[id]` | JWT | Billing | 订单详情 |
| POST | `/api/v1/orders/[id]/cancel` | JWT | Billing | 取消订单 |
| POST | `/api/v1/payment/mock-callback` | 公开 | Billing | 模拟支付 |
| GET | `/api/v1/schedules/[id]/attendance/roster` | JWT | CA | 花名册 |
| POST | `/api/v1/attendance` | JWT | CA | 标记考勤 |
| POST | `/api/v1/attendance/batch` | JWT | CA | 批量考勤 |
| GET | `/api/v1/attendance` | JWT | CA | 考勤查询 |

### 关键状态枚举

| 模型 | 状态值 | Phase 1 使用 |
|------|--------|------------|
| Course | draft, published, archived | 全部使用 |
| Schedule | draft, open, full, cancelled, completed | open, cancelled 为主 |
| Order | pending, paid, partial_refunded, refunded, cancelled, expired | pending, paid, cancelled, expired |
| Payment | pending, success, failed | success |
| Enrollment | active, transferred, refunded, dropped | active |
| Attendance | present, absent, late, early_leave, excused | 全部使用 |
| User | active, disabled | active |
| Tenant | active, suspended, expired | active |

### 价格体系说明

- **存储**: 所有金额为整数，单位"分"（cents），如 1980 元 = 198000 分
- **前端表单**: 用户输入"元"，提交时乘以 100
- **API 响应**: 返回分为单位的裸数值
- **前端展示**: `formatMoney(cents)` 除以 100 后格式化为 `¥1,980.00`
- **排期价格**: `schedule.price ?? course.basePrice`（排期价格优先于课程基准价）
