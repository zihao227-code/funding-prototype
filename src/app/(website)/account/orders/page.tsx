'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, formatMoney, STATUS_LABELS } from '@/lib/api-client';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    apiClient<{ data: any[] }>('/api/v1/orders')
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  async function handleCancel(orderId: string) {
    if (!confirm('确认取消该订单？')) return;
    try {
      await apiClient(`/api/v1/orders/${orderId}/cancel`, { method: 'POST' });
      alert('订单已取消');
      fetchOrders();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '取消订单失败');
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">加载中...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">我的订单</h1>
          <Link href="/account" className="text-sm text-gray-500">← 个人中心</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div key={o.id as string} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{o.orderNumber as string}</p>
                <p className="text-sm text-gray-500">{new Date(o.createdAt as string).toLocaleString('zh-CN')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatMoney(o.payableAmount as number)}</p>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  o.status === 'paid' ? 'bg-green-100 text-green-700' :
                  o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {STATUS_LABELS[o.status as string] || (o.status as string)}
                </span>
                {o.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(o.id as string)}
                    className="block mt-2 text-xs text-red-500 hover:underline ml-auto"
                  >
                    取消
                  </button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-center py-10 text-gray-400">暂无订单</p>}
        </div>
      </main>
    </div>
  );
}
