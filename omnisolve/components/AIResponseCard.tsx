'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Copy, Database, FileText, Sparkles, AlertTriangle } from 'lucide-react';
import { AIAnalysis } from '@/lib/mockData';

export default function AIResponseCard({ analysis, loading }: { analysis: AIAnalysis | null, loading: boolean }) {
  if (loading) {
    return (
      <div className="bg-card border border-blue-500/30 rounded-xl p-5 flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
          <Sparkles className="w-10 h-10 text-blue-400 animate-pulse relative z-10" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">OmniSolve AI Analyzing</h3>
        <p className="text-sm text-gray-400">Querying RAG vectors and historical tickets...</p>
        
        <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-blue-500/40 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden flex flex-col relative"
    >
      {/* Header */}
      <div className="bg-blue-600/10 px-5 py-3 border-b border-blue-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-blue-100">AI Resolution Plan</h3>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-medium text-blue-100">{analysis.confidence}% Confidence</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {analysis.duplicate && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-100">Duplicate Issue Detected</p>
              <p className="text-xs text-yellow-500/80 mt-1">
                Matches historical ticket <strong>{analysis.similar_ticket}</strong>. Re-using verified resolution steps.
              </p>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recommended Actions</h4>
          <div className="bg-black/40 rounded-lg border border-white/5 p-4 space-y-3">
            {analysis.solution.split('\n').map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/30">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-200 leading-relaxed font-medium">{step.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
           <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference Source</h4>
           <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-md border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
             <div className="flex items-center gap-2">
               <FileText className="w-4 h-4 text-gray-400" />
               <span className="text-xs text-gray-300">{analysis.source}</span>
             </div>
             <ChevronRight className="w-4 h-4 text-gray-500" />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
