'use client';

import { ReactNode, useState } from 'react';
import { Loader } from 'lucide-react';
import { motion } from 'framer-motion';

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
  valueColor = "text-slate-900 dark:text-white",
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
    <motion.div 
      whileHover={{ scale: 1.02, translateY: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 dark:border-slate-700/50 dark:bg-[var(--color-dark-panel)]/80 backdrop-blur-sm dark:hover:border-blue-500/50"
    >
      <div className="mb-4 flex items-start justify-between text-slate-500 dark:text-slate-400">
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
          <span className="text-lg text-slate-400 dark:text-slate-500">Loading...</span>
        ) : (
          value === '--' || value === '0' || value === '0ms' || value === '0%' ? (
            <div className="h-9 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700/50" />
          ) : (
            value || 'N/A'
          )
        )}
      </div>
    </motion.div>
  );
}