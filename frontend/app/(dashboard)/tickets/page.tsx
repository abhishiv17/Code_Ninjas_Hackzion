'use client';

import { useEffect, useState } from 'react';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { FileClock, Settings2, ZapIcon, PlusCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Tickets() {
  const { fetchAnalysis } = useSimulationContext();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // Submit state
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

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
        if (data.length > 0 && !selectedTicket) {
           setSelectedTicket(data[0]); // preselect latest
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitTicket = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        await fetch('/api/ticket', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ description })
        });
        
        setShowForm(false);
        setDescription('');
        await fetchTickets(); // Refresh immediately
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Incident Tickets</h2>
          <p className="text-sm text-gray-400 mt-1">Manage, triage, and route active system alerts dynamically.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 text-xs font-bold bg-[#00f0ff] hover:bg-cyan-300 text-black rounded-md shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2"
            >
                <PlusCircle className="w-4 h-4" /> New Ticket
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-md text-gray-300 hover:bg-white/10 transition flex items-center gap-2">
                <FileClock className="w-3.5 h-3.5" /> History
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        
        {/* Ticket List */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">Active Database Pipeline</h3>
          
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/5 border border-white/10 rounded-xl mb-2 backdrop-blur-md">
                <h4 className="text-sm font-bold text-white mb-2">Create New Diagnostic Request</h4>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g. Thermal critical spike detected on Node-042..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white mb-3 outline-none focus:border-[#00f0ff] transition-all min-h-[100px]"
                ></textarea>
                <div className="flex gap-2 justify-end">
                   <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition">Cancel</button>
                   <button onClick={submitTicket} disabled={loading} className="px-4 py-1.5 bg-[#00f0ff] hover:bg-cyan-300 text-black text-xs font-bold rounded shadow-[0_0_10px_rgba(0,240,255,0.4)] transition disabled:opacity-50 flex items-center gap-2">
                       {loading ? 'Processing AI...' : 'Submit ->'}
                   </button>
                </div>
            </motion.div>
          )}

          <div className="overflow-y-auto pr-2 space-y-4 pb-4">
             <AnimatePresence>
                {tickets.length > 0 ? tickets.map(tkt => (
                  <motion.div
                    key={tkt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedTicket(tkt)}
                    className={`relative cursor-pointer p-4 rounded-xl transition-all border ${selectedTicket?.id === tkt.id ? 'bg-[#111522] border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className="font-mono text-xs font-bold text-gray-300">TKT-{tkt.id}</span>
                       <span className="text-[10px] text-gray-500">{new Date(tkt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-gray-200 line-clamp-2">{tkt.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                       <span className="text-xs bg-black/40 text-blue-400 px-2 py-1 rounded border border-white/5 font-mono">{(tkt.ai_mode).toUpperCase()} ENGINE</span>
                       {tkt.diagnostic_report?.includes('Confidence') ? (
                          <span className="text-xs text-green-400 font-bold">AI Diagnosed</span>
                       ) : (
                          <span className="text-xs text-yellow-500">Pending AI</span>
                       )}
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-10 text-center text-sm text-gray-500 border border-white/5 border-dashed rounded-xl">
                    No active tickets in database currently.
                  </div>
                )}
             </AnimatePresence>
          </div>
        </div>

        {/* Ticket Details Side */}
        <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
          <h3 className="text-xs font-semibold text-white uppercase tracking-widest px-1">Selected Automated AI Diagnostics</h3>
          <div className="overflow-y-auto pr-2 pb-4 h-full">
             {selectedTicket ? (
                 <motion.div 
                   key={selectedTicket.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="h-full border border-[#00f0ff]/30 bg-card/60 backdrop-blur-lg rounded-2xl p-6 relative flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                 >
                    <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">TKT-{selectedTicket.id}</h2>
                        <span className="inline-block px-3 py-1 bg-[#00f0ff]/20 border border-[#00f0ff]/30 text-[#00f0ff] rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                          {selectedTicket.ai_mode === 'google' ? 'GEMINI LIVE' : 'OFFLINE LLM'} Processing
                        </span>
                      </div>
                      <span className="text-sm font-mono text-gray-400">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                    </div>

                    <div className="space-y-6 mb-8 flex-1">
                       <div>
                         <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Original Sensor Alert / Description</p>
                         <p className="text-lg text-gray-200 bg-black/40 p-4 rounded-lg border border-white/5">{selectedTicket.description}</p>
                       </div>
                       
                       <div>
                           <p className="text-xs text-[#ff7b00] uppercase tracking-widest mb-2 flex items-center gap-2"><ZapIcon className="w-4 h-4"/> Generated AI Report payload</p>
                           <div className="bg-[#111522] border border-[#ff7b00]/30 rounded-xl p-5 shadow-inner">
                               <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap leading-relaxed">
                                   {selectedTicket.diagnostic_report || "No diagnostic mapped yet. Processing failure."}
                               </pre>
                               
                               <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                                   <div>
                                       <span className="text-[10px] uppercase text-gray-500 tracking-wider">Elapsed Processing Time</span>
                                       <div className="text-sm font-bold text-white">{selectedTicket.elapsed_seconds}s latency</div>
                                   </div>
                               </div>
                           </div>
                       </div>
                    </div>

                    <div className="mt-auto bg-green-500/5 border border-green-500/20 rounded-xl p-5">
                       <h4 className="text-sm font-medium text-green-400 mb-3 text-center">Fast-Track Automated Resolution</h4>
                       <div className="flex gap-4">
                         <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all">
                           <ZapIcon className="w-4 h-4" /> Trigger Auto-Healing Subroutine
                         </button>
                         <Link href="/monitoring" className="px-6 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all">
                           Go to Live Maps <ArrowRight className="w-4 h-4" />
                         </Link>
                       </div>
                    </div>
                 </motion.div>
             ) : (
                 <div className="h-full min-h-[400px] border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-600 text-sm gap-4">
                     <p>Select a ticket or generate a new one to view diagnostics.</p>
                     <p className="font-mono text-xs opacity-50">GET /api/tickets resolving empty</p>
                 </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
