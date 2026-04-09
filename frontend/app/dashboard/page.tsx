"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

/* ── Types ─────────────────────────────────────────────── */
type User = { email: string; name: string };
type AIMode = "brains" | "google" | "offline" | "unknown";
type Log = { id: number; time: string; level: "info" | "success" | "error" | "warn"; msg: string };

const DEMO_TICKETS = [
  "The Cisco IE 4000 port is flashing amber and the PoE link is down.",
  "Camera 04 at Toll Plaza B is unresponsive, ping fails.",
  "Traffic sensor TS-99 reporting erratic data, suspect power loop.",
  "VMS sign at KM 42 not updating — controller shows heartbeat but no display output.",
];

/* ── Helpers ────────────────────────────────────────────── */
function now() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

function AiChip({ mode }: { mode: AIMode }) {
  const map: Record<AIMode, { label: string; color: string }> = {
    brains:  { label: "RAG · Groq LLM",       color: "#6BC9A3" },
    google:  { label: "Google Gemini Flash",   color: "#7C9EFF" },
    offline: { label: "Offline Fallback",      color: "#F0975A" },
    unknown: { label: "Checking…",             color: "#888" },
  };
  const { label, color } = map[mode] ?? map.unknown;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "3px 10px", borderRadius: "20px",
      border: `1px solid ${color}33`, background: `${color}18`,
      color, fontSize: "0.72rem", fontFamily: "var(--font-mono)",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%", background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: "pulse 2s infinite",
      }} />
      {label}
    </span>
  );
}

function StatusDot({ online }: { online: boolean }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: online ? "#6BC9A3" : "#ff4d6d",
      boxShadow: online ? "0 0 6px #6BC9A3" : "0 0 6px #ff4d6d",
      flexShrink: 0,
    }} />
  );
}

