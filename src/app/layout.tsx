import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '星光职业培训学校',
  description: '教育培训机构全流程管理平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
