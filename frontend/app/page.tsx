"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ────────────────────────────────────────────── */
type View    = "signin" | "signup" | "forgot";
type Theme   = "dark"   | "light";
type ToastT  = { msg: string; type: "success" | "error" } | null;

/* ─── Password strength helper ─────────────────────────── */
function calcStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  return s;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_CLASSES = ["", "lit-weak", "lit-fair", "lit-good", "lit-strong"];

/* ─── SVG Icons ─────────────────────────────────────────── */
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
);

const IconEye = ({ off }: { off?: boolean }) => off ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconGitHub = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const IconGoogle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
    <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
    <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
    <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);

const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ─── Toast Component ─────────────────────────────────── */
function Toast({ toast }: { toast: ToastT }) {
  if (!toast) return null;
  return (
    <div className={`toast visible ${toast.type}`}>
      {toast.type === "success" ? <IconCheck /> : <IconX />}
      <span>{toast.msg}</span>
    </div>
  );
}

/* ─── Strength Meter ──────────────────────────────────── */
function StrengthMeter({ password }: { password: string }) {
  const score = calcStrength(password);
  const cls   = STRENGTH_CLASSES[score];
  return (
    <>
      <div className="strength-track">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`strength-seg ${i <= score ? cls : ""}`} />
        ))}
      </div>
      {password.length > 0 && (
        <p className="strength-label">{STRENGTH_LABELS[score]}</p>
      )}
    </>
  );
}

/* ─── Sign In View ────────────────────────────────────── */
function SignInView({
  onForgot,
  showToast,
  onOAuth,
}: {
  onForgot: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
  onOAuth: (provider: string) => void;
}) {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !pass) { showToast("Please fill in all fields.", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Enter a valid email address.", "error"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        showToast("Signed in! Redirecting…", "success");
        router.push("/dashboard");
      } else {
        const data = await res.json();
        showToast(data.detail || "Login failed", "error");
      }
    } catch (e) {
      showToast("Network error. Is the backend running?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view visible" key="signin">
      <div className="form-header">
        <h2 className="form-title">Welcome back</h2>
        <p className="form-sub">// sign_in to continue</p>
      </div>

      <div className="field">
        <div className="field-label"><span>Email</span></div>
        <div className="input-wrap">
          <span className="input-icon"><IconMail /></span>
          <input type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
      </div>

      <div className="field">
        <div className="field-label">
          <span>Password</span>
          <a onClick={onForgot} style={{ cursor: "pointer" }}>Forgot?</a>
        </div>
        <div className="input-wrap">
          <span className="input-icon"><IconLock /></span>
          <input type={showPw ? "text" : "password"} placeholder="••••••••"
            value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <button className="toggle-pass" type="button" onClick={() => setShowPw(v => !v)}>
            <IconEye off={showPw} />
          </button>
        </div>
      </div>

      <button className={`btn-primary ${loading ? "loading" : ""}`} onClick={handleSubmit}>
        {loading ? "Signing in…" : "Sign In →"}
      </button>

      <div className="divider">
        <div className="div-line" />
        <span>OR</span>
        <div className="div-line" />
      </div>

      <div className="oauth-row">
        <button className="btn-oauth" onClick={() => onOAuth("GitHub")}>
          <IconGitHub /> GitHub
        </button>
        <button className="btn-oauth" onClick={() => onOAuth("Google")}>
          <IconGoogle /> Google
        </button>
      </div>
    </div>
  );
}

/* ─── Sign Up View ────────────────────────────────────── */
function SignUpView({
  showToast,
  onOAuth,
}: {
  showToast: (msg: string, type: "success" | "error") => void;
  onOAuth: (provider: string) => void;
}) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !pass) { showToast("Please fill in all fields.", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Enter a valid email address.", "error"); return;
    }
    if (pass.length < 8) { showToast("Password must be at least 8 characters.", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass })
      });
      if (res.ok) {
        showToast("Account created! You can now log in.", "success");
      } else {
        const data = await res.json();
        showToast(data.detail || "Signup failed", "error");
      }
    } catch (e) {
      showToast("Network error. Is the backend running?", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-view visible" key="signup">
      <div className="form-header">
        <h2 className="form-title">Get started</h2>
        <p className="form-sub">// create_account --free</p>
      </div>

      <div className="field">
        <div className="field-label"><span>Full Name</span></div>
        <div className="input-wrap">
          <span className="input-icon"><IconUser /></span>
          <input type="text" placeholder="Ada Lovelace"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <div className="field-label"><span>Email</span></div>
        <div className="input-wrap">
          <span className="input-icon"><IconMail /></span>
          <input type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <div className="field-label"><span>Password</span></div>
        <div className="input-wrap">
          <span className="input-icon"><IconLock /></span>
          <input type={showPw ? "text" : "password"} placeholder="min. 8 characters"
            value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <button className="toggle-pass" type="button" onClick={() => setShowPw(v => !v)}>
            <IconEye off={showPw} />
          </button>
        </div>
        <StrengthMeter password={pass} />
      </div>

      <button className={`btn-primary ${loading ? "loading" : ""}`}
        onClick={handleSubmit} style={{ marginTop: "8px" }}>
        {loading ? "Creating account…" : "Create Account →"}
      </button>

      <div className="divider">
        <div className="div-line" />
        <span>OR</span>
        <div className="div-line" />
      </div>

      <div className="oauth-row">
        <button className="btn-oauth" onClick={() => onOAuth("GitHub")}>
          <IconGitHub /> GitHub
        </button>
        <button className="btn-oauth" onClick={() => onOAuth("Google")}>
          <IconGoogle /> Google
        </button>
      </div>

      <p className="terms">
        By signing up you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </p>
    </div>
  );
}

