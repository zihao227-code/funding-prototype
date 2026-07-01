# 全流程 E2E 测试用例 -- 教育培训机构全流程管理平台 Phase 1

> 版本: v1.0 | 测试环境: http://localhost:3000 | 数据库: SQLite
> 种子数据: 1租户(tenant-001) / 6用户 / 3课程 / 4排期 / 3订单 / 6考勤
>
> 演示账号（密码统一: password123）:
> - Editor / 张校长: 13800001001
> - Desk / 小红: 13800001002
> - Trainer / 赵师傅: 13800001003
> - Learner / 李明: 13800001004
> - Learner / 王芳: 13800001005
> - Learner / 陈强: 13800001006

---

## E2E-001: 学员完整购买流程

**旅程**: 新学员注册 -> 浏览课程 -> 选择排期 -> 下单 -> 支付 -> 查看订单

**角色**: 新学员（非种子数据用户）

**测试数据**:
- 注册手机: 13900001001, 姓名: E2E测试学员, 密码: test123
- 选择课程: PMP 课程 (course-pm), 排期: sched-pm-01

### Step 1: 注册新账号
- **页面**: `/register`
- **操作**: 填写 phone=`13900001001`, displayName=`E2E测试学员`, password=`test123`, tenantId默认=`tenant-001`
- **验证点**:
  - [ ] HTTP 201, 返回 accessToken + refreshToken + user（role=learner）
  - [ ] 自动跳转到 `/courses`
  - [ ] localStorage 存储了 accessToken, refreshToken, user

### Step 2: 浏览课程列表
- **页面**: `/courses`
- **操作**: 查看课程卡片列表
- **验证点**:
  - [ ] 显示 3 门 published 课程（course-python, course-ui, course-pm）
  - [ ] 每张卡片显示: 课程名, 类型标签, 分类, 描述, 价格(元), 排期数
  - [ ] 不显示 draft 或 archived 状态课程

### Step 3: 查看课程详情
- **页面**: `/courses/course-pm`
- **操作**: 点击"项目管理PMP认证"课程
- **验证点**:
  - [ ] 显示课程标题, 描述, 类型(=offline), 分类(=管理), 创建者(=张校长)
  - [ ] 显示可选班次列表（含 sched-pm-01）
  - [ ] 排期显示: 标题, 日期范围, 教室, 已报 0/20人, 价格
  - [ ] "立即报名"按钮可用（status=open 且未满班）
  - [ ] 若课程有 courseFundings 则显示资助信息

### Step 4: 加入购物车并进入结算
- **页面**: `/courses/course-pm` -> 重定向到 `/checkout`
- **操作**: 点击"立即报名"
- **验证点**:
  - [ ] localStorage 的 cart 键存储了 `[{ scheduleId: "sched-pm-01", title: "项目管理PMP认证", price: 298000 }]`
  - [ ] 跳转到 `/checkout`
  - [ ] checkout 页面显示订单确认信息: 课程名 + 价格 ¥2,980.00
  - [ ] 显示合计金额

### Step 5: 创建订单
- **页面**: `/checkout` -> 重定向到 `/payment/{orderId}`
- **操作**: 点击"提交订单"
- **验证点**:
  - [ ] HTTP 201, 返回订单对象: status=`pending`, orderNumber 格式 `ORD-YYYYMMDD-xxxxxxxx`
  - [ ] payableAmount=`298000`（分）
  - [ ] expiresAt = 当前时间 + 15 分钟
  - [ ] localStorage cart 被清除
  - [ ] 跳转到 `/payment/{orderId}`

### Step 6: 确认支付页面
- **页面**: `/payment/{orderId}`
- **操作**: 查看支付页面内容
- **验证点**:
  - [ ] 显示订单号 `ORD-...` + 金额 `¥2,980.00`
  - [ ] 三种支付方式可选: 微信支付, 支付宝, 现金
  - [ ] 默认选中"微信支付"
  - [ ] 显示模拟扫码界面（手机 emoji 占位）
  - [ ] "模拟支付成功"按钮和"取消订单"按钮均可用

