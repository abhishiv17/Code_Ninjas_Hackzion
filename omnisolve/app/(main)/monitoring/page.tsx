'use client';

import NodeMap from '@/components/NodeMap';
import TelemetryGraph from '@/components/TelemetryGraph';
import { useSimulationContext } from '@/contexts/SimulationContext';
<<<<<<<< HEAD:frontend/app/(dashboard)/monitoring/page.tsx
========
import { t } from '@/lib/translations';
>>>>>>>> 84180915496bdca34c830f3d8a97205236d4fb22:omnisolve/app/(main)/monitoring/page.tsx

export default function Monitoring() {
  const { state } = useSimulationContext();
  const isSpiking = state !== 'IDLE';
  const nodeCritical = state !== 'IDLE' && state !== 'SPIKE_DETECTED';
  return (
    <div className="flex flex-col gap-6 h-full max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t("monitoring")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("interactive_geo_tracking")}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">
        <div className="xl:col-span-3 min-h-[400px] lg:min-h-[500px] bg-card/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative shadow-[0_4px_40px_rgba(0,0,0,0.2)]">
           <NodeMap criticalNodeId={nodeCritical ? 'N-124' : undefined} />
        </div>
        
        <div className="xl:col-span-1 flex xl:flex-col gap-6">
           <div className="flex-1 min-h-[300px]">
             <TelemetryGraph isSpiking={isSpiking} />
           </div>
           <div className="bg-card/40 border border-white/5 rounded-xl p-5 shadow-inner">
             <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-widest text-center">{t("status_summary")}</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{t("total_nodes")}</span>
                  <span className="text-gray-100 font-mono font-bold">50</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{t("healthy")}</span>
                  <span className="text-green-400 font-mono font-bold">48</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{t("warning")}</span>
                  <span className="text-yellow-400 font-mono font-bold">1</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{t("critical")}</span>
                  <span className="text-red-400 font-mono font-bold">1</span>
                </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-white/10 text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-xs text-green-400 font-medium">{t("sensors_active")}</span>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
