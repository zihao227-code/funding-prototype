import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  const [courseCount, userCount, orderCount] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.order.count(),
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">仪表盘</h2>
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: '课程总数', value: String(courseCount), color: 'bg-blue-500' },
          { label: '学员总数', value: String(userCount), color: 'bg-green-500' },
          { label: '本月订单', value: String(orderCount), color: 'bg-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 ${stat.color.replace('bg-', 'text-')}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}