'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient, STATUS_LABELS } from '@/lib/api-client';

interface RosterEntry {
  userId: string;
  displayName: string;
  phone: string;
  attendance: { status: string; checkInTime: string } | null;
}

export default function AttendanceRosterPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoster = () => {
    apiClient<RosterEntry[]>(`/api/v1/schedules/${scheduleId}/attendance/roster`)
      .then(setRoster)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRoster(); }, [scheduleId]);

  async function markStatus(userId: string, status: string) {
    await apiClient('/api/v1/attendance', {
      method: 'POST',
      body: JSON.stringify({ scheduleId, userId, status }),
    });
    fetchRoster();
  }

  if (loading) return <p className="text-gray-500">加载中...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">考勤花名册</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm text-gray-500">学员</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">手机号</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">考勤状态</th>
              <th className="text-left px-4 py-3 text-sm text-gray-500">签到时间</th>
              <th className="text-right px-4 py-3 text-sm text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((e) => (
              <tr key={e.userId} className="border-t">
                <td className="px-4 py-3 font-medium">{e.displayName}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{e.phone}</td>
                <td className="px-4 py-3">
                  {e.attendance ? (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      e.attendance.status === 'present' ? 'bg-green-100 text-green-700' :
                      e.attendance.status === 'absent' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{STATUS_LABELS[e.attendance.status] || e.attendance.status}</span>
                  ) : <span className="text-xs text-gray-400">未签到</span>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {e.attendance?.checkInTime ? new Date(e.attendance.checkInTime).toLocaleTimeString('zh-CN') : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={e.attendance?.status || ''}
                    onChange={(ev) => { if (ev.target.value) markStatus(e.userId, ev.target.value); }}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="">设置考勤</option>
                    <option value="present">出勤</option>
                    <option value="late">迟到</option>
                    <option value="absent">缺勤</option>
                    <option value="excused">请假</option>
                    <option value="early_leave">早退</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roster.length === 0 && <p className="text-center py-10 text-gray-400">该班次暂无所属学员</p>}
      </div>
    </div>
  );
}
