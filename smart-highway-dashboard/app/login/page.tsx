'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconMail, IconLock, IconUser, IconEye, IconArrowLeft, IconSun, IconMoon, IconCheck, IconX } from '@/lib/icons';
import { calcPasswordStrength, validateEmail, STRENGTH_LABELS, getStrengthColor } from '@/lib/auth-helpers';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import dynamic from 'next/dynamic';

const Login3DBackground = dynamic(() => import('@/components/Login3DBackground'), {
  ssr: false,
});

type View = 'signin' | 'signup' | 'forgot' | 'verify_email';
type ToastT = { msg: string; type: 'success' | 'error' } | null;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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

function SignInView({ onForgot, showToast, router, onLogin }: { onForgot: () => void; showToast: (msg: string, type: 'success' | 'error') => void; router: any; onLogin: (token: string, user: any) => void }) {
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
        onLogin(data.access_token, data.user);
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

      <div className="my-4 flex items-center justify-between before:border-t before:flex-1 before:border-slate-700 after:border-t after:flex-1 after:border-slate-700">
        <span className="px-2 text-xs text-slate-500 uppercase">Or continue with</span>
      </div>

      <button 
        onClick={() => {
          showToast('Google OAuth simulated successfully. Redirecting...', 'success');
          onLogin('google-token', { email: 'demo@google.com', name: 'Google User', role: 'engineer' });
          setTimeout(() => router.push('/dashboard'), 1000);
        }} 
        className={`w-full flex items-center justify-center gap-3 py-2.5 rounded-lg font-medium transition bg-white text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700`}
      >
        <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>

      <button onClick={handleSubmit} disabled={loading} className={`w-full py-2.5 rounded-lg mt-4 font-medium transition ${loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'}`}>
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>
    </div>
  );
}

function SignUpView({ showToast, router, onLogin, onSignUpSuccess }: { showToast: (msg: string, type: 'success' | 'error') => void; router: any; onLogin: (token: string, user: any) => void; onSignUpSuccess: () => void }) {
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
        // Strict Validation Rule simulated: Don't automatically log them in! Ask them to verify email.
        showToast('Account built securely. Verification email triggered.', 'success');
        onSignUpSuccess(); 
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

      <div className="my-4 flex items-center justify-between before:border-t before:flex-1 before:border-slate-700 after:border-t after:flex-1 after:border-slate-700">
        <span className="px-2 text-xs text-slate-500 uppercase">Or continue with</span>
      </div>

      <button 
        onClick={() => {
          showToast('Google OAuth simulated successfully. Redirecting...', 'success');
          onLogin('google-token', { email: 'demo@google.com', name: 'Google User', role: 'engineer' });
          setTimeout(() => router.push('/dashboard'), 1000);
        }} 
        className={`w-full flex items-center justify-center gap-3 py-2.5 rounded-lg font-medium transition bg-white text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700`}
      >
        <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>

      <button onClick={handleSubmit} disabled={loading} className={`w-full py-2.5 rounded-lg mt-4 font-medium transition ${loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'}`}>
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
  const { login } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [view, setView] = useState<View>('signin');
  const [toast, setToast] = useState<ToastT>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      <Login3DBackground isDark={theme === 'dark'} />

      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-20 rounded-lg border p-2 ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50 text-yellow-400 hover:bg-slate-700' : 'border-slate-200 bg-white/50 text-slate-700 hover:bg-white'}`}
      >
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>

      <div className={`w-full max-w-md relative z-10 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-2xl border rounded-2xl p-8 shadow-2xl`}>
        {view !== 'forgot' && view !== 'verify_email' && (
          <div className="flex gap-2 mb-6 border-b border-slate-700/50">
            <button onClick={() => switchTab('signin')} className={`px-4 py-2 font-medium border-b-2 transition ${tab === 'signin' ? 'text-blue-400 border-blue-400' : 'text-slate-400 border-transparent hover:text-slate-200'}`}>
              Sign In
            </button>
            <button onClick={() => switchTab('signup')} className={`px-4 py-2 font-medium border-b-2 transition ${tab === 'signup' ? 'text-blue-400 border-blue-400' : 'text-slate-400 border-transparent hover:text-slate-200'}`}>
              Create Account
            </button>
          </div>
        )}

        <Toast toast={toast} />

        {view === 'signin' && <SignInView onForgot={() => setView('forgot')} showToast={showToast} router={router} onLogin={login} />}
        {view === 'signup' && <SignUpView showToast={showToast} router={router} onLogin={login} onSignUpSuccess={() => setView('verify_email')} />}
        {view === 'forgot' && <ForgotView onBack={() => { setView('signin'); setToast(null); }} showToast={showToast} />}
        {view === 'verify_email' && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconMail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Verify your inbox</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We've sent a magic link to your email. Click it to verify your account securely and finish authentication.
            </p>
            <button
              onClick={() => setView('signin')}
              className="mt-6 text-blue-500 hover:text-blue-400 font-medium transition"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {view !== 'forgot' && view !== 'verify_email' && (
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
