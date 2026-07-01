# 系统级问题追踪

> 更新：2026-07-01 | 发现 → 根因分析 → 对治方案

---

## 🟡 ISSUE-001：中间件认证策略过于激进

**发现时间：** 2026-07-01（CLS模块联调时）

**现象：**
- `GET /api/v1/courses` 返回 401
- `GET /api/v1/courses/[id]` 返回 401
- Website 页面无法在不登录的情况下展示课程

**根因分析（全局视角）：**
`src/middleware.ts` 的白名单只包含4个 Auth 路径。但整个系统有两类 API：

| 类型 | 示例 | 认证需求 |
|------|------|---------|
| 公开读取 | GET /courses, GET /courses/[id], GET /schedules | ❌ 不需要 |
| 认证写入 | POST /courses, PUT /courses/[id], POST /orders | ✅ 需要 |

中间件没有区分 HTTP Method，一刀切拦了所有 /api/ 路径。

**影响范围：** Website 全部页面（课程列表、课程详情、排期查看）

**方案：**
- A）扩大白名单：加 GET /courses, GET /schedules → 但中间件不好区分Method
- B）中间件在公开路径上跳过GET，拦POST/PUT/DELETE → 需要Method判断
- C）移除白名单限制，改为每个Route Handler自行校验 → 最灵活但代码重复

**推荐：B** — middleware 对公开资源路径只放过 GET，其余 Method 照常拦截

---
