import { NextRequest } from 'next/server';
import { cancelSchedule } from '@/lib/cls/schedule-service';
import { errorResponse } from '@/lib/errors';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { reason } = await request.json().catch(() => ({}));
    const schedule = await cancelSchedule(params.id, reason);
    return Response.json(schedule);
  } catch (error) {
    return errorResponse(error);
  }
}
