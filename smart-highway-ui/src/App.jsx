import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Activity, Cpu, Wifi, MessageSquare, LayoutDashboard, Settings, Send, Bot, Zap } from 'lucide-react';
import './App.css';

function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", content: "Smart Highway IT RAG Agent online. Waiting for system queries or manual tickets." }
  ]);
  
  // Auto-scroll for the chat terminal
  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = async (ticketQuery) => {
    const queryToSend = ticketQuery || input;
    if (!queryToSend.trim()) return;

    // Add user message to UI
    const newHistory = [...chatHistory, { role: "user", content: queryToSend }];
    setChatHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      // Connect to Python Backend (brains.py / api.py)
      const res = await fetch("http://127.0.0.1:8000/api/solve-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryToSend })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setChatHistory([...newHistory, { role: "ai", content: data.response }]);
      } else {
        setChatHistory([...newHistory, { role: "ai", content: `Error: ${data.detail}` }]);
      }
    } catch (error) {
      setChatHistory([...newHistory, { role: "ai", content: "❌ Connection failed. Ensure the FastAPI backend is running on port 8000." }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick action function: When user clicks a bug, send it straight to the AI
  const handleAlertClick = (bugDescription) => {
    handleSend(bugDescription);
  };

  return (
    <div className="dashboard-container">
      {/* LEFT SIDEBAR */}
      <div className="sidebar">
        <div className="logo">
          <Zap size={24} /> SmartHighway OS
        </div>
        <div className="nav-item active"><LayoutDashboard size={20} /> Command Center</div>
        <div className="nav-item"><MessageSquare size={20} /> IT Support (RAG)</div>
        <div className="nav-item"><Settings size={20} /> Configurations</div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="header">
          <div>
            <h1>Command Center</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "5px" }}>Live System Monitoring & AI Support</p>
          </div>
          <div className="status-badge"><span style={{ fontSize: '10px' }}>🟢</span> All Systems Nominal</div>
        </div>

        {/* TOP METRICS */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-title">Active Vehicles <Activity size={18} /></div>
            <div className="metric-value">12,405</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Toll Gate Latency <Wifi size={18} /></div>
            <div className="metric-value">42ms</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">IoT Sensors Online <Cpu size={18} /></div>
            <div className="metric-value" style={{ color: 'var(--success)' }}>98.2%</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Open IT Tickets <ShieldAlert size={18} /></div>
            <div className="metric-value" style={{ color: 'var(--warning)' }}>3</div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="bottom-grid">
          {/* Active Alerts Panel */}
          <div className="panel">
            <h2><ShieldAlert size={20} color="var(--danger)" /> System Alerts</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
              Click an alert to auto-query the manuals.
            </p>
            <div className="alert-list">
              <div className="alert-item" onClick={() => handleAlertClick("Switch 3 on Highway Section B is offline. How do I reboot it?")}>
                <strong>Network Switch Offline</strong>
                <span className="alert-time">Section B, Gate 4 • 2 mins ago</span>
              </div>
              <div className="alert-item" onClick={() => handleAlertClick("Camera feed loss on pole 12. Check fiber optic connection protocol.")}>
                <strong>Camera Feed Loss</strong>
                <span className="alert-time">Pole 12 • 15 mins ago</span>
              </div>
              <div className="alert-item" onClick={() => handleAlertClick("RFID reader at Toll 1 not registering tags. Error code E-404.")}>
                <strong>RFID Reader Failure</strong>
                <span className="alert-time">Toll 1 • 1 hr ago</span>
              </div>
            </div>
          </div>

          {/* AI Terminal Panel */}
          <div className="panel">
            <h2><Bot size={20} color="var(--accent-blue)" /> RAG Agent Terminal</h2>
            <div className="terminal-window">
              <div className="chat-history">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
                {loading && (
                  <div className="message ai" style={{ opacity: 0.7 }}>
                    <em>Searching hardware manuals...</em>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="terminal-input-container">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Describe an issue or ask a manual question..."
                  disabled={loading}
                />
                <button onClick={() => handleSend()} disabled={loading || !input.trim()}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;