'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import NodeMap from '@/components/NodeMap';
import TicketCard from '@/components/TicketCard';
import AIResponseCard from '@/components/AIResponseCard';
import MTTRCard from '@/components/MTTRCard';
import LiveLogs from '@/components/LiveLogs';
import TelemetryGraph from '@/components/TelemetryGraph';
import { Ticket, AIAnalysis, mockTicket, mockAIAnalysis } from '@/lib/mockData';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    // Sequence simulation
    // 1. Wait a bit, then show ticket
    const ticketTimer = setTimeout(() => {
      setTicket(mockTicket);
      setLoadingAI(true);
      
      // 2. Wait for AI to "process" then show analysis
      const aiTimer = setTimeout(() => {
        setLoadingAI(false);
        setAnalysis(mockAIAnalysis);
      }, 4000);
      
      return () => clearTimeout(aiTimer);
    }, 5000); // Trigger after 5 seconds
    
    return () => clearTimeout(ticketTimer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden fixed inset-0">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-6 grid grid-cols-12 gap-4 md:gap-6 overflow-hidden">
        
        {/* Left Section - Node Map (Span 7 cols) */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col">
          <NodeMap />
        </div>

        {/* Right Section - Tickets & AI (Span 5 cols) */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
          <TicketCard ticket={ticket} />
          
          {(loadingAI || analysis) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex-1 min-h-[300px]"
            >
              <AIResponseCard analysis={analysis} loading={loadingAI} />
            </motion.div>
          )}
        </div>

        {/* Bottom Section - Telemetry, Logs, MTTR (Span across bottom, 3 cols each roughly) */}
        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 h-[220px]">
          <div className="h-full">
            <TelemetryGraph />
          </div>
          <div className="h-full">
            <LiveLogs />
          </div>
          <div className="h-full">
            <MTTRCard />
          </div>
        </div>

      </main>
    </div>
  );
}
