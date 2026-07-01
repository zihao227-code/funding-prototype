import { NextRequest } from 'next/server';
import { batchMarkAttendance } from '@/lib/ca/attendance-service';
import { errorResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')!;
    const { scheduleId, records } = await request.json();
    if (!scheduleId || !records || !Array.isArray(records)) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: '缺少必填字段(scheduleId/records)' } },
        { status: 422 }
      );
    }
    const result = await batchMarkAttendance({ scheduleId, records, markedBy: userId });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
