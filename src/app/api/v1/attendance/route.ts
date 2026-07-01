import { NextRequest } from 'next/server';
import { markAttendance, listAttendance } from '@/lib/ca/attendance-service';
import { errorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await listAttendance({
      scheduleId: searchParams.get('scheduleId') || undefined,
      userId: searchParams.get('userId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '50'),
    });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')!;
    const body = await request.json();
    const { scheduleId, userId: targetUserId, status, checkInMethod } = body;

    if (!scheduleId || !targetUserId || !status) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: '缺少必填字段(scheduleId/userId/status)' } },
        { status: 422 }
      );
    }

    const attendance = await markAttendance({
      scheduleId, userId: targetUserId, status,
      checkInMethod: checkInMethod || 'manual',
      markedBy: userId,
    });
    return Response.json(attendance, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
