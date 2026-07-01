# 测试覆盖矩阵

> 审查日期: 2026-07-01 | 审查人: 测试架构师

## 覆盖评分总览

| 模块 | API 端点 | 模块测试 | E2E 测试 | 覆盖度 |
|------|----------|----------|----------|--------|
| Auth | 4 | 19 + 4(补) | 间接 | 85% |
| Courses | 6 | 21 + 3(补) | E2E-002 + SM | 90% |
| Schedules | 7 | 17 + 4(补) | E2E-002 + SM | 88% |
| Orders | 4 | 17 + 6(补) | E2E-001 + SM | 92% |
| Payment | 1 | 8 + 3(补) | E2E-001 | 85% |
| Attendance | 4 | 14 + 4(补) | E2E-003 | 82% |
| Middleware | 1 | 7 | ACL | 70% |

---

## 1. API 端点 -> 测试用例映射

### 1.1 Auth

| 端点 | Method | 模块用例 | E2E 用例 | 未覆盖场景 |
|------|--------|----------|----------|-----------|
| `/api/v1/auth/register` | POST | AUTH-001~006, AUTH-020~021, AUTH-023 | - | 并发注册同手机号(无锁) |
| `/api/v1/auth/login` | POST | AUTH-007~011 | E2E-001(step1), E2E-002(step1) | 用户 disabled 状态登录 |
| `/api/v1/auth/refresh` | POST | AUTH-012~015, AUTH-022 | E2E-010(补) | refreshToken 过期(30d) |
| `/api/v1/auth/me` | GET | AUTH-016~019 | - | tenant 信息为空时 |

### 1.2 Courses

| 端点 | Method | 模块用例 | E2E 用例 | 未覆盖场景 |
|------|--------|----------|----------|-----------|
| `/api/v1/courses` | GET | CLS-001~005 | E2E-001(step1), E2E-002(step3) | 按 status 筛选未登录场景 |
| `/api/v1/courses` | POST | CLS-006~011, CLS-024 | E2E-002(step4-5) | Desk/Trainer 创建课程 |
| `/api/v1/courses/[id]` | GET | CLS-012~014 | E2E-001(step2) | 含 courseFundings 的详情 |
| `/api/v1/courses/[id]` | PUT | CLS-015~017, CLS-026 | E2E-008(补) | 更新 coverImageUrl/basePrice |
| `/api/v1/courses/[id]/publish` | POST | CLS-018~021, CLS-025 | E2E-002(step9), SM-CLS-1/3/4 | - |
| `/api/v1/courses/[id]/archive` | POST | CLS-022~023 | SM-CLS-2/5 | draft直接归档状态检查缺失 |

### 1.3 Schedules

| 端点 | Method | 模块用例 | E2E 用例 | 未覆盖场景 |
|------|--------|----------|----------|-----------|
| `/api/v1/schedules` | GET | SCH-001~004 | - | 公开访问无需认证 |
| `/api/v1/schedules/[id]` | GET | SCH-005~006 | - | schedule含course.tenantId |
| `/api/v1/schedules/[id]` | PUT | SCH-007~008, SCH-020 | - | 更新 enrolledCount 手动修改 |
| `/api/v1/schedules/[id]/cancel` | POST | SCH-009~010, SCH-018 | E2E-002(step7 cancel), SM-SCH-2/4 | 并发取消 |
| `/api/v1/courses/[id]/schedules` | GET | SCH-011~012 | E2E-002(step6) | - |
| `/api/v1/courses/[id]/schedules` | POST | SCH-013~015, SCH-019 | E2E-002(step7) | startTime > endTime 校验缺失 |
| `/api/v1/schedules/calendar` | GET | SCH-016~017, SCH-021 | - | 跨月查询, 空结果 |

### 1.4 Orders

| 端点 | Method | 模块用例 | E2E 用例 | 未覆盖场景 |
|------|--------|----------|----------|-----------|
| `/api/v1/orders` | GET | ORD-001~005, ORD-023 | E2E-001(step8), E2E-003(step2) | Desk/Trainer 查看订单权限 |
| `/api/v1/orders` | POST | ORD-006~011, ORD-018~019, ORD-022 | E2E-001(step5) | 部分排期不存在(混合场景) |
| `/api/v1/orders/[id]` | GET | ORD-012~014, ORD-020 | E2E-001(step6) | - |
| `/api/v1/orders/[id]/cancel` | POST | ORD-015~017 | E2E-005(补), SM-ORD-2/7/8 | cancelOrder 无 ownership 检查 |

### 1.5 Payment