/* ─── Forgot Password View ────────────────────────────── */
function ForgotView({
  onBack,
  showToast,
}: {
  onBack: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async () => {
    if (!email) { showToast("Enter your email address.", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Enter a valid email address.", "error"); return;
    }
    setLoading(true);
    // 🔌 TODO: replace with your password reset call
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    showToast("Reset link sent! Check your inbox.", "success");
  };

  return (
    <div className="auth-view visible" key="forgot">
      <button className="back-link" onClick={onBack}>
        <IconArrowLeft /> Back to sign in
      </button>

      <div className="form-header">
        <h2 className="form-title">{sent ? "Check inbox" : "Reset password"}</h2>
        <p className="form-sub">
          {sent ? "// link_sent → check your email" : "// enter_email --reset"}
        </p>
      </div>

      {!sent ? (
        <>
          <div className="field">
            <div className="field-label"><span>Email</span></div>
            <div className="input-wrap">
              <span className="input-icon"><IconMail /></span>
              <input type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>
          </div>

          <button className={`btn-primary ${loading ? "loading" : ""}`} onClick={handleSubmit}>
            {loading ? "Sending…" : "Send Reset Link →"}
          </button>
        </>
      ) : (
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.8rem",
          color: "var(--text-muted)", lineHeight: "1.75"
        }}>
          We sent a password reset link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
          Check your spam folder if it doesn&apos;t arrive in a minute.
        </p>
      )}
    </div>
  );
}

/* ─── Left Panel ──────────────────────────────────────── */
function LeftPanel() {
  const pills = [
    { label: "OAuth ready",       color: "#7C9EFF" },
    { label: "Dark + Light mode", color: "#F0975A" },
    { label: "Form validation",   color: "#6BC9A3" },
    { label: "Password strength", color: "#F0975A" },
    { label: "Next.js 14",        color: "#7C9EFF" },
  ];

  return (
    <section className="left-panel">
      {/* Ambient */}
      <div className="ambient-mesh">
        <div className="mesh-orb orb-a" />
        <div className="mesh-orb orb-b" />
        <div className="mesh-orb orb-c" />
      </div>
      <div className="dot-grid" />

      {/* Floating shapes */}
      <div className="shapes">
        <div className="shape shape-hex" />
        <div className="shape shape-ring" />
        <div className="shape shape-sq" />
        <div className="shape shape-tri" />
        <div className="shape shape-dot-cluster" />
      </div>

      {/* Brand */}
      <div className="l-brand">
        <div className="logo-mark" />
        <div>
          <span className="brand-name">HackProject</span>
          <span className="brand-tag">// drop-in auth kit</span>
        </div>
      </div>

      {/* Hero */}
      <div className="l-hero">
        <h1>
          Build fast.<br />
          <span className="gradient-text">Ship faster.</span>
        </h1>
        <p>
          Replace this copy with your pitch —
          what problem are you solving and for whom?
          You&apos;ve got 48 hours. Make it count.
        </p>
        <div className="feature-pills">
          {pills.map(p => (
            <span key={p.label} className="pill">
              <span className="pill-dot" style={{ background: p.color }} />
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="l-stats">
        <div className="stat">
          <span className="stat-num">48h</span>
          <span className="stat-label">Hack window</span>
        </div>
        <div className="stat">
          <span className="stat-num">∞</span>
          <span className="stat-label">Possibilities</span>
        </div>
        <div className="stat">
          <span className="stat-num">01</span>
          <span className="stat-label">Great idea</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ───────────────────────────────────────── */
export default function AuthPage() {
  const [theme, setTheme]     = useState<Theme>("dark");
  const [tab, setTab]         = useState<"signin" | "signup">("signin");
  const [view, setView]       = useState<View>("signin");
  const [toast, setToast]     = useState<ToastT>(null);
  const toastTimer            = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Sync theme to <html> */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* Toast helper */
  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  /* OAuth stub */
  const handleOAuth = useCallback((provider: string) => {
    // 🔌 TODO: redirect to OAuth provider
    showToast(`Redirecting to ${provider}…`, "success");
  }, [showToast]);

  /* Tab switch */
  const switchTab = (t: "signin" | "signup") => {
    setTab(t);
    setView(t);
    setToast(null);
  };

  return (
    <main className="auth-shell">
      <LeftPanel />

      <section className="right-panel">
        {/* Theme toggle */}
        <button className="theme-toggle" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
          <span className="theme-icon">
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </span>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        <div className="auth-card">
          {/* Show tabs only for signin/signup */}
          {view !== "forgot" && (
            <div className="tab-bar">
              <button className={`tab-btn ${tab === "signin" ? "active" : ""}`}
                onClick={() => switchTab("signin")}>Sign In</button>
              <button className={`tab-btn ${tab === "signup" ? "active" : ""}`}
                onClick={() => switchTab("signup")}>Create Account</button>
            </div>
          )}

          {/* Toast */}
          <Toast toast={toast} />

          {/* Views */}
          {view === "signin" && (
            <SignInView
              onForgot={() => setView("forgot")}
              showToast={showToast}
              onOAuth={handleOAuth}
            />
          )}
          {view === "signup" && (
            <SignUpView showToast={showToast} onOAuth={handleOAuth} />
          )}
          {view === "forgot" && (
            <ForgotView onBack={() => { setView("signin"); setToast(null); }} showToast={showToast} />
          )}

          {/* Bottom switch prompt */}
          {view !== "forgot" && (
            <p className="switch-prompt">
              {view === "signin" ? (
                <>Don&apos;t have an account?{" "}
                  <button onClick={() => switchTab("signup")}>Create one</button></>
              ) : (
                <>Already have an account?{" "}
                  <button onClick={() => switchTab("signin")}>Sign in</button></>
              )}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
