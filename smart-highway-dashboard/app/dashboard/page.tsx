'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import SystemAlerts from '@/components/SystemAlerts';
import RagTerminal from '@/components/RagTerminal';
import { Activity, Wifi, Cpu, AlertOctagon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useDashboard } from '@/context/DashboardContext';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useApp();
  const { setRagTerminalQuery, setSelectedAlert } = useDashboard();

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
    <div className="flex h-[100dvh] overflow-hidden bg-[#0f172a]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar />
        
        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
            <p className="text-slate-400 mt-2">Smart Highway Command Center - Real-time System Monitoring</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 shrink-0">
            <StatCard 
              title="Active Vehicles" 
              value="12,405" 
              icon={<Activity size={18} />}
            />
            <StatCard 
              title="Toll Gate Latency" 
              value="42ms" 
              icon={<Wifi size={18} />}
            />
            <StatCard 
              title="IoT Sensors Online" 
              value="98.2%" 
              icon={<Cpu size={18} />} 
              valueColor="text-emerald-400"
            />
            <StatCard 
              title="Open IT Tickets" 
              value="3" 
              icon={<AlertOctagon size={18} />} 
              valueColor="text-orange-400"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
            {/* System Alerts - Left Column (2 cols) */}
            <div className="lg:col-span-2 h-full min-h-0">
              <SystemAlerts onAlertClick={handleAlertClick} />
            </div>

            {/* RAG Terminal - Right Column */}
            <div className="h-full min-h-0">
              <RagTerminal />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
