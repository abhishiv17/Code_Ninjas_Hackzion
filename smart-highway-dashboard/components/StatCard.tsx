'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

interface StatCardProps {
  title: string;
  value?: string;
  icon: ReactNode;
  valueColor?: string;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  valueColor = "text-white",
  isLoading = false,
  onRefresh
}: StatCardProps) {
  const [loading, setLoading] = useState(isLoading);

  const handleRefresh = async () => {
    if (onRefresh) {
      setLoading(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl flex flex-col justify-between hover:border-slate-600/50 transition-colors">
      <div className="flex justify-between items-start text-slate-400 mb-4">
        <span className="text-sm font-medium">{title}</span>
        {loading ? (
          <Loader size={18} className="animate-spin text-blue-400" />
        ) : (
          <button
            onClick={handleRefresh}
            disabled={!onRefresh}
            className="opacity-50 hover:opacity-100 disabled:cursor-not-allowed transition-opacity"
          >
            {icon}
          </button>
        )}
      </div>
      <div className={`text-3xl font-bold ${valueColor}`}>
        {loading ? (
          <span className="text-slate-500 text-lg">Loading...</span>
        ) : (
          value || 'N/A'
        )}
      </div>
    </div>
  );
}