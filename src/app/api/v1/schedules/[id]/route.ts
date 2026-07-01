import { NextRequest } from 'next/server';
import { getScheduleById, updateSchedule } from '@/lib/cls/schedule-service';
import { updateScheduleSchema } from '@/lib/validators/course';
import { errorResponse, NotFoundError } from '@/lib/errors';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const schedule = await getScheduleById(params.id);
    if (!schedule) throw new NotFoundError('Schedule', params.id);
    return Response.json(schedule);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = updateScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: 'Validation failed', details: parsed.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }
    const schedule = await updateSchedule(params.id, parsed.data);
    return Response.json(schedule);
  } catch (error) {
    return errorResponse(error);
  }
}
