import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

/**
 * 生成订单号
 */
function genOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${date}-${nanoid(8).toUpperCase()}`;
}

/**
 * 创建统一订单
 * 使用 prisma.$transaction 包裹容量检查和订单创建，防止并发超卖
 * @usedBy POST /api/v1/orders
 */
export async function createOrder(params: {
  tenantId: string;
  buyerId: string;
  operatorId: string;
  channel: string;
  scheduleIds: string[];
}) {
  const { tenantId, buyerId, operatorId, channel, scheduleIds } = params;

  return prisma.$transaction(async (tx) => {
    // 1. 获取排期信息并计算金额（事务内读取，确保一致性）
    let originalAmount = 0;
    const items: { scheduleId: string; unitPrice: number; discountDetail: string }[] = [];

    for (const sid of scheduleIds) {
      const schedule = await tx.schedule.findUnique({
        where: { id: sid },
        include: { course: { select: { basePrice: true } } },
      });
      if (!schedule) throw new Error(`排期 ${sid} 不存在`);
      if (schedule.status !== 'open') throw new Error(`排期 "${schedule.title}" 已关闭`);
      if (schedule.enrolledCount >= schedule.capacity) throw new Error(`排期 "${schedule.title}" 已满班`);

      const unitPrice = schedule.price ?? schedule.course.basePrice;
      originalAmount += unitPrice;
      items.push({
        scheduleId: sid,
        unitPrice,
        discountDetail: JSON.stringify([]), // Phase 1: 无折扣
      });
    }

    // 2. 创建订单（15分钟超时）
    const order = await tx.order.create({
      data: {
        tenantId,
        orderNumber: genOrderNumber(),
        buyerId,
        operatorId,
        channel,
        originalAmount,
        discountAmount: 0,
        payableAmount: originalAmount,
        paidAmount: 0,
        status: 'pending',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        orderItems: {
          create: items,
        },
      },
      include: { orderItems: true },
    });

    return order;
  });
}

/**
 * 获取订单详情
 * @usedBy GET /api/v1/orders/[id]
 */
export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      buyer: { select: { displayName: true, phone: true } },
      operator: { select: { displayName: true } },
      orderItems: {
        include: {
          schedule: {
            include: { course: { select: { title: true } } },
          },
        },
      },
      payments: true,
      refunds: true,
    },
  });
}

/**
 * 订单列表
 * @usedBy GET /api/v1/orders
 */
export async function listOrders(params: {
  tenantId: string;
  userId?: string;
  status?: string;
  channel?: string;
  page?: number;
  pageSize?: number;
}) {
  const { tenantId, userId, status, channel, page = 1, pageSize = 20 } = params;
  const where: Record<string, unknown> = { tenantId };
  if (status) where.status = status;
  if (channel) where.channel = channel;
  if (userId) where.buyerId = userId;

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer: { select: { displayName: true } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);
  return { data, total, page, pageSize };
}

/**
 * 取消订单（仅 pending 状态）
 * @usedBy POST /api/v1/orders/[id]/cancel
 */
export async function cancelOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error('订单不存在');
  if (order.status !== 'pending') throw new Error(`订单状态为 "${order.status}"，无法取消`);
  return prisma.order.update({ where: { id }, data: { status: 'cancelled' } });
}

/**
 * 自动取消过期订单
 * @usedBy 定时任务或查询时调用
 */
export async function expireOverdueOrders() {
  const result = await prisma.order.updateMany({
    where: { status: 'pending', expiresAt: { lt: new Date() } },
    data: { status: 'expired' },
  });
  return result.count;
}
