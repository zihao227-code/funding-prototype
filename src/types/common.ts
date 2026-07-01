// 通用API响应类型

export interface ApiResponse<T = unknown> {
  data?: T;
  total?: number; // 分页总数
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 分页查询参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// 金额单位: 分 (cents)
export type MoneyInCents = number;
