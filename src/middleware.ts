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

  if (!pathname.startsWith('/api/')) return NextResponse.next();

  const isPublicPath = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicRead = method === 'GET' && PUBLIC_READ_PREFIXES.some((p) => pathname.startsWith(p));

  // 尝试解析JWT（无论是否公开路径，有token就注入用户信息）
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  let payload = null;
  if (token) {
    payload = await verifyToken(token);
  }

  // 非公开路径必须认证
  if (!isPublicPath && !isPublicRead) {
    if (!payload) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: token ? 'Token无效或已过期' : '未提供认证Token' } },
        { status: 401 }
      );
    }
  }

  // 注入用户信息（如果有）
  if (payload) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-tenant-id', payload.tenantId);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