### Step 7: 模拟支付
- **页面**: `/payment/{orderId}` -> 重定向到 `/account/orders`
- **操作**: 保持默认微信支付，点击"模拟支付成功"
- **验证点**:
  - [ ] HTTP 200, `{ success: true, transactionId: "MOCK_WECHAT_xxxxxxxxxxxx", orderId }`
  - [ ] 订单 status 变为 `paid`, paidAmount=`298000`, paidAt 已设置
  - [ ] Payment 记录已创建（method=wechat, amount=298000, currency=CNY, status=success）
  - [ ] Enrollment 记录已创建（userId=新学员, scheduleId=sched-pm-01, status=active, orderId=新订单）
  - [ ] 排期 enrolledCount 从 0 变为 1
  - [ ] Notification 记录创建（eventType=`purchase_success`, channel=`in_app`）
  - [ ] 跳转到 `/account/orders`

### Step 8: 查看我的订单
- **页面**: `/account/orders`
- **操作**: 刷新查看订单列表
- **验证点**:
  - [ ] 列表中包含刚创建的订单
  - [ ] 显示 orderNumber, 日期, 金额, 状态标签"已支付"（绿色）
  - [ ] 没有"取消"按钮（仅 pending 状态有）
  - [ ] 不会看到其他学员的订单（角色隔离）

### Step 9: 数据一致性终验
- **操作**: 手动查询数据库验证
- **验证点**:
  - [ ] `User` 表新增一条 role=learner 的记录
  - [ ] `Order` 表新增一条 status=paid, paidAmount=payableAmount 的记录
  - [ ] `Payment` 表新增一条 status=success 的记录
  - [ ] `Enrollment` 表新增一条 status=active 的记录
  - [ ] `Schedule` 表中 sched-pm-01 的 enrolledCount +1
  - [ ] `Notification` 表新增一条 eventType=`purchase_success` 的记录

---

## E2E-002: Editor 创建课程完整流程

**旅程**: Editor 登录 -> 创建课程 -> 添加排期 -> 发布课程 -> 下架课程

**角色**: 张校长 (Editor, 13800001001)

**测试数据**:
- 课程: title=`E2E新课程测试`, type=`online`, basePrice=`150`(元), category=`测试`
- 排期: title=`第1期线上班`, startTime=`2026-09-01T09:00`, endTime=`2026-09-30T18:00`, capacity=`25`

### Step 1: 登录后台
- **页面**: `/login` -> `/admin`
- **操作**: 填写 phone=`13800001001`, password=`password123`, tenantId=`tenant-001`，点击登录
- **验证点**:
  - [ ] HTTP 200, user.role=`editor`
  - [ ] 跳转到 `/admin`（Dashboard 页面）
  - [ ] 侧边栏显示导航菜单: Dashboard, Courses, Calendar, Orders, Users, Attendance
  - [ ] 左下角显示"张校长"和退出按钮

### Step 2: 查看课程管理列表
- **页面**: `/admin/courses`
- **操作**: 点击侧边栏"Courses"
- **验证点**:
  - [ ] 表格显示 3 门种子课程 + 任何之前创建的课程
  - [ ] 列: 课程名称, 价格, 类型, 状态, 排期数, 操作
  - [ ] 草稿课程显示"发布"按钮，已发布课程显示"下架"按钮
  - [ ] 顶部有"+ 创建课程"按钮

### Step 3: 进入创建课程表单
- **页面**: `/admin/courses/new`
- **操作**: 点击"+ 创建课程"
- **验证点**:
  - [ ] 显示表单: title(必填), description, type(下拉), basePrice(数字), category
  - [ ] "创建"按钮和"取消"按钮

### Step 4: 填写课程信息并创建
- **页面**: `/admin/courses/new` -> `/admin/courses/{newId}`
- **操作**:
  - title=`E2E新课程测试`
  - description=`这是E2E测试创建的课程`
  - type 下拉选择 `online`
  - basePrice=`150`
  - category=`测试`
  - 点击"创建"
- **验证点**:
  - [ ] HTTP 201, 返回课程对象
  - [ ] status=`draft`（自动设置）
  - [ ] coverImageUrl 自动生成（含 `placehold.co` 占位图且 title 已 encodeURIComponent）
  - [ ] basePrice 存储为 15000 分
  - [ ] 跳转到 `/admin/courses/{新课程id}`（课程编辑页）

