import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validators/auth';
import { signAccessToken, signRefreshToken, hashPassword } from '@/lib/auth';
import { errorResponse } from '@/lib/errors';

/**
 * POST /api/v1/auth/register
 * 学员自助注册
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Step 1: 校验入参
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse({
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
        statusCode: 422,
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { phone, email, password, displayName, tenantId } = parsed.data;

    // Step 2: 检查手机号唯一性
    const existing = await prisma.user.findFirst({
      where: { tenantId, phone },
    });
    if (existing) {
      return Response.json(
        { error: { code: 'PHONE_EXISTS', message: '该手机号已注册' } },
        { status: 409 }
      );
    }

    // Step 3: 创建用户
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        tenantId,
        phone,
        email: email || null,
        passwordHash,
        displayName,
        role: 'learner',
        status: 'active',
      },
    });

    // Step 4: 签发Token
    const payload = {
      userId: user.id,
      role: user.role,
      tenantId: user.tenantId,
    };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(user.id);

    // Step 5: 返回
    return Response.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