| 端点 | Method | 模块用例 | E2E 用例 | 未覆盖场景 |
|------|--------|----------|----------|-----------|
| `/api/v1/payment/mock-callback` | POST | PAY-001~008, PAY-009~011 | E2E-001(step7), SM-ORD-1/6 | 支付金额与订单payableAmount不匹配 |

### 1.6 Attendance

| 端点 | Method | 模块用例 | E2E 用例 | 未覆盖场景 |
|------|--------|----------|----------|-----------|
| `/api/v1/attendance` | GET | ATT-001~003 | - | scheduleId + userId 组合查询 |
| `/api/v1/attendance` | POST | ATT-004~008, ATT-015~016 | E2E-003(step5-6), E2E-006(补) | checkInTime 自动设置验证 |
| `/api/v1/attendance/batch` | POST | ATT-009~011, ATT-018 | E2E-006(补) | 部分失败时的事务性(无事务) |
| `/api/v1/schedules/[id]/attendance/roster` | GET | ATT-012~014 | E2E-003(step4) | roster 含 dropped/refunded enrollment |

---

## 2. 前端页面 -> 测试用例映射

| 页面 | 路由 | E2E 用例 | 关键操作覆盖 | 未覆盖 |
|------|------|----------|-------------|--------|
| 登录 | `/login` | E2E-001, E2E-002 | 登录成功/失败/角色路由 | tenantId 为空 |
| 注册 | `/register` | - | 注册成功跳转课程列表 | 邮箱选填验证 |
| 课程列表 | `/courses` | E2E-001(step1) | 展示 published 课程 | 空课程列表, loading 状态 |
| 课程详情 | `/courses/[id]` | E2E-001(step2-3) | 查看详情+Funding+排期 | 无排期课程, 满班排期 |
| 结算 | `/checkout` | E2E-001(step4-5) | 显示购物车+提交订单 | 空购物车重定向, 下单失败 |
| 模拟支付 | `/payment/[orderId]` | E2E-001(step6-7) | 支付+取消 | 非pending状态订单 |
| 我的订单 | `/account/orders` | E2E-001(step8) | 查看+取消 | 空订单, 分页 |
| 管理仪表盘 | `/admin` | E2E-002(step2) | 显示统计 | 统计数字硬编码 |
| 课程管理 | `/admin/courses` | E2E-002(step3/8/9) | CRUD+发布+归档 | 自动刷新焦点事件 |
| 创建课程 | `/admin/courses/new` | E2E-002(step4-5) | 表单提交 | 价格元->分转换 |
| 编辑课程 | `/admin/courses/[id]` | E2E-002(step6-7) | 排期CRUD | 课程基本信息编辑表单缺失 |
| 订单管理 | `/admin/orders` | E2E-003(step2) | 查看+取消 | 筛选/排序 |
| 考勤花名册 | `/admin/attendance/[scheduleId]` | E2E-003(step4-6) | 查看+逐条标记 | 批量标记未从UI暴露 |

---

## 3. 状态机覆盖

### 3.1 订单状态机 (6 状态: pending/paid/partial_refunded/refunded/cancelled/expired)

| 转换 | 测试覆盖 | 状态 |
|------|----------|------|
| pending -> paid | SM-ORD-1, PAY-001~003, E2E-001(step7) | 已覆盖 |
| pending -> cancelled | SM-ORD-2, ORD-015, E2E-005(补) | 已覆盖 |
| pending -> expired | SM-ORD-3, SM-ORD-9(补), E2E-004(补) | 已覆盖 |
| paid -> partial_refunded | SM-ORD-4, SM-ORD-10(补) | Phase 2, 仅标记 |
| paid -> refunded | SM-ORD-5, SM-ORD-10(补) | Phase 2, 仅标记 |
| cancelled -> * (不可逆) | SM-ORD-6 | 已覆盖 |
| expired -> * (不可逆) | SM-ORD-7 | 已覆盖 |
| paid -> cancelled (非法) | SM-ORD-8 | 已覆盖 |

**订单状态机覆盖率: 8/8 转换 (100%)** -- 注意 partial_refunded/refunded 属于 Phase 2 暂未实现

### 3.2 课程状态流转 (3 状态: draft/published/archived)

| 转换 | 测试覆盖 | 状态 |
|------|----------|------|
| draft -> published | SM-CLS-1, CLS-018, E2E-002(step9) | 已覆盖 |
| published -> archived | SM-CLS-2, CLS-022 | 已覆盖 |
| published -> published (拒绝) | SM-CLS-3, CLS-019 | 已覆盖 |
| archived -> published (拒绝) | SM-CLS-4, CLS-025(补) | 已覆盖 |
| draft -> archived (边界) | SM-CLS-5, SM-CLS-6(补) | 已覆盖 |

