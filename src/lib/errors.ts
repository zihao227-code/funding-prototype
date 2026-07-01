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
 */
export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    const body: Record<string, unknown> = {
      error: { code: error.code, message: error.message },
    };
    if (error instanceof ValidationError) {
      body.error = { ...body.error, details: error.details };
    }
    return Response.json(body, { status: error.statusCode });
  }

  // 未预期的错误
  console.error('[UNHANDLED ERROR]', error);
  return Response.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    { status: 500 }
  );
}
