'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function AdminCourseEdit() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<{ id: string; title: string; status: string; basePrice: number } | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 新增排期表单
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '', startTime: '', endTime: '', capacity: 20, price: null as number | null,
  });

  const fetchData = async () => {
    const [c, s] = await Promise.all([
      apiClient<{ id: string; title: string; status: string; basePrice: number }>(`/api/v1/courses/${id}`),
      apiClient<ScheduleItem[]>(`/api/v1/courses/${id}/schedules`),
    ]);
    setCourse(c);
    setSchedules(s);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  async function addSchedule() {
    if (!newSchedule.title || !newSchedule.startTime || !newSchedule.endTime) {
      alert('请填写班次名称和时间');
      return;
    }
    await apiClient(`/api/v1/courses/${id}/schedules`, {
      method: 'POST',
      body: JSON.stringify(newSchedule),
    });
    setShowAddSchedule(false);
    setNewSchedule({ title: '', startTime: '', endTime: '', capacity: 20, price: null });
    fetchData();
  }

  async function cancelSchedule(scheduleId: string) {
    if (!confirm('确认取消该排期？')) return;
    await apiClient(`/api/v1/schedules/${scheduleId}/cancel`, { method: 'POST', body: JSON.stringify({ reason: '手动取消' }) });
    fetchData();
  }

  if (loading) return <p className="text-gray-500">加载中...</p>;
  if (!course) return <p className="text-gray-500">课程不存在</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{course.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            基准价格: {formatMoney(course.basePrice)} · 状态: {course.status}
          </p>
        </div>
        <button onClick={() => window.history.back()} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
          ← 返回
        </button>
      </div>

      {/* 排期管理 */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">排期管理</h3>
          <button onClick={() => setShowAddSchedule(!showAddSchedule)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
            + 添加排期
          </button>
        </div>

        {showAddSchedule && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <input type="text" placeholder="班次名称（如：第3期周末班）" value={newSchedule.title}
              onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              <input type="datetime-local" value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                className="px-3 py-2 border rounded-lg" />
              <input type="datetime-local" value={newSchedule.endTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                className="px-3 py-2 border rounded-lg" />
            </div>
            <div className="flex gap-3">
              <input type="number" placeholder="容量" value={newSchedule.capacity}
                onChange={(e) => setNewSchedule({ ...newSchedule, capacity: Number(e.target.value) })}
                className="px-3 py-2 border rounded-lg w-24" />
              <button onClick={addSchedule} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">确认添加</button>
            </div>
          </div>
        )}

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 text-sm">班次</th>
              <th className="text-left px-3 py-2 text-sm">时间</th>
              <th className="text-left px-3 py-2 text-sm">容量</th>
              <th className="text-left px-3 py-2 text-sm">地点/讲师</th>
              <th className="text-left px-3 py-2 text-sm">状态</th>
              <th className="text-right px-3 py-2 text-sm">操作</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2 font-medium">{s.title}</td>
                <td className="px-3 py-2 text-sm text-gray-600">
                  {new Date(s.startTime).toLocaleDateString('zh-CN')} → {new Date(s.endTime).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-3 py-2 text-sm">{s.enrolledCount}/{s.capacity}</td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  {s.classroom?.name || '-'} / {s.trainer?.displayName || '未分配'}
                </td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    s.status === 'open' ? 'bg-green-100 text-green-700' :
                    s.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{s.status}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  {s.status === 'open' && (
                    <button onClick={() => cancelSchedule(s.id)} className="text-red-500 hover:underline text-sm">取消</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
