'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockNodes } from '@/lib/mockData';

export default function NodeMap() {
  const [nodes, setNodes] = useState(mockNodes);

  useEffect(() => {
    // Simulate active issue arriving
    const timer = setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === 'N-124' ? { ...n, state: 'critical' } : n));
    }, 5000); // 5 seconds wait before N-124 goes critical
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-card border border-white/5 rounded-xl h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 flex gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> Healthy
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div> Warning
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div> Critical
        </div>
      </div>
      
      <div className="flex-1 map-grid relative w-full h-full p-4">
        {nodes.map(node => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
            className={`absolute w-3 h-3 md:w-4 md:h-4 rounded-full cursor-pointer transition-transform hover:scale-150 z-20
              ${node.state === 'healthy' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : ''}
              ${node.state === 'warning' ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : ''}
              ${node.state === 'critical' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse ring-4 ring-red-500/30' : ''}
            `}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            title={`${node.label} - ${node.state}`}
          />
        ))}

        {/* Decorative Grid Lines */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/20"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-blue-500/20"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-white/5"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-white/5"></div>
      </div>
      
      <div className="px-4 py-3 border-t border-white/5 bg-black/20 shrink-0">
        <h2 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">Sector 4 Highway Map</h2>
        <p className="text-xs text-gray-500">Live Infrastructure Monitoring</p>
      </div>
    </div>
  );
}
