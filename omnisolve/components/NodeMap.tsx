'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockNodes } from '@/lib/mockData';

export default function NodeMap({ criticalNodeId }: { criticalNodeId?: string }) {
  const [nodes, setNodes] = useState(mockNodes);

  useEffect(() => {
    if (criticalNodeId) {
      setNodes(prev => prev.map(n => n.id === criticalNodeId ? { ...n, state: 'critical' } : { ...n, state: 'healthy' }));
    } else {
      setNodes(mockNodes.map(n => ({ ...n, state: 'healthy' })));
    }
  }, [criticalNodeId]);

  return (
    <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl h-full flex flex-col relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
      {/* Background radial map glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none"></div>

      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 flex gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> Healthy
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-pulse"></div> Warning
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse"></div> Critical
        </div>
      </div>
      
      <div className="flex-1 map-grid relative w-full h-full p-4">
        {nodes.map(node => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              node.state === 'critical'
                ? { opacity: [0.6, 1, 0.6], scale: [1, 1.3, 1] }
                : { opacity: 1, scale: 1 }
            }
            transition={
              node.state === 'critical'
                ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.5, delay: Math.random() * 0.5 }
            }
            className={`absolute w-3 h-3 md:w-3.5 md:h-3.5 rounded-full cursor-pointer transition-colors z-20 group
              ${node.state === 'healthy' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : ''}
              ${node.state === 'warning' ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse' : ''}
              ${node.state === 'critical' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] ring-4 ring-red-500/40' : ''}
            `}
            style={{ 
              left: `${node.x}%`, 
              top: `${node.y}%`,
              animationDuration: node.state === 'critical' ? '1s' : node.state === 'warning' ? '2s' : 'auto' 
            }}
          >
             {/* Glow Ring appears on hover */}
             <div className="absolute -inset-3 rounded-full border border-white/30 opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 pointer-events-none"></div>
             
             {/* Tooltip */}
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 backdrop-blur-sm border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none z-30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col items-center">
               <span className="font-bold text-gray-200">{node.label}</span>
               <span className={`uppercase font-semibold tracking-wider ${node.state==='healthy'?'text-green-400':node.state==='warning'?'text-yellow-400':'text-red-400'}`}>{node.state}</span>
             </div>
          </motion.div>
        ))}

        {/* Decorative Grid Lines with slight glow */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
        <div className="absolute top-1/4 left-0 w-full h-px bg-white/5"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-white/5"></div>
      </div>
      
      <div className="px-4 py-3 border-t border-white/5 bg-black/20 shrink-0 relative z-10 backdrop-blur-sm">
        <h2 className="text-sm font-semibold tracking-wider text-gray-300 uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Sector 4 Highway Map</h2>
        <p className="text-xs text-gray-500">Live Infrastructure Monitoring</p>
      </div>
    </div>
  );
}
