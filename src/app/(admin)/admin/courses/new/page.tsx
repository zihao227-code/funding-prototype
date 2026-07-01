'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function CreateCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'offline' as const,
    basePrice: 0,
    category: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const course = await apiClient<{ id: string }>('/api/v1/courses', {
        method: 'POST',
        body: JSON.stringify({ ...form, basePrice: form.basePrice * 100 }),
      });
      alert('课程创建成功！请添加排期');
      router.push(`/admin/courses/${course.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '创建失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">创建课程</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">课程名称 *</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">课程描述</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg" rows={4} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">课程类型</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'offline' })}
              className="w-full px-3 py-2 border rounded-lg">
              <option value="offline">线下</option>
              <option value="online">线上</option>
              <option value="hybrid">混合</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">价格 (元) *</label>
            <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg" min={0} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">分类</label>
            <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" placeholder="如: IT技术" />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? '创建中...' : '创建课程'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50">取消</button>
        </div>
      </form>
    </div>
  );
}