/* ── Main Dashboard ─────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser]           = useState<User | null>(null);
  const [loading, setLoading]     = useState(true);
  const [aiMode, setAiMode]       = useState<AIMode>("unknown");
  const [ticketDesc, setTicketDesc] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [elapsed, setElapsed]     = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [logs, setLogs]           = useState<Log[]>([]);
  const logIdRef                  = useRef(0);
  const logBoxRef                 = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, level: Log["level"] = "info") => {
    setLogs(prev => [...prev, { id: ++logIdRef.current, time: now(), level, msg }]);
  };

  /* Scroll logs to bottom */
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  /* Auth guard + health check */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    addLog("Authenticating session...", "info");
    fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error("Unauthorized"); return r.json(); })
      .then(data => {
        setUser(data);
        addLog(`Session verified for ${data.email}`, "success");
        setLoading(false);
        return fetch("/api/health");
      })
      .then(r => r?.json())
      .then(h => {
        if (h?.ai_mode) {
          setAiMode(h.ai_mode as AIMode);
          addLog(`AI engine online — mode: ${h.ai_mode}`, "success");
        }
      })
      .catch(() => {
        addLog("Auth failed — redirecting to login", "error");
        localStorage.removeItem("token");
        router.push("/");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleSubmit = async () => {
    if (!ticketDesc.trim()) return;
    setSubmitting(true);
    setAiResponse("");
    setElapsed(null);
    addLog(`Ticket submitted: "${ticketDesc.slice(0, 60)}…"`, "info");
    addLog("Routing to AI diagnostics engine…", "info");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description: ticketDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiResponse(data.diagnostic_report);
        setElapsed(data.elapsed_seconds);
        if (data.ai_mode) setAiMode(data.ai_mode as AIMode);
        addLog(`Diagnostics complete in ${data.elapsed_seconds}s`, "success");
      } else {
        setAiResponse("🔴 Error: " + (data.detail || "Unknown error"));
        addLog("AI engine returned an error", "error");
      }
    } catch {
      setAiResponse("🔴 Network error — is the backend running?");
      addLog("Network error reaching backend", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading state ──────────────────────────────────── */
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0a0a0f", flexDirection: "column", gap: "1rem",
      }}>
        <div style={{ width: 40, height: 40, border: "3px solid #7C9EFF33",
          borderTopColor: "#7C9EFF", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ color: "#7C9EFF", fontFamily: "monospace", fontSize: "0.85rem" }}>
          Authorizing session…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Main render ──────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes shimmer{ from{background-position:-200% 0} to{background-position:200% 0} }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }

        .card {
          background: #0f0f1a;
          border: 1px solid #1e1e38;
          border-radius: 12px;
          padding: 1.5rem;
          animation: fadeUp 0.4s ease forwards;
        }
        .card-title {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 1rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .btn-primary {
          width: 100%; padding: 0.85rem 1rem;
          background: linear-gradient(135deg, #7C9EFF, #5b7fe8);
          color: #fff; border: none; border-radius: 8px;
          font-weight: 600; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Inter', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px #7C9EFF44;
        }
        .btn-primary:disabled {
          background: #1e1e38; color: #666; cursor: not-allowed;
        }
        .btn-ghost {
          padding: 0.5rem 1rem;
          background: transparent; border: 1px solid #2a2a44;
          color: #aaa; border-radius: 6px;
          cursor: pointer; font-size: 0.8rem;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .btn-ghost:hover { border-color: #666; color: #eee; }

        .pill-btn {
          padding: 5px 12px;
          background: #14142a; border: 1px solid #2a2a44;
          color: #999; border-radius: 20px;
          cursor: pointer; font-size: 0.72rem;
          transition: all 0.2s;
          font-family: 'JetBrains Mono', monospace;
          text-align: left; line-height: 1.4;
        }
        .pill-btn:hover { border-color: #7C9EFF88; color: #ccc; background: #1a1a30; }

        textarea.ticket-input {
          width: 100%; min-height: 130px;
          background: #060610; border: 1px solid #1e1e38;
          border-radius: 8px; color: #e0e0f0;
          padding: 1rem; font-size: 0.88rem; resize: vertical;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.7; transition: border-color 0.2s;
          outline: none;
        }
        textarea.ticket-input:focus { border-color: #7C9EFF66; }
        textarea.ticket-input::placeholder { color: #333; }

        .terminal {
          background: #06060e;
          border: 1px solid #1a1a30;
          border-radius: 8px;
          padding: 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          line-height: 1.8;
          color: #00ff88;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-y: auto;
          max-height: 320px;
        }
        .log-entry { display: flex; gap: 10px; align-items: flex-start; }
        .log-time  { color: #444; flex-shrink: 0; }
        .log-info  { color: #7C9EFF; }
        .log-success { color: #6BC9A3; }
        .log-error { color: #ff4d6d; }
        .log-warn  { color: #F0975A; }

        .stat-card {
          background: #0f0f1a; border: 1px solid #1e1e38;
          border-radius: 10px; padding: 1rem 1.2rem;
          display: flex; flex-direction: column; gap: 4px;
        }
        .stat-num { font-size: 1.6rem; font-weight: 700; color: #e0e0f0; }
        .stat-lbl { font-size: 0.72rem; color: #666; font-family: 'JetBrains Mono', monospace; }

        .loading-bar {
          height: 3px; border-radius: 2px;
          background: linear-gradient(90deg, #7C9EFF, #6BC9A3, #7C9EFF);
          background-size: 200% 100%;
          animation: shimmer 1.4s linear infinite;
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', sans-serif", color: "#e0e0f0" }}>

        {/* ── Top Nav ──────────────────────────────────────── */}
        <header style={{
          borderBottom: "1px solid #1e1e38",
          padding: "0.85rem 2rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#0a0a0f",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "8px",
              background: "linear-gradient(135deg,#7C9EFF,#5b7fe8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem",
            }}>🛣️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1 }}>Smart Highway IT Support</div>
              <div style={{ fontSize: "0.7rem", color: "#666", fontFamily: "'JetBrains Mono',monospace" }}>
                // AI-powered field diagnostics
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AiChip mode={aiMode} />
            <span style={{ fontSize: "0.82rem", color: "#888" }}>
              {user?.name}
            </span>
            <button className="btn-ghost" onClick={handleLogout}>Sign out</button>
          </div>
        </header>

        {/* ── Body ─────────────────────────────────────────── */}
        <main style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {[
              { num: aiMode === "brains" ? "RAG" : aiMode === "google" ? "LLM" : "—", lbl: "AI Engine" },
              { num: elapsed != null ? `${elapsed}s` : "—", lbl: "Last Response" },
              { num: "24/7", lbl: "Monitoring" },
              { num: logs.filter(l => l.level === "success").length.toString(), lbl: "Resolved" },
            ].map(s => (
              <div key={s.lbl} className="stat-card">
                <span className="stat-num">{s.num}</span>
                <span className="stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "1.5rem" }}>

            {/* ── Left: Submit ────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

              <div className="card">
                <div className="card-title">📥 Submit Ticket</div>
                <textarea
                  className="ticket-input"
                  value={ticketDesc}
                  onChange={e => setTicketDesc(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && e.ctrlKey && handleSubmit()}
                  placeholder="Describe the fault — device model, error codes, LED status, network symptoms…"
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "0.75rem 0" }}>
                  {DEMO_TICKETS.map(t => (
                    <button key={t} className="pill-btn" onClick={() => setTicketDesc(t)}>
                      {t.slice(0, 45)}…
                    </button>
                  ))}
                </div>
                {submitting && <div className="loading-bar" style={{ marginBottom: "0.75rem" }} />}
                <button className="btn-primary" onClick={handleSubmit} disabled={submitting || !ticketDesc.trim()}>
                  {submitting ? (
                    <>
                      <span style={{ width: 14, height: 14, border: "2px solid #ffffff55", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                      Running AI Diagnostics…
                    </>
                  ) : "🚀 Run AI Diagnostics"}
                </button>
                <p style={{ fontSize: "0.7rem", color: "#444", marginTop: "0.5rem", textAlign: "center", fontFamily: "'JetBrains Mono',monospace" }}>
                  Ctrl+Enter to submit
                </p>
              </div>

              {/* System Status */}
              <div className="card">
                <div className="card-title">System Status</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "FastAPI Backend",    online: true },
                    { label: "AI Engine",          online: aiMode !== "offline" },
                    { label: "Auth (JWT)",         online: !!user  },
                    { label: "Vector DB (Chroma)", online: aiMode === "brains" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem" }}>
                      <StatusDot online={s.online} />
                      <span style={{ color: "#ccc", flex: 1 }}>{s.label}</span>
                      <span style={{ color: s.online ? "#6BC9A3" : "#ff4d6d", fontSize: "0.72rem", fontFamily: "'JetBrains Mono',monospace" }}>
                        {s.online ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Output + Logs ─────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

              {/* AI Output */}
              <div className="card" style={{ flex: 1 }}>
                <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>🧠 AI Diagnostics Output</span>
                  {elapsed != null && (
                    <span style={{ fontSize: "0.7rem", color: "#6BC9A3", fontFamily: "'JetBrains Mono',monospace" }}>
                      {elapsed}s
                    </span>
                  )}
                </div>
                {aiResponse ? (
                  <div className="terminal" style={{ maxHeight: 280 }}>
                    {aiResponse}
                  </div>
                ) : (
                  <div style={{
                    background: "#06060e", border: "1px solid #1a1a30", borderRadius: "8px",
                    padding: "2rem", textAlign: "center",
                    color: "#333", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.8rem",
                  }}>
                    {submitting ? "⏳ Querying AI engine…" : "// System idle — submit a ticket to begin"}
                  </div>
                )}
              </div>

              {/* Activity Log */}
              <div className="card">
                <div className="card-title" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>📋 Activity Log</span>
                  <button className="btn-ghost" style={{ padding: "2px 8px", fontSize: "0.68rem" }}
                    onClick={() => setLogs([])}>Clear</button>
                </div>
                <div ref={logBoxRef} className="terminal" style={{ maxHeight: 200, color: "#ccc" }}>
                  {logs.length === 0
                    ? <span style={{ color: "#333" }}>// No activity yet</span>
                    : logs.map(l => (
                      <div key={l.id} className="log-entry">
                        <span className="log-time">[{l.time}]</span>
                        <span className={`log-${l.level}`}>{l.msg}</span>
                      </div>
                    ))
                  }
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
