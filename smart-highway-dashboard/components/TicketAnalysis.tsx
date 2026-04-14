'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { CheckCircle2, AlertTriangle, Loader2, XCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export interface TicketAnalysisResult {
  type: string;
  solution: string;
  confidence: number;
  rootCause?: string;
  rootCauseConfidence?: number;
}

interface TicketAnalysisProps {
  ticketDescription: string;
  imageBase64?: string;
  onAnalysisComplete?: (result: TicketAnalysisResult) => void;
}

export function TicketAnalysis({ ticketDescription, imageBase64, onAnalysisComplete }: TicketAnalysisProps) {
  const [analysis, setAnalysis] = useState<TicketAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!ticketDescription.trim()) {
      setError('Please enter a ticket description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get LLM analysis with Vision context
      const llmAnalysis = await apiClient.analyzeTicket(ticketDescription, imageBase64);

      // Get root cause prediction
      const rootCauseAnalysis = await apiClient.predictRootCause(ticketDescription);

      const result: TicketAnalysisResult = {
        type: llmAnalysis.type,
        solution: llmAnalysis.solution,
        confidence: llmAnalysis.confidence,
        rootCause: rootCauseAnalysis.root_cause,
        rootCauseConfidence: rootCauseAnalysis.confidence,
      };

      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-900/10 backdrop-blur-md border border-red-500/30 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px]">
        <XCircle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-1">Analysis Failed</h3>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-blue-900/10 backdrop-blur-md border border-blue-500/30 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Analyzing Ticket...</h3>
        <p className="text-sm text-blue-300">Processing with Groq LLM and ML models</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <button
        onClick={handleAnalyze}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20"
      >
        Analyze with AI
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-900/20 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-blue-500/20">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-blue-200">AI Analysis Results</h3>
      </div>

      {/* Issue Type */}
      <div className="bg-white/5 rounded-lg p-4">
        <p className="text-sm text-slate-400 mb-1">Issue Type</p>
        <p className="text-lg font-semibold text-white">{analysis.type}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              style={{ width: `${analysis.confidence * 100}%` }}
            />
          </div>
          <span className="text-sm text-slate-300">{Math.round(analysis.confidence * 100)}%</span>
        </div>
      </div>

      {/* Solution */}
      <div className="bg-white/5 rounded-lg p-4">
        <p className="text-sm text-slate-400 mb-1">Recommended Solution</p>
        <p className="text-white leading-relaxed">{analysis.solution}</p>
      </div>

      {/* Root Cause */}
      {analysis.rootCause && (
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Root Cause Prediction</p>
          <p className="text-white font-medium mb-2">{analysis.rootCause}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                style={{ width: `${(analysis.rootCauseConfidence || 0) * 100}%` }}
              />
            </div>
            <span className="text-sm text-slate-300">{Math.round((analysis.rootCauseConfidence || 0) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAnalyze}
        className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all border border-white/20"
      >
        Re-analyze
      </button>
    </motion.div>
  );
}

export default TicketAnalysis;
