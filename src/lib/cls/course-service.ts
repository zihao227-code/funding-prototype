import { prisma } from '@/lib/prisma';
import type { CreateCourseInput, UpdateCourseInput } from '@/lib/validators/course';

/**
 * 课程列表
 * @usedBy GET /api/v1/courses (Website: published only; Admin: all)
 */
export async function listCourses(params: {
  tenantId: string;
  status?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}) {
  const { tenantId, status, category, page = 1, pageSize = 20 } = params;
  const where: Record<string, unknown> = { tenantId };
  if (status) where.status = status;
  if (category) where.category = category;

  const [data, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { creator: { select: { displayName: true } }, _count: { select: { schedules: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.course.count({ where }),
  ]);

  return { data, total, page, pageSize };
}

/**
 * 课程详情（含排期列表 + Funding关联信息）
 * @usedBy GET /api/v1/courses/[id]
 */
export async function getCourseById(id: string, tenantId: string) {
  return prisma.course.findFirst({
    where: { id, tenantId },
    include: {
      creator: { select: { displayName: true } },
      schedules: {
        orderBy: { startTime: 'asc' },
        include: {
          classroom: { select: { name: true } },
          trainer: { select: { displayName: true } },
        },
      },
      courseFundings: {
        include: { fundingType: true },
      },
    },
  });
}

/**
 * 创建课程
 * @usedBy POST /api/v1/courses
 */
export async function createCourse(input: CreateCourseInput, tenantId: string, createdBy: string) {
  return prisma.course.create({
    data: {
      ...input,
      coverImageUrl: input.coverImageUrl || `https://placehold.co/600x400?text=${encodeURIComponent(input.title)}`,
      tenantId,
      createdBy,
      status: 'draft',
    },
  });
}

/**
 * 更新课程
 * @usedBy PUT /api/v1/courses/[id]
 */
export async function updateCourse(id: string, input: UpdateCourseInput, tenantId: string) {
  return prisma.course.update({
    where: { id, tenantId },
    data: input,
  });
}

/**
 * 发布课程
 * @usedBy POST /api/v1/courses/[id]/publish
 */
export async function publishCourse(id: string, tenantId: string) {
  const course = await prisma.course.findFirst({ where: { id, tenantId } });
  if (!course) return null;
  if (course.status !== 'draft') {
    throw new Error(`无法发布状态为 "${course.status}" 的课程`);
  }
  return prisma.course.update({
    where: { id },
    data: { status: 'published', publishedAt: new Date() },
  });
}

/**
 * 删除课程（仅 draft 状态可删除）
 * @usedBy DELETE /api/v1/courses/[id]
 */
export async function deleteCourse(id: string, tenantId: string) {
  const course = await prisma.course.findFirst({ where: { id, tenantId } });
  if (!course) throw new Error('课程不存在');
  if (course.status !== 'draft') {
    throw new Error(`无法删除状态为 "${course.status}" 的课程，只能删除草稿`);
  }
  return prisma.course.delete({ where: { id, tenantId } });
}

/**
 * 下架/归档课程
 * 只有 published 状态的课程才能归档
 * @usedBy POST /api/v1/courses/[id]/archive
 */
export async function archiveCourse(id: string, tenantId: string) {
  const course = await prisma.course.findFirst({ where: { id, tenantId } });
  if (!course) throw new Error('课程不存在');
  if (course.status !== 'published') {
    throw new Error(`无法归档状态为 "${course.status}" 的课程`);
  }
  return prisma.course.update({
    where: { id, tenantId },
    data: { status: 'archived', archivedAt: new Date() },
  });
}
