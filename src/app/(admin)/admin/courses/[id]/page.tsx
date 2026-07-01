'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient, formatMoney } from '@/lib/api-client';

interface CourseFull {
  id: string; title: string; description: string | null; type: string;
  basePrice: number; category: string | null; status: string;
}

interface ScheduleItem {
  id: string; title: string; startTime: string; endTime: string;
  capacity: number; enrolledCount: number; price: number | null;
  status: string; classroom: { name: string } | null;
  trainer: { displayName: string } | null;
}

export default function AdminCourseEdit() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseFull | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 课程编辑状态
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', type: 'offline', basePrice: 0, category: '' });
  const [saving, setSaving] = useState(false);

  // 排期表单
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '', startTime: '', endTime: '', capacity: 20, price: null as number | null,
  });

  const fetchData = async () => {
    const c = await apiClient<CourseFull>(`/api/v1/courses/${id}`);
    const s = await apiClient<ScheduleItem[]>(`/api/v1/courses/${id}/schedules`);
    setCourse(c);
    setSchedules(s);
    setEditForm({ title: c.title, description: c.description || '', type: c.type, basePrice: c.basePrice / 100, category: c.category || '' });
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      await apiClient(`/api/v1/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...editForm, basePrice: editForm.basePrice * 100 }),
      });
      alert('课程信息已保存');
      setEditing(false);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '保存失败');
    } finally { setSaving(false); }
  }

  async function handlePublish() {
    if (!confirm('确认发布该课程？发布后学员即可在官网看到。')) return;
    try {
      await apiClient(`/api/v1/courses/${id}/publish`, { method: 'POST' });
      alert('课程已发布！');
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '发布失败');
    }
  }

  async function addSchedule() {
    if (!newSchedule.title || !newSchedule.startTime || !newSchedule.endTime) {
      alert('请填写班次名称和时间'); return;
    }
    try {
      await apiClient(`/api/v1/courses/${id}/schedules`, {
        method: 'POST', body: JSON.stringify(newSchedule),
      });
      alert('排期添加成功！');
      setShowAddSchedule(false);
      setNewSchedule({ title: '', startTime: '', endTime: '', capacity: 20, price: null });
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '添加排期失败');
    }
  }

  async function cancelSchedule(scheduleId: string) {
    if (!confirm('确认取消该排期？')) return;
    try {
      await apiClient(`/api/v1/schedules/${scheduleId}/cancel`, { method: 'POST', body: JSON.stringify({ reason: '手动取消' }) });
      alert('排期已取消');
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '取消排期失败');
    }
  }

  if (loading) return <p className="text-gray-500">加载中...</p>;
  if (!course) return <p className="text-gray-500">课程不存在</p>;

  return (
    <div className="space-y-6">
      {/* 课程信息编辑区 */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">课程信息</h3>
          <div className="flex gap-2">
            {!editing ? (
              <>
                {course.status === 'draft' && (
                  <button onClick={handlePublish} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">发布课程</button>
                )}
                <button onClick={() => setEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">编辑信息</button>
              </>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                  {saving ? '保存中...' : '保存'}
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
              </>
            )}
            <button onClick={() => window.history.back()} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">← 返回</button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">课程名称</label>
              <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">描述</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg" rows={4} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">类型</label>
                <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="offline">线下</option>
                  <option value="online">线上</option>
                  <option value="hybrid">混合</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">价格 (元)</label>
                <input type="number" value={editForm.basePrice} onChange={(e) => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg" min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分类</label>
                <input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">名称：</span>{course.title}</p>
            <p><span className="text-gray-500">描述：</span>{course.description || '-'}</p>
            <p><span className="text-gray-500">类型：</span>{course.type === 'offline' ? '线下' : course.type === 'online' ? '线上' : '混合'} · 价格：{formatMoney(course.basePrice)} · 分类：{course.category || '-'} · 状态：{course.status}</p>
          </div>
        )}
      </div>

      {/* 排期管理 */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">排期管理</h3>
          <button onClick={() => setShowAddSchedule(!showAddSchedule)}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">+ 添加排期</button>
        </div>

        {showAddSchedule && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <input type="text" placeholder="班次名称" value={newSchedule.title}
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
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${s.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span>
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
