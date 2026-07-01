import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';

/**
 * JWT 认证中间件
 *
 * 策略：公开读取（GET courses/schedules），写入操作需认证
 */
const PUBLIC_PREFIXES = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/payment/mock-callback',
];

// 允许公开 GET 读取的资源
const PUBLIC_READ_PREFIXES = [
  '/api/v1/courses',
  '/api/v1/schedules',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { method } = request;

  // 跳过非 API 路径
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Auth 路径完全公开
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 公开资源：GET 读取不需要认证
  if (method === 'GET' && PUBLIC_READ_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 验证 JWT
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '未提供认证Token' } },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Token无效或已过期' } },
      { status: 401 }
    );
  }

  // 注入用户信息到请求头（Route Handler 中读取）
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-tenant-id', payload.tenantId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: '/api/:path*',
};
