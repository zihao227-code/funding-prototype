import { NextRequest } from 'next/server';
import { createOrder, listOrders } from '@/lib/billing/order-service';
import { errorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const role = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);

    // Learner 只能看自己的订单
    const filterUserId = role === 'learner' ? userId : (searchParams.get('userId') || undefined);

    const result = await listOrders({
      tenantId,
      userId: filterUserId || undefined,
      status: searchParams.get('status') || undefined,
      channel: searchParams.get('channel') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
    });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')!;
    const tenantId = request.headers.get('x-tenant-id') || 'tenant-001';
    const body = await request.json();
    const { scheduleIds, channel = 'online' } = body;

    if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: '请选择至少一个班次' } },
        { status: 422 }
      );
    }

    const order = await createOrder({
      tenantId,
      buyerId: userId,
      operatorId: userId,
      channel,
      scheduleIds,
    });

    return Response.json(order, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
