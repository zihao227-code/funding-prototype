import { jwtVerify } from 'jose';

/**
 * Edge-compatible JWT utilities (for middleware)
 * 不依赖 bcryptjs / Node.js crypto
 */

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-funding-prototype-2026'
);

export interface JwtPayload {
  userId: string;
  role: string;
  tenantId: string;
}

/**
 * 验证 Token（Edge Runtime 兼容）
 * @usedBy src/middleware.ts
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
