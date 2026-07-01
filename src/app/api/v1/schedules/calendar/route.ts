import { NextRequest } from 'next/server';
import { getCalendarView } from '@/lib/cls/schedule-service';
import { errorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') || new Date().toISOString();
    const end = searchParams.get('end') || new Date(Date.now() + 30 * 86400000).toISOString();
    const events = await getCalendarView(tenantId, start, end);
    return Response.json(events);
  } catch (error) {
    return errorResponse(error);
  }
}
