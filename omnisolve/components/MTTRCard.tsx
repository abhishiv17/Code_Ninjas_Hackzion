'use client';

import { Activity, ArrowDownRight } from 'lucide-react';

export default function MTTRCard() {
  return (
    <div className="bg-card border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Activity className="w-24 h-24" />
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
          Mean Time To Resolution (MTTR)
        </h3>
        <p className="text-xs text-blue-400 mt-1">AI-Assisted Processing</p>
      </div>

      <div className="mt-4">
        <div className="flex items-end gap-3">
          <span className="text-4xl font-black text-white tracking-tighter">14<span className="text-2xl text-gray-500">m</span></span>
          <div className="flex items-center text-green-500 text-sm font-medium pb-1 bg-green-500/10 px-2 py-0.5 rounded-md">
            <ArrowDownRight className="w-4 h-4 mr-1" />
            94.4%
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-gray-500 line-through decoration-red-500/50">Previous: 4.2 Hours</span>
          <div className="h-1 flex-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[5%] rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
