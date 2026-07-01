import { NextRequest } from 'next/server';
import { getAttendanceRoster } from '@/lib/ca/attendance-service';
import { errorResponse } from '@/lib/errors';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const roster = await getAttendanceRoster(params.id);
    return Response.json(roster);
  } catch (error) {
    return errorResponse(error);
  }
}
