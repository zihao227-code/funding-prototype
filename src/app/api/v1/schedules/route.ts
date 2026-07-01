import { NextRequest } from 'next/server';
import { listAllSchedules } from '@/lib/cls/schedule-service';
import { errorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const { searchParams } = new URL(request.url);
    const result = await listAllSchedules({
      tenantId,
      status: searchParams.get('status') || undefined,
      courseId: searchParams.get('courseId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
    });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