**课程状态流转覆盖率: 5/5 转换 (100%)**

### 3.3 排期状态流转 (5 状态: draft/open/full/cancelled/completed)

| 转换 | 测试覆盖 | 状态 |
|------|----------|------|
| (new) -> open | SM-SCH-1, SCH-019(补) | 已覆盖 |
| open -> cancelled | SM-SCH-2, SCH-009 | 已覆盖 |
| cancelled -> cancelled (重复) | SM-SCH-4, SCH-018(补) | 已覆盖 |
| open -> full (自动) | SM-SCH-5(补) | 未实现, 仅标记 |
| open -> completed (自动) | SM-SCH-6(补) | 未实现, 仅标记 |

**排期状态流转覆盖率: 3/3 已实现转换 (100%); 2/5 含未实现功能标记**

---

## 4. 权限边界覆盖

| 边界 | 模块用例 | E2E 用例 | 补充 |
|------|----------|----------|------|
| Editor 可创建/发布/归档课程 | CLS-006, CLS-018, CLS-022 | E2E-002 | ACL-11(补) |
| Learner 不可创建/发布/归档课程 | CLS-008, ACL-1~3 | - | ACL-15(补) |
| Admin 可查看全部订单 | ORD-001 | E2E-003 | ACL-4 |
| Learner 仅查看自己订单 | ORD-002, ORD-023(补) | - | ACL-5~6 |
| Learner 不可越权查其他用户订单 | ORD-023(补) | - | ACL-13(补) |
| 未登录可公开读取已发布课程 | CLS-001 | E2E-001(step1) | - |
| 未登录不可访问 /admin | - | - | ACL-14(补) |
| Trainer 写操作权限 | - | - | ACL-12(补) |
| Desk 写操作权限 | - | - | ACL-11(补) |

**权限边界覆盖率: 约 60%** -- 需补充 Desk/Trainer 角色的精确权限测试

---

## 5. 错误场景覆盖

| 错误类型 | 用例数 | 覆盖率 |
|----------|--------|--------|
| 404 Not Found | 5 | 85% -- 缺少 schedule 创建时 courseId 不存在 |
| 422 Validation | 12 | 75% -- 缺少 Zod 边界值测试(schedule PUT 无校验) |
| 401 Unauthorized | 8 | 80% |
| 403 Forbidden | 0 | 0% -- ForbiddenError 定义但未使用 |
| 409 Conflict | 2 | 80% -- 仅注册手机号冲突 |
| 500 Internal | 1 | 20% -- 仅错误响应格式测试 |
| 业务异常(400) | 6 | 70% |

---

## 6. 种子数据利用

| 种子数据 | 故事线 | 利用用例 | 状态 |
|----------|--------|----------|------|
| order-001 (李明, 线上, 已支付) | A | SEED-001~002, E2E-SEED-001 | 已利用 |
| order-002 (王芳, Desk, 已支付) | B | SEED-003~004, E2E-SEED-002 | 已利用 |
| order-003 (陈强, 线上, 已过期) | C | SEED-005~006, E2E-SEED-003 | 已利用 |
| 6个种子用户 | - | SEED-007(补) | 仅标记 |
| 考勤记录 6条 | - | SEED-008~009(补) | 仅标记 |
| 2个教室 | - | SEED-010(补) | 仅标记 |
| 4个排期 | - | 间接使用 | 已利用 |

---

## 7. 覆盖缺口总结

### 严重缺口 (需立即补充)
1. **Desk/Trainer 角色权限** -- middleware 对 editor/desk/trainer 不区分，存在越权风险，测试未覆盖
2. **Schedule PUT 无 Zod 校验** -- SCH-020 标记但缺乏边界入参测试
3. **并发安全** -- 下单/支付无并发控制测试
4. **archiveCourse 无状态检查** -- draft 可直接归档，未阻止

### 中等缺口
5. **Token 刷新完整流程** -- E2E-010 仅标记
6. **Dashboard 数据为假数据** -- 管理仪表盘硬编码，非动态
7. **Enrollment-Attendance 不一致** -- 考勤记录可能有非报名学员 (种子数据揭示)
8. **schedule PUT 可手动修改 enrolledCount** -- 无后端校验
9. **apiClient 401 自动重定向** -- 前端错误处理链路未测试

### 建议
- 补充 Desk/Trainer 角色在 API 层的精确权限矩阵测试
- 补充并发下单/支付的 race condition 测试
- 补充 archiveCourse 状态检查代码修复后的回归测试
- 补充 schedule PUT 的 Zod 校验 schema 缺失相关的测试
