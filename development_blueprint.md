# 教育培训机构全流程管理平台 —— 开发蓝图

**版本：** v1.0
**日期：** 2026年6月30日
**基于：** 竞品深度分析报告（13竞品） + 业务流程审计报告 + 待决策问题清单
**用途：** 产品定义 / 流程规范 / 架构设计 / 实施路线图

---

## 目录

1. [第一部分：产品定义](#第一部分产品定义)
2. [第二部分：优化后的完整业务流程](#第二部分优化后的完整业务流程)
3. [第三部分：系统架构细化](#第三部分系统架构细化)
4. [第四部分：角色权限矩阵](#第四部分角色权限矩阵)
5. [第五部分：数据模型概要](#第五部分数据模型概要)
6. [第六部分：技术方案建议](#第六部分技术方案建议)
7. [第七部分：实施路线图](#第七部分实施路线图)
8. [第八部分：待决策问题与推荐方案](#第八部分待决策问题与推荐方案)

---

## 第一部分：产品定义

### 1.1 一句话定位

> **为线下培训机构打造的、线上线下打通的、自带资助管理闭环的经营操作系统（Training Business OS）。**

这不是"又一个线上卖课平台"。Thinkific、Teachable、小鹅通已经充分覆盖了"创作者卖课"市场，我们不需要在那个红海里竞争。我们的战场是**线下培训机构的数字化转型**。

### 1.2 核心差异化（与竞品对比）

基于对13个竞品的系统性分析，我们有三重差异化：

| 差异化维度 | 竞品现状 | 我们的方案 |
|-----------|---------|-----------|
| **资助管理（Funding）** | 全局空白。没有任何SaaS竞品提供标准化资助管理功能 | 内置Funding引擎：政府补贴、企业报销、机构奖学金的配置/核验/审批/对账全流程 |
| **前台角色（Desk）** | 除Mindbody外全部缺失。大多数竞品只有Admin/Teacher/Student三类角色 | 专属Desk角色+POC流程：前台代购、扫码收款、签到办理，权限精准限制 |
| **双渠道统一订单** | 线上线下数据割裂。校宝和有赞有一定能力但未做到无缝统一 | 统一订单引擎：同一学员的线上自助购买和线下前台代购共用一个订单体系和账户 |

**竞争格局图：**

```
              线上强
                |
    Thinkific   |   小鹅通
    Teachable   |   有赞教育
    Kajabi      |   腾讯课堂/网易云课堂
                |
  ——————————————+——————————————
                |
    (空白)      |   校宝在线
                |   Mindbody
                |   Arlo/Cademy
                |
              线下强

 我们的定位：右下象限 + Funding维度（第三轴）
 = 线上线下双强 + 资助管理闭环
```

**三条核心战略：**

1. **不做"又一个线上卖课平台"** -- Thinkific/Teachable/小鹅通已充分覆盖。我们的战场是线下培训机构的数字化经营操作系统。
2. **Funding是护城河** -- 没有任何竞品在做。有真实政策驱动需求（中国各地人社局技能培训补贴、企业培训外包、非营利资助）。一旦培训机构将Funding数据沉淀在我们系统里，迁移成本极高。
3. **双渠道统一订单是基本功** -- 需要做到比校宝/有赞教育/Mindbody更无缝，但这不是终极差异化。差异化在Funding + Desk角色覆盖。

### 1.3 目标用户画像

**MVP阶段目标客群：**

| 维度 | 描述 |
|------|------|
| 机构类型 | 线下为主、有线上展示需求的培训机构 |
| 典型类别 | 语言培训、职业培训（IT/技能）、艺术培训（美术/音乐/舞蹈）、体育培训 |
| 规模 | 1-3个校区、50-500学员、3-20名教师 |
| 现有痛点 | 用Excel/微信管理学员，线上线下订单对不上，资助/补贴资金追踪困难，前台操作无系统支撑 |
| 决策人 | 校区校长 / 机构创始人 |
| 付费意愿 | 年费￥5,000-15,000可接受（参考校宝￥4,480-7,480、有赞教育￥3,800-12,800） |

**完整版扩展客群：**
- 多校区连锁机构（5-20校区）
- 有政府补贴对接需求的职业技能培训学校
- 企业培训部门（B2B批量报名+对公结算）

### 1.4 MVP vs 完整版边界

#### MVP 核心（P0 — 必须做）

| 模块 | 功能 | 理由 |
|------|------|------|
| **UEM** | 4角色基础权限（Editor/Desk/Trainer/Learner） | 产品架构的骨架 |
| **UEM** | 学员注册 + 档案管理 | 学员是一切业务的核心实体 |
| **CLS** | 课程创建（名称/描述/价格/类型/封面）+ 发布到官网 | 培训机构最基础需求 |
| **CLS** | 课程排期（按天/周排课，含时间/地点/容量） | 连接"购买"和"上课"的关键桥梁 |
| **Billing** | 线上支付（微信支付/支付宝） | 线上自助购买闭环 |
| **Billing** | 订单管理 + 订单状态机（待支付→已支付→已退款，含超时自动取消） | 双渠道统一订单系统 |
| **Billing** | 前台代购流程（Desk帮学员下单并收款） | 线下渠道MVP关键场景 |
| **CA** | 课堂考勤签到 | 线下场景核心闭环 |
| **Funding** | 资助类型基础配置（标签+金额）+ 课程关联资助 | 最独特差异化，MVP就要有 |
| **通知** | 基础消息通知（购买成功/开课提醒，站内信+邮件） | 流程衔接的基础设施 |

#### MVP 不做的事

| 不做的功能 | 理由 |
|-----------|------|
| 在线直播/录播播放器 | P2再考虑，先专注线下场景 |
| 社区/论坛/朋友圈 | 培训机构非核心需求 |
| AI课程生成器 | 培训机构自己有课程内容 |
| 分销/裂变营销 | 先做管理效率，后做获客 |
| 自建支付网关 | 接入微信/支付宝即可 |
| 小程序独立开发 | MVP先做响应式Web |
| 多校区管理 | 单校区先行 |
| 完整Funding审批流 | MVP只做标记和分账展示，完整流程P1 |

#### P1（MVP第二阶段）

- 资助申请->审批->发放全流程
- 退款/退课/转班统一管理
- 教室/教师资源管理
- 学员-家长绑定（家庭账号）
- 数据分析仪表盘
- 消息通知中心（多渠道）

#### P2（后续迭代）

- 在线直播/录播课程
- 手机端签到（GPS/二维码）
- 教师端App
- 多校区管理
- 开放API平台
- 营销与获客工具
- 企业批量报名（B2B）

#### MVP验证指标（6个月目标）

| 指标 | 目标 | 衡量方式 |
|------|------|---------|
| 付费机构数 | 10-20家 | 签约付费 |
| 月活跃学员 | 500+ | 系统登录活跃 |
| 前台代购使用率 | >30%的订单来自Desk | Billing模块统计 |
| Funding课程数 | >5门关联资助的课程 | Funding模块统计 |
| NPS | >40 | 季度调研 |
| 客户留存率 | >85%（月度） | 续费率 |

---

## 第二部分：优化后的完整业务流程

> 基于原8条流程的审计结果，补充了缺失流程、合并了冗余逻辑、补充了边界情况处理。最终形成18条流程，按学员生命周期时序排列。

### 流程总览

```
┌─────────────────────────────────────────────────────┐
│                  获客与营销层                         │
├─────────────────────────────────────────────────────┤
│ F1. 营销与获客管理                                    │
│ F2. 机构/企业客户管理 (B2B)                           │
├─────────────────────────────────────────────────────┤
│                  课程供给层                           │
├─────────────────────────────────────────────────────┤
│ F3. 课程全生命周期管理                                │
│ F4. 课程排期与日历管理                                │
│ F5. Trainer全生命周期管理                             │
│ F6. 统一折扣引擎（Funding + 营销优惠）                 │
├─────────────────────────────────────────────────────┤
│                  交易与履约层                         │
├─────────────────────────────────────────────────────┤
│ F7. 统一订单与支付流程（线上+线下合并）                 │
│ F8. 订单状态机管理                                    │
│ F9. 退款/退课/转班统一管理                             │
├─────────────────────────────────────────────────────┤
│                  交付与成果层                         │
├─────────────────────────────────────────────────────┤
│ F10. 上课与交付                                      │
│ F11. 评估与发证                                      │
├─────────────────────────────────────────────────────┤
│                  运营与支撑层                         │
├─────────────────────────────────────────────────────┤
│ F12. 消息通知中心                                    │
│ F13. 客户服务与工单                                   │
│ F14. 数据分析与运营报表                               │
│ F15. 学员360视图                                     │
├─────────────────────────────────────────────────────┤
│                  系统与合规层                         │
├─────────────────────────────────────────────────────┤
│ F16. 系统权限与安全管理                               │
│ F17. 合规与审计                                      │
│ F18. 开放平台与集成                                   │
└─────────────────────────────────────────────────────┘
```

---

### F1. 营销与获客管理

| 属性 | 内容 |
|------|------|
| **涉及系统** | CLS（课程数据）、Billing（优惠券数据）、Website（展示） |
| **涉及角色** | Editor（配置和管理）、Learner（参与和领取） |
| **输入** | 营销活动配置（类型/规则/有效期/预算上限） |
| **输出** | 已生效的优惠策略、领取记录、转化数据 |
| **关键状态变化** | 草稿 → 进行中 → 已结束 / 预算耗尽 |
| **核心场景** | 优惠券创建与发放、拼团活动、试听课/免费课引流、限时折扣/早鸟价 |
| **边界情况** | 优惠券超发处理、拼团失败退款、试听课的学员信息收集 |

### F2. 机构/企业客户管理 (B2B)

| 属性 | 内容 |
|------|------|
| **涉及系统** | UEM（企业账号）、Billing（对公结算）、CLS（批量选课） |
| **涉及角色** | Editor（管理企业客户）、企业HR（发起报名） |
| **输入** | 企业入驻信息、批量报名名单、对公转账凭证 |
| **输出** | 企业账户、批量订单、统一发票、权限批量开通 |
| **关键状态变化** | 企业注册 → 资质审核 → 签约 → 批量报名 → 对公付款(待确认→已到账) → 权限开通 |
| **核心场景** | 企业HR给50名员工批量报课、对公转账、统一开票 |
| **边界情况** | 部分员工中途退出、对公转账到账周期长(3-7天)何时开权限、发票分拆 |

### F3. 课程全生命周期管理

| 属性 | 内容 |
|------|------|
| **涉及系统** | CLS（核心）、Website（展示）、Funding（关联资助） |
| **涉及角色** | Editor（创建/编辑/发布/下架）、内容审核者（审核） |
| **输入** | 课程信息（名称/描述/价格/类型/封面/内容/大纲） |
| **输出** | 已发布课程（官网可见）、课程版本记录 |
| **关键状态变化** | 草稿 → 待审核 → 已发布 → 已下架 / 已归档 |
| **核心场景** | 创建课程、内容编辑(课件版本管理/素材库)、审核发布、下架归档 |
| **边界情况** | 课件版本回滚、已购学员的课程下架后如何处理、封面/视频CDN管理 |

### F4. 课程排期与日历管理

| 属性 | 内容 |
|------|------|
| **涉及系统** | CLS（核心）、CA（教室/教师资源）、Billing（价格关联） |
| **涉及角色** | Editor（排课和管理）、Learner（查看课表）、Trainer（查看自己的排课） |
| **输入** | 排期配置：课程ID、日期时间、地点/Zoom链接、容量上限、报名截止时间、价格 |
| **输出** | 可报名的班次列表、日历视图、满班/取消状态 |
| **关键状态变化** | 待发布 → 开放报名 → 满班关闭 / 报名截止 → 已开课 → 已结课 / 已取消 |
| **核心场景** | 创建班次、日历视图(日/周/月)、自动满班关闭、课程取消/改期(通知+补偿) |
| **边界情况** | Editor取消课程后已付费学员的处理(自动退款/转班/保留)、并发抢课名额锁定(乐观锁vs悲观锁)、改期对学员排期的连锁影响、教室/Zoom资源冲突检测 |

### F5. Trainer全生命周期管理

| 属性 | 内容 |
|------|------|
| **涉及系统** | UEM（Trainer档案）、CLS（排课关联）、CA（上课记录）、Billing（课酬） |
| **涉及角色** | Editor（管理Trainer）、Trainer（上课） |
| **输入** | Trainer入驻申请（资质材料）、排课安排、上课记录 |
| **输出** | Trainer档案、资质状态、课酬结算单、评级 |
| **关键状态变化** | 待审核 → 已入驻 → 排课中 → 授课中 → 已结算 |
| **核心场景** | 入驻审核、资质管理、排课分配、课酬结算(按时/按节/按学员)、学员评价与评级 |
| **边界情况** | Trainer临时无法上课(代课机制/延期+通知)、资质过期提醒、课酬争议处理 |

### F6. 统一折扣引擎

| 属性 | 内容 |
|------|------|
| **涉及系统** | Funding（资助规则）、Billing（优惠券/拼团/限时价）、CLS（课程定价） |
| **涉及角色** | Editor（配置规则）、系统（自动计算） |
| **输入** | 原始课程价格 + 学员身份 + 适用的折扣策略列表 |
| **输出** | 最终应付金额 + 折扣明细（每项折扣的来源和金额） |
| **关键状态变化** | 无状态，纯计算引擎。每次订单创建时实时计算 |
| **核心场景** | Funding规则匹配(优先级最高)、优惠券叠加/互斥、拼团折扣、早鸟价/限时价、多种折扣聚合计算 |
| **边界情况** | 跨Funding规则叠加(一个学员同时满足政府补贴和企业福利)、优惠券与Funding是否互斥、Funding预算上限检测、Funding有效期判断 |

**设计说明：** 这是原流程审计报告建议的重大优化。将Funding规则、营销优惠券、拼团折扣、早鸟价统一收敛到一个折扣引擎，避免Billing模块需要分别处理多种折扣逻辑。Funding本质是一种高优先级的折扣策略（有资金来源追踪的折扣），营销优惠是另一种。退款时也只需回溯折扣引擎，自动恢复Funding额度/优惠券。

### F7. 统一订单与支付流程（线上+线下合并）

| 属性 | 内容 |
|------|------|
| **涉及系统** | CLS（课程/排期数据）、UEM（学员身份）、Funding/Billing（折扣计算）、Website（线上）/ Admin Console（线下） |
| **涉及角色** | Learner（线上自助）、Desk（线下代购）、系统（回调处理） |
| **输入** | 课程选择 + 学员身份 + 支付方式（线上/线下） |
| **输出** | 已支付订单 + 权限已开通 + 通知已发送 |
| **关键状态变化** | 见 F8 订单状态机 |
| **核心场景** | **场景A（线上自助）：** 浏览课程 → 选课 → 登录/注册 → 计算折扣 → 生成订单 → 微信/支付宝支付 → 回调确认 → 自动开通权限 → 发送通知。**场景B（线下前台代购）：** Desk搜索学员 → 选择课程 → 计算折扣 → 生成订单 → 扫码/现金收款 → Desk手动确认 → 自动开通权限 → 发送通知 |
| **边界情况** | 支付超时(见F8)、金额不符校验、并发名额抢光(乐观锁)、购物车多门课合并支付时Funding如何分配、线上预约线下补款混合场景、试听/免费课是否走完整订单流程 |

**设计说明：** 这是原流程审计报告建议的另一个重大优化。线上自助购买和线下前台代购的核心链路相同（选课→确认订单→扣减Funding→支付→开通权限），唯一差异在支付方式。统一订单引擎避免了订单模型不一致、Funding核销逻辑写两遍、退款逻辑需适配两套订单的问题。

### F8. 订单状态机管理

| 属性 | 内容 |
|------|------|
| **涉及系统** | Billing（核心）、CLS（名额锁定/释放）、Funding（额度占用/释放）、通知系统 |
| **涉及角色** | 系统自动（状态流转）、Editor（监控和人工干预） |
| **输入** | 支付事件（发起/成功/失败/超时）、退款事件、人工操作 |
| **输出** | 状态变更 + 触发关联动作（开权限/释放名额/恢复Funding/发通知） |
| **关键状态变化** | 详见下方状态图 |
| **核心场景** | 超时自动取消、支付回调失败重试+对账、部分退款vs全额退款差异处理 |
| **边界情况** | 超时时长定义（建议15-30分钟）、回调失败重试策略（指数退避，最多3次→人工对账）、并发支付导致重复扣款（幂等性设计） |

**订单状态机：**

```
                    ┌──────────┐
                    │  待支付   │
                    └────┬─────┘
                         │
            ┌────────────┼────────────┐
            │ 支付成功    │ 超时       │ 手动取消
            ▼            ▼            ▼
      ┌──────────┐  ┌──────────┐  ┌──────────┐
      │  已支付   │  │  已取消   │  │  已取消   │
      └────┬─────┘  └──────────┘  └──────────┘
           │
    ┌──────┼──────┐
    │ 全额退款     │ 部分退款
    ▼             ▼
┌──────────┐  ┌──────────┐
│  已退款   │  │ 部分退款  │
└──────────┘  └──────────┘
```

每个状态变更触发的关联动作：

| 状态变更 | 触发动作 |
|---------|---------|
| 创建订单→待支付 | 锁定课程名额（乐观锁，15分钟预留期）、锁定Funding额度 |
| 待支付→已支付 | 开通学习权限、扣减Funding额度（确认消耗）、发送购买成功通知 |
| 待支付→已取消（超时） | 释放课程名额、释放Funding额度、发送超时提醒 |
| 已支付→已退款 | 收回学习权限、恢复Funding额度（如适用）、恢复优惠券、退款到账通知 |
| 已支付→部分退款 | 按比例收回部分权限、按比例恢复Funding/优惠券 |

### F9. 退款/退课/转班统一管理

| 属性 | 内容 |
|------|------|
| **涉及系统** | Billing（退款）、CLS（排期变更）、Funding（额度恢复）、CA（考勤记录处理）、通知系统 |
| **涉及角色** | Learner（申请）、Editor（审核和执行） |
| **输入** | 退课/转班申请（类型/原因/目标班次） |
| **输出** | 退款完成 / 转班完成 + 通知 |
| **关键状态变化** | 申请提交 → 待审核 → 已批准(执行中) → 已完成 / 已拒绝 |
| **核心场景** | 全额退款（恢复Funding/优惠券→收回权限）、转班（差价处理→变更排期→权限延续）、部分退款（按比例恢复折扣→部分收回权限） |
| **边界情况** | 退课后Funding额度恢复的精确逻辑（尤其是Funding已过有效期）、跨Funding规则退款时按比例分配、已发证课程的证书是否自动作废、转班产生差价时的支付/退款处理、退课后已产生的考勤记录如何处理 |

### F10. 上课与交付

| 属性 | 内容 |
|------|------|
| **涉及系统** | CA（核心）、CLS（排期数据）、UEM（学员/Trainer身份）、通知系统 |
| **涉及角色** | Trainer（主导上课）、Learner（参与上课） |
| **输入** | 排期信息（时间/地点/学员列表）、备课内容 |
| **输出** | 上课记录、考勤记录、课程回放（如有录制） |
| **关键状态变化** | 待开课 → 进行中 → 已结束 |
| **核心场景** | Trainer备课、上课（直播/线下）、考勤签到、互动（问答/作业）、课程回放 |
| **边界情况** | Trainer临时无法上课（代课/延期→通知全员）、学员迟到/早退的考勤标记、直播断线重连、线下课堂临时换教室 |

### F11. 评估与发证

| 属性 | 内容 |
|------|------|
| **涉及系统** | CA（评估数据）、CLS（课程关联）、UEM（学员档案）、通知系统 |
| **涉及角色** | Trainer（批改）、Editor（审核发证）、Learner（参加考核/获证） |
| **输入** | 考核/考试结果、发证条件（出勤率/成绩/完成度） |
| **输出** | 考核结果、证书（唯一编号+可查验） |
| **关键状态变化** | 待考核 → 已批改 → 判定通过/不通过 → 证书已发放 / 证书已撤销 |
| **核心场景** | 考核/考试、批改(自动+人工)、结果判定、发证(唯一编号+二维码查验)、证书补发/撤销 |
| **边界情况** | 证书丢失补发（保持原编号）、作弊被发现的证书撤销（查验API同步失效）、退课后证书自动作废、证书编号全局唯一性保证 |

### F12. 消息通知中心

| 属性 | 内容 |
|------|------|
| **涉及系统** | 独立服务，被所有其他模块调用 |
| **涉及角色** | Editor（配置模板和路由规则）、系统（自动触发发送） |
| **输入** | 触发事件（购买成功/开课提醒/退款通知/审批请求等） + 接收人 |
| **输出** | 多渠道消息送达（站内信/邮件/短信/企微/飞书） |
| **关键状态变化** | 待发送 → 已发送 → 已送达/已读（站内信） |
| **核心场景** | 统一模板管理、路由规则（什么事件→什么渠道→什么模板）、多渠道发送、发送日志和失败重试 |
| **边界情况** | 短信/邮件发送失败重试（最多3次，间隔递增）、用户通知偏好设置（免打扰时段）、渠道不可用时的降级策略（短信失败→站内信兜底） |

**触发点清单（MVP必须覆盖）：**

| 触发事件 | 渠道 | 接收人 |
|---------|------|--------|
| 购买成功 | 站内信 + 邮件 | Learner |
| 开课提醒（提前24h/1h） | 站内信 + 邮件 | Learner |
| 付款超时提醒 | 站内信 | Learner |
| 退款到账通知 | 站内信 + 邮件 | Learner |
| 课程取消/改期通知 | 站内信 + 邮件 + 短信 | 已报名Learner |
| 证书发放通知 | 站内信 + 邮件 | Learner |
| Desk代购成功 | 站内信 | Learner |
| 新订单通知 | 站内信 | Editor |

### F13. 客户服务与工单

| 属性 | 内容 |
|------|------|
| **涉及系统** | 独立模块，关联UEM（用户身份）、Billing（订单查询）、CLS（课程查询） |
| **涉及角色** | Learner（提问）、Desk/Editor（处理） |
| **输入** | 学员提交的工单（问题分类/描述/截图/关联订单） |
| **输出** | 已解决的工单 + 满意度评价 |
| **关键状态变化** | 待处理 → 处理中 → 已解决(待确认) → 已关闭 |
| **核心场景** | 帮助中心/FAQ、智能客服（常见问题自动回复）、工单提交→分配→处理→关闭+评价 |
| **边界情况** | 支付失败问题紧急升级、批量投诉（如课程取消引发的集中工单）、工单SLA超时升级 |

### F14. 数据分析与运营报表

| 属性 | 内容 |
|------|------|
| **涉及系统** | 独立BI模块，消费所有其他模块的数据 |
| **涉及角色** | Editor（查看和分析） |
| **输入** | 各模块业务数据（订单/学员/课程/Funding/考勤） |
| **输出** | 报表和仪表盘 |
| **关键状态变化** | 无，只读分析 |
| **核心场景** | 销售报表（课程销量排行/营收趋势）、学员漏斗（访问→注册→购买→完课→复购）、Funding使用率分析、退课率监控、区域热力图、Trainer绩效看板 |
| **边界情况** | 实时 vs 离线数据一致性、大数据量下的聚合查询性能 |

### F15. 学员360视图

| 属性 | 内容 |
|------|------|
| **涉及系统** | 聚合UEM、Billing、CLS、CA、Funding数据 |
| **涉及角色** | Desk/Editor（查询）、Learner（自助查看自己的数据） |
| **输入** | 学员ID |
| **输出** | 学员全维度信息聚合视图 |
| **关键状态变化** | 无，聚合视图 |
| **核心场景** | 学员资料（基本信息+标签）、订单历史、课程/证书列表、沟通记录（工单/通知）、学习进度 |

**设计说明：** 原"用户生命周期"流程被重新定位为"学员360视图"。它不是独立业务流程，而是多个流程的聚合视图。既可作为Desk/Editor的查询工具，也可作为Learner的"我的主页"。

### F16. 系统权限与安全管理

| 属性 | 内容 |
|------|------|
| **涉及系统** | UEM（权限管理）、全系统（权限校验）、独立审计日志模块 |
| **涉及角色** | 超级管理员（角色分配和权限配置） |
| **输入** | 权限配置（角色定义/权限分配） |
| **输出** | 生效的权限控制、操作日志、异常告警 |
| **关键状态变化** | 权限配置 → 生效 → 异常行为告警 |
| **核心场景** | 角色定义（4角色+可扩展）、权限分配（到模块/到操作/到数据范围）、操作日志（谁在什么时间做了什么）、异常行为告警（频繁登录失败/批量数据导出） |
| **边界情况** | Editor全权限是否包含查看财务数据和他人操作日志、角色分配权归属、权限变更的审批流程 |

### F17. 合规与审计

| 属性 | 内容 |
|------|------|
| **涉及系统** | 全系统（数据采集）、独立审计模块（查询和导出） |
| **涉及角色** | Editor（日常合规）、合规官/外部审计（审计查询） |
| **输入** | 审计要求（资金审计/证书合规/数据隐私） |
| **输出** | 审计报告、数据导出包 |
| **关键状态变化** | 无，合规是贯穿全局的约束 |
| **核心场景** | 资金流水审计（Funding资金来源与去向全链路可追溯）、证书合规（唯一编号链+查验API）、数据隐私（GDPR/个保法：数据导出权、删除权、授权管理）、操作审计日志 |
| **边界情况** | 政府补贴场景的审计要求更严（需支持导出审计材料包）、数据删除后审计日志中的关联处理（假删vs真删） |

### F18. 开放平台与集成

| 属性 | 内容 |
|------|------|
| **涉及系统** | 独立网关模块，对接第三方服务 |
| **涉及角色** | Editor（配置集成）、外部开发者（调用API） |
| **输入** | 集成配置（API Key/Webhook URL/渠道参数） |
| **输出** | 已对接的第三方服务 |
| **关键状态变化** | 配置 → 测试连接 → 已启用 / 已停用 |
| **核心场景** | 支付渠道接入（微信/支付宝）、直播平台对接（腾讯会议/Zoom）、证书查验API（供用人单位核验）、企微/飞书组织同步、自定义Webhook |
| **边界情况** | 支付渠道的商户号审批周期（2-4周）、直播平台的计费模式对接、API版本化兼容 |

---

### 新旧流程对照表

| 原流程(8条) | 优化后(18条) | 变化类型 |
|-----------|-------------|---------|
| 1.课程创建与发布 | F3.课程全生命周期管理 | 扩展（+内容版本/审核/下架） |
| — | F4.课程排期与日历管理 | **新增**（连接购买→上课的桥梁） |
| — | F5.Trainer全生命周期管理 | **新增** |
| 4.Funding资助管理 | F6.统一折扣引擎 | 合并扩展（Funding+营销优惠统一） |
| 2.线上自助购买 + 3.线下前台购买 | F7.统一订单与支付流程 | 合并（线上+线下统一订单引擎） |
| — | F8.订单状态机管理 | **新增**（超时/回调/并发） |
| 7.退款与订单管理 | F9.退款/退课/转班统一管理 | 扩展（+转班/部分退款） |
| 5.上课与交付 | F10.上课与交付 | 保留 |
| 6.评估与发证 | F11.评估与发证 | 扩展（+补发/撤销） |
| — | F12.消息通知中心 | **新增**（P0级缺失） |
| — | F13.客户服务与工单 | **新增** |
| — | F14.数据分析与运营报表 | **新增** |
| 8.用户生命周期 | F15.学员360视图 | 重新定位（从流程变为聚合视图） |
| — | F16.系统权限与安全管理 | **新增**（P0级缺失） |
| — | F17.合规与审计 | **新增** |
| — | F18.开放平台与集成 | **新增** |
| — | F1.营销与获客管理 | **新增** |
| — | F2.机构/企业客户管理 | **新增** |

---

## 第三部分：系统架构细化

### 3.1 模块架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
├───────────────┬───────────────────┬─────────────────────────┤
│   Website     │  Admin Console    │   Learning Space        │
│  (学员官网)    │  (管理后台)        │   (上课系统)             │
│  面向Learner  │  面向Editor/Desk  │   面向Learner/Trainer   │
├───────────────┴───────────────────┴─────────────────────────┤
│                      API Gateway                             │
│            (认证/鉴权/限流/路由/API版本化)                      │
├─────────────────────────────────────────────────────────────┤
│                    Business Modules                          │
├────────┬────────┬────────┬────────┬────────┬────────────────┤
│  UEM   │  CLS   │Funding │Billing │   CA   │  Notification  │
│ 用户   │ 课程   │ 资助   │ 支付   │ 上课   │  消息通知       │
│ 管理   │ 系统   │ 管理   │ 结算   │ 管理   │  中心          │
├────────┴────────┴────────┴────────┴────────┴────────────────┤
│                    Infrastructure                            │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Auth    │  File    │  Job     │  Audit   │  Integration    │
│  Service │  Storage │  Queue   │  Log     │  Hub            │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

### 3.2 各模块详细职责与API边界

#### 3.2.1 UEM（用户管理 / User Engagement Management）

**职责：**
- 用户注册（手机号+邮箱唯一性校验，统一注册API供Website和Admin Console调用）
- 用户档案管理（基本信息、标签、家庭绑定）
- 4角色权限管理（角色定义、权限分配、操作日志）
- 学员360视图数据聚合
- 多租户隔离（tenant_id贯穿全部查询）

**对外API（核心）：**

| API | 方法 | 调用方 | 说明 |
|-----|------|--------|------|
| `/api/v1/users/register` | POST | Website, Admin Console | 统一注册入口。参数：手机号/邮箱/密码/角色/租户ID。返回：user_id |
| `/api/v1/users/{id}` | GET/PUT | Admin Console | 查询/更新用户档案 |
| `/api/v1/users/{id}/bindings` | GET/POST | Admin Console | 查询/创建学员-家长绑定 |
| `/api/v1/users/{id}/profile-360` | GET | Admin Console, Website (本人) | 学员360视图聚合数据 |
| `/api/v1/roles` | GET/POST | Admin Console (超级管理员) | 角色管理 |
| `/api/v1/roles/{id}/permissions` | GET/PUT | Admin Console (超级管理员) | 权限分配 |
| `/api/v1/audit-logs` | GET | Admin Console | 操作审计日志查询 |
| `/api/v1/tenant/{id}/stats` | GET | Admin Console | 租户统计（用户数/活跃度） |

**数据依赖：**
- 依赖Billing模块提供订单历史（通过user_id关联）
- 依赖CLS模块提供课程/证书列表（通过user_id关联）
- 依赖CA模块提供考勤记录（通过user_id关联）
- 不直接存储这些数据，通过聚合查询或事件同步获取

---

#### 3.2.2 CLS（课程管理 / Course & Learning System）

**职责：**
- 课程CRUD（名称/描述/价格/类型/封面/内容/大纲）
- 课程版本管理（课件版本记录、素材库）
- 课程审核与发布流程
- 课程排期管理（创建班次、日历视图、满班关闭）
- 教室/教师资源管理
- 课程下架/归档
- 课程评价与评分

**对外API（核心）：**

| API | 方法 | 调用方 | 说明 |
|-----|------|--------|------|
| `/api/v1/courses` | GET/POST | Admin Console, Website(列表) | 课程列表/创建。Website只读 |
| `/api/v1/courses/{id}` | GET/PUT/DELETE | Admin Console | 课程详情/编辑/删除 |
| `/api/v1/courses/{id}/publish` | POST | Admin Console | 发布课程（状态：草稿→已发布） |
| `/api/v1/courses/{id}/archive` | POST | Admin Console | 下架/归档课程 |
| `/api/v1/courses/{id}/schedules` | GET/POST | Admin Console, Website(列表) | 课程排期列表/创建班次 |
| `/api/v1/schedules/{id}` | GET/PUT/DELETE | Admin Console | 班次详情/编辑/取消 |
| `/api/v1/schedules/{id}/enrollments` | GET | Admin Console | 查看班次已报名学员 |
| `/api/v1/schedules/calendar` | GET | Admin Console, Website | 日历视图（参数：start_date, end_date） |
| `/api/v1/classrooms` | CRUD | Admin Console | 教室管理 |
| `/api/v1/courses/{id}/reviews` | GET/POST | Website(Learner) | 课程评价 |

**数据依赖：**
- 依赖UEM模块提供Trainer列表（排课时选择教师）
- 依赖Funding模块提供课程关联的资助类型
- 依赖Billing模块提供课程销量数据（用于展示和排序）
- 向Website暴露已发布课程列表（tenant_id过滤 + status=published）

---

#### 3.2.3 Funding（资助管理）

**职责：**
- 资助类型配置（名称/资金来源/计算规则/预算上限/有效期）
- 课程关联资助（关联课程ID + 资助比例/金额上限）
- 学员资格核验（是否满足资助条件：重复参训检查、身份校验等）
- 资助申请->审批->发放流程
- 资助额度管理（预算池扣减/恢复）
- 资助使用报告（对资助方的报表）
- 统一折扣引擎的一部分（与Billing的优惠券/拼团/限时价合并计算）

**对外API（核心）：**

| API | 方法 | 调用方 | 说明 |
|-----|------|--------|------|
| `/api/v1/funding-types` | GET/POST | Admin Console | 资助类型列表/创建 |
| `/api/v1/funding-types/{id}` | GET/PUT | Admin Console | 资助类型详情/编辑 |
| `/api/v1/funding-types/{id}/courses` | GET/POST | Admin Console | 查看/关联课程 |
| `/api/v1/funding/applications` | GET/POST | Admin Console, Website(Learner) | 资助申请列表/提交 |
| `/api/v1/funding/applications/{id}` | GET/PUT | Admin Console | 申请详情/审核 |
| `/api/v1/funding/applications/{id}/approve` | POST | Admin Console | 审批通过 |
| `/api/v1/funding/applications/{id}/reject` | POST | Admin Console | 审批拒绝 |
| `/api/v1/funding/calculate` | POST | 内部(Billing) | 折扣引擎核心：传入(学员ID, 课程ID, 课程列表) → 返回(折扣明细) |
| `/api/v1/funding/usage-report` | GET | Admin Console | 资助使用报告（给资助方） |

**数据依赖：**
- 依赖UEM模块获取学员身份信息（资格核验）
- 依赖CLS模块获取课程信息（课程关联资助）
- 依赖Billing模块获取实际支付数据（使用报告）
- 被Billing模块调用（折扣计算），被通知模块调用（审批状态变更通知）

---

#### 3.2.4 Billing（支付结算）

**职责：**
- 统一订单管理（线上+线下）
- 订单状态机（待支付→已支付→已退款/部分退款，含超时自动取消）
- 统一折扣引擎（调用Funding + 管理优惠券/拼团/限时价规则）
- 支付渠道对接（微信支付/支付宝，线上支付回调 + 线下手动确认）
- 退款管理（全额/部分退款，触发Funding额度恢复 + 权限回收）
- 对账（每日前台收银与系统订单勾稽）
- 财务导出（多维度报表）

**对外API（核心）：**

| API | 方法 | 调用方 | 说明 |
|-----|------|--------|------|
| `/api/v1/orders` | POST | Website, Admin Console | 创建订单（统一入口）。参数：课程列表/学员ID/支付方式(ONLINE/DESK) |
| `/api/v1/orders/{id}` | GET | Website, Admin Console | 订单详情 |
| `/api/v1/orders/{id}/pay` | POST | Website (线上), Admin Console (线下确认) | 触发支付/确认收款 |
| `/api/v1/orders/{id}/cancel` | POST | 系统自动(超时), Admin Console(手动) | 取消订单 |
| `/api/v1/orders/{id}/refund` | POST | Admin Console | 退款（全额/部分）。参数：refund_amount, reason |
| `/api/v1/payment/callback/wechat` | POST | 微信支付回调 | 支付结果回调 |
| `/api/v1/payment/callback/alipay` | POST | 支付宝回调 | 支付结果回调 |
| `/api/v1/discounts/coupons` | CRUD | Admin Console | 优惠券管理 |
| `/api/v1/discounts/calculate` | POST | 内部 | 统一折扣计算（聚合Funding+优惠券+拼团+限时价） |
| `/api/v1/orders/reconciliation` | GET | Admin Console | 每日对账报表 |
| `/api/v1/orders/export` | GET | Admin Console | 财务导出（CSV/Excel） |

**数据依赖：**
- 依赖UEM模块获取学员身份
- 依赖CLS模块获取课程价格和排期（名额锁定）
- 依赖Funding模块进行折扣计算
- 向UEM/CLS/CA/通知模块发出事件（订单支付成功→开权限、发通知）

---

#### 3.2.5 CA（上课管理 / Classroom & Attendance）

**职责：**
- 考勤签到（支持多种签到方式：扫码/手动标记/手机GPS）
- 上课记录（关联排期/学员/Trainer）
- Trainer备课→上课→课后记录
- 考核与评估（考试/作业/批改）
- 证书管理（唯一编号生成、发放、补发、撤销、查验API）
- 课程回放管理（如有录制）

**对外API（核心）：**

| API | 方法 | 调用方 | 说明 |
|-----|------|--------|------|
| `/api/v1/attendance` | POST/GET | Admin Console, Learning Space | 签到/查看考勤记录 |
| `/api/v1/attendance/batch` | POST | Admin Console | 批量签到 |
| `/api/v1/attendance/{schedule_id}/roster` | GET | Admin Console, Learning Space | 某班次学员花名册+考勤状态 |
| `/api/v1/assessments` | CRUD | Learning Space (Trainer) | 考核/作业管理 |
| `/api/v1/assessments/{id}/grade` | POST | Learning Space (Trainer) | 批改 |
| `/api/v1/certificates` | POST/GET | Admin Console | 证书发放/查询 |
| `/api/v1/certificates/{number}/verify` | GET | 公开API | 证书查验（供用人单位） |
| `/api/v1/certificates/{id}/revoke` | POST | Admin Console | 证书撤销 |
| `/api/v1/sessions/{id}/recording` | GET/POST | Learning Space | 课程回放管理 |

**数据依赖：**
- 依赖CLS模块获取排期信息
- 依赖UEM模块获取学员和Trainer身份
- 向UEM模块写入学员的学习记录（供360视图消费）
- 向通知模块发出事件（证书发放通知）

---

#### 3.2.6 通知中心（独立服务）

**职责：**
- 消息模板管理（支持变量替换：{学员姓名}、{课程名称}等）
- 路由规则配置（什么事件→什么渠道→什么模板）
- 多渠道发送（站内信/邮件/短信，后续扩展企微/飞书）
- 发送日志和失败重试
- 用户通知偏好设置

**对外API（核心）：**

| API | 方法 | 调用方 | 说明 |
|-----|------|--------|------|
| `/api/v1/notifications/send` | POST | 所有业务模块 | 统一发送入口。参数：event_type, user_id, channel, template_params |
| `/api/v1/notifications` | GET | Website, Admin Console | 站内信列表 |
| `/api/v1/notifications/{id}/read` | POST | Website, Admin Console | 标记已读 |
| `/api/v1/notifications/templates` | CRUD | Admin Console | 模板管理 |
| `/api/v1/notifications/preferences` | GET/PUT | Website (Learner) | 通知偏好设置 |

**数据依赖：**
- 不持有业务数据，仅接收事件和模板参数
- 依赖UEM模块获取用户联系方式（手机号/邮箱）

---

### 3.3 模块间数据依赖关系（精确到字段）

```
UEM ─── user_id, phone, email, role, tenant_id ───► 所有模块
CLS ─── course_id, schedule_id, price, status ───► Funding, Billing, CA
Funding ─── funding_type_id, discount_result ───► Billing
Billing ─── order_id, payment_status, amount ───► UEM(360), CLS(销量), 通知
CA ─── attendance_id, certificate_id ───► UEM(360), 通知
通知 ←── event_type, user_id, template_params ─── 所有模块
```

**关键数据流：**

1. **购买流程数据流：**
   Website/Admin Console → Billing(创建订单) → Funding(折扣计算) → Billing(生成应付金额) → 支付 → Billing(确认) → CLS(开权限) → 通知(购买成功)

2. **退课数据流：**
   Admin Console → Billing(退款) → Funding(恢复额度) → Billing(更新订单) → CLS(收权限) → CA(证书作废) → 通知(退款到账)

3. **上课数据流：**
   CLS(排期) → CA(上课+考勤) → UEM(更新学习记录) → CA(评估+发证) → 通知(证书发放)

### 3.4 前端路由结构建议

#### Website（学员官网）— `/`

```
/                              首页（课程列表/搜索/推荐）
/courses                       课程列表（支持按类型/价格/时间筛选）
/courses/:id                   课程详情（介绍/大纲/排期/评价/关联资助）
/schedules/:id                 班次详情 + 报名
/cart                          购物车
/checkout                      结算（含折扣明细展示）
/payment/:orderId              支付页面（微信/支付宝扫码）
/account                       个人中心
/account/orders                我的订单
/account/courses               我的课程
/account/certificates          我的证书
/account/funding               我的资助申请
/account/notifications         站内信
/account/settings              账户设置
/login                         登录
/register                      注册
```

#### Admin Console（管理后台）— `/admin`

```
/admin                         仪表盘首页（关键指标看板）
/admin/dashboard               数据分析（F14）
/admin/courses                 课程管理
/admin/courses/:id             课程编辑
/admin/courses/:id/schedules   课程排期管理
/admin/schedules/calendar      排期日历视图
/admin/orders                  订单管理（线上+线下统一列表）
/admin/orders/:id              订单详情
/admin/orders/desk             前台代购快捷入口（Desk角色专属视图）
/admin/orders/reconciliation   对账报表
/admin/funding                 资助类型管理
/admin/funding/applications    资助申请审核
/admin/funding/reports         资助使用报告
/admin/users                   学员管理
/admin/users/:id/profile-360   学员360视图
/admin/trainers                Trainer管理
/admin/trainers/:id            Trainer详情+排课+课酬
/admin/attendance              考勤管理
/admin/attendance/:scheduleId  某班次考勤花名册
/admin/certificates            证书管理
/admin/notifications/templates 通知模板
/admin/customerservice         工单处理
/admin/settings                系统设置（角色/权限/租户信息）
/admin/audit-logs              审计日志
/admin/integrations            开放平台和集成配置
```

#### Desk快捷视图 — `/desk`

```
/desk                          前台工作台（快捷代购+签到+今日课表）
/desk/quick-order              快速下单（扫码学员→选课→收款→开权限）
/desk/checkin                  签到办理
/desk/today-schedules          今日课表
```

#### Learning Space（上课系统）— `/learn`

```
/learn/schedules               我的课表（Learner）/ 授课列表（Trainer）
/learn/sessions/:id            上课页面（直播/线下签到/互动）
/learn/sessions/:id/attendance 签到
/learn/assessments             考核/作业列表
/learn/assessments/:id         考核详情/提交
/learn/certificates            我的证书
```

---

## 第四部分：角色权限矩阵（细化版）

### 4.1 四角色定义

| 角色 | 定位 | 对标竞品参考 | 一句话描述 |
|------|------|------------|-----------|
| **Editor** | 机构管理者 | Mindbody Owner/Manager, Canvas Admin | 管理机构的全部数据和配置，查看报表，审核关键操作 |
| **Desk** | 前台柜员 | Mindbody Front Desk | 线下场景的核心角色：代购、收款、签到、处理工单，无法访问后台设置 |
| **Trainer** | 教师 | Canvas Teacher, 校宝教师 | 备课、上课、考勤、批改、查看自己的学员和课酬 |
| **Learner** | 学员 | Canvas Student | 浏览课程、购买、上课、查看自己的学习记录和证书 |

### 4.2 细化权限矩阵

**权限符号说明：**
- `CRUD` = 创建/读取/更新/删除
- `全` = 全部数据的该操作
- `自` = 仅自己拥有的数据
- `本机构` = 自己所属机构内的数据
- `所属` = 自己被分配到的数据（如Trainer只看到自己教的班）
- `-` = 无权限

#### UEM 模块

| 操作 | Editor | Desk | Trainer | Learner |
|------|--------|------|---------|---------|
| 查看学员列表 | `R(本机构)` | `R(本机构)` | `R(所属)` | `-` |
| 查看学员详情(360) | `R(本机构)` | `R(本机构)` | `R(所属)` | `-` |
| 创建学员(注册) | `C` | `C` | `-` | `C(自注册)` |
| 编辑学员信息 | `U(本机构)` | `U(本机构)` | `-` | `U(自)` |
| 删除学员 | `D(本机构)` | `-` | `-` | `-` |
| 学员-家长绑定 | `CRUD(本机构)` | `-` | `-` | `-` |
| 查看操作日志 | `R(本机构)` | `-` | `-` | `-` |
| 角色分配 | `CRUD(本机构)` | `-` | `-` | `-` |

#### CLS 模块

| 操作 | Editor | Desk | Trainer | Learner |
|------|--------|------|---------|---------|
| 创建课程 | `C` | `-` | `-` | `-` |
| 编辑课程 | `U` | `-` | `-` | `-` |
| 发布/下架课程 | `U` | `-` | `-` | `-` |
| 查看已发布课程 | `R(全)` | `R(全)` | `R(全)` | `R(全)` |
| 查看未发布课程 | `R(全)` | `-` | `-` | `-` |
| 创建/编辑排期 | `CRUD` | `-` | `-` | `-` |
| 查看排期日历 | `R(全)` | `R(全)` | `R(所属)` | `R(全)` |
| 教室/教师资源管理 | `CRUD` | `-` | `-` | `-` |
| 课程评价 | `R(全)` | `-` | `-` | `CRU(自)` |

#### Funding 模块

| 操作 | Editor | Desk | Trainer | Learner |
|------|--------|------|---------|---------|
| 资助类型配置 | `CRUD` | `-` | `-` | `-` |
| 课程关联资助 | `CRUD` | `-` | `-` | `-` |
| 查看资助信息 | `R(全)` | `R(全)` | `-` | `R(自, 可见资助类型)` |
| 提交资助申请 | `C` | `C(代学员)` | `-` | `C(自)` |
| 审核资助申请 | `U(审批)` | `-` | `-` | `-` |
| 查看资助使用报告 | `R` | `-` | `-` | `-` |

#### Billing 模块

| 操作 | Editor | Desk | Trainer | Learner |
|------|--------|------|---------|---------|
| 创建订单 | `C` | `C(前台代购)` | `-` | `C(自)` |
| 查看订单列表 | `R(本机构)` | `R(本机构)` | `-` | `R(自)` |
| 查看订单详情 | `R(本机构)` | `R(本机构)` | `-` | `R(自)` |
| 确认线下收款 | `U` | `U` | `-` | `-` |
| 发起退款 | `U` | `-` | `-` | `-` |
| 取消订单 | `U` | `U(自己创建的)` | `-` | `U(自己的,待支付)` |
| 对账报表 | `R` | `-` | `-` | `-` |
| 财务导出 | `R` | `-` | `-` | `-` |
| 优惠券管理 | `CRUD` | `-` | `-` | `-` |
| 查看自己的支付记录 | `-` | `-` | `R(自,课酬)` | `R(自,消费)` |

#### CA 模块

| 操作 | Editor | Desk | Trainer | Learner |
|------|--------|------|---------|---------|
| 查看排课表 | `R(全)` | `R(全)` | `R(所属)` | `R(自)` |
| 签到操作 | `CRUD` | `CRUD` | `CRUD(所属)` | `R(自)` |
| 查看考勤记录 | `R(全)` | `R(全)` | `R(所属)` | `R(自)` |
| 考核/作业管理 | `CRUD` | `-` | `CRUD(所属)` | `C(提交), R(自)` |
| 批改 | `U` | `-` | `U(所属)` | `-` |
| 发放证书 | `CRUD` | `-` | `-` | `-` |
| 撤销证书 | `U` | `-` | `-` | `-` |
| 查看证书 | `R(全)` | `R(全)` | `R(所属)` | `R(自)` |

#### 通知模块

| 操作 | Editor | Desk | Trainer | Learner |
|------|--------|------|---------|---------|
| 模板管理 | `CRUD` | `-` | `-` | `-` |
| 站内信查看 | `R(全)` | `R(全)` | `R(自)` | `R(自)` |
| 通知偏好设置 | `U(自)` | `U(自)` | `U(自)` | `U(自)` |

#### 系统设置

| 操作 | Editor | Desk | Trainer | Learner |
|------|--------|------|---------|---------|
| 租户信息配置 | `CRUD(本机构)` | `-` | `-` | `-` |
| 支付渠道配置 | `CRUD` | `-` | `-` | `-` |
| 第三方集成配置 | `CRUD` | `-` | `-` | `-` |
| 数据导出 | `R` | `-` | `-` | `-` |
| 审计日志查看 | `R(本机构)` | `-` | `-` | `-` |

### 4.3 特殊权限说明

**Desk角色的核心约束：**
- 可以创建订单并确认收款，但无法发起退款
- 可以查看学员信息但不能编辑核心档案（只能补充标签/备注）
- 无法访问系统设置、财务对账、数据分析
- 这是参考Mindbody的Front Desk角色设计 -- 权限精准限制在预约管理、签到办理、收银结算

**数据可见性原则：**
- `自己拥有的数据` = 与自己user_id直接关联的数据（Learner看自己的订单，Trainer看自己的排课）
- `全局数据` = 本机构内所有数据（Editor视角）
- `所属数据` = 通过业务关系关联的数据（Trainer被分配到某课程→可看该课程学员）

---

## 第五部分：数据模型概要

### 5.1 核心实体关系（ER图文字描述）

```
Tenant (租户/机构)
  │
  ├── 1:N ── User (用户，含role字段: editor/desk/trainer/learner)
  │            │
  │            ├── 1:N ── Order (订单)
  │            │            ├── 1:N ── OrderItem (订单明细)
  │            │            ├── 1:N ── Payment (支付记录)
  │            │            └── 1:N ── Refund (退款记录)
  │            │
  │            ├── 1:N ── FundingApplication (资助申请)
  │            │
  │            └── N:M ── Course (课程，通过Enrollment关联)
  │                       │
  │                       ├── 1:N ── CourseVersion (课程版本)
  │                       ├── 1:N ── Schedule (排期/班次)
  │                       │            ├── 1:N ── Attendance (考勤记录)
  │                       │            └── 1:N ── Enrollment (报名记录)
  │                       ├── N:M ── FundingType (资助类型，通过CourseFunding关联)
  │                       └── 1:N ── Review (课程评价)
  │
  ├── 1:N ── DiscountRule (折扣规则：优惠券/拼团/限时价)
  ├── 1:N ── NotificationTemplate (通知模板)
  ├── 1:N ── Classroom (教室)
  └── 1:N ── Certificate (证书)

Assessment (考核/作业)
  │
  ├── N:1 ── Schedule (关联排期)
  ├── N:1 ── User (学员，作答者)
  └── 1:N ── Grade (批改结果)

Ticket (工单)
  │
  ├── N:1 ── User (提交者)
  └── N:1 ── User (处理者)
```

### 5.2 核心表字段概要

#### tenant（租户/机构）
```
id, name, logo, contact_phone, contact_email, address,
status (active/suspended/expired),
subscription_plan (starter/professional/enterprise),
subscription_expires_at,
created_at, updated_at
```

#### user（用户）
```
id, tenant_id (FK), role (editor/desk/trainer/learner),
phone (unique per tenant), email, password_hash,
display_name, avatar,
parent_id (FK→user, 学员-家长绑定，可null),
status (active/disabled),
registered_at, last_login_at,
created_at, updated_at
```

#### course（课程）
```
id, tenant_id (FK),
title, description, cover_image_url,
category, type (online/offline/hybrid),
base_price (原始价格，单位分),
status (draft/pending_review/published/archived),
published_at, archived_at,
created_by (FK→user), created_at, updated_at
```

#### course_version（课程版本）
```
id, course_id (FK),
version_number, changelog,
content_json (课件内容结构),
status (draft/published),
created_at
```

#### schedule（排期/班次）
```
id, course_id (FK), classroom_id (FK→classroom, 可null),
trainer_id (FK→user),
title (如"第3期周末班"),
start_time, end_time,
capacity (容量上限), enrolled_count (已报名人数, 冗余),
registration_deadline,
price (班次价格，可覆盖课程价格),
meeting_link (线上课Zoom/腾讯会议链接, 可null),
status (draft/open/full/cancelled/completed),
cancellation_reason,
created_at, updated_at
```

#### enrollment（报名）
```
id, schedule_id (FK), user_id (FK→user, learner),
order_id (FK→order),  -- 通过哪个订单报名的
status (active/transferred/refunded/dropped),
enrolled_at, updated_at
```

#### order（订单）
```
id, tenant_id (FK),
order_number (唯一),
buyer_id (FK→user, 学员Learner),
operator_id (FK→user, 操作者 -- 线上自助=学员本人，线下代购=Desk),
channel (online/desk/b2b),
original_amount (折扣前总额),
discount_amount (折扣总额),
payable_amount (应付金额),
paid_amount (已付金额),
status (pending/paid/partial_refunded/refunded/cancelled/expired),
expires_at (超时自动取消时间),
paid_at,
created_at, updated_at
```

#### order_item（订单明细）
```
id, order_id (FK),
schedule_id (FK),  -- 购买的班次
unit_price, quantity,
discount_detail (JSON -- 每项折扣的来源和金额，如: [{"type":"funding","id":"...","amount":50000},{"type":"coupon","code":"SAVE50","amount":5000}]),
created_at
```

#### payment（支付记录）
```
id, order_id (FK),
payment_method (wechat/alipay/cash/transfer),
transaction_id (第三方支付流水号),
amount, currency,
status (pending/success/failed),
callback_raw (第三方回调原始数据),
paid_at, created_at
```

#### refund（退款记录）
```
id, order_id (FK),
refund_amount,
refund_type (full/partial),
reason,
status (pending/approved/processed/rejected),
approved_by (FK→user, editor),
refunded_at, created_at
```

#### funding_type（资助类型）
```
id, tenant_id (FK),
name (如"政府职业技能补贴"),
source (government/enterprise/scholarship/nonprofit),
calculation_rule (fixed_per_head/percentage/conditional),
amount_or_rate,  -- 定额(分)或比例(%)
max_amount (上限), budget_limit (资金池上限), budget_used (已使用),
effective_from, effective_to,
status (active/expired/depleted),
created_at, updated_at
```

#### course_funding（课程-资助关联）
```
id, course_id (FK), funding_type_id (FK),
applicable,  -- 该课程是否可使用此资助
created_at
```

#### funding_application（资助申请）
```
id, funding_type_id (FK), user_id (FK→learner),
order_id (FK→order),
amount_applied, amount_approved,
status (pending/approved/rejected/disbursed),
reviewed_by (FK→user, editor),
reviewed_at, review_comment,
created_at, updated_at
```

#### discount_rule（折扣规则 -- 优惠券/拼团/限时价）
```
id, tenant_id (FK),
type (coupon/group_buy/early_bird/flash_sale),
code (优惠券码, coupon类型必填),
rule_config (JSON -- 折扣规则配置),
usage_limit, usage_count,
effective_from, effective_to,
status (active/paused/expired),
created_at, updated_at
```

#### attendance（考勤）
```
id, schedule_id (FK), user_id (FK→learner),
status (present/absent/late/early_leave/excused),
check_in_method (scan/qrcode/manual/gps),
check_in_time, check_out_time,
marked_by (FK→user, trainer或desk),
created_at
```

#### certificate（证书）
```
id, tenant_id (FK),
certificate_number (全局唯一编号),
user_id (FK→learner), course_id (FK), schedule_id (FK),
issue_date, expiry_date (可null),
template_id, metadata_json (证书内容变量),
status (issued/revoked),
revoked_at, revoked_by, revoke_reason,
created_at
```

#### assessment（考核/作业）
```
id, schedule_id (FK), created_by (FK→user, trainer),
title, description, type (exam/assignment/quiz),
total_score, pass_score,
due_date,
status (draft/open/closed),
created_at
```

#### grade（批改结果）
```
id, assessment_id (FK), user_id (FK→learner),
score, result (pass/fail), feedback,
graded_by (FK→user, trainer),
graded_at, created_at
```

#### notification（站内信）
```
id, tenant_id (FK), user_id (FK),
event_type, title, content,
is_read, read_at,
channel (in_app/email/sms),
send_status (pending/sent/failed),
created_at
```

#### ticket（工单）
```
id, tenant_id (FK),
user_id (FK, 提交者), handler_id (FK→user, 处理者),
subject, description, category,
priority (low/medium/high/urgent),
status (open/in_progress/resolved/closed),
resolution,
satisfaction_rating,
created_at, resolved_at, closed_at
```

---

## 第六部分：技术方案建议

> 以下建议基于"一人公司独立开发"的现实约束，优先考虑开发效率而非完美架构。

### 6.1 推荐技术栈

| 层次 | 推荐技术 | 版本 | 理由 |
|------|---------|------|------|
| **后端框架** | Spring Boot | 3.x | 国内生态最成熟，人才池最大；若已有JeecgBoot基础可复用代码生成器提速50%+ |
| **替代方案** | Go (Gin/Fiber) | 1.22+ | 性能更好，部署更简单（单二进制），但国内生态不如Java丰富 |
| **前端框架** | React + TypeScript | 18+ | 生态最完善。Canvas/Thinkific都用React。Next.js可选做SSR |
| **UI组件库** | Ant Design | 5.x | 国内最成熟的中后台组件库，Table/Form/ProTable大幅提效 |
| **数据库(主)** | PostgreSQL | 16 | 支持多租户Schema隔离，JSON字段（存折扣明细等半结构数据），比MySQL更现代 |
| **缓存** | Redis | 7.x | Session管理、分布式锁、支付回调幂等 |
| **消息队列** | RabbitMQ / Redis Streams | — | MVP可暂用Redis Streams替代（少一个中间件），规模化后换RabbitMQ |
| **文件存储** | 阿里云OSS / AWS S3 | — | 课件视频/图片/证书模板存储 |
| **搜索引擎** | PostgreSQL全文索引 | — | MVP不需要ES，PG内置全文搜索足够 |
| **部署** | Docker + Docker Compose | — | 单机部署，运维最简单 |

### 6.2 前端三个应用架构

```
frontend/
├── packages/
│   ├── website/          # 学员官网 (Next.js SSR)
│   ├── admin-console/    # 管理后台 (React SPA + Vite)
│   └── learning-space/   # 上课系统 (React SPA + Vite)
├── packages/shared/      # 共享组件和类型定义
│   ├── components/       # 通用UI组件
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   └── api-client/       # API调用封装
└── pnpm-workspace.yaml
```

### 6.3 单体优先架构

**明确建议：MVP阶段使用模块化单体，而非微服务。**

理由：
- 一人开发，微服务的运维成本远超其好处（部署、监控、链路追踪、CI/CD）
- 先做好模块边界（清晰的package划分和API接口），后期按需拆分
- 小鹅通验证过的路径：从Spring Cloud单体式拆分逐步到微服务
- 我们的目标用户规模（10-20机构、500+学员）单体完全够用

**模块化单体结构：**

```
backend/
├── common/                # 公共基础设施
│   ├── auth/             # 认证鉴权（Spring Security + JWT）
│   ├── tenant/           # 多租户拦截器（tenant_id注入）
│   ├── notification/     # 通知服务
│   └── audit/            # 审计日志
├── modules/
│   ├── uem/              # 用户管理模块
│   ├── cls/              # 课程管理模块
│   ├── funding/          # 资助管理模块
│   ├── billing/          # 支付结算模块
│   └── ca/               # 上课管理模块
└── integration/           # 第三方集成
    ├── payment/          # 微信/支付宝SDK
    ├── sms/              # 短信服务
    └── email/            # 邮件服务
```

每个module内部按分层组织：
```
module/
├── controller/    # REST API
├── service/       # 业务逻辑
├── repository/    # 数据访问
├── domain/        # 实体和值对象
├── dto/           # 数据传输对象
└── event/         # 领域事件
```

模块间通过**接口+事件**通信，禁止直接访问对方的Repository：
- 同步调用：通过Service接口（如Billing调用Funding的calculate折扣方法）
- 异步通知：通过Spring Event / Redis PubSub（如支付成功→开权限+发通知）

### 6.4 多租户方案

**推荐：共享数据库 + tenant_id字段隔离（MVP阶段）**

- 所有表（除全局配置表）增加`tenant_id`列
- 通过Spring拦截器自动注入当前请求的tenant_id到SQL查询条件
- 参考方案：使用Hibernate Filter或MyBatis拦截器统一处理
- 规模化后（100+租户或1000+活跃用户）迁移到PostgreSQL Schema分片，参考Canvas的Switchman方案

### 6.5 第三方服务选型

| 服务类别 | 推荐方案 | 备选方案 | 月成本估算（MVP） |
|---------|---------|---------|-----------------|
| **云服务** | 阿里云（国内）/ AWS（海外） | 腾讯云 | ￥300-800/月（2C4G ECS + RDS + OSS） |
| **支付-微信** | 微信支付JSAPI/ Native | — | 0.6%手续费 |
| **支付-支付宝** | 支付宝当面付/电脑网站支付 | — | 0.6%手续费 |
| **短信** | 阿里云短信 | 腾讯云短信 | ￥0.045/条，MVP按1000条/月≈￥45 |
| **邮件** | Resend / 阿里云邮件推送 | SendGrid | 免费额度通常够MVP用 |
| **域名+SSL** | 阿里云域名 + 免费SSL | — | ￥60-100/年 |
| **直播** | 腾讯云TRTC | 声网Agora | MVP不做直播，P2再评估 |
| **代码托管** | GitHub / GitLab | — | 免费 |

### 6.6 如果已有JeecgBoot基础

如果已在JeecgBoot框架上有开发基础，可额外获得：
- 代码生成器：实体CRUD一键生成（节省约50%的CRUD开发时间）
- RBAC权限：开箱即用的角色-权限-用户管理
- 系统管理：字典、菜单、日志等基础功能
- 多租户：已有租户隔离方案

但仍需自行开发：
- Funding折扣引擎（核心差异化，无现成方案）
- 统一订单引擎（双渠道支付+状态机）
- 前台Desk快捷操作界面
- 排期日历和考勤系统
- 证书管理和查验API

### 6.7 开发效率和代码量估算

| 模块 | 预估代码量（后端+前端） | 预估开发时间（一人全职） |
|------|---------------------|----------------------|
| 基础框架搭建（认证/租户/日志） | ~3,000行 | 2周 |
| UEM（用户+角色+360视图） | ~5,000行 | 3周 |
| CLS（课程+排期+教室） | ~8,000行 | 4周 |
| Billing（订单引擎+支付+对账） | ~10,000行 | 5周 |
| Funding（折扣引擎+申请审批） | ~6,000行 | 3周 |
| CA（考勤+评估+证书） | ~6,000行 | 3周 |
| 通知中心 | ~2,000行 | 1周 |
| Website前端 | ~8,000行 | 4周 |
| Admin Console前端 | ~10,000行 | 5周 |
| **MVP总计** | **~58,000行** | **30周（约7-8个月）** |

**如果使用JeecgBoot代码生成器：** 可节省约30-40%的后端CRUD开发时间，MVP总周期约**5-6个月**。

### 6.8 关键架构决策记录

| 决策点 | 推荐方案 | 原因 |
|--------|---------|------|
| 架构模式 | 模块化单体 | 一人开发，微服务运维成本高 |
| 多租户 | 共享DB+tenant_id | MVP最简单，后期可迁移到Schema分片 |
| 前后端分离 | 是 | 行业基线，3个独立前端应用 |
| API风格 | RESTful + 版本化(/api/v1/) | 参考小鹅通的Token鉴权+版本化 |
| 支付幂等 | Redis分布式锁 + 订单号去重 | 防止重复扣款 |
| 文件存储 | 云OSS直传 + CDN | 不经过后端转发 |
| Session | JWT (Access + Refresh Token) | 无状态，适合前后端分离 |

---

## 第七部分：实施路线图

### Phase 0: 原型验证（1-2周）

**目标：** 验证核心假设，确认技术方案可行性。

**交付物：**

| # | 交付物 | 描述 |
|---|--------|------|
| 0.1 | 技术选型确认 | 确认技术栈（Spring Boot/React/PostgreSQL），搭建开发环境 |
| 0.2 | 数据库Schema设计 | 完成核心表的DDL（tenant/user/course/schedule/order） |
| 0.3 | 最小可跑原型 | 一个可运行的后端+前端项目，实现：用户注册→登录→创建课程→发布到官网→学员浏览（没有支付，只是走通全链路） |
| 0.4 | 前端壳工程 | 三个前端应用的脚手架（Website/Admin Console路由骨架+Ant Design集成） |
| 0.5 | 部署脚本 | Docker Compose一键启动（后端+前端+PostgreSQL+Redis） |

**验证点：**
- 多租户拦截器是否正常工作
- 前后端分离的API联调是否顺畅
- JWT认证流程是否完整
- 数据库设计是否满足MVP需求

---

### Phase 1: MVP核心（官网+UEM+CLS+Billing，约10-12周）

**目标：** 可上线运营的最小版本。单校区培训机构可以用它管理学员、课程、订单、支付。

**交付物：**

**Week 1-3: UEM模块**
| # | 交付物 |
|---|--------|
| 1.1 | 统一注册API（手机号+邮箱唯一性校验） |
| 1.2 | 登录/JWT认证/权限拦截器 |
| 1.3 | 4角色基础权限（Editor/Desk/Trainer/Learner） |
| 1.4 | 学员档案管理（CRUD + 列表筛选 + 分页） |
| 1.5 | 学员360视图后端API（聚合订单/课程/证书/考勤） |
| 1.6 | Admin Console用户管理页面 |
| 1.7 | Website注册/登录/个人中心页面 |

**Week 4-7: CLS模块**
| # | 交付物 |
|---|--------|
| 1.8 | 课程创建和编辑（名称/描述/价格/类型/封面/COS上传） |
| 1.9 | 课程状态流转（草稿→待审核→已发布→已下架） |
| 1.10 | 课程排期（创建班次：时间/地点/Zoom链接/容量/价格） |
| 1.11 | 排期日历视图（日/周视图） |
| 1.12 | 教室/教师基础资源管理（名称/容量维护） |
| 1.13 | Website课程列表+详情+排期展示页面 |
| 1.14 | Admin Console课程管理+排期管理页面 |

**Week 8-11: Billing模块**
| # | 交付物 |
|---|--------|
| 1.15 | 统一订单创建API（线上+线下统一入口） |
| 1.16 | 订单状态机（待支付→已支付→已退款，含超时自动取消定时任务） |
| 1.17 | 微信支付对接（Native扫码支付） |
| 1.18 | 支付宝对接（电脑网站支付） |
| 1.19 | 支付回调处理（幂等性+重试） |
| 1.20 | 前台代购快捷入口（Desk搜索学员→选课→收款→确认） |
| 1.21 | 退款功能（全额退款→恢复课程名额） |
| 1.22 | Website购物车+结算+支付页面 |
| 1.23 | Admin Console订单管理+前台代购页面 |

**Week 12: 集成+Message MVP**
| # | 交付物 |
|---|--------|
| 1.24 | 基础消息通知（站内信：购买成功+开课提醒） |
| 1.25 | 邮件通知（购买成功，可选） |
| 1.26 | 端到端集成测试（注册→创建课程→排期→学员购买→支付→开权限→通知） |
| 1.27 | 部署到云服务器，绑定域名，配置HTTPS |

**Phase 1完成标志：** 一个培训机构可以注册、创建课程和排期、学员可以在官网购买并支付、Desk可以在前台代购、购买后自动开通权限。

---

### Phase 2: 增强（Funding + CA，约6-8周）

**目标：** 解锁核心差异化功能，形成完整的产品闭环。

**交付物：**

**Week 13-16: Funding模块**
| # | 交付物 |
|---|--------|
| 2.1 | 资助类型配置（资金来源/计算规则/预算上限/有效期） |
| 2.2 | 课程关联资助类型 |
| 2.3 | 统一折扣引擎（Funding + 优惠券聚合计算） |
| 2.4 | 资助申请提交（Learner自申 + Desk代申） |
| 2.5 | 资助审批流（Editor审核→通过/拒绝） |
| 2.6 | 订单中展示折扣明细（学员自助支付 + 前台代购均展示） |
| 2.7 | Funding额度管理（预算扣减/退款恢复） |
| 2.8 | 资助使用基础报表 |
| 2.9 | Admin Console Funding管理全部页面 |

**Week 17-20: CA模块**
| # | 交付物 |
|---|--------|
| 2.10 | 考勤签到（手动标记，支持批量签到） |
| 2.11 | 考勤花名册视图（某班次全部学员+考勤状态） |
| 2.12 | 证书模板配置 + 证书发放（唯一编号自动生成） |
| 2.13 | 证书公开查验API（供用人单位核验） |
| 2.14 | 基础评估功能（考核创建+批改+结果判定） |
| 2.15 | Learning Space基础页面（课表+签到+证书查看） |

**Phase 2完成标志：** 培训机构可以配置资助、学员购买时自动计算Funding折扣、上课考勤可记录、结课后可发证、证书可在线查验。

---

### Phase 3: 完善（约6-8周）

**目标：** 运营支撑、数据分析、多校区、B2B。

**交付物：**

| # | 交付物 |
|---|--------|
| 3.1 | 消息通知中心（多渠道：站内信+邮件+短信） |
| 3.2 | 通知模板管理和路由规则配置 |
| 3.3 | 退款/退课/转班全流程（含Funding/优惠券恢复） |
| 3.4 | 数据分析仪表盘（销售/学员漏斗/Funding使用/退课率） |
| 3.5 | 财务对账和导出 |
| 3.6 | 客户服务工单系统 |
| 3.7 | 多校区支持（机构层级+数据隔离） |
| 3.8 | B2B批量报名 |
| 3.9 | 合规模块（操作审计日志+数据导出/删除） |
| 3.10 | 移动端签到（扫码/二维码） |

---

### 总时间线

```
Phase 0:  ██░░░░░░░░░░░░░░  1-2周  原型验证
Phase 1:  ████████████░░░░  10-12周 MVP核心（官网+UEM+CLS+Billing）
Phase 2:  ░░░░░░░░░░░░███░  6-8周  增强（Funding+CA）
Phase 3:  ░░░░░░░░░░░░░░██  6-8周  完善（运营+数据分析+多校区）
          ────────────────────────────
          总计：23-30周（约6-8个月）
```

---

## 第八部分：待决策问题与推荐方案

> 基于竞品报告和业务审计综合推断，对每个待决策问题给出推荐方案和理由。P0问题用🚨标注。

### 8.1 业务层面

| # | 问题 | 优先级 | 推荐方案 | 理由 |
|---|------|--------|---------|------|
| 1 | 面向**国内**还是**海外**？ | 🚨 P0 | **国内优先** | 国内培训机构市场容量大（人社部技能培训补贴政策驱动）；微信/支付宝支付生态成熟；海外虽Funding场景存在（新加坡SkillsFuture、香港持续进修基金），但市场分散、获客成本高。建议先做国内市场，有了Funding产品壁垒后再出海 |
| 2 | **B2B**还是**自营**？ | 🚨 P0 | **B2B SaaS**（卖给培训机构） | 竞品报告明确了我们的定位是"培训机构的经营操作系统"而非"自己开培训平台"。自营模式意味着与自己的客户竞争，不可取。参考校宝在线、有赞教育的B2B SaaS路径 |
| 3 | 课程是**直播/录播/线下课**？ | 🚨 P0 | **线下课为主，预留线上扩展** | 我们的核心差异化在"前台POS"和"Funding"，这两个都依赖线下场景。MVP专注线下课，但CLS模块预留type字段支持线上课程类型，排期支持Zoom链接，为P2的直播课做准备 |
| 4 | 预期**并发用户数**和**总注册用户数**？ | 🚨 P0 | **MVP预期：总注册用户2000-5000，并发50-100** | 基于MVP目标：10-20家机构、每机构50-500学员。不需要过早为大规模并发做过重设计。单体架构 + 2C4G服务器即可满足。数据库连接池20-50足够 |
| 5 | 支付是**真实资金流转**还是**模拟**？ | 🚨 P0 | **真实支付（微信+支付宝）** | MVP就必须走真实支付，否则无法验证"培训机构愿意为管理效率付费"这个核心假设。支付渠道建议先接入微信支付（国内培训机构主流收付款方式），再接入支付宝。注意：需提前2-4周申请商户号 |
| 6 | Funding的**精确规则**？ | 🚨 P0 | **先做两种规则：按人头定额 + 按比例报销** | 基于竞品报告对南非LGSETA、新加坡PSG和中国职业技能培训系统的分析，这两种规则覆盖了90%的资助场景。MVP先实现：1）定义资助类型（来源/规则/金额或比例/预算上限/有效期）；2）课程关联资助；3）订单中自动计算并展示折扣明细。完整审批流在P1实现 |

### 8.2 产品/功能层面

| # | 问题 | 优先级 | 推荐方案 | 理由 |
|---|------|--------|---------|------|
| 7 | MVP到底包含哪些模块和前端？ | 🚨 P0 | **模块：UEM+CLS+Billing（完整）+ Funding（基础配置和计算）+ CA（考勤签到）+ 通知（站内信）。前端：Website + Admin Console。Learning Space暂不做** | 详见本文1.4节MVP边界。砍掉Learning Space是因为线下培训的考勤可以通过Admin Console操作（Desk/Editor标记），不需要独立的Learner端上课系统。5模块+2前端约10-12周可完成 |
| 8 | 三个前端是否全部要做？ | 🚨 P0 | **MVP只做Website+Admin Console** | Learning Space（上课系统）是学员/Trainer上课时的交互界面，在线下课场景中不是必需的（上课在线下教室发生）。P1再考虑移动端签到需求 |
| 9 | Funding MVP是**完整实现**还是**先做占位**？ | 🟡 P1 | **做基础配置+折扣计算，暂不做审批流** | MVP只需：1）Editor配置资助类型和关联课程；2）学员购买时系统自动计算Funding折扣并展示。这已经能验证"资助管理是否有真实付费需求"。审批流（申请→审核→放款）在P1实现 |
| 10 | Billing MVP是否需要**真实对接支付**？ | 🟡 P1 | **需要** | 理由同问题5。真实支付是验证商业模式的基础。且微信/支付宝对接是成熟技术，开发量可控（各约1周） |

### 8.3 技术层面

| # | 问题 | 优先级 | 推荐方案 | 理由 |
|---|------|--------|---------|------|
| 11 | **技术栈**是否已确定？ | 🚨 P0 | **Spring Boot 3 + React 18 + TypeScript + Ant Design 5 + PostgreSQL 16 + Redis** | 若已有JeecgBoot基础，直接复用其代码生成器和RBAC权限体系可提速50%+。若没有，从零搭建Spring Boot也只需1-2周。React是竞品主流选择（Canvas/Thinkific都用React） |
| 12 | 部署到**国内云**还是**海外云**？ | 🚨 P0 | **国内首选阿里云** | 与"国内优先"市场策略一致。注意：国内需要ICP备案（2-4周），必须在项目早期启动。阿里云的一站式服务（ECS+RDS+OSS+短信）集成度最高 |
| 13 | **单租户**还是**多租户**？ | 🚨 P0 | **多租户（共享DB+tenant_id）** | 行业最佳实践清一色多租户（Canvas/小鹅通/校宝）。单租户后期改多租户的迁移成本极高（30-50% SQL需重写）。MVP阶段共享DB+租户ID隔离是最务实方案 |
| 14 | MVP **期望上线时间**？ | 🚨 P0 | **建议4-6个月（全职开发）** | 基于一人全职开发估算。如果使用JeecgBoot可缩短至4-5个月。如果有硬性deadline（如开学季、政策窗口），需优先砍范围：建议先把Learning Space和移动端全部砍掉，Funding只做基础折扣计算 |
| 15 | **自己用**还是做成**SaaS卖**？ | 🚨 P0 | **SaaS产品** | 竞品报告已明确这是B2B SaaS定位。自己用和SaaS产品的产品化工作量差异约3-5倍，建议从Day 1就按SaaS标准设计（多租户、onboarding流程、帮助文档、试用/付费转化） |

### 8.4 待补充确认的问题（P1/P2）

| # | 问题 | 优先级 | 推荐方案 |
|---|------|--------|---------|
| 16 | **定价策略** | 🟡 P1 | 建议3版本：Starter ￥3,800/年（单校区/基础功能）、Professional ￥8,800/年（1-3校区/含Funding基础）、Enterprise ￥15,800/年（多校区/完整Funding审批流/API）。参考校宝￥4,480-7,480和有赞教育￥3,800-12,800的定价区间。避免抽成模型（竞品中小鹅通2%超额抽成和腾讯课堂10%抽成是主要差评来源） |
| 17 | **国际化/多语言** | 🟢 P2 | MVP只做中文。但前端使用React i18n框架预留国际化能力（通过`<Trans>`组件而非硬编码文本）。后期多语言改造成本可从"不可接受"降到"可控" |
| 18 | **移动端需求** | 🟢 P2 | MVP不做独立移动端。Website使用响应式设计（Ant Design Mobile兼容），确保学员在手机浏览器上可以浏览课程和支付。P2再评估是否做微信小程序 |
| 19 | **第三方音视频集成** | 🟢 P2 | MVP不做。排期的meeting_link字段预留，Editor可手动填写腾讯会议/Zoom链接。P2再评估是否做SDK深度集成 |
| 20 | **是否有现有代码/框架可复用？** | 🟡 P1 | **建议确认。** 如果已有JeecgBoot基础，可节省约30-40%开发时间。如果已有其他框架基础（如RuoYi/若依），也可复用其RBAC和代码生成能力 |

---

## 附录：关键设计决策汇总

| 决策 | 选择 | 一句话理由 |
|------|------|-----------|
| 产品定位 | 培训机构的经营操作系统(Training Business OS) | 不做"又一个线上卖课平台" |
| 核心差异化 | Funding + Desk角色 + 双渠道统一订单 | 三个维度都没有成熟竞品 |
| 目标市场 | 国内B2B SaaS | 政策驱动+市场空白 |
| MVP范围 | 5模块+2前端（砍Learning Space） | 约10-12周，线下课不需要独立上课系统 |
| 课程类型 | 线下为主，预留线上扩展 | 前台POS和Funding依赖线下场景 |
| 架构模式 | 模块化单体 | 一人开发，微服务运维成本高 |
| 多租户 | 共享DB+tenant_id字段 | MVP最简单，后期可迁移到Schema分片 |
| 数据库 | PostgreSQL 16 | 支持JSON/多租户Schema，比MySQL更现代 |
| 后端 | Spring Boot 3 | 国内生态成熟；如有JeecgBoot可复用提速 |
| 前端 | React 18 + Ant Design 5 | 竞品主流选择，中后台组件库提效显著 |
| 支付 | 真实支付（微信+支付宝） | 验证商业模式必须走真实资金流 |
| 部署 | 阿里云ECS + Docker Compose | 国内首选，备案需提前启动 |
| MVP时长 | 4-6个月（全职） | 一人开发，含原型验证 |
| 定价 | 3版本年付 ￥3,800-15,800 | 参考竞品定价区间，避免抽成 |

---

**参考资料（已综合进本蓝图）：**
- 13竞品深度分析报告（Thinkific, Teachable, Kajabi, Podia, Moodle, Canvas, Mindbody, Booker, 小鹅通, 有赞教育, 校宝在线, 腾讯课堂机构版, 网易云课堂机构版）
- 业务流程审计报告（原8流程审计，补充10条缺失流程，合并冗余，识别14个边界情况）
- 待决策问题清单（18个决策问题，12个P0）
- 政府资助案例：南非LGSETA、新加坡PSG、中国职业技能培训管理信息系统
- Canvas LMS架构参考（Switchman Sharding多租户方案）
- Mindbody Front Desk角色设计参考

---

*本文档为开发蓝图的v1.0版本，基于2026年6月可获取的公开信息。核心业务决策（P0问题）需要项目发起人确认后锁定。技术方案可根据实际资源情况动态调整。*
