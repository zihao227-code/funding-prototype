import { NextRequest } from 'next/server';
import { getCourseById, updateCourse, publishCourse, archiveCourse } from '@/lib/cls/course-service';
import { updateCourseSchema } from '@/lib/validators/course';
import { errorResponse, NotFoundError } from '@/lib/errors';

/**
 * GET /api/v1/courses/[id] — 课程详情
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const course = await getCourseById(params.id, tenantId);
    if (!course) throw new NotFoundError('Course', params.id);
    return Response.json(course);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/v1/courses/[id] — 更新课程（仅 Editor）
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const body = await request.json();
    const parsed = updateCourseSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: 'Validation failed', details: parsed.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }
    const course = await updateCourse(params.id, parsed.data, tenantId);
    return Response.json(course);
  } catch (error) {
    return errorResponse(error);
  }
}
