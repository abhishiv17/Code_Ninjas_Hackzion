'use client';

import React from 'react';
import { Target, Zap, Clock, ShieldCheck } from 'lucide-react';

export default function ModelPerformance({ active }: { active?: boolean }) {
  const metrics = [
    { label: 'RAG Latency', value: '412ms', icon: Clock, color: 'text-blue-400' },
    { label: 'Tokens/Sec', value: '88.5', icon: Zap, color: 'text-yellow-400' },
    { label: 'Accuracy', value: '99.2%', icon: Target, color: 'text-green-400' },
    { label: 'Safety Check', value: 'Passed', icon: ShieldCheck, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="bg-card/30 border border-white/5 rounded-xl p-3 flex flex-col gap-1 relative overflow-hidden group">
          {active && (
            <div className="absolute top-0 left-0 h-0.5 bg-blue-500 w-full animate-[shimmer_2s_infinite]"></div>
          )}
          <div className="flex items-center gap-2 opacity-60">
            <m.icon className={`w-3 h-3 ${m.color}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{m.label}</span>
          </div>
          <div className="text-sm font-mono font-bold text-white">
            {active ? m.value : '---'}
          </div>
        </div>
      ))}
    </div>
  );
}
