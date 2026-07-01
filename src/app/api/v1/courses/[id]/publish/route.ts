import { NextRequest } from 'next/server';
import { publishCourse } from '@/lib/cls/course-service';
import { errorResponse, NotFoundError } from '@/lib/errors';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const course = await publishCourse(params.id, tenantId);
    if (!course) throw new NotFoundError('Course', params.id);
    return Response.json(course);
  } catch (error) {
    return errorResponse(error);
  }
}
