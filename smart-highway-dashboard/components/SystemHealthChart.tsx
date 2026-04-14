'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function SystemHealthChart() {
  const { theme } = useTheme();
  
  // Fake 14-day data
  const data = useMemo(() => {
    const arr = [];
    let load = 40;
    for (let i = 14; i >= 0; i--) {
        load += Math.floor(Math.random() * 20 - 10);
        if (load < 10) load = 10;
        if (load > 100) load = 100;
        const date = new Date();
        date.setDate(date.getDate() - i);
        arr.push({
            day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            NetworkLoad: load,
        });
    }
    return arr;
  }, []);

  const isDark = theme === 'dark';
  const color = isDark ? '#38bdf8' : '#2563eb';

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-6 flex items-center gap-2">
        <Activity size={20} className="text-blue-500" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Global Network Load (14 Days)</h2>
      </div>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} dx={-10} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
                color: isDark ? '#f8fafc' : '#0f172a',
                borderRadius: '8px'
              }} 
            />
            <Area type="monotone" dataKey="NetworkLoad" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
