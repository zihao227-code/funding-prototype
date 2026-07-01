import { NextRequest } from 'next/server';
import { listCourses, createCourse } from '@/lib/cls/course-service';
import { createCourseSchema } from '@/lib/validators/course';
import { errorResponse } from '@/lib/errors';

/**
 * GET /api/v1/courses — 课程列表
 * Website: 仅 published；Admin: 全部
 */
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const role = request.headers.get('x-user-role');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Website 公开访问：只看已发布
    const effectiveStatus = role ? (status || undefined) : 'published';

    const result = await listCourses({
      tenantId,
      status: effectiveStatus,
      category: category || undefined,
      page,
      pageSize,
    });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/v1/courses — 创建课程（仅 Editor）
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')!;
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const body = await request.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: 'Validation failed', details: parsed.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }
    const course = await createCourse(parsed.data, tenantId, userId);
    return Response.json(course, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
