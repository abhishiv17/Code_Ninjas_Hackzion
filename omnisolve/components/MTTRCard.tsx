'use client';

import { Activity, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MTTRCard() {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden h-full shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] group hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.2),0_4px_30px_rgba(59,130,246,0.1)] transition-all duration-500"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
        <Activity className="w-24 h-24 text-blue-400 group-hover:scale-110 transition-transform duration-700" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 tracking-wide">
          Mean Time To Resolution (MTTR)
        </h3>
        <p className="text-xs text-blue-400 mt-1 font-medium bg-blue-500/10 inline-block px-2 py-0.5 rounded border border-blue-500/20">AI-Assisted Efficiency</p>
      </div>

      <div className="mt-4 relative z-10">
        <div className="flex items-end gap-3">
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:from-white group-hover:to-blue-200 transition-colors duration-500">14<span className="text-2xl text-gray-500 ml-1">m</span></span>
          <div className="flex items-center text-green-400 text-sm font-bold pb-2 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20 shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]">
            <ArrowDownRight className="w-4 h-4 mr-1 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
            94.4%
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-3">
          <span className="text-sm text-gray-500 line-through decoration-red-500/50 hover:decoration-red-500 transition-colors">Previous: 4.2 Hours</span>
          <div className="h-1.5 flex-1 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
            <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[5%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] relative">
               <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/50 blur-[1px]"></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
