'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, formatMoney } from '@/lib/api-client';

interface CartItem { scheduleId: string; title: string; price: number; }

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
    if (cart.length === 0) { router.push('/courses'); return; }
    setItems(cart);
  }, [router]);

  const total = items.reduce((s, i) => s + i.price, 0);

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      const order = await apiClient<{ id: string }>('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          scheduleIds: items.map((i) => i.scheduleId),
          channel: 'online',
        }),
      });
      localStorage.removeItem('cart');
      router.push(`/payment/${order.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '下单失败');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">确认订单</h1>
          <Link href="/courses" className="text-sm text-blue-600 hover:underline">
            &larr; 返回选课
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0">
              <span>{item.title}</span>
              <span className="font-semibold">{formatMoney(item.price)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 mt-2 border-t text-lg font-bold">
            <span>合计</span>
            <span className="text-blue-600">{formatMoney(total)}</span>
          </div>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '创建订单中...' : '提交订单'}
        </button>
      </main>
    </div>
  );
}
