import { NextRequest } from 'next/server';
import { verifyToken, signAccessToken } from '@/lib/auth';
import { errorResponse } from '@/lib/errors';

/**
 * POST /api/v1/auth/refresh
 * 刷新 Access Token
 */
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: '缺少refreshToken' } },
        { status: 422 }
      );
    }

    const payload = await verifyToken(refreshToken);
    if (!payload || !payload.userId) {
      return Response.json(
        { error: { code: 'INVALID_TOKEN', message: 'Refresh Token无效或已过期' } },
        { status: 401 }
      );
    }

    // 签发新的 Access Token
    // 注意：refreshToken仅包含userId，需要通过数据库获取最新role/tenantId
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, tenantId: true, status: true },
    });

    if (!user || user.status !== 'active') {
      return Response.json(
        { error: { code: 'USER_NOT_FOUND', message: '用户不存在或已禁用' } },
        { status: 401 }
      );
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId,
    });

    return Response.json({ accessToken });
  } catch (error) {
    return errorResponse(error);
  }
}