### Step 5: 在课程编辑页添加排期
- **页面**: `/admin/courses/{id}`
- **操作**: 点击"+ 添加排期"，展开表单
- **验证点**:
  - [ ] 排期表单显示: 班次名称, 开始时间, 结束时间, 容量(默认20)
  - [ ] 标题显示课程名称 + 基准价格(¥150.00) + 状态(draft)

### Step 6: 填写排期并提交
- **页面**: `/admin/courses/{id}`
- **操作**:
  - title=`第1期线上班`
  - startTime=`2026-09-01T09:00`
  - endTime=`2026-09-30T18:00`
  - capacity=`25`
  - price 留空
  - 点击"确认添加"
- **验证点**:
  - [ ] HTTP 201, 返回排期对象
  - [ ] status=`open`
  - [ ] enrolledCount=`0`
  - [ ] price=`null`
  - [ ] 排期出现在下方的排期列表中
  - [ ] 排期表格显示: 班次名, 时间, 容量(0/25), 状态(open)

### Step 7: 返回课程列表并发布课程
- **页面**: `/admin/courses`
- **操作**: 返回课程列表，找到刚创建的 draft 课程，点击"发布"
- **验证点**:
  - [ ] HTTP 200, 课程 status 变为 `published`, publishedAt 已设置
  - [ ] 列表自动刷新，状态标签变为绿色"已发布"
  - [ ] "发布"按钮消失，变为"下架"按钮

### Step 8: 验证发布后游客可见
- **页面**: `/courses`（新开隐身窗口或清除 token）
- **操作**: 游客访问课程列表
- **验证点**:
  - [ ] 列表中包含刚创建的"E2E新课程测试"
  - [ ] 可进入详情页看到排期

### Step 9: 下架课程
- **页面**: `/admin/courses`
- **操作**: 找到该课程，点击"下架"，确认对话框
- **验证点**:
  - [ ] HTTP 200, status 变为 `archived`, archivedAt 已设置
  - [ ] 游客访问课程列表不再显示该课程
  - [ ] 管理员列表仍可见（显示灰色 archived 标签）

### Step 10: 数据一致性终验
- **操作**: 查询数据库
- **验证点**:
  - [ ] `Course` 表新增一条记录，status 变化轨迹 draft->published->archived
  - [ ] `Schedule` 表新增一条记录，关联到新课程

---

## E2E-003: 考勤完整流程

**旅程**: Trainer 登录 -> 查看排期 -> 打开花名册 -> 批量签到 -> 逐个修改考勤状态

**角色**: 赵师傅 (Trainer, 13800001003)

**前置条件**:
- sched-py-01 有 active enrollment（种子数据中李明已报名）
- 如需要可预先让王芳也报名 sched-py-01（通过 order-002 支付已关联 enrollment）

### Step 1: Trainer 登录
- **页面**: `/login` -> `/courses`（非 editor 跳转到 courses）
- **操作**: phone=`13800001003`, password=`password123`, tenantId=`tenant-001`
- **验证点**:
  - [ ] HTTP 200, user.role=`trainer`
  - [ ] 跳转到 `/courses`（trainer 不是 editor，不跳转 /admin）

### Step 2: 访问考勤花名册
- **页面**: `/admin/attendance/sched-py-01`
- **操作**: 直接访问（需 admin layout 检查，trainer 可能无法进入 /admin layout，需验证）
- **说明**: 当前 admin layout 仅检查 localStorage 中有 user 即放行；trainer 可以访问 admin 路由
- **验证点**:
  - [ ] 页面加载，显示"考勤花名册"标题
  - [ ] 表格列: 学员, 手机号, 考勤状态, 签到时间, 操作
  - [ ] 显示已报名学员列表（至少包含李明）
  - [ ] 种子数据中已有的考勤记录正确显示（如 present 显示绿色"出勤"）
  - [ ] 无考勤的学员显示灰色"未签到"

### Step 3: 批量标记考勤（API 直调）
- **操作**: POST `/api/v1/attendance/batch`, body:
  ```json
  {
    "scheduleId": "sched-py-01",
    "records": [
      { "userId": "user-learner-1", "status": "present" },
      { "userId": "user-learner-2", "status": "late" }
    ]
  }
  ```
