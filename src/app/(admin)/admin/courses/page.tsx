'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, formatMoney, STATUS_LABELS } from '@/lib/api-client';

interface Course {
  id: string;
  title: string;
  basePrice: number;
  status: string;
  type: string;
  publishedAt: string | null;
  _count: { schedules: number };
}

export default function AdminCourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = () => {
    setLoading(true);
    apiClient<{ data: Course[] }>('/api/v1/courses?pageSize=50')
      .then((res) => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handlePublish = async (id: string) => {
    await apiClient(`/api/v1/courses/${id}/publish`, { method: 'POST' });
    fetchCourses();
  };

  const handleArchive = async (id: string) => {
    if (!confirm('确认下架该课程？')) return;
    await apiClient(`/api/v1/courses/${id}/archive`, { method: 'POST' });
    fetchCourses();
  };

  if (loading) return <p className="text-gray-500">加载中...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">课程管理</h2>
        <Link href="/admin/courses/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + 创建课程
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">课程名称</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">价格</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">类型</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">状态</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">排期</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.title}</td>
                <td className="px-4 py-3">{formatMoney(c.basePrice)}</td>
                <td className="px-4 py-3 text-sm">{c.type === 'offline' ? '线下' : c.type}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    c.status === 'published' ? 'bg-green-100 text-green-700' :
                    c.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {STATUS_LABELS[c.status] || c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{c._count.schedules} 个</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/courses/${c.id}`} className="text-blue-600 hover:underline text-sm mr-3">编辑</Link>
                  {c.status === 'draft' && (
                    <button onClick={() => handlePublish(c.id)} className="text-green-600 hover:underline text-sm mr-3">发布</button>
                  )}
                  {c.status === 'published' && (
                    <button onClick={() => handleArchive(c.id)} className="text-red-500 hover:underline text-sm">下架</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && <p className="text-center py-10 text-gray-400">暂无课程</p>}
      </div>
    </div>
  );
}
