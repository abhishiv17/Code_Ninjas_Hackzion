'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  getTicketFlowSeries,
  getUrgencyConfidence,
} from '@/lib/liveMonitoringData';
import { Activity, Radio, Video } from 'lucide-react';

const KarnatakaMap = dynamic(
  () => import('@/components/live-monitoring/KarnatakaMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-slate-700/80 bg-slate-950 text-sm text-slate-400">
        Loading Karnataka Map...
      </div>
    ),
  },
);

const TOLL_OPTIONS = Array.from({ length: 50 }, (_, i) => i + 1);

function UrgencyGauge({ value }: { value: number }) {
  const r = 58;
  const stroke = 11;
  const c = 2 * Math.PI * r;
  const dashOffset = c - (value / 100) * c;
  const gradId = 'urgency-ring-grad';

  return (
    <div className="flex h-full min-h-[280px] flex-col justify-between rounded-2xl border border-amber-500/25 bg-gradient-to-b from-amber-950/30 via-slate-900/90 to-slate-950 p-6 shadow-lg shadow-amber-900/10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-200/80">
          AI signal
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">Urgency confidence</h3>
        <p className="mt-1 text-sm text-slate-400">
          Estimated chance that immediate support is needed for this gate.
        </p>
      </div>

      <div className="relative mx-auto flex aspect-square w-full max-w-[200px] items-center justify-center py-4">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="drop-shadow-[0_0_24px_rgba(251,191,36,0.15)]"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="55%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="#1e293b"
            strokeWidth={stroke}
          />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold tabular-nums tracking-tight text-white">
            {value}%
          </span>
          <span className="mt-1 max-w-[9rem] text-xs leading-snug text-slate-400">
            immediate support likelihood
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500">
        Updates when you change the toll gate above.
      </p>
    </div>
  );
}

export default function LiveMonitoringDashboard() {
  const [tollId, setTollId] = useState(1);

  const ticketData = useMemo(() => getTicketFlowSeries(tollId), [tollId]);
  const urgency = useMemo(() => getUrgencyConfidence(tollId), [tollId]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-400">
            <Activity className="h-5 w-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Live monitoring
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">
            Toll plaza overview
          </h1>
          <p className="mt-1 text-slate-400">
            Isometric layout, ticket flow, and AI urgency for the selected gate.
          </p>
        </div>

        <label className="flex w-full flex-col gap-2 sm:w-72">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Toll gate
          </span>
          <select
            value={tollId}
            onChange={(e) => setTollId(Number(e.target.value))}
            className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-inner outline-none ring-blue-500/0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          >
            {TOLL_OPTIONS.map((n) => (
              <option key={n} value={n}>
                Toll {n}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-xl backdrop-blur-sm md:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2 py-1 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            Lanes & booth
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2 py-1 text-slate-300">
            <Video className="h-3.5 w-3.5 text-sky-400" aria-hidden />
            Cameras
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-800/80 px-2 py-1 text-slate-300">
            <Radio className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
            RFID nodes
          </span>
          <span className="ml-auto font-mono text-slate-500">Toll {tollId}</span>
        </div>
        <KarnatakaMap selectedTollId={tollId} onTollSelect={setTollId} />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm lg:col-span-8">
          <h2 className="text-base font-semibold text-white">
            Flow of tickets raised
          </h2>
          <p className="mt-1 text-sm text-slate-400">Last 12 hours (synthetic, gate-specific).</p>
          <div className="mt-4 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ticketData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="hourLabel"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(v) => [`${v ?? '—'} tickets`, 'Raised']}
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4">
          <UrgencyGauge value={urgency} />
        </div>
      </section>
    </div>
  );
}
