'use client';

import { useApp } from '@/context/AppContext';
import { Activity, AlertCircle } from 'lucide-react';

export default function Topbar() {
  const { user, backendOnline, systemHealth } = useApp();

  return (
    <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-gradient-to-r from-slate-950 to-slate-900/50 backdrop-blur-sm fixed top-0 left-64 right-0 z-30">
      <div>
        <h1 className="text-2xl font-semibold text-white">Command Center</h1>
        <p className="text-sm text-slate-400 mt-1">Live System Monitoring & AI Support Terminal</p>
      </div>

      <div className="flex items-center space-x-6">
        {/* Backend Status */}
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
          backendOnline
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${backendOnline ? 'text-emerald-400' : 'text-red-400'}`}>
            {backendOnline ? 'Backend Online' : 'Backend Offline'}
          </span>
        </div>

        {/* System Health */}
        <div className="flex items-center space-x-3">
          <div className="text-right text-sm">
            <p className="text-slate-300 font-medium">{user?.name || 'Engineer'}</p>
            <p className="text-xs text-slate-500">{systemHealth.activeVehicles} active vehicles</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}