'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Target, Activity, CheckCircle2 } from 'lucide-react';
import { t } from '@/lib/translations';

export default function ModelPerformance({ active }: { active: boolean }) {
  const [accuracy, setAccuracy] = useState(0);
  const [precision, setPrecision] = useState(0);
  const [recall, setRecall] = useState(0);

  useEffect(() => {
    if (active) {
      let start = 0;
      const duration = 1500; // 1.5 seconds
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function for smoother counting
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAccuracy(Math.floor(easeOutQuart * 92));
        setPrecision(Math.floor(easeOutQuart * 89));
        setRecall(Math.floor(easeOutQuart * 94));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      // Optional: reset when not active
      // setAccuracy(0); setPrecision(0); setRecall(0);
    }
  }, [active]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.2)]"
    >
      {/* Background glow triggers when active */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}></div>
      
      <div className="relative z-10">
        <h3 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-6 flex items-center gap-2">
          <Target className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-gray-500'} transition-colors duration-500`} />
          {t('ai_model_performance')}
        </h3>

        <div className="space-y-6">
          <MetricBar label={t("accuracy")} value={accuracy} target={92} color="bg-blue-500" glow="rgba(59,130,246,0.6)" active={active} icon={Target} subtext={t("correct_predictions")} />
          <MetricBar label={t("precision")} value={precision} target={89} color="bg-purple-500" glow="rgba(168,85,247,0.6)" active={active} icon={CheckCircle2} subtext={t("correct_specific_fixes")} />
          <MetricBar label={t("recall")} value={recall} target={94} color="bg-green-500" glow="rgba(34,197,94,0.6)" active={active} icon={Activity} subtext={t("ability_to_catch")} />
        </div>
      </div>
    </motion.div>
  );
}

function MetricBar({ label, value, target, color, glow, active, icon: Icon, subtext }: { label: string, value: number, target: number, color: string, glow: string, active: boolean, icon: any, subtext: string }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2">
           <div className={`p-1.5 rounded-md ${active ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500'} transition-colors`}>
              <Icon className="w-3.5 h-3.5" />
           </div>
           <div>
             <span className="text-sm font-medium text-gray-200 block">{label}</span>
             <span className="text-[10px] text-gray-500">{subtext}</span>
           </div>
        </div>
        <span className={`text-xl font-bold ${active ? 'text-white' : 'text-gray-600'} transition-colors font-mono`}>{value}%</span>
      </div>
      <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-white/5">
        <motion.div 
          className={`h-full ${color} rounded-full`}
          style={{ width: `${active ? target : 0}%`, boxShadow: active ? `0 0 10px ${glow}` : 'none' }}
          initial={{ width: "0%" }}
          animate={{ width: `${active ? target : 0}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
