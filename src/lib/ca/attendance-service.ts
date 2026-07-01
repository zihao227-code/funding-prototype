import { prisma } from '@/lib/prisma';

/**
 * 单条签到
 * @usedBy POST /api/v1/attendance
 */
export async function markAttendance(params: {
  scheduleId: string;
  userId: string;
  status: string;
  checkInMethod?: string;
  markedBy: string;
}) {
  const { scheduleId, userId, status, checkInMethod = 'manual', markedBy } = params;

  const existing = await prisma.attendance.findFirst({
    where: { scheduleId, userId },
  });
  if (existing) {
    return prisma.attendance.update({
      where: { id: existing.id },
      data: { status, checkInMethod, checkInTime: new Date(), markedBy },
    });
  }
  return prisma.attendance.create({
    data: { scheduleId, userId, status, checkInMethod, checkInTime: new Date(), markedBy },
  });
}

/**
 * 批量签到
 * @usedBy POST /api/v1/attendance/batch
 */
export async function batchMarkAttendance(params: {
  scheduleId: string;
  records: { userId: string; status: string }[];
  markedBy: string;
}) {
  const { scheduleId, records, markedBy } = params;
  let count = 0;

  for (const r of records) {
    const existing = await prisma.attendance.findFirst({
      where: { scheduleId, userId: r.userId },
    });
    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: r.status, checkInMethod: 'manual', checkInTime: new Date(), markedBy },
      });
    } else {
      await prisma.attendance.create({
        data: {
          scheduleId, userId: r.userId, status: r.status,
          checkInMethod: 'manual', checkInTime: new Date(), markedBy,
        },
      });
    }
    count++;
  }
  return { count };
}

/**
 * 班次花名册（全部学员 + 考勤状态）
 * @usedBy GET /api/v1/schedules/[id]/attendance/roster
 */
export async function getAttendanceRoster(scheduleId: string) {
  // 获取该班次的全部报名学员
  const enrollments = await prisma.enrollment.findMany({
    where: { scheduleId, status: 'active' },
    include: { user: { select: { id: true, displayName: true, phone: true } } },
  });

  // 获取已有考勤记录
  const attendances = await prisma.attendance.findMany({
    where: { scheduleId },
  });
  const attMap = new Map(attendances.map((a) => [a.userId, a]));

  return enrollments.map((e) => ({
    userId: e.user.id,
    displayName: e.user.displayName,
    phone: e.user.phone,
    attendance: attMap.get(e.user.id) || null,
  }));
}

/**
 * 考勤记录列表
 * @usedBy GET /api/v1/attendance
 */
export async function listAttendance(params: {
  scheduleId?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}) {
  const { scheduleId, userId, page = 1, pageSize = 50 } = params;
  const where: Record<string, unknown> = {};
  if (scheduleId) where.scheduleId = scheduleId;
  if (userId) where.userId = userId;

  const [data, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        user: { select: { displayName: true } },
        schedule: { select: { title: true, courseId: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.attendance.count({ where }),
  ]);
  return { data, total, page, pageSize };
}
