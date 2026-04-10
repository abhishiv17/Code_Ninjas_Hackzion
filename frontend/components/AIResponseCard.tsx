'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, FileText, Sparkles, AlertTriangle, Cpu, Loader2, XCircle } from 'lucide-react';
import { AIAnalysis } from '@/lib/mockData';
import { t } from '@/lib/translations';

export default function AIResponseCard({ analysis, loading, error }: { analysis: any | null, loading: boolean, error?: string | null }) {
  if (error) {
    return (
      <div className="bg-red-900/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
        <XCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-1">{t('failed_to_analyze')}</h3>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

<<<<<<< HEAD:frontend/components/AIResponseCard.tsx
export default function AIResponseCard({ analysis, loading, error }: { analysis: any | null, loading: boolean, error?: string | null }) {
  if (error) {
    return (
      <div className="bg-red-900/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
        <XCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-1">Failed to analyze</h3>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

=======
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22:omnisolve/components/AIResponseCard.tsx
  if (loading) {
    return (
      <div className="bg-card/60 backdrop-blur-md border border-blue-500/30 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px] shadow-[inset_0_0_30px_rgba(59,130,246,0.1),0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        <div className="relative mb-6">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin relative z-10" />
        </div>
<<<<<<< HEAD:frontend/components/AIResponseCard.tsx
        <h3 className="text-lg font-semibold text-white mb-2">Analyzing...</h3>
        <p className="text-sm text-gray-400">Querying RAG vectors and historical tickets...</p>
        
=======
        <h3 className="text-lg font-semibold text-white mb-2">{t('analyzing')}</h3>
        <p className="text-sm text-gray-400">{t('querying_rag')}</p>

>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22:omnisolve/components/AIResponseCard.tsx
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
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      className="bg-card/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-[inset_0_0_30px_rgba(59,130,246,0.1),0_0_30px_rgba(59,130,246,0.1)] overflow-hidden flex flex-col relative group transition-all duration-300"
    >
      {/* Animated top gradient line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-[length:200%_100%] animate-[gradient_2s_linear_infinite]"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/5 px-5 py-3 border-b border-blue-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 blur-sm animate-pulse rounded-full"></div>
            <Sparkles className="w-4 h-4 text-blue-300 relative z-10 animate-pulse" />
          </div>
<<<<<<< HEAD:frontend/components/AIResponseCard.tsx
          <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">AI Resolution Plan: {analysis.issue_type || analysis.type || 'Unknown'}</h3>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/20 px-2.5 py-1 rounded-md border border-blue-500/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
          <span className="text-xs font-semibold text-blue-100">{analysis.confidence <= 1 ? Math.round(analysis.confidence * 100) : analysis.confidence}% Confidence</span>
=======
          <h3 className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{t('ai_resolution_plan')} {analysis.issue_type || analysis.type || 'Unknown'}</h3>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/20 px-2.5 py-1 rounded-md border border-blue-500/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
          <span className="text-xs font-semibold text-blue-100">{analysis.confidence <= 1 ? Math.round(analysis.confidence * 100) : analysis.confidence}% {t('confidence')}</span>
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22:omnisolve/components/AIResponseCard.tsx
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4 relative z-10">
        {/* Ambient background glow inside the card */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.05)_0%,transparent_50%)] pointer-events-none"></div>

        {analysis.duplicate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border border-yellow-500/30 rounded-xl p-3 flex gap-3 items-start shadow-[inset_0_0_15px_rgba(234,179,8,0.1)]"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
            <div>
              <p className="text-sm font-semibold text-yellow-200">{t('duplicate_issue')}</p>
              <p className="text-xs text-yellow-500/90 mt-1 font-medium">
                {t('matches_historical')} <strong className="text-yellow-300 bg-yellow-500/20 px-1 py-0.5 rounded">{analysis.similar_ticket}</strong>. (Resolved in {analysis.similar_ticket_time}). Optimizing parameters.
              </p>
            </div>
          </motion.div>
        )}

        {analysis.root_cause && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-col gap-1">
<<<<<<< HEAD:frontend/components/AIResponseCard.tsx
            <span className="text-xs text-gray-500 uppercase tracking-widest">Root Cause</span>
=======
            <span className="text-xs text-gray-500 uppercase tracking-widest">{t('root_cause')}</span>
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22:omnisolve/components/AIResponseCard.tsx
            <span className="text-sm text-gray-200 font-medium">{analysis.root_cause}</span>
          </motion.div>
        )}

        {analysis.why_solution && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-col gap-1">
<<<<<<< HEAD:frontend/components/AIResponseCard.tsx
            <span className="text-xs text-gray-500 uppercase tracking-widest">Why This Solution?</span>
=======
            <span className="text-xs text-gray-500 uppercase tracking-widest">{t('why_solution')}</span>
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22:omnisolve/components/AIResponseCard.tsx
            <span className="text-sm text-blue-200 italic">{analysis.why_solution}</span>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('plan_of_action')}</h4>
            {analysis.estimated_time && (
              <span className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400">{t('est_time')} {analysis.estimated_time}</span>
            )}
          </div>
          <div className="bg-black/40 rounded-lg border border-white/5 p-4 space-y-3">
            {analysis.steps ? (
<<<<<<< HEAD:frontend/components/AIResponseCard.tsx
               analysis.steps.map((step: string, i: number) => (
                <motion.div 
                  key={i} 
=======
              analysis.steps.map((step: string, i: number) => (
                <motion.div
                  key={i}
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22:omnisolve/components/AIResponseCard.tsx
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + (i * 0.2) }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/30">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed font-medium">{step.replace(/^\d+\.\s*/, '')}</p>
                </motion.div>
<<<<<<< HEAD:frontend/components/AIResponseCard.tsx
               ))
            ) : (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/30">
                    1
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed font-medium">{analysis.solution}</p>
                </motion.div>
=======
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
                className="flex gap-3 items-start"
              >
                <div className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-500/30">
                  1
                </div>
                <p className="text-sm text-gray-200 leading-relaxed font-medium">{analysis.solution}</p>
              </motion.div>
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22:omnisolve/components/AIResponseCard.tsx
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-auto pt-4 border-t border-white/5 space-y-2"
        >
<<<<<<< HEAD:frontend/components/AIResponseCard.tsx
           <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference Source</h4>
           <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-md border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
             <div className="flex items-center gap-2">
               <FileText className="w-4 h-4 text-gray-400" />
               <span className="text-xs text-gray-300">{analysis.source}</span>
             </div>
             <ChevronRight className="w-4 h-4 text-gray-500" />
           </div>
=======
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('reference_source')}</h4>
          <div className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-md border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-300">{analysis.source}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </div>
>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22:omnisolve/components/AIResponseCard.tsx
        </motion.div>
      </div>
    </motion.div>
  );
}
