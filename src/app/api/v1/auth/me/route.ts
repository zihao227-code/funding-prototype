import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/errors';

/**
 * GET /api/v1/auth/me
 * 获取当前登录用户信息（通过JWT中间件注入的headers）
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return Response.json(
        { error: { code: 'UNAUTHORIZED', message: '未认证' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        role: true,
        phone: true,
        email: true,
        avatar: true,
        tenantId: true,
        lastLoginAt: true,
        tenant: {
          select: { name: true },
        },
      },
    });

    if (!user) {
      return Response.json(
        { error: { code: 'USER_NOT_FOUND', message: '用户不存在' } },
        { status: 404 }
      );
    }

    return Response.json({
      ...user,
      tenantName: user.tenant.name,
      tenant: undefined,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
