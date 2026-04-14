'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import RagTerminal from '@/components/RagTerminal';
import SystemAlerts from '@/components/SystemAlerts';
import { useApp } from '@/context/AppContext';
import { useDashboard } from '@/context/DashboardContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldAlert } from 'lucide-react';

export default function AiDiagnosticsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, sidebarOpen } = useApp();
  const { setSelectedAlert, setRagTerminalQuery } = useDashboard();
  const { t } = useLanguage();

  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert);
    setRagTerminalQuery(`How do I fix: ${alert.title} at ${alert.location}?`);
  };

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
      <Sidebar />
      <main className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Topbar />
        
        <div className="flex flex-1 flex-col overflow-y-auto p-6 pt-24 md:p-8 md:pt-28">
          {/* Welcome Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('nav.diagnostics')}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                AI-Powered technical troubleshooting and hardware manual lookups.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 w-full max-w-7xl mx-auto">
            {/* Left Column: Active Alerts */}
            <div className="lg:col-span-1 h-full max-h-[800px] overflow-hidden flex flex-col">
              <SystemAlerts onAlertClick={handleAlertClick} />
            </div>

            {/* Right Column: RAG Terminal */}
            <div className="lg:col-span-2 flex flex-col min-h-[600px] max-h-[800px] drop-shadow-xl">
              <RagTerminal />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