- **验证点**:
  - [ ] HTTP 200, `{ count: 2 }`
  - [ ] 两个学员的考勤记录已创建/更新
  - [ ] checkInMethod 均为 `manual`, checkInTime 为当前时间

### Step 4: 刷新花名册页面验证
- **页面**: `/admin/attendance/sched-py-01`
- **操作**: 刷新页面
- **验证点**:
  - [ ] 李明: 显示绿色"出勤"标签 + 签到时间
  - [ ] 王芳: 显示黄色"迟到"标签 + 签到时间

### Step 5: 逐个修改考勤状态 — 李明改为缺勤
- **页面**: `/admin/attendance/sched-py-01`
- **操作**: 在李明的下拉框中从"出勤"改为"缺勤"
- **验证点**:
  - [ ] POST `/api/v1/attendance` 成功, status=`absent`
  - [ ] 页面刷新后李明显示红色"缺勤"标签
  - [ ] 签到时间已更新为新时间

### Step 6: 逐个修改考勤状态 — 王芳改为请假
- **操作**: 在王芳的下拉框中选择"请假"
- **验证点**:
  - [ ] status=`excused` 更新成功
  - [ ] 页面显示黄色"请假"标签

### Step 7: 全覆盖考勤状态测试
- **操作**: 逐个设置 5 种状态
  - present（出勤）
  - absent（缺勤）
  - late（迟到）
  - excused（请假）
  - early_leave（早退）
- **验证点**:
  - [ ] 每种状态的 API 调用均返回 201
  - [ ] 页面标签颜色: present=绿色, absent=红色, 其余=黄色
  - [ ] 未签到状态显示灰色"未签到"

### Step 8: 查询考勤记录
- **操作**: GET `/api/v1/attendance?scheduleId=sched-py-01`
- **验证点**:
  - [ ] 返回该排期所有考勤记录
  - [ ] 总数与花名册学员数一致
  - [ ] 每条记录含 user.displayName, user.phone

### Step 9: 数据一致性终验
- **操作**: 查询数据库 Attendance 表
- **验证点**:
  - [ ] 每个学员只有一条考勤记录（Upsert 不会重复创建）
  - [ ] markedBy=user-trainer
  - [ ] checkInMethod=`manual`

---

## E2E-004: 订单取消流程

**旅程**: 学员下单 -> 不支付 -> 取消订单 -> 验证排期 enrolledCount 不变 -> 验证订单状态

**角色**: 王芳 (Learner, 13800001005)

**测试数据**: scheduleId=sched-pm-01（当前 enrolledCount=0）

### Step 1: 王芳登录
- **页面**: `/login` -> `/courses`
- **操作**: phone=`13800001005`, password=`password123`, tenantId=`tenant-001`
- **验证点**:
  - [ ] HTTP 200, user.displayName=`王芳`, role=`learner`

### Step 2: 浏览课程并报名
- **页面**: `/courses/course-pm`
- **操作**: 查看 PMP 课程详情，点击 sched-pm-01 的"立即报名"
- **验证点**: 跳转到 `/checkout`

### Step 3: 确认订单
- **页面**: `/checkout`
- **操作**: 确认显示 PMP 课程 ¥2,980.00，点击"提交订单"
- **验证点**:
  - [ ] 跳转到 `/payment/{orderId}`
  - [ ] 订单 status=`pending`, payableAmount=`298000`

### Step 4: 记录下单前 enrolledCount
- **操作**: 查询 sched-pm-01 当前 enrolledCount（记为 N）
- **验证点**: 下单时 enrolledCount 未变化（支付后才递增）

### Step 5: 在支付页取消订单
- **页面**: `/payment/{orderId}`
- **操作**: 点击"取消订单"，确认对话框
- **验证点**:
  - [ ] HTTP 200, 订单 status=`cancelled`
  - [ ] alert("订单已取消")
  - [ ] 跳转到 `/courses`

