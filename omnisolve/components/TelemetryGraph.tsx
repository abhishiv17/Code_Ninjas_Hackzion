import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, CartesianGrid } from 'recharts';
import { mockTelemetryData } from '@/lib/mockData';
import { Activity } from 'lucide-react';

export default function TelemetryGraph({ isSpiking = true }: { isSpiking?: boolean }) {
  // Generate stable baseline if not spiking, otherwise show the spike
  const data = mockTelemetryData.map(d => ({
    ...d,
    temp: isSpiking ? d.temp : (d.time >= 14 ? 45 + Math.random() * 5 : d.temp),
    load: isSpiking ? (d.time >= 14 ? 80 + Math.random() * 10 : 30 + Math.random() * 10) : 30 + Math.random() * 10
  }));

  return (
    <div className="bg-card dark:bg-card/40 dark:backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-xl flex flex-col h-full overflow-hidden shadow-sm dark:shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-black/20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-300 dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Live Telemetry (N-124)</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse"></div> Temp</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div> Load</span>
        </div>
      </div>
      
      <div className="p-6 flex-1 w-full bg-white dark:bg-transparent min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            {/* Very subtle grid lines */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
            
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 15']} />
            
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(20,20,25,0.95)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#ededed' }}
            />
            
            {/* The Anomaly Highlight */}
            {isSpiking && (
              <>
                <ReferenceLine x={14} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.6} />
                <ReferenceDot x={14} y={85} r={8} fill="#ef4444" stroke="none" className="dark:animate-ping" style={{ transformOrigin: 'center' }} opacity={0.3} />
                <ReferenceDot x={14} y={85} r={4} fill="#fff" stroke="#ef4444" strokeWidth={2.5} />
              </>
            )}

            <Line 
              type="monotone" 
              dataKey="temp" 
              stroke="#ef4444" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
              style={{ filter: 'drop-shadow(0px 4px 6px rgba(239, 68, 68, 0.4))' }}
              isAnimationActive={true} 
            />
            <Line 
              type="monotone" 
              dataKey="load" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              style={{ filter: 'drop-shadow(0px 4px 6px rgba(59, 130, 246, 0.4))' }}
              isAnimationActive={true} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
