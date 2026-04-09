'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Activity, Target, ZapIcon, Thermometer } from 'lucide-react';
import { useSimulation } from '@/hooks/useSimulation';
import NodeMap from '@/components/NodeMap';
import TelemetryGraph from '@/components/TelemetryGraph';
import TicketCard from '@/components/TicketCard';
import AIResponseCard from '@/components/AIResponseCard';
import ModelPerformance from '@/components/ModelPerformance';
import { mockTicket, mockAIAnalysis } from '@/lib/mockData';

export default function Dashboard() {
  const { state } = useSimulation();

  const isSpiking = state !== 'IDLE';
  const nodeCritical = state !== 'IDLE' && state !== 'SPIKE_DETECTED';
  const showTicket = ['TICKET_GENERATED', 'AI_ANALYZING', 'AI_RESOLVED'].includes(state);
  const showAI = state === 'AI_ANALYZING' || state === 'AI_RESOLVED';
  const aiLoading = state === 'AI_ANALYZING';
  const aiResolved = state === 'AI_RESOLVED';

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto h-full pb-10">
      
      {/* SYSTEM PULSE BAR (Unchanged but adapted) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${nodeCritical ? 'bg-red-900/10 border-red-500/30' : 'bg-green-900/10 border-green-500/30'} border rounded-2xl p-4 flex items-center justify-between relative overflow-hidden transition-colors duration-1000`}
      >
        <div className={`absolute inset-0 ${nodeCritical ? 'bg-red-500/5' : 'bg-green-500/5'} animate-pulse duration-[3000ms]`}></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative flex h-4 w-4">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${nodeCritical ? 'bg-red-400' : 'bg-green-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-4 w-4 ${nodeCritical ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]'}`}></span>
          </div>
          <span className={`${nodeCritical ? 'text-red-400' : 'text-green-400'} font-bold tracking-widest uppercase text-sm`}>
            {nodeCritical ? 'System Pulse: Critical Alert (N-124)' : 'System Pulse: Nominal'}
          </span>
        </div>
        <div className="relative z-10 text-xs font-mono text-gray-400 flex gap-6">
          <span>Simulation Phase: <span className="text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">{state}</span></span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT COLUMN: Map & Graph */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="min-h-[350px] lg:h-[45%] bg-card/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative shadow-[0_4px_40px_rgba(0,0,0,0.2)]">
             <NodeMap criticalNodeId={nodeCritical ? 'N-124' : undefined} />
          </div>
          <div className="flex-1 min-h-[300px]">
             <TelemetryGraph isSpiking={isSpiking} />
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket, AI, Performance */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row gap-6">
             {/* Ticket Section */}
             <div className="flex-1 relative">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1 mb-3">Live Incident Queue</h3>
                <div className="min-h-[220px]">
                  <AnimatePresence>
                     {showTicket ? (
                        <div className="relative">
                          <div className="absolute -inset-1 bg-red-500/20 blur-xl opacity-100 rounded-3xl transition duration-1000 pointer-events-none"></div>
                          <TicketCard ticket={mockTicket} />
                        </div>
                     ) : (
                        <motion.div 
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="h-full w-full border border-white/5 border-dashed rounded-xl flex items-center justify-center text-gray-600 text-sm py-16"
                        >
                          Awaiting active alerts...
                        </motion.div>
                     )}
                  </AnimatePresence>
                </div>
             </div>
             
             {/* AI Engine Section */}
             <div className="flex-1 relative">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-widest pl-1 mb-3 flex items-center gap-2">
                  <div className={`w-2 h-2 ${showAI ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'} rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]`}></div>
                  OmniSolve AI Diagnostics
                </h3>
                <div className="min-h-[400px]">
                  <AnimatePresence>
                    {showAI ? (
                       <AIResponseCard analysis={mockAIAnalysis} loading={aiLoading} />
                    ) : (
                       <motion.div 
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="h-[300px] w-full border border-white/5 border-dashed rounded-xl flex items-center justify-center text-gray-600 text-sm"
                       >
                         AI Standby
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
             </div>
          </div>

          {/* Model Performance triggers when AI resolves */}
          <div className="mt-auto">
            <ModelPerformance active={aiResolved} />
          </div>

        </div>
      </div>
      
    </div>
  );
}
