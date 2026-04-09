import { useState, useEffect } from 'react';

export type SimulationState = 'IDLE' | 'SPIKE_DETECTED' | 'NODE_CRITICAL' | 'TICKET_GENERATED' | 'AI_ANALYZING' | 'AI_RESOLVED';

export function useSimulation() {
  const [state, setState] = useState<SimulationState>('IDLE');

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

  return { state };
}
