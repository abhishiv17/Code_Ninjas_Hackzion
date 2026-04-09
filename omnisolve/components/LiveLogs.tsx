'use client';

import { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';
import { mockLogs } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '@/lib/translations';

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
    <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col h-full overflow-hidden font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] relative">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 bg-black/40 relative z-20">
        <Terminal className="w-4 h-4 text-gray-400 drop-shadow-[0_0_3px_rgba(255,255,255,0.2)]" />
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{t('system_terminal')}</h3>
        <div className="ml-auto flex gap-1.5 opacity-50">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
        </div>
      </div>
      
      {/* Background neon scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(20,20,30,0.2)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-50"></div>

      <div className="p-4 flex-1 overflow-y-auto space-y-2 text-xs flex flex-col-reverse relative z-10">
        <AnimatePresence>
          {logs.map((log, i) => {
            if (!log) return null;
            return (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={i} 
              className="flex gap-4 hover:bg-white/5 px-2 py-1 -mx-2 rounded transition-colors group"
            >
              <span className="text-gray-500/70 shrink-0 group-hover:text-gray-400 transition-colors">[{log.time}]</span>
              <span className={`
                ${log.type === 'error' ? 'text-red-400 font-bold drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]' : ''}
                ${log.type === 'warning' ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]' : ''}
                ${log.type === 'info' ? 'text-blue-300 drop-shadow-[0_0_5px_rgba(147,197,253,0.4)]' : ''}
              `}>
                {log.msg}
              </span>
            </motion.div>
            );
          })}
        </AnimatePresence>
        
        {logs.length === 0 && (
          <div className="text-gray-600 italic">{t('waiting_for_logs')}</div>
        )}
      </div>
    </div>
  );
}