### Step 6: 验证排期 enrolledCount 未变
- **操作**: 查询 sched-pm-01 enrolledCount
- **验证点**:
  - [ ] enrolledCount 仍为 N（取消订单不创建 enrollment，不递增 enrolledCount）
  - [ ] 排期仍然可报名

### Step 7: 验证订单状态
- **页面**: `/account/orders`
- **操作**: 查看我的订单列表
- **验证点**:
  - [ ] 取消的订单显示灰色状态标签
  - [ ] 无"取消"按钮
  - [ ] 无支付记录

### Step 8: 验证取消后不可支付
- **操作**: POST `/api/v1/payment/mock-callback`, body: `{ orderId: <已取消订单> }`
- **验证点**:
  - [ ] HTTP 500, message 包含 "无法支付"（状态不是 pending）

### Step 9: 验证取消后不可再次取消
- **操作**: POST `/api/v1/orders/{orderId}/cancel`
- **验证点**:
  - [ ] HTTP 500, message 包含 "无法取消"（状态不是 pending）

### Step 10: 数据一致性终验
- **验证点**:
  - [ ] Order status=`cancelled`, paidAmount=`0`
  - [ ] Payment 表无关联记录
  - [ ] Enrollment 表无关联记录（下单未支付，没有 enrollment）
  - [ ] Schedule enrolledCount 未变化
  - [ ] 排期仍然是 open 状态（可供他人报名）

---

## E2E-005: 全角色切换流程

**旅程**: Editor 创建课程并发布 -> Learner 购买 -> Trainer 考勤 -> 验证全链路数据贯通

**角色**: 张校长 (Editor) -> 李明 (Learner) -> 赵师傅 (Trainer)

**测试数据**:
- 课程: E2E全链路课程, basePrice=200(元)
- 排期: E2E全链路排期, capacity=2
- 支付金额: 20000 分

### Phase A: Editor 创建并发布课程

#### A-1: 张校长登录并创建课程
- **页面**: `/login` -> `/admin/courses/new`
- **操作**: phone=`13800001001`, 创建 title=`E2E全链路课程`, basePrice=`200`, type=`offline`, category=`综合`
- **验证点**: HTTP 201, status=`draft`

#### A-2: 添加排期
- **页面**: `/admin/courses/{id}`
- **操作**: 添加排期 title=`E2E全链路排期`, startTime=`2026-10-01T09:00`, endTime=`2026-10-03T17:00`, capacity=`2`
- **验证点**: HTTP 201, status=`open`, enrolledCount=`0`

#### A-3: 发布课程
- **页面**: `/admin/courses`
- **操作**: 点击"发布"
- **验证点**: status=`published`

### Phase B: Learner 购买

#### B-1: 李明登录
- **页面**: `/login`
- **操作**: phone=`13800001004`, password=`password123`
- **验证点**: 登录成功，跳转 `/courses`

#### B-2: 找到新课程
- **页面**: `/courses`
- **操作**: 浏览课程列表
- **验证点**: "E2E全链路课程"出现在列表中，价格 ¥200.00

#### B-3: 查看详情并报名
- **页面**: `/courses/{新课程id}`
- **操作**: 查看详情 -> 点击"立即报名"
- **验证点**: 跳转到 `/checkout`, 显示 ¥200.00

#### B-4: 创建订单
- **页面**: `/checkout`
- **操作**: 点击"提交订单"
- **验证点**: 跳转 `/payment/{orderId}`, status=`pending`

#### B-5: 支付
- **页面**: `/payment/{orderId}`
- **操作**: 点击"模拟支付成功"
- **验证点**: 跳转 `/account/orders`, status=`paid`

#### B-6: 验证购买结果
- **操作**: 查看 `/account/orders`, 查询数据库
- **验证点**:
  - [ ] 订单 status=`paid`, paidAmount=`20000`
  - [ ] Enrollment 记录已创建
  - [ ] 排期 enrolledCount=`1`

### Phase C: Trainer 考勤

#### C-1: 赵师傅登录
- **页面**: `/login`
- **操作**: phone=`13800001003`, password=`password123`
- **验证点**: 登录成功

#### C-2: 访问花名册
- **页面**: `/admin/attendance/{排期ID}`
- **操作**: 打开排期的考勤花名册
- **验证点**:
  - [ ] 花名册显示 1 名学员: 李明
  - [ ] 显示手机号 13800001004
  - [ ] 初始状态: "未签到"

