import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

/**
 * Mock支付处理（支付成功回调的完整逻辑）
 * @usedBy POST /api/v1/payment/mock-callback
 */
export async function processMockPayment(orderId: string, method: string) {
  // 1. 查找订单
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });
  if (!order) throw new Error('订单不存在');
  if (order.status !== 'pending') throw new Error(`订单状态为 "${order.status}"，无法支付`);

  const transactionId = `MOCK_${method.toUpperCase()}_${nanoid(12)}`;

  // 2. 使用事务确保原子性
  return prisma.$transaction(async (tx) => {
    // 2a. 更新订单状态
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'paid',
        paidAmount: order.payableAmount,
        paidAt: new Date(),
      },
    });

    // 2b. 创建支付记录
    await tx.payment.create({
      data: {
        orderId,
        paymentMethod: method,
        transactionId,
        amount: order.payableAmount,
        currency: 'CNY',
        status: 'success',
        callbackRaw: JSON.stringify({ mock: true, method, transactionId }),
        paidAt: new Date(),
      },
    });

    // 2c. 创建Enrollment + 更新enrolledCount
    for (const item of order.orderItems) {
      await tx.enrollment.create({
        data: {
          scheduleId: item.scheduleId,
          userId: order.buyerId,
          orderId,
          status: 'active',
        },
      });
      await tx.schedule.update({
        where: { id: item.scheduleId },
        data: { enrolledCount: { increment: 1 } },
      });
    }

    // 2d. 创建站内信通知
    await tx.notification.createMany({
      data: order.orderItems.map((item) => ({
        tenantId: order.tenantId,
        userId: order.buyerId,
        eventType: 'purchase_success',
        title: '购买成功',
        content: `恭喜！你已成功报名课程，订单号：${order.orderNumber}`,
        channel: 'in_app',
        sendStatus: 'sent',
      })),
    });

    return { success: true, transactionId, orderId };
  });
}
