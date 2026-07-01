import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-gray-900">
          星光职业培训学校
        </h1>
        <p className="text-lg text-gray-600">
          教育培训机构全流程管理平台 —— 本地高保真原型
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            学员登录
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            管理后台
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg shadow text-left text-sm text-gray-600">
          <p className="font-medium mb-2">🔑 演示账号（种子数据）:</p>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-1 text-left">角色</th>
                <th className="py-1 text-left">手机号</th>
                <th className="py-1 text-left">密码</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="py-1">Editor 校长</td><td>13800001001</td><td>password123</td></tr>
              <tr><td className="py-1">Trainer 讲师</td><td>13800001003</td><td>password123</td></tr>
              <tr><td className="py-1">Learner 学员</td><td>13800001004</td><td>password123</td></tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Phase 1: 核心链路打通 | v0.1.0
        </p>
      </div>
    </div>
  );
}
