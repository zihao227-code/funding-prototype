# 📖 项目速查手册

> 打开方式：IDE右键 → Open Preview，或分屏固定

---

## 🚀 启动

```bash
cd d:\funding
npm run dev
```

---

## 🌐 访问地址

| 入口 | URL |
|------|-----|
| 首页 | http://localhost:3000 |
| 学员官网 | http://localhost:3000/courses |
| 登录页 | http://localhost:3000/login |
| 管理后台 | http://localhost:3000/admin |
| 数据库查看 | `npx prisma studio` → http://localhost:5555 |

---

## 🔑 演示账号

> 密码统一：`password123`
> 机构ID：`tenant-001`

| 角色 | 手机号 | 姓名 | 说明 |
|------|--------|------|------|
| Editor | `13800001001` | 张校长 | 课程管理、订单、考勤 |
| Desk | `13800001002` | 小红 | Phase 3 开放 |
| Trainer | `13800001003` | 赵师傅 | 课表、考勤签到 |
| Learner | `13800001004` | 李明 | 已买Python课 |
| Learner | `13800001005` | 王芳 | 已买UI课 |
| Learner | `13800001006` | 陈强 | 有笔过期订单 |

---

## 🗄️ 种子数据

| 实体 | 内容 |
|------|------|
| 课程 | Python全栈(¥1980)、UI设计(¥1680)、PMP认证(¥2980) |
| 排期 | 4个班次（Python×2, UI×1, PMP×1） |
| 订单 | 李明已付(Python)、王芳已付(UI/Desk)、陈强过期(PMP) |
| 考勤 | 6条（出勤/迟到/请假/缺勤/早退各覆盖） |

---

## 🔗 链接

| 平台 | 地址 |
|------|------|
| GitHub | https://github.com/zihao227-code/funding-prototype |

---

## 🛠️ 常用命令

```bash
npm run dev          # 启动开发服务器
npx prisma studio    # 数据库可视化管理
npx prisma db seed   # 重置种子数据
npx prisma migrate dev --name init  # 数据库迁移
```

---
