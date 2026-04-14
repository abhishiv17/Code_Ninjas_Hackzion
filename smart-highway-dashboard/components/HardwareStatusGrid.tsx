'use client';

import { useMemo } from 'react';
import { Server, Videotape, Radio, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HardwareStatusGrid() {
  const { t } = useLanguage();
  
  const nodes = useMemo(() => [
    { type: 'server', id: 'SRV-01', status: 'online', load: '32%' },
    { type: 'server', id: 'SRV-02', status: 'online', load: '45%' },
    { type: 'server', id: 'SRV-03', status: 'warning', load: '89%' },
    { type: 'camera', id: 'CAM-N1', status: 'online', lat: '12ms' },
    { type: 'camera', id: 'CAM-N2', status: 'offline', lat: '--' },
    { type: 'camera', id: 'CAM-S1', status: 'online', lat: '18ms' },
    { type: 'sensor', id: 'RFID-A', status: 'online', scans: '1.2k/hr' },
    { type: 'sensor', id: 'RFID-B', status: 'online', scans: '890/hr' },
    { type: 'sensor', id: 'RADAR-1', status: 'online', scans: 'Active' },
  ], []);

  const getStatusIcon = (status: string) => {
    if (status === 'online') return <CheckCircle size={14} className="text-emerald-500" />;
    if (status === 'warning') return <AlertTriangle size={14} className="text-yellow-500" />;
    return <XCircle size={14} className="text-red-500" />;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'server') return <Server size={18} className="text-indigo-400" />;
    if (type === 'camera') return <Videotape size={18} className="text-blue-400" />;
    return <Radio size={18} className="text-purple-400" />;
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server size={20} className="text-blue-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edge Node Matrix</h2>
        </div>
        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
          92% Online
        </span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1">
        {nodes.map((node, i) => (
          <div key={i} className={`flex flex-col gap-2 rounded-lg border p-3 transition-colors ${node.status === 'offline' ? 'border-red-500/30 bg-red-500/5' : node.status === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTypeIcon(node.type)}
                <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {node.id}
                </span>
              </div>
              {getStatusIcon(node.status)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between">
              <span>{node.type.toUpperCase()}</span>
              <span>{node.load || node.lat || node.scans}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
