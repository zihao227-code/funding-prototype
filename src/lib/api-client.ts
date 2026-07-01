/**
 * 前端 API 调用封装
 * @usedBy 所有前端页面
 */
export async function apiClient<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  return data as T;
}

/** 金额格式化：分 → 元 */
export function formatMoney(cents: number): string {
  return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
}

/** 状态标签映射 */
export const STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
  open: '开放报名',
  full: '已满班',
  cancelled: '已取消',
  completed: '已结课',
  pending: '待支付',
  paid: '已支付',
  partial_refunded: '部分退款',
  refunded: '已退款',
  expired: '已过期',
  active: '正常',
  present: '出勤',
  absent: '缺勤',
  late: '迟到',
  early_leave: '早退',
  excused: '请假',
};
