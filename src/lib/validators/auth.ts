import { z } from 'zod';

/**
 * 注册校验
 * @usedBy POST /api/v1/auth/register
 */
export const registerSchema = z.object({
  phone: z
    .string()
    .min(11, '手机号至少11位')
    .max(15, '手机号最多15位')
    .regex(/^[0-9+\- ]+$/, '手机号格式不正确'),
  email: z.string().email('邮箱格式不正确').optional(),
  password: z
    .string()
    .min(6, '密码至少6位')
    .max(100, '密码最多100位'),
  displayName: z
    .string()
    .min(1, '姓名不能为空')
    .max(50, '姓名最多50字'),
  tenantId: z.string().min(1, '租户ID不能为空'),
});

/**
 * 登录校验
 * @usedBy POST /api/v1/auth/login
 */
export const loginSchema = z.object({
  phone: z.string().min(1, '手机号不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
