# CHANGELOG.md

## 2026-07-01

### 新增
- `development_blueprint_v2.md` — 开发蓝图v2.0（从v1.0重构）
- `PROJECT_STATUS.md` — 项目进度追踪
- `CHANGELOG.md` — 本文件
- `TECH_DEBT.md` — 技术债记录
- `prototype_technical_plan.md` — 技术架构Agent产出（Next.js方案）

### 变更
- 技术栈：Spring Boot + React → Next.js + SQLite
- 开发阶段：4 Phase → 3 Phase
- Desk角色：Phase 1 → Phase 3
- 蓝图定位：外部产品文档 → 内部执行手册

### 移除
- v1.0蓝图中的竞品分析、定价、ICP合规等外部内容
- Docker Compose方案（当前阶段不需要）
- Redis、RabbitMQ、PostgreSQL等中间件依赖