#### C-3: 标记出勤
- **操作**: 在李明行下拉框选择"出勤"
- **验证点**:
  - [ ] HTTP 201, status=`present`
  - [ ] 页面显示绿色"出勤"标签 + 签到时间

### Phase D: 全链路数据贯通验证

#### D-1: 课程数据链路
- **查询**: Course -> Schedule -> Enrollment
- **验证点**:
  - [ ] Course (E2E全链路课程) --1对多--> Schedule (E2E全链路排期)
  - [ ] Schedule --1对多--> Enrollment (1条, userId=user-learner-1)

#### D-2: 订单数据链路
- **查询**: Order -> OrderItem -> Payment -> Enrollment
- **验证点**:
  - [ ] Order (status=paid) --1对多--> OrderItem (unitPrice=20000)
  - [ ] Order --1对多--> Payment (method=wechat, amount=20000)
  - [ ] OrderItem 引用同一 scheduleId

#### D-3: 考勤数据链路
- **查询**: Schedule -> Attendance -> User
- **验证点**:
  - [ ] Schedule (E2E全链路排期) --1对多--> Attendance (1条, userId=user-learner-1)
  - [ ] Attendance.status = `present`, markedBy = user-trainer

#### D-4: 跨模块关联验证
- **验证点**:
  - [ ] Enrollment.userId = Attendance.userId = Order.buyerId = user-learner-1
  - [ ] Enrollment.scheduleId = Attendance.scheduleId = OrderItem.scheduleId
  - [ ] Schedule.enrolledCount = 实际 active enrollment 数量 = 1
  - [ ] Course.createdBy = user-editor（张校长）
  - [ ] Attendance.markedBy = user-trainer（赵师傅）

---

## E2E-006: 异常场景与容错性测试

**旅程**: 覆盖多种业务异常和边界场景

**复用角色**: 李明 (Learner), 张校长 (Editor)

---

### E2E-006-A: 重复支付幂等性

#### A-1: 对已支付订单再次发起支付
- **前置条件**: order-001 status=`paid`
- **步骤**: POST `/api/v1/payment/mock-callback`, body: `{ orderId: "order-001", method: "alipay" }`
- **验证点**:
  - [ ] HTTP 500, message 包含 "订单状态为 "paid"，无法支付"
  - [ ] order-001 状态不变
  - [ ] 未产生第二条 Payment 记录
  - [ ] 未产生重复 Enrollment
  - [ ] enrolledCount 未额外递增

#### A-2: 快速连点支付按钮（前端防重）
- **前置条件**: 创建 pending 订单
- **步骤**: 快速连续点击"模拟支付成功"两次
- **验证点**:
  - [ ] 第一次调用成功（status -> paid）
  - [ ] 第二次调用返回报错（$transaction 保护，或 API 拒绝）
  - [ ] 数据状态正确（无重复记录）

---

### E2E-006-B: 已满班下单被拒

#### B-1: 构造满班排期
- **前置条件**: 创建排期 capacity=`1`，已有 1 人报名并支付
- **步骤**: 第二个学员尝试下单该排期
- **验证点**:
  - [ ] HTTP 500, message 包含 "已满班"
  - [ ] 订单未创建（或创建了但支付时会失败 -- 当前 createOrder 阶段即检查并拒绝）
  - [ ] "立即报名"按钮在前端显示为禁用状态("已满班")

#### B-2: 同一学员重复购买同一排期
- **前置条件**: 李明在 sched-py-01 已有 active enrollment
- **步骤**: 李明再次下单 sched-py-01
- **验证点**:
  - [ ] 订单创建成功（createOrder 不检查重复 enrollment）
  - [ ] 支付时触发 Enrollment 唯一约束 `[scheduleId, userId]` 违反 -> 事务回滚
  - [ ] 订单仍为 pending（未成功支付）

---

### E2E-006-C: 未登录访问后台

#### C-1: 直接访问 /admin 路径
- **前置条件**: 未登录（localStorage 无 token/user）
- **步骤**: 浏览器访问 `/admin`, `/admin/courses`, `/admin/attendance/sched-py-01`
- **验证点**:
  - [ ] `AdminLayout` 检测到 localStorage 无 user，重定向到 `/login`
  - [ ] 不会看到任何管理后台内容

