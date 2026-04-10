'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockTicket } from '@/lib/mockData';

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

  const fetchAnalysis = async () => {
    setIsApiLoading(true);
    setApiError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: mockTicket.description })
      });
      if (!res.ok) {
        throw new Error("API error");
      }
      const data = await res.json();
      setApiAnalysis(data);
    } catch (error: any) {
      setApiError("Failed to fetch");
    } finally {
      setIsApiLoading(false);
    }
  };

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    let isMounted = true;

    const startSimulation = () => {
      if (!isMounted) return;
      setState('IDLE');
      
      timers.push(setTimeout(() => { if (isMounted) setState('SPIKE_DETECTED') }, 2000));
      timers.push(setTimeout(() => { if (isMounted) setState('NODE_CRITICAL') }, 4000));
      timers.push(setTimeout(() => { if (isMounted) setState('TICKET_GENERATED') }, 5000));
      timers.push(setTimeout(() => { if (isMounted) setState('AI_ANALYZING') }, 6500));
      timers.push(setTimeout(() => { if (isMounted) setState('AI_RESOLVED') }, 9500));
      
      // Loop sequence
      timers.push(setTimeout(() => { if (isMounted) startSimulation() }, 20000)); 
    };

    startSimulation();

    return () => {
      isMounted = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  // Hook API logic into the state machine
  useEffect(() => {
    if (state === 'AI_ANALYZING') {
      fetchAnalysis();
    }
    if (state === 'IDLE') {
      setApiAnalysis(null);
      setApiError(null);
    }
  }, [state]);

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
