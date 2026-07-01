import { NextRequest } from 'next/server';
import { cancelOrder } from '@/lib/billing/order-service';
import { errorResponse } from '@/lib/errors';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await cancelOrder(params.id);
    return Response.json(order);
  } catch (error) {
    return errorResponse(error);
  }
}
