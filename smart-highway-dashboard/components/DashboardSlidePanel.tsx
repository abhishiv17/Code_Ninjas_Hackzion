'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Activity,
  Wifi,
  Cpu,
  AlertOctagon,
  LogOut,
  User,
  Mail,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { validateEmail } from '@/lib/auth-helpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const snapshotSlides = [
  {
    title: 'Active Vehicles',
    value: '12,405',
    icon: Activity,
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/10',
  },
  {
    title: 'Toll latency',
    value: '42ms',
    icon: Wifi,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
  },
  {
    title: 'Sensors online',
    value: '98.2%',
    icon: Cpu,
    accent: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10 dark:bg-violet-500/10',
  },
  {
    title: 'Open tickets',
    value: '3',
    icon: AlertOctagon,
    accent: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 dark:bg-orange-500/10',
  },
];

export default function DashboardSlidePanel() {
  const router = useRouter();
  const {
    slidePanelOpen,
    setSlidePanelOpen,
    user,
    isAuthenticated,
    logout,
    rehydrateAuthFromStorage,
    systemHealth,
    backendOnline,
  } = useApp();

  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const close = useCallback(() => setSlidePanelOpen(false), [setSlidePanelOpen]);

  const handleSignIn = async () => {
    setMessage(null);
    if (!email || !password) {
      setMessage({ type: 'err', text: 'Email and password required.' });
      return;
    }
    if (!validateEmail(email)) {
      setMessage({ type: 'err', text: 'Invalid email.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'err', text: data.detail || 'Login failed.' });
        return;
      }
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      rehydrateAuthFromStorage();
      setMessage({ type: 'ok', text: 'Signed in successfully.' });
      setPassword('');
    } catch {
      setMessage({ type: 'err', text: 'Network error. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setMessage(null);
    if (!name || !email || !password) {
      setMessage({ type: 'err', text: 'All fields required.' });
      return;
    }
    if (!validateEmail(email)) {
      setMessage({ type: 'err', text: 'Invalid email.' });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: 'err', text: 'Password must be at least 8 characters.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'err', text: data.detail || 'Signup failed.' });
        return;
      }
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        rehydrateAuthFromStorage();
      }
      setMessage({ type: 'ok', text: 'Account created. You can sign in.' });
      setAuthTab('signin');
      setPassword('');
    } catch {
      setMessage({ type: 'err', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    close();
    router.push('/login');
  };

  return (
    <AnimatePresence>
      {slidePanelOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-slate-900/40 dark:bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="slide-panel-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 z-[70] flex h-[100dvh] w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2
                  id="slide-panel-title"
                  className="text-lg font-semibold text-slate-900 dark:text-white"
                >
                  Control center
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Snapshot · Account
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              {/* Horizontal sliding snapshot strip */}
              <section className="mb-10">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Dashboard snapshot
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      backendOnline
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-500/15 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {backendOnline ? 'Live' : 'Offline'}
                  </span>
                </div>
                <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {snapshotSlides.map((slide) => (
                    <div
                      key={slide.title}
                      className={`min-w-[calc(100%-2rem)] shrink-0 snap-center rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:min-w-[200px] ${slide.bg}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {slide.title}
                        </span>
                        <slide.icon size={16} className={slide.accent} />
                      </div>
                      <p className={`text-2xl font-bold ${slide.accent}`}>{slide.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">
                  Swipe horizontally for more metrics
                </p>
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>Active vehicles (live)</span>
                    <span className="font-mono font-medium">
                      {systemHealth.activeVehicles.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Sensor health</span>
                    <span>{systemHealth.sensorsOnline}%</span>
                  </div>
                </div>
              </section>

              {/* Account / auth — after dashboard section */}
              <section className="border-t border-slate-200 pt-8 dark:border-slate-800">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <User size={16} />
                  Account
                </h3>

                {isAuthenticated && user ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
                      <p className="mt-1 font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                      <p className="mt-2 text-xs capitalize text-slate-500">Role: {user.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                    >
                      <LogOut size={18} />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
                      {(['signin', 'signup'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setAuthTab(tab);
                            setMessage(null);
                          }}
                          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                            authTab === tab
                              ? 'bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {tab === 'signin' ? 'Sign in' : 'Sign up'}
                        </button>
                      ))}
                    </div>

                    {message && (
                      <p
                        className={`mb-3 rounded-lg px-3 py-2 text-sm ${
                          message.type === 'ok'
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                            : 'bg-red-500/15 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {message.text}
                      </p>
                    )}

                    {authTab === 'signup' && (
                      <label className="mb-3 block">
                        <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                          Name
                        </span>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                          />
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            placeholder="Ada Lovelace"
                          />
                        </div>
                      </label>
                    )}

                    <label className="mb-3 block">
                      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Email
                      </span>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (authTab === 'signin' ? handleSignIn() : handleSignUp())}
                          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          placeholder="you@example.com"
                        />
                      </div>
                    </label>

                    <label className="mb-4 block">
                      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Password
                      </span>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (authTab === 'signin' ? handleSignIn() : handleSignUp())}
                          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </label>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={authTab === 'signin' ? handleSignIn : handleSignUp}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Please wait…' : authTab === 'signin' ? 'Sign in' : 'Create account'}
                      <ChevronRight size={18} />
                    </button>

                    <p className="mt-4 text-center text-xs text-slate-500">
                      Full-screen auth:{' '}
                      <button
                        type="button"
                        className="text-blue-600 underline dark:text-blue-400"
                        onClick={() => {
                          close();
                          router.push('/login');
                        }}
                      >
                        Open login page
                      </button>
                    </p>
                  </div>
                )}
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
