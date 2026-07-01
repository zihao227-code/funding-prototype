'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: '仪表盘', icon: '📊' },
  { href: '/admin/courses', label: '课程管理', icon: '📚' },
  { href: '/admin/schedules', label: '排期日历', icon: '📅' },
  { href: '/admin/orders', label: '订单管理', icon: '💰' },
  { href: '/admin/users', label: '学员管理', icon: '👥' },
  { href: '/admin/attendance', label: '考勤管理', icon: '✅' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ displayName: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  function logout() {
    localStorage.clear();
    router.push('/login');
  }

  return (
    <div className="flex h-screen">
      {/* 侧边栏 */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold">星光培训</h1>
          <p className="text-xs text-gray-400 mt-1">管理后台</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                pathname.startsWith(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <p className="text-sm">{user?.displayName || '...'}</p>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-white mt-1">
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
}
