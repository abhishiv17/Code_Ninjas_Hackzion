'use client';

import { AlertCircle } from 'lucide-react';
import { useCallback } from 'react';

interface Alert {
  id: number;
  title: string;
  location: string;
  time: string;
  critical: boolean;
}

interface SystemAlertsProps {
  onAlertClick?: (alert: Alert) => void;
}

export default function SystemAlerts({ onAlertClick }: SystemAlertsProps) {
  const alerts: Alert[] = [
    { id: 1, title: 'Network Switch Offline', location: 'Section B, Gate 4', time: '2 mins ago', critical: true },
    { id: 2, title: 'Camera Feed Loss', location: 'Pole 12', time: '15 mins ago', critical: false },
    { id: 3, title: 'RFID Reader Failure', location: 'Toll 1', time: '1 hr ago', critical: true },
  ];

  const handleAlertClick = useCallback((alert: Alert) => {
    if (onAlertClick) {
      onAlertClick(alert);
    }
  }, [onAlertClick]);

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 h-full">
      <div className="flex items-center space-x-2 mb-2">
        <AlertCircle className="text-red-400" size={20} />
        <h2 className="text-lg font-semibold text-white">System Alerts</h2>
      </div>
      <p className="text-sm text-slate-400 mb-6">Click an alert to auto-query the manuals.</p>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <button
            key={alert.id}
            onClick={() => handleAlertClick(alert)}
            className={`w-full text-left p-4 rounded-lg border flex flex-col transition-all hover:bg-slate-800 ${
              alert.critical
                ? 'border-red-500/30 bg-red-500/5 border-l-4 border-l-red-500'
                : 'border-orange-500/30 bg-orange-500/5 border-l-4 border-l-orange-500'
            }`}
          >
            <span className="font-semibold text-slate-200">{alert.title}</span>
            <span className="text-xs text-slate-400 mt-1">{alert.location} • {alert.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}