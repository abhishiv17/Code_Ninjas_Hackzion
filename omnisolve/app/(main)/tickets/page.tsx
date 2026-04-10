'use client';

import { useSimulationContext } from '@/contexts/SimulationContext';
import TicketCard from '@/components/TicketCard';
import { mockTicket, Ticket } from '@/lib/mockData';
import { FileClock, Settings2, ZapIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { t } from '@/lib/translations';

const historicalTickets: Ticket[] = [
  { id: 'TKT-8105', nodeId: 'N-045', type: 'Hardware', priority: 'High', description: 'Thermal threshold hit previously (Resolved)', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'TKT-7702', nodeId: 'N-012', type: 'Software', priority: 'Medium', description: 'Firmware sync failure', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() }
];

export default function Tickets() {
  const { state, fetchAnalysis, forceState } = useSimulationContext();
  
  const showTicket = ['TICKET_GENERATED', 'AI_ANALYZING', 'AI_RESOLVED'].includes(state);

  const handleForceAnalyze = () => {
    forceState('AI_ANALYZING');
    fetchAnalysis();
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{t("tickets")}</h2>
          <p className="text-sm text-gray-400 mt-1">{t("manage_triage") || "Manage, triage, and route active system alerts."}</p>
        </div>
        <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-md text-gray-300 hover:bg-white/10 transition flex items-center gap-2">
                <FileClock className="w-3.5 h-3.5" /> {t("history")}
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-md text-gray-300 hover:bg-white/10 transition flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5" /> {t("filter")}
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        
        {/* Ticket List */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">{t("active_pending")}</h3>
          <div className="overflow-y-auto pr-2 space-y-4 pb-4">
             <AnimatePresence>
                {showTicket ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative cursor-pointer"
                  >
                    <div className="absolute -inset-1 bg-red-500/20 blur opacity-100 rounded-2xl"></div>
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-red-500/50 rounded-xl z-20"></div>
                    <TicketCard ticket={mockTicket} />
                  </motion.div>
                ) : (
                  <div className="py-10 text-center text-sm text-gray-500 border border-white/5 border-dashed rounded-xl">
                    {t("no_tickets_available")}
                  </div>
                )}
             </AnimatePresence>

             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1 pt-4">{t("resolved_historical")}</h3>
             {historicalTickets.map(tkt => (
                 <div key={tkt.id} className="opacity-50 hover:opacity-80 transition-opacity cursor-pointer grayscale">
                     <TicketCard ticket={tkt} />
                 </div>
             ))}
          </div>
        </div>

        {/* Ticket Details Side */}
        <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-xs font-semibold text-white uppercase tracking-widest px-1">{t("selected_ticket_details")}</h3>
          <div className="overflow-y-auto pr-2 pb-4 h-full">
             {showTicket ? (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="h-full border border-white/10 bg-card/60 rounded-2xl p-6 relative flex flex-col"
                 >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{mockTicket.id}</h2>
                        <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider">
                          {t(mockTicket.priority.toLowerCase())} {t("priority")}
                        </span>
                      </div>
                      <span className="text-sm font-mono text-gray-400">{mockTicket.timestamp}</span>
                    </div>

                    <div className="space-y-6 mb-8">
                       <div>
                         <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t("issue_description")}</p>
                         <p className="text-lg text-gray-200">{mockTicket.description}</p>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/5 rounded-lg p-3">
                           <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t("affected_node")}</p>
                           <p className="text-sm font-bold text-white">{mockTicket.nodeId}</p>
                         </div>
                         <div className="bg-white/5 rounded-lg p-3">
                           <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t("category")}</p>
                           <p className="text-sm font-bold text-white">{t(mockTicket.type.toLowerCase())}</p>
                         </div>
                         <div className="bg-white/5 rounded-lg p-3">
                           <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t("location")}</p>
                           <p className="text-sm font-bold text-white">{mockTicket.location || t("unknown")}</p>
                         </div>
                         <div className="bg-white/5 rounded-lg p-3">
                           <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t("sensor_source")}</p>
                           <p className="text-sm font-bold text-white">{mockTicket.sensorType || t("na")}</p>
                         </div>
                       </div>
                    </div>

                    <div className="mt-auto bg-blue-900/10 border border-blue-500/20 rounded-xl p-5">
                       <h4 className="text-sm font-medium text-blue-300 mb-3 text-center">{t("fast_track_resolution")}</h4>
                       <div className="flex gap-4">
                         <button 
                           onClick={handleForceAnalyze} 
                           className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                         >
                           <ZapIcon className="w-4 h-4" /> {t("analyze")}
                         </button>
                         <Link href="/ai" className="px-6 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all">
                           {t("go_to_diagnostics")} <ArrowRight className="w-4 h-4" />
                         </Link>
                       </div>
                    </div>
                 </motion.div>
             ) : (
                 <div className="h-full min-h-[400px] border border-white/5 border-dashed rounded-xl flex items-center justify-center text-gray-600 text-sm">
                     {t("select_ticket_to_view")}
                 </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
