'use client';

import React from 'react';
import { Ticket } from '@/lib/mockData';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const isCritical = ticket.priority === 'Critical' || ticket.priority === 'High';
  
  return (
    <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer flex flex-col gap-3 group">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          {ticket.id}
        </span>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-500/20 text-gray-400 border border-white/10'}`}>
          {ticket.priority}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-1">{ticket.description}</h4>
        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {ticket.type} Incident
        </p>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <MapPin className="w-3 h-3" /> {ticket.nodeId}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Calendar className="w-3 h-3" /> {ticket.timestamp}
        </div>
      </div>
    </div>
  );
}
