"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUserName(d.name || d.email))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="dash-navbar">
      {/* Left: status */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--omni-text-muted)" }}>
          // system_status:
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--omni-green)" }}>
          <span style={{
            display: "inline-block", width: "0.4rem", height: "0.4rem",
            borderRadius: "50%", background: "var(--omni-green)",
            boxShadow: "0 0 6px var(--omni-green)",
            animation: "omni-pulse 2s ease-in-out infinite",
          }} />
          ONLINE
        </span>
      </div>

      {/* Right: controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        {/* Theme toggle */}
        <button
          id="dash-theme-toggle"
          className="omni-theme-toggle"
          onClick={toggleTheme}
          title="Toggle theme"
          type="button"
        >
          <span style={{ fontSize: "0.85rem" }}>{theme === "dark" ? "☀️" : "🌙"}</span>
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        {/* Notification bell */}
        <button
          style={{
            position: "relative", padding: "0.5rem", borderRadius: "0.5rem",
            color: "var(--omni-text-muted)", background: "none", border: "none",
            cursor: "pointer", transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--omni-text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--omni-text-muted)")}
          title="Notifications"
        >
          <Bell style={{ width: "1rem", height: "1rem" }} />
          <span style={{
            position: "absolute", top: "0.25rem", right: "0.25rem",
            width: "0.4rem", height: "0.4rem", borderRadius: "50%",
            background: "var(--omni-error)",
            boxShadow: "0 0 6px var(--omni-error)",
          }} />
        </button>

        {/* User chip */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.375rem 0.75rem", borderRadius: "0.5rem",
          background: "var(--omni-card)", border: "1px solid var(--omni-border)",
        }}>
          <User style={{ width: "0.875rem", height: "0.875rem", color: "var(--omni-cyan)" }} />
          <span style={{
            fontFamily: "var(--font-display)", fontSize: "0.78rem",
            color: "var(--omni-text)", maxWidth: "120px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {userName || "User"}
          </span>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: "0.375rem",
            padding: "0.375rem 0.75rem", borderRadius: "0.5rem",
            color: "var(--omni-text-muted)", background: "none",
            border: "1px solid var(--omni-border)", cursor: "pointer",
            fontSize: "0.75rem", fontWeight: 500,
            transition: "color 0.2s, background 0.2s, border-color 0.2s",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = "var(--omni-error)";
            el.style.background = "rgba(255,75,75,0.08)";
            el.style.borderColor = "rgba(255,75,75,0.3)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = "var(--omni-text-muted)";
            el.style.background = "none";
            el.style.borderColor = "var(--omni-border)";
          }}
          title="Sign out"
        >
          <LogOut style={{ width: "0.875rem", height: "0.875rem" }} />
          Sign out
        </button>
      </div>
    </header>
  );
}
