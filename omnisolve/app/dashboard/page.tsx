'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, ZapIcon, Thermometer, Ticket as TicketIcon } from 'lucide-react';
import { useSimulationContext } from '@/contexts/SimulationContext';

export default function Dashboard() {
  const { state, apiAnalysis } = useSimulationContext();

  const isCritical = state === 'NODE_CRITICAL' || state === 'TICKET_GENERATED' || state === 'AI_ANALYZING';

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto h-full pb-10">
      
      {/* SYSTEM PULSE BAR */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${isCritical ? 'bg-red-900/10 border-red-500/30' : 'bg-green-900/10 border-green-500/30'} border rounded-2xl p-4 flex items-center justify-between relative overflow-hidden transition-colors duration-1000`}
      >
        <div className={`absolute inset-0 ${isCritical ? 'bg-red-500/5' : 'bg-green-500/5'} animate-pulse duration-[3000ms]`}></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative flex h-4 w-4">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCritical ? 'bg-red-400' : 'bg-green-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-4 w-4 ${isCritical ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]'}`}></span>
          </div>
          <span className={`${isCritical ? 'text-red-400' : 'text-green-400'} font-bold tracking-widest uppercase text-sm`}>
            {isCritical ? 'System Pulse: Critical Alert Active' : 'System Pulse: Operating Normally'}
          </span>
        </div>
        <div className="relative z-10 text-xs font-mono text-gray-400 flex gap-6">
          <span>Global State: <span className="text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">{state}</span></span>
        </div>
      </motion.div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Active Tickets</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{isCritical ? '2' : '1'}</h3>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TicketIcon className="w-5 h-5 text-blue-400" />
              </div>
           </div>
           <div className="text-xs text-green-400 font-medium">↓ 12% from yesterday</div>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Critical Alerts</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{isCritical ? '1' : '0'}</h3>
              </div>
              <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                <ShieldCheck className={`w-5 h-5 ${isCritical ? 'text-red-400' : 'text-green-400'}`} />
              </div>
           </div>
           <div className={`text-xs font-medium ${isCritical ? 'text-red-400' : 'text-gray-500'}`}>Requires immediate attention</div>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Average MTTR</p>
                <h3 className="text-3xl font-bold mt-1 text-white">4m 12s</h3>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ZapIcon className="w-5 h-5 text-purple-400" />
              </div>
           </div>
           <div className="text-xs text-green-400 font-medium">↑ 34% AI Improvement</div>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">AI Confidence (Avg)</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{apiAnalysis?.confidence ? (apiAnalysis.confidence <= 1 ? Math.round(apiAnalysis.confidence * 100) : apiAnalysis.confidence) : '92'}%</h3>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
           </div>
           <div className="text-xs text-green-400 font-medium">Highly Accurate RAG Model</div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-4 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Recent Activity Feed</h3>
        <div className="space-y-4">
          
          {isCritical && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
               <div className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <div>
                   <p className="text-sm font-medium text-red-200">New Critical Ticket Generated (T-101)</p>
                   <p className="text-xs text-red-400/70 mt-1">Node HWY-042 - Thermal Spike Detected</p>
                 </div>
               </div>
               <span className="text-xs text-gray-500">Just now</span>
            </motion.div>
          )}

          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
             <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-blue-500"></div>
               <div>
                 <p className="text-sm font-medium text-gray-200">Routine Maintenance Completed</p>
                 <p className="text-xs text-gray-500 mt-1">Sector 7 Edge Routers patched.</p>
               </div>
             </div>
             <span className="text-xs text-gray-500">2h ago</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
             <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
               <div>
                 <p className="text-sm font-medium text-gray-200">Ticket T-087 Closed by AI</p>
                 <p className="text-xs text-gray-500 mt-1">Network Latency Issue resolved autonomously.</p>
               </div>
             </div>
             <span className="text-xs text-gray-500">5h ago</span>
          </div>

        </div>
      </div>
      
    </div>
  );
}