#### C-2: 直接调用受保护 API
- **前置条件**: 无 token
- **步骤**:
  - POST `/api/v1/courses` -> 401
  - GET `/api/v1/auth/me` -> 401
  - POST `/api/v1/attendance` -> 401
  - GET `/api/v1/orders` -> 401
- **验证点**:
  - [ ] 所有受保护端点返回 HTTP 401, error.code=`UNAUTHORIZED`

#### C-3: 携带伪造 token 访问
- **前置条件**: 构造无效 JWT
- **步骤**: `Authorization: Bearer faketoken123`
- **验证点**: HTTP 401, message="Token无效或已过期"

#### C-4: 携带过期 token 访问
- **前置条件**: 等待当前 token 过期（24h），或修改 token 的 exp 字段
- **验证点**: HTTP 401, "Token无效或已过期"

---

### E2E-006-D: 订单过期流程

#### D-1: 等待订单过期（15 分钟）
- **前置条件**: 创建 pending 订单，记录 expiresAt
- **步骤**: 等待 15 分钟，或手动将数据库中的 expiresAt 改为过去时间
- **验证点**:
  - [ ] GET `/api/v1/orders/{id}` 返回 status=`expired`（动态判断）
  - [ ] 或触发 `expireOverdueOrders` 批量更新后 status 持久化为 `expired`

#### D-2: 过期订单不可支付
- **步骤**: POST `/api/v1/payment/mock-callback` 到过期订单
- **验证点**: HTTP 500, message 包含 "无法支付"

#### D-3: 过期订单不可取消
- **步骤**: POST `/api/v1/orders/{id}/cancel`
- **验证点**: HTTP 500, message 包含 "无法取消"

---

### E2E-006-E: 并发与边界

#### E-1: 最后一个名额并发下单
- **前置条件**: 排期 capacity=`1`, enrolledCount=`0`
- **步骤**: 两个用户（两个不同的 learner token）几乎同时 POST `/api/v1/orders` 同一排期
- **验证点**:
  - [ ] 第一个成功创建订单
  - [ ] 第二个可能被拒绝（"已满班"）或在支付时因 enrolledCount 已满而失败
  - [ ] 最终 paid enrollment 数量不超过 capacity
  - [ ] **说明**: Phase 1 无分布式锁，SQLite 写入串行化提供一定保护

#### E-2: 超大金额订单（边界值）
- **前置条件**: 课程 basePrice = Number.MAX_SAFE_INTEGER / 100（约 90 万亿）
- **步骤**: 下单并支付
- **验证点**:
  - [ ] SQLite INTEGER 支持 64 位有符号整数
  - [ ] payableAmount 正确存储和展示
  - [ ] **说明**: 此测试可能遇到前端精度问题（JS Number），实际业务中金额有上限

#### E-3: 排期 endTime 早于 startTime
- **前置条件**: Editor 登录
- **步骤**: 添加排期 startTime=`2026-12-31`, endTime=`2026-01-01`
- **验证点**:
  - [ ] Zod 校验仅检查字段存在（min 1），不检查时间先后逻辑
  - [ ] 排期创建成功（**已知 bug/优化点**: 缺少 startTime < endTime 的校验）

#### E-4: 注册时 phone 含特殊字符（空格/短横）
- **前置条件**: 无
- **步骤**: phone=`138-0000-1001` 或 `138 0000 1001`
- **验证点**:
  - [ ] Regex `/^[0-9+\- ]+$/` 允许短横和空格
  - [ ] HTTP 201, 注册成功

---

### E2E-006-F: 种子数据故事线验证

#### F-1: 故事线 A — 已支付订单 (order-001)
- **步骤**: GET `/api/v1/orders/order-001`
- **验证点**:
  - [ ] status=`paid`, paidAmount=`198000`, buyer=user-learner-1 (李明)
  - [ ] Payment: method=`wechat`, amount=`198000`, status=`success`
  - [ ] Enrollment: scheduleId=sched-py-01, userId=user-learner-1, status=active
  - [ ] sched-py-01 enrolledCount >= 1

