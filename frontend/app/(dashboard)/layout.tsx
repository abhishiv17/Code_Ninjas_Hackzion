"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AppBackground from "@/components/AppBackground";
import { SimulationProvider } from "@/contexts/SimulationContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div style={{ position: "relative", minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AppBackground />
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "2.5rem", height: "2.5rem",
            border: "3px solid var(--omni-border)",
            borderTopColor: "var(--omni-cyan)",
            borderRadius: "50%",
            animation: "omni-spin 0.8s linear infinite",
          }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--omni-cyan)", letterSpacing: "0.1em" }}>
            AUTHORIZING SESSION…
          </span>
        </div>
      </div>
    );
  }

  return (
    <SimulationProvider>
      {/* Global background behind everything */}
      <AppBackground />

      <div className="dash-shell">
        <Sidebar />
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: "15rem",
          overflowX: "hidden",
          position: "relative",
          zIndex: 1,
        }}>
          <Navbar />
          <main style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            paddingBottom: "5rem",
          }}>
            {children}
          </main>
        </div>
      </div>
    </SimulationProvider>
  );
}
