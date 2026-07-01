# 🤖 Agent Dashboard

> 最后更新：2026-07-01 | 🔗 [GitHub](https://github.com/zihao227-code/funding-prototype)

---

## 🔑 快速参考

### 启动方式

```bash
cd d:\funding
npm run dev
```

### 访问地址

| 入口 | URL |
|------|-----|
| 学员官网 | http://localhost:3000/courses |
| 登录页 | http://localhost:3000/login |
| 管理后台 | http://localhost:3000/admin |
| 数据库查看 | `npx prisma studio` → http://localhost:5555 |

### 演示账号（密码统一：`password123`）

| 角色 | 手机号 | 姓名 | 能做什么 |
|------|--------|------|---------|
| Editor 校长 | `13800001001` | 张校长 | 课程CRUD、排期、发布、订单管理、考勤 |
| Desk 前台 | `13800001002` | 小红 | Phase 3开放 |
| Trainer 讲师 | `13800001003` | 赵师傅 | 查看课表、考勤签到 |
| Learner 学员A | `13800001004` | 李明 | 已买Python课，可浏览下单 |
| Learner 学员B | `13800001005` | 王芳 | 已买UI课 |
| Learner 学员C | `13800001006` | 陈强 | 有笔过期订单 |

> 机构ID：`tenant-001`

---

## 📊 Phase 进度

```
Phase 1: 核心链路 ████████████████████ 100% ✅
Phase 2: Funding   ░░░░░░░░░░░░░░░░░░ 0%
Phase 3: 其余完善  ░░░░░░░░░░░░░░░░░░ 0%
```

### Phase 1 已完成

| 模块 | 功能 |
|------|------|
| Auth | 注册、登录、JWT鉴权、角色路由 |
| CLS | 课程创建/编辑/发布/下架、排期管理、官网展示 |
| Billing | 下单、Mock支付(微信/支付宝/现金)、订单状态机、Enrollment自动创建 |
| CA | 单条签到、批量签到、花名册查看 |

### Phase 2 计划

| 模块 | 功能 |
|------|------|
| Funding | 资助类型配置、课程关联、折扣引擎、申请审批 |
| Refund | 开课前退款、Funding额度恢复 |

### Phase 3 计划

| 模块 | 功能 |
|------|------|
| Desk | 前台工作台、代购、扫码收款 |
| Certificate | 证书发放、唯一编号、公开查验 |
| Notification | 站内信、Mock短信/邮件查看 |
| Analytics | 基础仪表盘 |

---

## 📋 PM决策面板

### 当前无待决策项

Phase 1 已完工。等你说 "开" 进入 Phase 2。

---

## ⚠️ 风险

| # | 风险 | 级别 |
|---|------|------|
| R1 | 前端UI有缺失按钮（Agent修复中） | 🟡 |
| R2 | 未做浏览器前端全流程测试 | 🟡 |

---

*此文件手动更新。Dashboard打开方式：IDE右键 → Open Preview，或分屏固定。*
