import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始加载种子数据...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // =========================================================================
  // Tenant（租户）
  // =========================================================================
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant-001' },
    update: {},
    create: {
      id: 'tenant-001',
      name: '星光职业培训学校',
      contactPhone: '010-8888-6666',
      contactEmail: 'admin@starlight-edu.cn',
      address: '北京市朝阳区建国路88号',
      status: 'active',
      subscriptionPlan: 'starter',
    },
  });
  console.log('  ✅ Tenant:', tenant.name);

  // =========================================================================
  // Users（6个用户，4种角色）
  // =========================================================================
  const users = [
    { id: 'user-editor', role: 'editor' as const, displayName: '张校长', phone: '13800001001', email: 'zhang@starlight-edu.cn' },
    { id: 'user-desk', role: 'desk' as const, displayName: '小红', phone: '13800001002', email: 'xiaohong@starlight-edu.cn' },
    { id: 'user-trainer', role: 'trainer' as const, displayName: '赵师傅', phone: '13800001003', email: 'zhao@starlight-edu.cn' },
    { id: 'user-learner-1', role: 'learner' as const, displayName: '李明', phone: '13800001004', email: 'liming@email.cn' },
    { id: 'user-learner-2', role: 'learner' as const, displayName: '王芳', phone: '13800001005', email: 'wangfang@email.cn' },
    { id: 'user-learner-3', role: 'learner' as const, displayName: '陈强', phone: '13800001006', email: 'chenqiang@email.cn' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        tenantId: tenant.id,
        role: u.role,
        phone: u.phone,
        email: u.email,
        passwordHash,
        displayName: u.displayName,
        status: 'active',
      },
    });
  }
  console.log(`  ✅ Users: ${users.length} 个 (editor×1, desk×1, trainer×1, learner×3)`);

  // =========================================================================
  // Classrooms（教室）
  // =========================================================================
  const classrooms = [
    { id: 'classroom-301', name: '301教室', capacity: 30, location: '3楼东侧' },
    { id: 'classroom-302', name: '302教室', capacity: 25, location: '3楼西侧' },
  ];

  for (const c of classrooms) {
    await prisma.classroom.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, tenantId: tenant.id, ...c },
    });
  }
  console.log(`  ✅ Classrooms: ${classrooms.length} 个`);

  // =========================================================================
  // Courses（课程）
  // =========================================================================
  const courses = [
    {
      id: 'course-python',
      title: 'Python全栈开发实战',
      description: '从零基础到独立开发Web应用，涵盖Python基础、Django框架、数据库设计、项目实战。适合转行IT和编程爱好者。',
      type: 'offline' as const,
      basePrice: 1980_00, // ￥1,980.00（分）
      category: 'IT技术',
    },
    {
      id: 'course-ui',
      title: 'UI设计从入门到精通',
      description: '系统学习UI设计理论与工具，包含Figma、Sketch、用户研究、交互设计。适合设计爱好者和转行人员。',
      type: 'offline' as const,
      basePrice: 1680_00,
      category: '设计',
    },
    {
      id: 'course-pm',
      title: '项目管理PMP认证',
      description: '围绕PMBOK第七版，系统讲解项目管理五大过程组和十大知识领域，助你顺利通过PMP认证考试。',
      type: 'offline' as const,
      basePrice: 2980_00,
      category: '管理',
    },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {},
      create: {
        ...c,
        tenantId: tenant.id,
        status: 'published',
        createdBy: 'user-editor',
        publishedAt: new Date('2026-06-15'),
        coverImageUrl: `https://placehold.co/600x400?text=${encodeURIComponent(c.title)}`,
      },
    });
  }
  console.log(`  ✅ Courses: ${courses.length} 门 (全部已发布)`);

  // =========================================================================
  // Schedules（排期）
  // =========================================================================
  const schedules = [
    {
      id: 'sched-py-01',
      courseId: 'course-python',
      classroomId: 'classroom-301',
      trainerId: 'user-trainer',
      title: 'Python第15期周末班',
      startTime: new Date('2026-07-15T09:00:00'),
      endTime: new Date('2026-09-15T18:00:00'),
      capacity: 30,
      enrolledCount: 1,
      price: null, // 使用课程基准价
      status: 'open' as const,
    },
    {
      id: 'sched-ui-01',
      courseId: 'course-ui',
      classroomId: 'classroom-302',
      trainerId: null,
      title: 'UI设计第8期晚班',
      startTime: new Date('2026-07-20T19:00:00'),
      endTime: new Date('2026-09-20T21:30:00'),
      capacity: 25,
      enrolledCount: 1,
      price: null,
      status: 'open' as const,
    },
    {
      id: 'sched-pm-01',
      courseId: 'course-pm',
      classroomId: 'classroom-301',
      trainerId: null,
      title: 'PMP第3期集训班',
      startTime: new Date('2026-08-01T09:00:00'),
      endTime: new Date('2026-08-15T18:00:00'),
      capacity: 20,
      enrolledCount: 0,
      price: null,
      status: 'open' as const,
    },
    {
      id: 'sched-py-02',
      courseId: 'course-python',
      classroomId: 'classroom-301',
      trainerId: 'user-trainer',
      title: 'Python第16期暑假班',
      startTime: new Date('2026-08-01T09:00:00'),
      endTime: new Date('2026-09-30T18:00:00'),
      capacity: 25,
      enrolledCount: 0,
      price: null,
      status: 'open' as const,
    },
  ];

  for (const s of schedules) {
    await prisma.schedule.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.log(`  ✅ Schedules: ${schedules.length} 个排期`);

  // =========================================================================
  // 故事线A：李明线上自助购买Python课程（已完成订单）
  // =========================================================================
  const orderPaid = await prisma.order.upsert({
    where: { id: 'order-001' },
    update: {},
    create: {
      id: 'order-001',
      tenantId: tenant.id,
      orderNumber: 'ORD-20260701-001',
      buyerId: 'user-learner-1',
      operatorId: 'user-learner-1', // 线上自助=学员本人操作
      channel: 'online',
      originalAmount: 1980_00,
      discountAmount: 0,
      payableAmount: 1980_00,
      paidAmount: 1980_00,
      status: 'paid',
      paidAt: new Date('2026-07-01T10:30:00'),
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 'order-item-001' },
    update: {},
    create: {
      id: 'order-item-001',
      orderId: orderPaid.id,
      scheduleId: 'sched-py-01',
      unitPrice: 1980_00,
      quantity: 1,
      discountDetail: JSON.stringify([]), // Phase 1: 无折扣
    },
  });

  await prisma.payment.upsert({
    where: { id: 'payment-001' },
    update: {},
    create: {
      id: 'payment-001',
      orderId: orderPaid.id,
      paymentMethod: 'wechat',
      transactionId: 'MOCK_WECHAT_20260701_a1b2c3d4e5',
      amount: 1980_00,
      currency: 'CNY',
      status: 'success',
      callbackRaw: JSON.stringify({ mock: true }),
      paidAt: new Date('2026-07-01T10:30:00'),
    },
  });

  await prisma.enrollment.upsert({
    where: { id: 'enroll-001' },
    update: {},
    create: {
      id: 'enroll-001',
      scheduleId: 'sched-py-01',
      userId: 'user-learner-1',
      orderId: orderPaid.id,
      status: 'active',
    },
  });
  console.log('  ✅ 故事线A: 李明线上购买Python课程 (￥1,980已支付)');

  // =========================================================================
  // 故事线B：王芳前台代购UI设计课程（Phase 3 Desk场景，Phase 1预留数据）
  // =========================================================================
  // 注意：Desk代购场景在Phase 3实现，Phase 1仅创建种子数据
  const orderDesk = await prisma.order.upsert({
    where: { id: 'order-002' },
    update: {},
    create: {
      id: 'order-002',
      tenantId: tenant.id,
      orderNumber: 'ORD-20260701-002',
      buyerId: 'user-learner-2',
      operatorId: 'user-desk',
      channel: 'desk',
      originalAmount: 1680_00,
      discountAmount: 0,
      payableAmount: 1680_00,
      paidAmount: 1680_00,
      status: 'paid',
      paidAt: new Date('2026-07-01T14:00:00'),
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 'order-item-002' },
    update: {},
    create: {
      id: 'order-item-002',
      orderId: orderDesk.id,
      scheduleId: 'sched-ui-01',
      unitPrice: 1680_00,
      quantity: 1,
      discountDetail: JSON.stringify([]),
    },
  });

  await prisma.payment.upsert({
    where: { id: 'payment-002' },
    update: {},
    create: {
      id: 'payment-002',
      orderId: orderDesk.id,
      paymentMethod: 'cash',
      transactionId: 'MOCK_CASH_20260701_f6g7h8i9j0',
      amount: 1680_00,
      currency: 'CNY',
      status: 'success',
      callbackRaw: JSON.stringify({ mock: true }),
      paidAt: new Date('2026-07-01T14:00:00'),
    },
  });

  await prisma.enrollment.upsert({
    where: { id: 'enroll-002' },
    update: {},
    create: {
      id: 'enroll-002',
      scheduleId: 'sched-ui-01',
      userId: 'user-learner-2',
      orderId: orderDesk.id,
      status: 'active',
    },
  });
  console.log('  ✅ 故事线B: 王芳前台代购UI课程 (￥1,680 Desk收款)');

  // =========================================================================
  // 故事线C：陈强的待支付订单（展示超时取消）
  // =========================================================================
  await prisma.order.upsert({
    where: { id: 'order-003' },
    update: {},
    create: {
      id: 'order-003',
      tenantId: tenant.id,
      orderNumber: 'ORD-20260701-003',
      buyerId: 'user-learner-3',
      operatorId: 'user-learner-3',
      channel: 'online',
      originalAmount: 2980_00,
      discountAmount: 0,
      payableAmount: 2980_00,
      paidAmount: 0,
      status: 'expired', // 已过期的待支付订单
      expiresAt: new Date('2026-07-01T18:00:00'),
    },
  });
  console.log('  ✅ 故事线C: 陈强待支付订单已超时过期');

  // =========================================================================
  // Attendance（考勤记录）
  // =========================================================================
  const attendances = [
    { id: 'att-01', scheduleId: 'sched-py-01', userId: 'user-learner-1', status: 'present' as const, markedBy: 'user-trainer', checkInTime: new Date('2026-07-16T09:05:00') },
    { id: 'att-02', scheduleId: 'sched-py-01', userId: 'user-learner-2', status: 'late' as const, markedBy: 'user-trainer', checkInTime: new Date('2026-07-16T09:35:00') },
    { id: 'att-03', scheduleId: 'sched-py-01', userId: 'user-learner-3', status: 'excused' as const, markedBy: 'user-trainer' },
    { id: 'att-04', scheduleId: 'sched-ui-01', userId: 'user-learner-1', status: 'present' as const, markedBy: 'user-trainer', checkInTime: new Date('2026-07-21T19:05:00') },
    { id: 'att-05', scheduleId: 'sched-ui-01', userId: 'user-learner-2', status: 'absent' as const, markedBy: 'user-trainer' },
    { id: 'att-06', scheduleId: 'sched-ui-01', userId: 'user-learner-3', status: 'early_leave' as const, markedBy: 'user-trainer', checkInTime: new Date('2026-07-21T19:00:00'), checkOutTime: new Date('2026-07-21T20:15:00') },
  ];

  for (const a of attendances) {
    await prisma.attendance.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, checkInMethod: 'manual' },
    });
  }
  console.log(`  ✅ Attendance: ${attendances.length} 条考勤记录`);

  // =========================================================================
  // Phase 2 预留实体（空表占位，Phase 2再填充数据）
  // =========================================================================
  // FundingType, CourseFunding, FundingApplication, Refund — 建表但Phase 1不插入数据
  // Certificate, Assessment, Grade — 建表但Phase 1不插入数据
  // DiscountRule, Notification, MockSms, MockEmail — 建表但Phase 1不插入数据

  console.log('\n🎉 种子数据加载完成！');
  console.log('   默认密码: password123');
  console.log('   Editor:  13800001001');
  console.log('   Trainer: 13800001003');
  console.log('   Learner: 13800001004');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 种子数据加载失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
