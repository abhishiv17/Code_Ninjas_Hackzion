'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import SystemAlerts from '@/components/SystemAlerts';
import CommunityTickets from '@/components/CommunityTickets';
import RagTerminal from '@/components/RagTerminal';
import DashboardSlidePanel from '@/components/DashboardSlidePanel';
import { Activity, Wifi, Cpu, AlertOctagon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useDashboard } from '@/context/DashboardContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useApp();
  const { setRagTerminalQuery, setSelectedAlert } = useDashboard();
  const { t } = useLanguage();

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert);
    setRagTerminalQuery(`How do I fix: ${alert.title} at ${alert.location}?`);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
      <Sidebar />
      
      <main className="ml-64 flex flex-1 flex-col h-full overflow-hidden">
        <Topbar />
        
        <div className="flex flex-1 flex-col overflow-y-auto p-6 pt-24 md:p-8 md:pt-28">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('dash.welcome')}, {user?.name}!</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('dash.subtitle')}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 shrink-0">
            <StatCard 
              title={t('dash.activeVehicles')} 
              value="12,405" 
              icon={<Activity size={18} />}
            />
            <StatCard 
              title={t('dash.latency')} 
              value="42ms" 
              icon={<Wifi size={18} />}
            />
            <StatCard 
              title={t('dash.sensors')} 
              value="98.2%" 
              icon={<Cpu size={18} />} 
              valueColor="text-emerald-600 dark:text-emerald-400"
            />
            <StatCard 
              title={t('dash.openTickets')} 
              value="3" 
              icon={<AlertOctagon size={18} />} 
              valueColor="text-orange-600 dark:text-orange-400"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
            {/* Left Column Strategy (2 cols) */}
            <div className="lg:col-span-2 flex flex-col md:flex-row gap-8 h-full min-h-0">
              <div className="flex-1 h-full min-h-0">
                <SystemAlerts onAlertClick={handleAlertClick} />
              </div>
              <div className="flex-1 h-full min-h-0">
                <CommunityTickets />
              </div>
            </div>

            {/* RAG Terminal - Right Column */}
            <div className="h-full min-h-0">
              <RagTerminal />
            </div>
          </div>
        </div>
      </main>
      <DashboardSlidePanel />
    </div>
  );
}
