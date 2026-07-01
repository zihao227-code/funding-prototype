/**
 * 统一错误类
 * @usedBy 所有 API Route Handlers
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} not found: ${id}`, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super('VALIDATION_FAILED', 'Validation failed', 422);
    this.details = details;
  }
  details: unknown;
}

/**
 * 统一错误响应格式
 * 支持 AppError 实例、Error 实例、普通错误对象
 */
export function errorResponse(error: unknown): Response {
  // AppError 及其子类
  if (error instanceof AppError) {
    const body: Record<string, unknown> = {
      error: { code: error.code, message: error.message },
    };
    if (error instanceof ValidationError) {
      (body.error as Record<string, unknown>).details = error.details;
    }
    return Response.json(body, { status: error.statusCode });
  }

  // 普通 Error 实例
  if (error instanceof Error) {
    console.error('[ERROR]', error.message, error.stack);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  // 类 AppError 对象（{ code, message, statusCode }）
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if (typeof e.code === 'string' && typeof e.message === 'string') {
      const statusCode = typeof e.statusCode === 'number' ? e.statusCode : 400;
      const body: Record<string, unknown> = {
        error: { code: e.code as string, message: e.message as string },
      };
      if (e.details) {
        (body.error as Record<string, unknown>).details = e.details;
      }
      return Response.json(body, { status: statusCode });
    }
  }

  // 兜底
  console.error('[UNHANDLED ERROR]', error);
  return Response.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    { status: 500 }
  );
}
