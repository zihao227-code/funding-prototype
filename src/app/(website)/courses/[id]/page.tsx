'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, formatMoney } from '@/lib/api-client';

interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolledCount: number;
  price: number | null;
  status: string;
  classroom: { name: string } | null;
  trainer: { displayName: string } | null;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  basePrice: number;
  category: string | null;
  status: string;
  creator: { displayName: string };
  schedules: ScheduleItem[];
  courseFundings: { fundingType: { id: string; name: string; source: string; amountOrRate: number; calculationRule: string; budgetLimit: number; budgetUsed: number } }[];
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<CourseDetail>(`/api/v1/courses/${id}`)
      .then(setCourse)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">加载中...</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-500">课程不存在</div>;

  const handleEnroll = (scheduleId: string) => {
    // Phase 1: 直接跳转到结算（购物车存localStorage）
    localStorage.setItem('cart', JSON.stringify([{ scheduleId, title: course.title, price: course.basePrice }]));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/courses" className="text-sm text-gray-500 hover:text-blue-600">← 返回课程列表</Link>
          <Link href="/login" className="px-3 py-1 bg-blue-600 text-white rounded text-sm">登录购买</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 课程基本信息 */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{course.type === 'offline' ? '线下课' : course.type}</span>
            {course.category && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{course.category}</span>}
          </div>
          <h1 className="text-2xl font-bold mb-3">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <div className="text-sm text-gray-500">讲师：{course.creator.displayName}</div>
        </div>

        {/* Funding 信息 */}
        {course.courseFundings.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">💰 可用资助</h3>
            {course.courseFundings.map((cf) => (
              <div key={cf.fundingType.id} className="text-sm text-green-700">
                <strong>{cf.fundingType.name}</strong>
                {cf.fundingType.calculationRule === 'fixed_per_head' && ` — 立减 ${formatMoney(cf.fundingType.amountOrRate)}`}
                {cf.fundingType.calculationRule === 'percentage' && ` — 报销 ${cf.fundingType.amountOrRate}%`}
                <span className="text-green-500 ml-2">(剩余预算: {formatMoney(cf.fundingType.budgetLimit - cf.fundingType.budgetUsed)})</span>
              </div>
            ))}
          </div>
        )}

        {/* 排期列表 */}
        <h2 className="text-xl font-bold mb-4">可选班次</h2>
        <div className="space-y-3">
          {course.schedules.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{s.title}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(s.startTime).toLocaleDateString('zh-CN')} ～ {new Date(s.endTime).toLocaleDateString('zh-CN')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {s.classroom?.name && `${s.classroom.name} · `}
                  {s.trainer?.displayName && `讲师: ${s.trainer.displayName} · `}
                  已报 {s.enrolledCount}/{s.capacity} 人
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">{formatMoney(s.price ?? course.basePrice)}</p>
                <button
                  onClick={() => handleEnroll(s.id)}
                  disabled={s.status !== 'open' || s.enrolledCount >= s.capacity}
                  className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {s.status === 'open' ? '立即报名' : s.status === 'full' ? '已满班' : '已关闭'}
                </button>
              </div>
            </div>
          ))}
          {course.schedules.length === 0 && (
            <p className="text-gray-400 text-center py-8">暂无可用班次</p>
          )}
        </div>
      </main>
    </div>
  );
}
