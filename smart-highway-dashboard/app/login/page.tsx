'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconMail, IconLock, IconUser, IconEye, IconArrowLeft, IconSun, IconMoon, IconCheck, IconX } from '@/lib/icons';
import { calcPasswordStrength, validateEmail, STRENGTH_LABELS, getStrengthColor } from '@/lib/auth-helpers';

type View = 'signin' | 'signup' | 'forgot';
type Theme = 'dark' | 'light';
type ToastT = { msg: string; type: 'success' | 'error' } | null;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';

function Toast({ toast }: { toast: ToastT }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg flex items-center gap-2 z-50 ${toast.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
      {toast.type === 'success' ? <IconCheck /> : <IconX />}
      <span>{toast.msg}</span>
    </div>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const score = calcPasswordStrength(password);
  return (
    <>
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= score ? getStrengthColor(score) : 'bg-slate-700'}`} />
        ))}
      </div>
      {password.length > 0 && <p className="text-xs text-slate-400 mt-1">{STRENGTH_LABELS[score]}</p>}
    </>
  );
}

function SignInView({ onForgot, showToast, router }: { onForgot: () => void; showToast: (msg: string, type: 'success' | 'error') => void; router: any }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !pass) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (!validateEmail(email)) {
      showToast('Enter a valid email address.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('Signed in! Redirecting…', 'success');
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        const data = await res.json();
        showToast(data.detail || 'Login failed', 'error');
      }
    } catch (e) {
      showToast('Network error. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-sm text-slate-400">// sign_in to continue</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-slate-400"><IconMail /></span>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition" />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-300">Password</label>
          <a onClick={onForgot} className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">Forgot?</a>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-3 text-slate-400"><IconLock /></span>
          <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition" />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200">
            <IconEye off={showPw} />
          </button>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading} className={`w-full py-2.5 rounded-lg font-medium transition ${loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>
    </div>
  );
}

function SignUpView({ showToast, router }: { showToast: (msg: string, type: 'success' | 'error') => void; router: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !pass) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (!validateEmail(email)) {
      showToast('Enter a valid email address.', 'error');
      return;
    }
    if (pass.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('Account created! Redirecting…', 'success');
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        const data = await res.json();
        showToast(data.detail || 'Signup failed', 'error');
      }
    } catch (e) {
      showToast('Network error. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Get started</h2>
        <p className="text-sm text-slate-400">// create_account --free</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-slate-400"><IconUser /></span>
          <input type="text" placeholder="Ada Lovelace" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-slate-400"><IconMail /></span>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-slate-400"><IconLock /></span>
          <input type={showPw ? 'text' : 'password'} placeholder="min. 8 characters" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition" />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200">
            <IconEye off={showPw} />
          </button>
        </div>
        <StrengthMeter password={pass} />
      </div>

      <button onClick={handleSubmit} disabled={loading} className={`w-full py-2.5 rounded-lg font-medium transition ${loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
        {loading ? 'Creating account…' : 'Create Account →'}
      </button>
    </div>
  );
}

function ForgotView({ onBack, showToast }: { onBack: () => void; showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      showToast('Enter your email address.', 'error');
      return;
    }
    if (!validateEmail(email)) {
      showToast('Enter a valid email address.', 'error');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    showToast('Reset link sent! Check your inbox.', 'success');
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-4">
        <IconArrowLeft /> Back to sign in
      </button>

      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{sent ? 'Check inbox' : 'Reset password'}</h2>
        <p className="text-sm text-slate-400">{sent ? '// link_sent → check your email' : '// enter_email --reset'}</p>
      </div>

      {!sent ? (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400"><IconMail /></span>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className={`w-full py-2.5 rounded-lg font-medium transition ${loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {loading ? 'Sending…' : 'Send Reset Link →'}
          </button>
        </>
      ) : (
        <p className="text-sm text-slate-400 leading-relaxed">
          We sent a password reset link to <strong className="text-slate-200">{email}</strong>. Check your spam folder if it doesn&apos;t arrive in a minute.
        </p>
      )}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('dark');
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [view, setView] = useState<View>('signin');
  const [toast, setToast] = useState<ToastT>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const switchTab = (t: 'signin' | 'signup') => {
    setTab(t);
    setView(t);
    setToast(null);
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br ${theme === 'dark' ? 'from-slate-950 via-slate-900 to-slate-950' : 'from-slate-50 via-white to-slate-100'} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        className={`fixed top-4 right-4 p-2 rounded-lg border z-20 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-white/50 border-slate-200 text-slate-700 hover:bg-white'}`}
      >
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>

      {/* Card */}
      <div className={`w-full max-w-md relative z-10 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-slate-200'} backdrop-blur-xl border rounded-2xl p-8 shadow-2xl`}>
        {view !== 'forgot' && (
          <div className="flex gap-2 mb-6 border-b border-slate-700">
            <button onClick={() => switchTab('signin')} className={`px-4 py-2 font-medium border-b-2 transition ${tab === 'signin' ? 'text-blue-400 border-blue-400' : 'text-slate-400 border-transparent hover:text-slate-200'}`}>
              Sign In
            </button>
            <button onClick={() => switchTab('signup')} className={`px-4 py-2 font-medium border-b-2 transition ${tab === 'signup' ? 'text-blue-400 border-blue-400' : 'text-slate-400 border-transparent hover:text-slate-200'}`}>
              Create Account
            </button>
          </div>
        )}

        <Toast toast={toast} />

        {view === 'signin' && <SignInView onForgot={() => setView('forgot')} showToast={showToast} router={router} />}
        {view === 'signup' && <SignUpView showToast={showToast} router={router} />}
        {view === 'forgot' && <ForgotView onBack={() => { setView('signin'); setToast(null); }} showToast={showToast} />}

        {view !== 'forgot' && (
          <p className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {view === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => switchTab('signup')} className="text-blue-400 hover:text-blue-300">
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => switchTab('signin')} className="text-blue-400 hover:text-blue-300">
                  Sign in
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </main>
  );
}
