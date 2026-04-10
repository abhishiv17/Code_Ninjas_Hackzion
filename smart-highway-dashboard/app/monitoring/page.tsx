'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import LiveMonitoringDashboard from '@/components/LiveMonitoringDashboard';
import { useApp } from '@/context/AppContext';

export default function MonitoringPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useApp();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0f172a]">
      <Sidebar />
      <main className="ml-64 flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-6 pt-24 md:p-8 md:pt-28">
          <LiveMonitoringDashboard />
        </div>
      </main>
    </div>
  );
}
