import { NextRequest } from 'next/server';
import { getScheduleById, updateSchedule } from '@/lib/cls/schedule-service';
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
    const schedule = await updateSchedule(params.id, body);
    return Response.json(schedule);
  } catch (error) {
    return errorResponse(error);
  }
}
