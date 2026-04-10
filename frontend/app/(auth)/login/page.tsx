"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import AppBackground from "@/components/AppBackground";
import "./login.css";

type ToastT = { msg: string; type: "success" | "error" } | null;

/* ── Icons ─────────────────────────────────────────────── */
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
  </svg>
);
const IconEye = ({ off }: { off?: boolean }) => off ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const SparklineCyan = () => (
  <svg viewBox="0 0 100 30" className="omni-widget-spark" fill="none" stroke="var(--omni-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M0 20 Q 15 20, 25 10 T 50 15 T 75 5 T 100 20" />
  </svg>
);
const SparklinePurple = () => (
  <svg viewBox="0 0 100 30" className="omni-widget-spark" fill="none" stroke="var(--omni-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M0 15 Q 20 5, 40 15 T 70 25 T 90 10 T 100 20" />
  </svg>
);

/* ── Strength util ─────────────────────────────────────── */
function getStrength(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const strLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strColor  = ["", "var(--omni-error)", "var(--omni-orange)", "var(--omni-cyan)", "var(--omni-green)"];

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState<ToastT>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const handleToggle = (val: boolean) => { setIsSignUp(val); setToast(null); };

  const handleSubmit = async () => {
    if (isSignUp) {
      if (!name || !email || !pass) { showToast("Please fill in all fields.", "error"); return; }
      if (pass.length < 8) { showToast("Password must be at least 8 characters.", "error"); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password: pass }),
        });
        let data: any = {};
        try { data = await res.json(); } catch {}
        res.ok ? showToast("Account created! Switch to Sign in.", "success")
               : showToast(data?.detail || "Signup failed", "error");
      } catch { showToast("Network error.", "error"); }
      finally { setLoading(false); }
    } else {
      if (!email || !pass) { showToast("Please fill in all fields.", "error"); return; }
      setLoading(true);
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pass }),
        });
        let data: any = {};
        try { data = await res.json(); } catch {}
        if (res.ok) {
          if (data?.access_token) localStorage.setItem("token", data.access_token);
          showToast("Signed in! Redirecting…", "success");
          setTimeout(() => router.push("/dashboard"), 800);
        } else {
          showToast(data?.detail || "Login failed", "error");
        }
      } catch { showToast("Network error.", "error"); }
      finally { setLoading(false); }
    }
  };

  const strength = getStrength(pass);

  return (
    <div className="omni-body">
      {/* Shared background */}
      <AppBackground />

      {/* Theme toggle */}
      <button
        className="omni-theme-btn"
        onClick={toggleTheme}
        title="Toggle theme"
        type="button"
        id="login-theme-toggle"
      >
        <span>{theme === "dark" ? "☀️" : "🌙"}</span>
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="omni-content">
        {/* ── Left: Hero ── */}
        <div className="omni-left">
          <div className="omni-logo-area">
            <div className="omni-hex" />
            <div className="omni-brand-text">
              <span className="omni-brand-title">OmniSolve</span>
              <span className="omni-brand-sub">2F AI COMMAND CENTER</span>
            </div>
          </div>

          <div className="omni-hero">
            <h1>
              <span className="omni-h-white">AI-Powered.</span>
              <span className="omni-h-grad">Highway Ready.</span>
            </h1>
            <p className="omni-hero-sub">
              Intelligent ticket routing for Smart Highway infrastructure. Diagnose faults, route issues, and resolve incidents in seconds with AI.
            </p>
          </div>

          <div className="omni-pills">
            <div className="omni-pill"><span className="omni-dot" style={{ color: "var(--omni-cyan)" }}/>OmniSolve AI</div>
            <div className="omni-pill"><span className="omni-dot" style={{ color: "var(--omni-orange)" }}/>Smart Highway</div>
            <div className="omni-pill"><span className="omni-dot" style={{ color: "var(--omni-green)" }}/>Real-Time Diagnostics</div>
            <div className="omni-pill"><span className="omni-dot" style={{ color: "var(--omni-purple)" }}/>Next-gen M</div>
          </div>

          <div className="omni-dials">
            <div className="omni-dial cyan" />
            <div className="omni-dial orange" />
          </div>
        </div>

        {/* ── Right: Auth card ── */}
        <div className="omni-right">
          <div className="omni-card">
            {/* Tab toggle */}
            <div className="omni-toggle">
              <button
                className={`omni-toggle-btn ${!isSignUp ? "active" : ""}`}
                onClick={() => handleToggle(false)}
                type="button"
                id="login-tab-signin"
              >
                Sign In
              </button>
              <button
                className={`omni-toggle-btn ${isSignUp ? "active" : ""}`}
                onClick={() => handleToggle(true)}
                type="button"
                id="login-tab-signup"
              >
                Create Account
              </button>
            </div>

            <div className="omni-auth-header">
              <h2>{isSignUp ? "Get started" : "Welcome back"}</h2>
              <div className="omni-auth-sub">{isSignUp ? "// create_account --free" : "// auth --start session"}</div>
            </div>

            {/* Toast */}
            {toast && (
              <div style={{
                marginBottom: 18, padding: "12px 16px", borderRadius: 10,
                background: toast.type === "success" ? "rgba(0,255,136,0.10)" : "rgba(255,75,75,0.10)",
                color: toast.type === "success" ? "var(--omni-green)" : "var(--omni-error)",
                fontSize: "0.87rem", lineHeight: 1.5,
                border: `1px solid ${toast.type === "success" ? "rgba(0,255,136,0.25)" : "rgba(255,75,75,0.25)"}`,
              }}>
                {toast.msg}
              </div>
            )}

            {/* Name field (signup only) */}
            {isSignUp && (
              <div className="omni-input-group">
                <span className="omni-icon-left"><IconUser /></span>
                <input id="signup-name" type="text" className="omni-input" placeholder="FULL NAME"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}

            {/* Email */}
            <div className="omni-input-group">
              <span className="omni-icon-left"><IconMail /></span>
              <input id="auth-email" type="email" className="omni-input" placeholder="EMAIL"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            {/* Password */}
            <div className="omni-input-group">
              <span className="omni-icon-left"><IconLock /></span>
              <input
                id="auth-password"
                type={showPw ? "text" : "password"}
                className="omni-input"
                placeholder="PASSWORD"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
              />
              <button className="omni-icon-right" type="button" onClick={() => setShowPw(!showPw)} title="Toggle visibility">
                <IconEye off={showPw} />
              </button>
            </div>

            {/* Strength bars (signup only) */}
            {isSignUp && pass && (
              <div className="omni-strength">
                <div className="omni-str-bars">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="omni-str-bar"
                      style={strength >= i ? {
                        background: strColor[strength],
                        boxShadow: `0 0 8px ${strColor[strength]}`,
                      } : {}}
                    />
                  ))}
                </div>
                <div className="omni-str-text" style={{ color: strColor[strength] }}>
                  {strLabel[strength]}
                </div>
              </div>
            )}

            <button
              id="auth-submit"
              className="omni-submit"
              onClick={handleSubmit}
              disabled={loading}
              type="button"
            >
              {loading ? "Processing…" : isSignUp ? "Create Account →" : "Sign In →"}
            </button>

            <div className="omni-footer">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button type="button" onClick={() => handleToggle(!isSignUp)}>
                {isSignUp ? "Sign in" : "Create one"}
              </button>
            </div>
          </div>

          {/* Floating data widgets */}
          <div className="omni-widgets">
            <div className="omni-widget">
              <div className="omni-widget-header">AI ANALYTICS</div>
              <div className="omni-widget-value cyan-text">101.58k/s</div>
              <SparklineCyan />
            </div>
            <div className="omni-widget">
              <div className="omni-widget-header">24/7 MONITORING</div>
              <div className="omni-widget-value purple-text">3.79</div>
              <SparklinePurple />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
