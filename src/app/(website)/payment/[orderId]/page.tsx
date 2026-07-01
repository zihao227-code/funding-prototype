'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, formatMoney } from '@/lib/api-client';

export default function MockPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<{ payableAmount: number; orderNumber: string; status: string } | null>(null);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [method, setMethod] = useState('wechat');

  useEffect(() => {
    apiClient<{ payableAmount: number; orderNumber: string; status: string }>(`/api/v1/orders/${orderId}`)
      .then(setOrder)
      .catch(() => router.push('/courses'));
  }, [orderId, router]);

  async function handlePay() {
    setPaying(true);
    try {
      await apiClient('/api/v1/payment/mock-callback', {
        method: 'POST',
        body: JSON.stringify({ orderId, method }),
      });
      router.push('/account/orders');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '支付失败');
    } finally { setPaying(false); }
  }

  async function handleCancel() {
    if (!confirm('确认取消该订单？取消后无法恢复。')) return;
    setCancelling(true);
    try {
      await apiClient(`/api/v1/orders/${orderId}/cancel`, { method: 'POST' });
      alert('订单已取消');
      router.push('/courses');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '取消订单失败');
    } finally { setCancelling(false); }
  }

  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">加载中...</div>;
  if (order.status !== 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg">订单 {order.status}</p>
        <button onClick={() => router.push('/account/orders')} className="text-blue-600">查看订单</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-xl font-bold text-center mb-4">模拟支付</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          订单: {order.orderNumber}<br/>金额: <strong className="text-lg">{formatMoney(order.payableAmount)}</strong>
        </p>

        <div className="space-y-3 mb-6">
          {[
            { key: 'wechat', label: '微信支付', color: 'bg-green-500' },
            { key: 'alipay', label: '支付宝', color: 'bg-blue-500' },
            { key: 'cash', label: '现金', color: 'bg-gray-500' },
          ].map((m) => (
            <label
              key={m.key}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                method === m.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="method"
                value={m.key}
                checked={method === m.key}
                onChange={() => setMethod(m.key)}
                className="hidden"
              />
              <span className={`w-4 h-4 rounded-full ${method === m.key ? 'bg-blue-500' : 'bg-gray-300'}`} />
              {m.label}
            </label>
          ))}
        </div>

        <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
          <p className="text-sm text-gray-500 mb-2">模拟支付扫码界面</p>
          <div className="w-32 h-32 mx-auto bg-white border rounded-lg flex items-center justify-center">
            <span className="text-4xl">📱</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {paying ? '支付处理中...' : '模拟支付成功'}
        </button>
      </div>
    </div>
  );
}
