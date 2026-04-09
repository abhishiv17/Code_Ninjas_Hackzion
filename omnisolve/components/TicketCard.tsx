'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Clock, Cpu, MapPin } from 'lucide-react';
import { Ticket } from '@/lib/mockData';

export default function TicketCard({ ticket }: { ticket: Ticket | null }) {
  if (!ticket) {
    return (
      <div className="bg-card border border-white/5 rounded-xl p-6 h-[200px] flex items-center justify-center flex-col gap-3">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
          <AlertCircle className="w-6 h-6 text-gray-500" />
        </div>
        <p className="text-sm text-gray-500">Awaiting active alerts...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-red-500/30 rounded-xl p-5 shadow-[0_0_20px_rgba(239,68,68,0.05)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-red-500/20 text-red-400 uppercase tracking-wider">{ticket.priority} TICKET</span>
            <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Infrastructure Failure Alert</h3>
        </div>
        
        <div className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">{ticket.type} (OT)</span>
        </div>
      </div>

      <div className="bg-black/40 rounded-lg p-3 border border-white/5 mb-4">
        <p className="text-sm text-gray-300 leading-relaxed">{ticket.description}</p>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>Node {ticket.nodeId}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>0m 14s ago</span>
        </div>
      </div>
    </motion.div>
  );
}