#### F-2: 故事线 B — Desk 代购订单 (order-002)
- **步骤**: GET `/api/v1/orders/order-002`
- **验证点**:
  - [ ] channel=`desk`, buyerId=user-learner-2 (王芳), operatorId=user-desk (小红)
  - [ ] buyerId != operatorId
  - [ ] Payment: method=`cash`, amount=`168000`
  - [ ] Enrollment: scheduleId=sched-ui-01, userId=user-learner-2

#### F-3: 故事线 C — 过期订单 (order-003)
- **步骤**: GET `/api/v1/orders/order-003`
- **验证点**:
  - [ ] status=`expired`, paidAmount=`0`
  - [ ] 无 Payment 记录
  - [ ] 无 Enrollment 记录
  - [ ] 不可支付/不可取消

#### F-4: 验证所有 6 个种子用户可登录
- **步骤**: 依次用 6 个用户登录
- **验证点**:
  - [ ] user-editor (13800001001): 登录成功, role=editor, 跳转 /admin
  - [ ] user-desk (13800001002): 登录成功, role=desk, 跳转 /admin
  - [ ] user-trainer (13800001003): 登录成功, role=trainer, 跳转 /courses
  - [ ] user-learner-1 (13800001004): 登录成功, role=learner, 跳转 /courses
  - [ ] user-learner-2 (13800001005): 登录成功, role=learner
  - [ ] user-learner-3 (13800001006): 登录成功, role=learner

#### F-5: 验证种子课程数据
- **步骤**: GET `/api/v1/courses`
- **验证点**:
  - [ ] course-python: title=`Python全栈开发实战`, basePrice=`198000`, 2 个排期
  - [ ] course-ui: title=`UI设计从入门到精通`, basePrice=`168000`, 1 个排期
  - [ ] course-pm: title=`项目管理PMP认证`, basePrice=`298000`, 1 个排期
  - [ ] 全部 status=published

#### F-6: 验证种子排期数据
- **步骤**: 查询 schedules 表
- **验证点**:
  - [ ] sched-py-01: enrolledCount=1 (李明), capacity=30, status=open
  - [ ] sched-ui-01: enrolledCount=1 (王芳), capacity=25, status=open
  - [ ] sched-pm-01: enrolledCount=0, capacity=20, status=open
  - [ ] sched-py-02: enrolledCount=0, capacity=25, status=open

#### F-7: 验证种子考勤数据
- **步骤**: GET `/api/v1/attendance?scheduleId=sched-py-01`
- **验证点**:
  - [ ] 6 条考勤记录，覆盖 5 种状态
  - [ ] 均标记为 markedBy=user-trainer, checkInMethod=manual

---

## 附录: 测试执行建议

### 执行顺序
1. 先执行 F-4/F-5/F-6/F-7（种子数据验证），确认环境基线正确
2. 执行 E2E-006（异常场景），确保错误处理正常
3. 执行 E2E-002（Editor 创建），创建测试数据
4. 执行 E2E-001（学员购买），使用自有创建的课程数据
5. 执行 E2E-003（考勤），依赖已报名的学员
6. 执行 E2E-004（取消订单），独立测试
7. 执行 E2E-005（全角色切换），端到端验证

### 测试数据清理
- Phase 1 为 SQLite 数据库，建议每次回归前执行 `npx prisma db push --force-reset && npx prisma db seed` 恢复基线数据
- 或为 E2E 准备独立数据库副本

### 关键检查点
- [ ] 所有 HTTP 状态码符合预期（200/201/401/404/409/422/500）
- [ ] 所有 error.code 正确
- [ ] 金额单位一致性（存储分，展示元）
- [ ] 事务原子性（支付流程中任一步失败整体回滚）
- [ ] 角色隔离（Learner 看不到其他用户订单）
- [ ] 租户隔离（所有查询 scoped by tenantId）
- [ ] 状态机防护（非法状态转换被拒绝）

### 性能注意
- SQLite 为单文件数据库，无需并发压测
- 15 分钟订单过期需等待或手动修改数据库时间
- Token 24h 过期可在测试中手动调短 JWT 有效期
