'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SimulationState = 'IDLE' | 'SPIKE_DETECTED' | 'NODE_CRITICAL' | 'TICKET_GENERATED' | 'AI_ANALYZING' | 'AI_RESOLVED';

interface SimulationContextProps {
  state: SimulationState;
  apiAnalysis: any;
  apiError: string | null;
  isApiLoading: boolean;
  fetchAnalysis: () => Promise<void>;
  forceState: (newState: SimulationState) => void;
}

const SimulationContext = createContext<SimulationContextProps | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationState>('IDLE');
  const [apiAnalysis, setApiAnalysis] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);

  // Poll for tickets natively in context to run simulation across all views
  const fetchAnalysis = async () => {
    setIsApiLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("API call failed");
      
      const data = await res.json();
      
      if (data.length > 0) {
        const latest = data[0]; // Assuming sorted DESC
        
        // Parse the report text back into object structure for AI view
        const typeMatch = latest.diagnostic_report?.match(/Type:\s*(.+?)\n/);
        const solutionMatch = latest.diagnostic_report?.match(/Solution:\s*([\s\S]+?)\n\nConfidence/);
        const confidenceMatch = latest.diagnostic_report?.match(/Confidence:\s*(\d+)%/);

        const type = typeMatch ? typeMatch[1] : latest.type || 'Unknown';
        const solution = solutionMatch ? solutionMatch[1] : 'No solution detailed.';
        const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 90;

        setApiAnalysis({
          type,
          issue_type: type,
          solution,
          confidence,
          root_cause: latest.description,
          source: 'FastAPI + RAG DB',
          steps: [solution, 'Apply patch', 'Monitor logs'] // Mock steps based on solution
        });

        // Trigger simulation state depending on how recent the ticket is
        const ageInSeconds = (Date.now() - new Date(latest.created_at).getTime()) / 1000;
        
        if (ageInSeconds < 10) {
           setState('TICKET_GENERATED');
           setTimeout(() => setState('AI_ANALYZING'), 1000);
           setTimeout(() => setState('AI_RESOLVED'), 3000);
        } else if (ageInSeconds < 60) {
           setState('AI_RESOLVED');
        } else {
           setState('IDLE');
        }

      } else {
        setState('IDLE');
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Database Sync Error");
    } finally {
      setIsApiLoading(false);
    }
  };

  useEffect(() => {
     fetchAnalysis();
     const interval = setInterval(fetchAnalysis, 8000);
     return () => clearInterval(interval);
  }, []);

  const forceState = (newState: SimulationState) => {
    setState(newState);
  };

  return (
    <SimulationContext.Provider value={{ state, apiAnalysis, apiError, isApiLoading, fetchAnalysis, forceState }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationContext() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulationContext must be used within a SimulationProvider');
  }
  return context;
}
