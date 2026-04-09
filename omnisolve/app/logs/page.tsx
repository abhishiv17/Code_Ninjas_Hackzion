'use client';

import LiveLogs from '@/components/LiveLogs';
import { TerminalSquare } from 'lucide-react';

export default function Logs() {
  return (
    <div className="flex flex-col h-full gap-6 w-full mx-auto relative">
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-3">
          <TerminalSquare className="w-8 h-8 text-gray-400" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">System Terminal</h2>
            <p className="text-sm text-gray-400 mt-1">Live streaming logs from Sector 4 edge nodes.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-black/60 rounded-2xl relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden group">
         {/* Slight green glow behind the terminal for hacker aesthetic */}
         <div className="absolute inset-0 bg-green-500/5 blur-[100px] pointer-events-none group-hover:bg-green-500/10 transition-colors duration-1000"></div>
         <LiveLogs />
      </div>
    </div>
  );
}
