import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validators/auth';
import {
  signAccessToken,
  signRefreshToken,
  verifyPassword,
} from '@/lib/auth';
import { errorResponse } from '@/lib/errors';

/**
 * POST /api/v1/auth/login
 * 手机号+密码登录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Step 1: 校验入参
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        statusCode: 422,
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { phone, password } = parsed.data;

    // Step 2: 查找用户（通过手机号）
    // 注意：从请求体获取 tenantId（登录时用户需提供机构ID）
    const tenantId = body.tenantId;
    if (!tenantId) {
      return Response.json(
        { error: { code: 'VALIDATION_FAILED', message: '缺少机构ID(tenantId)' } },
        { status: 422 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { tenantId, phone, status: 'active' },
    });

    // Step 3: 统一错误信息（防撞库）
    if (!user) {
      return Response.json(
        { error: { code: 'INVALID_CREDENTIALS', message: '手机号或密码错误' } },
        { status: 401 }
      );
    }

    // Step 4: 验证密码
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return Response.json(
        { error: { code: 'INVALID_CREDENTIALS', message: '手机号或密码错误' } },
        { status: 401 }
      );
    }

    // Step 5: 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Step 6: 签发Token
    const payload = {
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(user.id);

    return Response.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        displayName: user.displayName,
        role: user.role,
        tenantId: user.tenantId,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
