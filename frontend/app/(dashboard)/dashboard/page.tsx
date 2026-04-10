'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, ZapIcon, Ticket as TicketIcon } from 'lucide-react';
import { useSimulationContext } from '@/contexts/SimulationContext';
import NodeMap from '@/components/NodeMap';

export default function Dashboard() {
  const { state, apiAnalysis } = useSimulationContext();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine state heuristically based on tickets count/time or simulation state
  const isCritical = state === 'NODE_CRITICAL' || state === 'TICKET_GENERATED' || state === 'AI_ANALYZING';

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/tickets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
        }
      } catch (err) {
        console.error('Failed to fetch ticket activity', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
    
    // Poll for new tickets every 5 seconds
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const totalTickets = tickets.length;
  // If a ticket was created very recently, consider it a critical active alert
  const criticalCount = tickets.filter(t => (Date.now() - new Date(t.created_at).getTime()) < 60000).length;
  
  // Try to parse confidence
  let avgConfidence = 0;
  if (totalTickets > 0) {
    const confs = tickets.map(t => {
      const match = t.diagnostic_report?.match(/Confidence:\s*(\d+)%/);
      return match ? parseInt(match[1]) : 0;
    });
    avgConfidence = Math.round(confs.reduce((a,b) => a+b, 0) / totalTickets);
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto h-full pb-10">
      
      {/* SYSTEM PULSE BAR */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${criticalCount > 0 ? 'bg-red-900/10 border-red-500/30' : 'bg-green-900/10 border-green-500/30'} border rounded-2xl p-4 flex items-center justify-between relative overflow-hidden transition-colors duration-1000`}
      >
        <div className={`absolute inset-0 ${criticalCount > 0 ? 'bg-red-500/5' : 'bg-green-500/5'} animate-pulse duration-[3000ms]`}></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative flex h-4 w-4">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${criticalCount > 0 ? 'bg-red-400' : 'bg-green-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-4 w-4 ${criticalCount > 0 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)]' : 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]'}`}></span>
          </div>
          <span className={`${criticalCount > 0 ? 'text-red-400' : 'text-green-400'} font-bold tracking-widest uppercase text-sm`}>
            {criticalCount > 0 ? 'System Pulse: Critical Alert Active' : 'System Pulse: Operating Normally'}
          </span>
        </div>
        <div className="relative z-10 text-xs font-mono text-gray-400 flex gap-6">
          <span>Global State: <span className="text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">{state}</span></span>
        </div>
      </motion.div>

      {/* LIVE MAP TRACKING */}
      <div className="w-full h-[500px] relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl mt-2 mb-2">
        <NodeMap />
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Logged Tickets</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{totalTickets}</h3>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TicketIcon className="w-5 h-5 text-blue-400" />
              </div>
           </div>
           <div className="text-xs text-green-400 font-medium">Synced exactly via DB</div>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">New Critical Alerts</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{criticalCount}</h3>
              </div>
              <div className={`p-2 rounded-lg ${criticalCount > 0 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                <ShieldCheck className={`w-5 h-5 ${criticalCount > 0 ? 'text-red-400' : 'text-green-400'}`} />
              </div>
           </div>
           <div className={`text-xs font-medium ${criticalCount > 0 ? 'text-red-400' : 'text-gray-500'}`}>Requires immediate attention</div>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">Average MTTR</p>
                <h3 className="text-3xl font-bold mt-1 text-white">1m 12s</h3>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ZapIcon className="w-5 h-5 text-purple-400" />
              </div>
           </div>
           <div className="text-xs text-green-400 font-medium">↑ Improved by GenAI integration</div>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 relative overflow-hidden">
           <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400">AI Confidence (Avg)</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{avgConfidence > 0 ? avgConfidence : 0}%</h3>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
           </div>
           <div className="text-xs text-green-400 font-medium">LLM Diagnostic Validation</div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="mt-4 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Recent Live Activity Feed</h3>
        
        {loading ? (
             <div className="text-center py-6 text-gray-500 text-sm animate-pulse">Loading live events from database...</div>
        ) : tickets.length === 0 ? (
             <div className="text-center py-6 text-gray-500 text-sm border border-white/5 border-dashed rounded-lg">No active ticket events found inside database.</div>
        ) : (
             <div className="space-y-4">
             {tickets.map((t) => {
               // Classify UI by string searching the report or description.
               const isUrgent = t.description.toLowerCase().includes('critical') || t.description.toLowerCase().includes('spike');
               // Extract type
               const typeMatch = t.diagnostic_report?.match(/Type:\s*(.+)/);
               const categoryType = typeMatch ? typeMatch[1] : 'System Event';

               return (
                 <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center justify-between p-4 ${isUrgent ? 'bg-red-900/10 border-red-500/20' : 'bg-white/5 border-white/5'} border rounded-xl`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                      <div>
                        <p className={`text-sm font-medium ${isUrgent ? 'text-red-200' : 'text-gray-200'}`}>TKT-{t.id}: {categoryType}</p>
                        <p className={`text-xs ${isUrgent ? 'text-red-400/70' : 'text-gray-500'} mt-1`}>{t.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                 </motion.div>
               );
             })}
            </div>
        )}
      </div>
      
    </div>
  );
}
