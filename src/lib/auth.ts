import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@prisma/client';

// ---- 类型 ----
export interface JwtPayload {
  userId: string;
  role: UserRole;
  tenantId: string;
}

// ---- 密钥 ----
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-funding-prototype-2026'
);

// ---- Token ----
/**
 * 签发 Access Token
 * @usedBy POST /api/v1/auth/login, POST /api/v1/auth/register
 */
export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

/**
 * 签发 Refresh Token
 */
export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

/**
 * 验证 Token，返回 payload
 * @usedBy src/middleware.ts, 所有需要认证的 Route Handler
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

// ---- 密码 ----
const SALT_ROUNDS = 10;

/**
 * 哈希密码
 * @usedBy POST /api/v1/auth/register
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 * @usedBy POST /api/v1/auth/login
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
