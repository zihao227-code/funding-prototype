'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, formatMoney, STATUS_LABELS } from '@/lib/api-client';

interface Course {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  type: string;
  basePrice: number;
  category: string | null;
  status: string;
  _count: { schedules: number };
  creator: { displayName: string };
}

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<{ data: Course[] }>('/api/v1/courses')
      .then((res) => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">星光职业培训学校</Link>
          <div className="flex gap-3 items-center">
            <Link href="/account" className="text-sm text-gray-600 hover:text-blue-600">个人中心</Link>
            <Link href="/login" className="px-3 py-1 bg-blue-600 text-white rounded text-sm">登录</Link>
          </div>
        </div>
      </header>

      {/* 课程列表 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">全部课程</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-lg font-bold">{course.title.slice(0, 6)}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    {course.type === 'offline' ? '线下' : course.type === 'online' ? '线上' : '混合'}
                  </span>
                  {course.category && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {course.category}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">{formatMoney(course.basePrice)}</span>
                  <span className="text-xs text-gray-400">{course._count.schedules} 个班次</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-20 text-gray-400">暂无课程</div>
        )}
      </main>
    </div>
  );
}
