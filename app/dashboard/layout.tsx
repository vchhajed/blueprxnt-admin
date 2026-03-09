'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 px-6 py-8 md:px-8 md:py-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
