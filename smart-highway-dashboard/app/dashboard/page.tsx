'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import HardwareStatusGrid from '@/components/HardwareStatusGrid';
import KnowledgeIngestionHub from '@/components/KnowledgeIngestionHub';
import SystemHealthChart from '@/components/SystemHealthChart';
import DashboardSlidePanel from '@/components/DashboardSlidePanel';
import { Activity, Wifi, Cpu, AlertOctagon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useDashboard } from '@/context/DashboardContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user, sidebarOpen, currentTollId, setCurrentTollId, systemHealth } = useApp();
  const { setSelectedAlert } = useDashboard();
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

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-slate-50 dark:bg-[#0f172a]">
      <Sidebar />
      
      <main className={`flex flex-1 flex-col h-full overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Topbar />
        
        <div className="flex flex-1 flex-col overflow-y-auto p-6 pt-24 md:p-8 md:pt-28">
          {/* Welcome Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('dash.welcome')}, {user?.name}!</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{t('dash.subtitle')}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <label htmlFor="toll-selector" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Data Targeting:
              </label>
              <select
                id="toll-selector"
                value={currentTollId}
                onChange={(e) => setCurrentTollId(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                <option value={1}>Toll Sector Alpha (ID: 1)</option>
                <option value={2}>Toll Sector Bravo (ID: 2)</option>
                <option value={3}>Toll Sector Charlie (ID: 3)</option>
                <option value={4}>Toll Sector Delta (ID: 4)</option>
              </select>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 shrink-0">
            <StatCard 
              title={t('dash.activeVehicles')} 
              value={systemHealth.activeVehicles.toLocaleString() || "0"} 
              icon={<Activity size={18} />}
            />
            <StatCard 
              title={t('dash.latency')} 
              value={`${systemHealth.latency}ms`} 
              icon={<Wifi size={18} />}
            />
            <StatCard 
              title="Uptime" 
              value={systemHealth.uptime} 
              icon={<Cpu size={18} />} 
              valueColor={systemHealth.uptime === "Online" || systemHealth.uptime.includes("99") ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}
            />
            <StatCard 
              title={t('dash.sensors')} 
              value={`${systemHealth.sensorsOnline}%`} 
              icon={<AlertOctagon size={18} />} 
              valueColor={systemHealth.sensorsOnline < 50 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
            {/* Left Column Strategy (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-8 min-h-[400px]">
              <div className="h-[350px]">
                <SystemHealthChart />
              </div>
              <div className="flex-1 min-h-[300px]">
                <HardwareStatusGrid />
              </div>
            </div>

            {/* Right Column - Knowledge Ingestion Hub */}
            <div className="min-h-[500px]">
              <KnowledgeIngestionHub />
            </div>
          </div>
        </div>
      </main>
      <DashboardSlidePanel />
    </div>
  );
}
