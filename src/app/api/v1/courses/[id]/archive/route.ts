import { NextRequest } from 'next/server';
import { archiveCourse } from '@/lib/cls/course-service';
import { errorResponse } from '@/lib/errors';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const course = await archiveCourse(params.id, tenantId);
    return Response.json(course);
  } catch (error) {
    return errorResponse(error);
  }
}
