'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { mockTelemetryData } from '@/lib/mockData';

export default function TelemetryGraph({ isSpiking }: { isSpiking?: boolean }) {
  const [data, setData] = useState(mockTelemetryData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1), { 
          time: prev[prev.length - 1].time + 1, 
          temp: isSpiking ? 80 + Math.random() * 20 : 40 + Math.random() * 10 
        }];
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSpiking]);

  const maxTemp = 100;
  
  return (
    <div className="w-full h-full bg-card/60 rounded-xl border border-white/5 p-4 flex flex-col">
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Core Telemetry / Thermal</h3>
      
      <div className="flex-1 flex items-end gap-1 px-2 pb-2 border-l border-b border-white/10">
        {data.map((point, i) => {
          const height = (point.temp / maxTemp) * 100;
          const isHot = point.temp > 75;
          return (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              className={`flex-1 rounded-t-sm transition-colors duration-500 ${isHot ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-blue-500/40'}`}
            />
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between items-center bg-black/40 rounded p-2">
        <span className="text-[10px] text-gray-500 font-mono">CURR_TEMP:</span>
        <span className={`text-sm font-mono font-bold ${isSpiking ? 'text-red-400' : 'text-blue-400'}`}>
          {Math.round(data[data.length - 1].temp)}°C
        </span>
      </div>
    </div>
  );
}
