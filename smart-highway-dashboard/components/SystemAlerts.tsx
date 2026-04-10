'use client';

import { AlertCircle } from 'lucide-react';
import { useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();
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
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700/50 dark:bg-slate-800/30">
      <div className="mb-2 flex items-center space-x-2">
        <AlertCircle className="text-red-500 dark:text-red-400" size={20} />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('alerts.title')}</h2>
      </div>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{t('alerts.subtitle')}</p>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {alerts.map((alert) => (
          <button
            key={alert.id}
            onClick={() => handleAlertClick(alert)}
            className={`flex w-full flex-col rounded-lg border p-4 text-left transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
              alert.critical
                ? 'border-red-500/30 bg-red-500/5 border-l-4 border-l-red-500'
                : 'border-orange-500/30 bg-orange-500/5 border-l-4 border-l-orange-500'
            }`}
          >
            <span className="font-semibold text-slate-800 dark:text-slate-200">{alert.title}</span>
            <span className="text-xs text-slate-400 mt-1">{alert.location} • {alert.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}