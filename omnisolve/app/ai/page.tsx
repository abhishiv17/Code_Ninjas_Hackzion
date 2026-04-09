'use client';

import { useSimulationContext } from '@/contexts/SimulationContext';
import AIResponseCard from '@/components/AIResponseCard';
import ModelPerformance from '@/components/ModelPerformance';
import { Target, ShieldCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIDiagnostics() {
  const { state, apiAnalysis, isApiLoading, apiError } = useSimulationContext();
  
  const showAI = state === 'AI_ANALYZING' || state === 'AI_RESOLVED';
  const aiResolved = state === 'AI_RESOLVED';
  const hasData = showAI || apiAnalysis || isApiLoading || apiError;

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-400 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${state === 'AI_ANALYZING' ? 'bg-blue-500 animate-ping' : 'bg-blue-600'}`}></div>
            OmniSolve AI Engine
          </h2>
          <p className="text-sm text-gray-400 mt-1">Autonomous diagnostics and RAG-integrated incident resolution.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        
        {/* Main AI Response Section */}
        <div className="relative flex-1 min-h-[400px]">
           <AnimatePresence mode="wait">
             {hasData ? (
                <motion.div 
                  key="ai-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full"
                >
                  <AIResponseCard analysis={apiAnalysis} loading={isApiLoading || state === 'AI_ANALYZING'} error={apiError} />
                </motion.div>
             ) : (
                <motion.div 
                  key="standby"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="h-full border border-blue-500/10 bg-blue-900/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-blue-800"
                >
                  <ShieldCheck className="w-16 h-16 opacity-20 mb-4" />
                  <p className="text-lg font-medium text-blue-300">Engine in Standby</p>
                  <p className="text-sm text-blue-500/50 mt-2">Waiting for incident trigger...</p>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Real-time Model Performance Metrics */}
        <div className="shrink-0 mt-4">
           <ModelPerformance active={aiResolved || !!apiAnalysis} />
        </div>

      </div>
    </div>
  );
}
