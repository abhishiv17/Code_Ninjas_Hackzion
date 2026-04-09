'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { mockTelemetryData } from '@/lib/mockData';
import { Activity } from 'lucide-react';

export default function TelemetryGraph() {
  return (
    <div className="bg-card border border-white/5 rounded-xl flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-300">Live Telemetry (N-124)</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div> Temp</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Load</span>
        </div>
      </div>
      
      <div className="p-4 flex-1 h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockTelemetryData}>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#121217', borderColor: '#2e2e38', borderRadius: '8px' }}
              itemStyle={{ color: '#ededed' }}
            />
            <ReferenceLine x={14} stroke="#ef4444" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={true} />
            <Line type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
