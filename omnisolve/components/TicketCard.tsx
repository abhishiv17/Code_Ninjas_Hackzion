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
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="bg-card/40 backdrop-blur-md border border-red-500/20 rounded-2xl p-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.2),0_4px_30px_rgba(239,68,68,0.05)] relative overflow-hidden group hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.2),0_4px_30px_rgba(239,68,68,0.15)] transition-shadow duration-500"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded pl-3 bg-red-500/10 text-red-400 uppercase tracking-widest border border-red-500/20 drop-shadow-[0_0_3px_rgba(239,68,68,0.5)] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>{ticket.priority} TICKET</span>
            <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">{ticket.id}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-100 mt-2 group-hover:text-white transition-colors">{ticket.type} Alert</h3>
        </div>
        
        <div className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">OT Config</span>
        </div>
      </div>

      <div className="bg-black/40 rounded-xl p-3 border border-white/5 mb-4 relative z-10 group-hover:border-white/10 transition-colors">
        <p className="text-sm text-gray-300 leading-relaxed">{ticket.description}</p>
      </div>

      <div className="flex flex-wrap gap-3 relative z-10">
        {ticket.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{ticket.location}</span>
          </div>
        )}
        {ticket.sensorType && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>{ticket.sensorType}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md border border-red-500/10">
          <Clock className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-200">Just now</span>
        </div>
      </div>
    </motion.div>
  );
}
