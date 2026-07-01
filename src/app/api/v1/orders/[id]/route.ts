import { NextRequest } from 'next/server';
import { getOrderById, expireOverdueOrders } from '@/lib/billing/order-service';
import { errorResponse, NotFoundError } from '@/lib/errors';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 先清理过期订单
    await expireOverdueOrders();

    const order = await getOrderById(params.id);
    if (!order) throw new NotFoundError('Order', params.id);

    // 动态判断过期
    if (order.status === 'pending' && order.expiresAt && new Date(order.expiresAt) < new Date()) {
      return Response.json({ ...order, status: 'expired' });
    }

    return Response.json(order);
  } catch (error) {
    return errorResponse(error);
  }
}
