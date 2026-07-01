import { NextRequest } from 'next/server';
import { processMockPayment } from '@/lib/billing/payment-service';
import { errorResponse } from '@/lib/errors';

/**
 * POST /api/v1/payment/mock-callback
 * Mock 支付回调 — 模拟微信/支付宝支付成功
 * Body: { orderId, method: "wechat"|"alipay"|"cash" }
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, method = 'wechat' } = await request.json();
    if (!orderId) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: '缺少 orderId' } },
        { status: 422 }
      );
    }
    const result = await processMockPayment(orderId, method);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
