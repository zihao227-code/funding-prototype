import { prisma } from '@/lib/prisma';
import type { CreateScheduleInput } from '@/lib/validators/course';

/**
 * 某课程的排期列表
 * @usedBy GET /api/v1/courses/[id]/schedules
 */
export async function listSchedulesByCourse(courseId: string, tenantId: string) {
  return prisma.schedule.findMany({
    where: {
      courseId,
      course: { tenantId },
    },
    include: {
      classroom: { select: { name: true } },
      trainer: { select: { displayName: true } },
    },
    orderBy: { startTime: 'asc' },
  });
}

/**
 * 全部排期（支持筛选）
 * @usedBy GET /api/v1/schedules
 */
export async function listAllSchedules(params: {
  tenantId: string;
  status?: string;
  courseId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const { tenantId, status, courseId, startDate, endDate, page = 1, pageSize = 20 } = params;
  const where: Record<string, unknown> = { course: { tenantId } };
  if (status) where.status = status;
  if (courseId) where.courseId = courseId;
  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) (where.startTime as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (where.startTime as Record<string, unknown>).lte = new Date(endDate);
  }

  const [data, total] = await Promise.all([
    prisma.schedule.findMany({
      where,
      include: {
        course: { select: { title: true, basePrice: true } },
        classroom: { select: { name: true } },
        trainer: { select: { displayName: true } },
      },
      orderBy: { startTime: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.schedule.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

/**
 * 排期详情
 * @usedBy GET /api/v1/schedules/[id]
 */
export async function getScheduleById(id: string) {
  return prisma.schedule.findUnique({
    where: { id },
    include: {
      course: { select: { title: true, basePrice: true, type: true, tenantId: true } },
      classroom: { select: { name: true, location: true } },
      trainer: { select: { displayName: true } },
    },
  });
}

/**
 * 创建排期
 * @usedBy POST /api/v1/courses/[id]/schedules
 */
export async function createSchedule(courseId: string, input: CreateScheduleInput) {
  return prisma.schedule.create({
    data: {
      ...input,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      courseId,
      status: 'open',
    },
  });
}

/**
 * 更新排期
 * @usedBy PUT /api/v1/schedules/[id]
 */
export async function updateSchedule(id: string, input: Partial<CreateScheduleInput>) {
  return prisma.schedule.update({
    where: { id },
    data: input,
  });
}

/**
 * 取消排期
 * @usedBy POST /api/v1/schedules/[id]/cancel
 */
export async function cancelSchedule(id: string, reason?: string) {
  return prisma.schedule.update({
    where: { id },
    data: { status: 'cancelled', cancellationReason: reason || null },
  });
}

/**
 * 日历视图
 * @usedBy GET /api/v1/schedules/calendar
 */
export async function getCalendarView(tenantId: string, start: string, end: string) {
  return prisma.schedule.findMany({
    where: {
      course: { tenantId },
      startTime: { gte: new Date(start) },
      endTime: { lte: new Date(end) },
      status: { not: 'cancelled' },
    },
    include: {
      course: { select: { title: true, type: true } },
      classroom: { select: { name: true } },
      trainer: { select: { displayName: true } },
    },
    orderBy: { startTime: 'asc' },
  });
}
