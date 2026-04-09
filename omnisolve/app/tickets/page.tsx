'use client';

import { useState, useEffect } from 'react';
import TicketCard from '@/components/TicketCard';
import AIResponseCard from '@/components/AIResponseCard';
import { mockTicket, mockAIAnalysis, Ticket, AIAnalysis } from '@/lib/mockData';
import { FileClock, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const historicalTickets: Ticket[] = [
  { id: 'TKT-8105', nodeId: 'N-045', type: 'Hardware', priority: 'High', description: 'Thermal threshold hit previously (Resolved)', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'TKT-7702', nodeId: 'N-012', type: 'Software', priority: 'Medium', description: 'Firmware sync failure', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() }
];

export default function Tickets() {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    // Simulate real-time ticket arrival
    const timer = setTimeout(() => {
      setActiveTicket(mockTicket);
      setLoadingAI(true);
      setTimeout(() => {
        setLoadingAI(false);
        setAnalysis(mockAIAnalysis);
      }, 2500);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Tickets & AI Analysis</h2>
          <p className="text-sm text-gray-400 mt-1">Triaging and RAG-assisted resolution pipelines.</p>
        </div>
        <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-md text-gray-300 hover:bg-white/10 transition flex items-center gap-2">
                <FileClock className="w-3.5 h-3.5" /> History
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-md text-gray-300 hover:bg-white/10 transition flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" /> Filter
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        
        {/* Active Ticket List */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">Active / Pending</h3>
          <div className="overflow-y-auto pr-2 space-y-4 pb-4">
             <AnimatePresence>
                {activeTicket && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative cursor-pointer"
                  >
                     {/* Outer glow for selected state */}
                    <div className="absolute -inset-1 bg-red-500/20 blur opacity-100 rounded-2xl"></div>
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-red-500/50 rounded-xl z-20"></div>
                    <TicketCard ticket={activeTicket} />
                  </motion.div>
                )}
             </AnimatePresence>

             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1 pt-4">Resolved Historical</h3>
             {historicalTickets.map(tkt => (
                 <div key={tkt.id} className="opacity-50 hover:opacity-80 transition-opacity cursor-pointer grayscale">
                     <TicketCard ticket={tkt} />
                 </div>
             ))}
          </div>
        </div>

        {/* AI Resolution Side */}
        <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-widest px-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            OmniSolve AI Diagnostics
          </h3>
          <div className="overflow-y-auto pr-2 pb-4">
             {activeTicket ? (
                 <div className="relative group p-1">
                   {/* Main AI Glow */}
                   <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-3xl opacity-50 transition duration-1000 group-hover:opacity-80 pointer-events-none"></div>
                   <AIResponseCard analysis={analysis} loading={loadingAI} />
                 </div>
             ) : (
                 <div className="h-full min-h-[400px] border border-white/5 border-dashed rounded-xl flex items-center justify-center text-gray-600 text-sm">
                     Select a ticket to view AI resolution plan
                 </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
