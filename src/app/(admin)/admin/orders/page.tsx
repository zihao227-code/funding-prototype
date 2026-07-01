'use client';

import { useEffect, useState } from 'react';
import { apiClient, formatMoney, STATUS_LABELS } from '@/lib/api-client';

export default function AdminOrderList() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ data: any[] }>('/api/v1/orders?pageSize=50')
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">加载中...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">订单管理</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm text-gray-500">订单号</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">学员</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">渠道</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">金额</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">状态</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id as string} className="border-t">
                <td className="px-4 py-3 font-mono text-sm">{o.orderNumber as string}</td>
                <td className="px-4 py-3 text-sm">{(o.buyer as { displayName: string })?.displayName}</td>
                <td className="px-4 py-3 text-sm">{o.channel === 'online' ? '线上' : o.channel === 'desk' ? '前台' : 'B2B'}</td>
                <td className="px-4 py-3 font-semibold">{formatMoney(o.payableAmount as number)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    o.status === 'paid' ? 'bg-green-100 text-green-700' :
                    o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    o.status === 'expired' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{STATUS_LABELS[o.status as string] || (o.status as string)}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(o.createdAt as string).toLocaleDateString('zh-CN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
