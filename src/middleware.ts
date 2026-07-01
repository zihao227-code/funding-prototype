import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * JWT 认证中间件
 *
 * 白名单路径跳过认证，其余路径验证 JWT
 */
const PUBLIC_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过非 API 路径
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 跳过白名单
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
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
