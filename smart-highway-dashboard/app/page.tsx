'use client';

import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import SystemAlerts from '@/components/SystemAlerts';
import RagTerminal from '@/components/RagTerminal';
import { Activity, Wifi, Cpu, AlertOctagon } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';

export default function Dashboard() {
  const { setRagTerminalQuery, setSelectedAlert } = useDashboard();

  // This function runs when an alert is clicked
  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert);
    setRagTerminalQuery(`How do I fix: ${alert.title} at ${alert.location}?`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar />
        
        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Main Grid: Alerts & NLP Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-8rem)] min-h-[500px]">
            <div className="lg:col-span-1">
              {/* Added the click handler prop here */}
              <SystemAlerts onAlertClick={handleAlertClick} />
            </div>
            <div className="lg:col-span-2">
              <RagTerminal />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}