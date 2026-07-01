import { NextRequest } from 'next/server';
import { listSchedulesByCourse, createSchedule } from '@/lib/cls/schedule-service';
import { createScheduleSchema } from '@/lib/validators/course';
import { errorResponse } from '@/lib/errors';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const schedules = await listSchedulesByCourse(params.id, tenantId);
    return Response.json(schedules);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = createScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: 'Validation failed', details: parsed.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }
    const schedule = await createSchedule(params.id, parsed.data);
    return Response.json(schedule, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
