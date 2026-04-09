'use client';

import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import { mockLogs } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveLogs() {
  const [logs, setLogs] = useState<{time: string, msg: string, type: string}[]>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockLogs.length) {
        setLogs(prev => [mockLogs[index], ...prev]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card border border-white/5 rounded-xl flex flex-col h-full overflow-hidden font-mono">
      <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 bg-white/[0.02]">
        <Terminal className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">System Terminal</h3>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-2 text-xs flex flex-col-reverse">
        <AnimatePresence>
          {logs.map((log, i) => {
            if (!log) return null;
            return (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={i} 
              className="flex gap-3 text-gray-300"
            >
              <span className="text-gray-500 shrink-0">[{log.time}]</span>
              <span className={`
                ${log.type === 'error' ? 'text-red-400 font-semibold' : ''}
                ${log.type === 'warning' ? 'text-yellow-400' : ''}
                ${log.type === 'info' ? 'text-blue-300' : ''}
              `}>
                {log.msg}
              </span>
            </motion.div>
            );
          })}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="text-gray-600 italic">Waiting for incoming logs...</div>
        )}
      </div>
    </div>
  );
}
