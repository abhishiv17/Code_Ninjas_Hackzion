'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

export interface User {
  email: string;
  name: string;
  role: 'engineer' | 'admin' | 'viewer';
}

export interface SystemAlert {
  id: string;
  title: string;
  location: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  description?: string;
}

export interface TicketData {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  tollId: string;
  assignedTo?: string;
  imageBase64?: string;
}

export interface CommunityComment {
  author: string;
  text: string;
  timestamp: string;
}

export interface CommunityTicketData {
  id: string;
  issue: string;
  solution: string;
  rating: number;
  time: string;
  comments: CommunityComment[];
}

export interface AppContextType {
  // Authentication
  user: User | null;
  isHydrated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;

  // System State
  backendOnline: boolean;
  systemHealth: {
    uptime: string;
    activeVehicles: number;
    latency: number;
    sensorsOnline: number;
    urgencyPercentage: number;
  };
  currentTollId: number;
  setCurrentTollId: (id: number) => void;

  // Alerts & Tickets
  alerts: SystemAlert[];
  selectedAlert: SystemAlert | null;
  setSelectedAlert: (alert: SystemAlert | null) => void;
  tickets: TicketData[];
  createTicket: (ticket: Omit<TicketData, 'id' | 'createdAt'>) => void;
  resolveTicket: (id: string) => void;
  assignTicket: (id: string, user: string) => void;
  ragTerminalQuery: string;
  setRagTerminalQuery: (query: string) => void;

  // Feedback
  submitFeedback: (ticketQuery: string, solution: string, wasSuccessful: boolean) => Promise<void>;

  // Community Tickets
  communityTickets: CommunityTicketData[];
  fetchCommunityTickets: () => Promise<void>;
  createCommunityTicket: (issue: string, solution: string) => Promise<void>;
  rateCommunityTicket: (id: string, type: 'up' | 'down') => Promise<void>;
  commentCommunityTicket: (id: string, text: string) => Promise<void>;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  slidePanelOpen: boolean;
  setSlidePanelOpen: (open: boolean) => void;
  rehydrateAuthFromStorage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initialize auth state from localStorage on client
function getInitialAuthState() {
  if (typeof window === 'undefined') return { user: null, isAuth: false };
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const userData = JSON.parse(userStr);
      return {
        user: {
          email: userData.email,
          name: userData.name || userData.email.split('@')[0],
          role: userData.role || 'engineer' as const,
        },
        isAuth: true,
      };
    } catch (e) {
      console.error('Failed to parse stored user data');
    }
  }
  
  const storedEmail = localStorage.getItem('user_email');
  const storedName = localStorage.getItem('user_name');
  const storedRole = localStorage.getItem('user_role');
  const authenticated = localStorage.getItem('authenticated');

  if (authenticated === 'true' && storedEmail) {
    return {
      user: {
        email: storedEmail,
        name: storedName || storedEmail.split('@')[0],
        role: (storedRole as any) || 'engineer',
      },
      isAuth: true,
    };
  }
  
  return { user: null, isAuth: false };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initialAuth = getInitialAuthState();
  
  // Authentication State
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.isAuth);
  const [isHydrated, setIsHydrated] = useState(false);

  // System State
  const [backendOnline, setBackendOnline] = useState(false);
  const [currentTollId, setCurrentTollId] = useState(1);
  const [systemHealth, setSystemHealth] = useState({
    uptime: '--',
    activeVehicles: 0,
    latency: 0,
    sensorsOnline: 0,
    urgencyPercentage: 0,
  });

  // Alerts & Tickets
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [ragTerminalQuery, setRagTerminalQuery] = useState('');

  // Community Tickets
  const [communityTickets, setCommunityTickets] = useState<CommunityTicketData[]>([]);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [slidePanelOpen, setSlidePanelOpen] = useState(false);

  const rehydrateAuthFromStorage = () => {
    const s = getInitialAuthState();
    setUser(s.user);
    setIsAuthenticated(s.isAuth);
  };

  // Hydrate auth state from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check Backend Health & Establish SSE Telemetry Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const establishSSE = () => {
      // Standard HTTP fetch for initial data & health check
      fetch(`http://127.0.0.1:8000/api/live-monitoring/${currentTollId}`)
        .then(res => {
           if(res.ok) setBackendOnline(true);
           else setBackendOnline(false);
        }).catch(() => setBackendOnline(false));

      // Open SSE connection for real-time 2-second telemetry without polling
      eventSource = new EventSource(`http://127.0.0.1:8000/api/live-monitoring-stream/${currentTollId}`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setBackendOnline(true);
          setSystemHealth({
            uptime: data.uptime,
            activeVehicles: data.active_vehicles,
            latency: Math.round(data.latency),
            sensorsOnline: data.sensors_online,
            urgencyPercentage: data.urgency_percentage || 0
          });
        } catch (e) {
          // parse silently fails
        }
      };

      eventSource.onerror = () => {
        setBackendOnline(false);
        setSystemHealth({ uptime: 'Offline', activeVehicles: 0, latency: 0, sensorsOnline: 0, urgencyPercentage: 0 });
        eventSource?.close();
      };
    };

    establishSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentTollId]);

  const login = (token: string, userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('user_name', userData.name);
    localStorage.setItem('user_role', userData.role || 'engineer');
    localStorage.setItem('authenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('authenticated');
  };

  const createTicket = async (ticket: Omit<TicketData, 'id' | 'createdAt'>) => {
    try {
      // 1. Dispatch to Triage AI via standard fetch or apiClient
      const response = await fetch('http://127.0.0.1:8000/api/triage-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: ticket.title, description: ticket.description, image_base64: ticket.imageBase64 })
      });
      
      let triageData = { severity: ticket.severity, tags: ['Manual'], assignedTo: 'General SysOps' };
      if (response.ok) {
        triageData = await response.json();
      }

      const newTicket: TicketData = {
        ...ticket,
        severity: triageData.severity as any,
        assignedTo: triageData.assignedTo,
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString() // We could add tags if the TicketData interface supports it
      };
      
      setTickets([newTicket, ...tickets]);
    } catch (e) {
      console.error("Triage Error", e);
      // Fallback
      const newTicket: TicketData = {
        ...ticket,
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString()
      };
      setTickets([newTicket, ...tickets]);
    }
  };

  const resolveTicket = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
  };

  const assignTicket = (id: string, assignedTo: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, assignedTo } : t));
  };

  const submitFeedback = async (ticketQuery: string, solution: string, wasSuccessful: boolean) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_query: ticketQuery,
          solution_given: solution,
          was_successful: wasSuccessful,
        }),
      });
      if (!response.ok) throw new Error('Feedback submission failed');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const fetchCommunityTickets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/community-tickets');
      const data = await response.json();
      if (data.status === 'success') {
        setCommunityTickets(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch community tickets', e);
    }
  };

  const createCommunityTicket = async (issue: string, solution: string) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/community-tickets/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue, solution })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCommunityTickets([data.data, ...communityTickets]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const rateCommunityTicket = async (id: string, type: 'up' | 'down') => {
    setCommunityTickets(prev => prev.map(t => t.id === id ? { ...t, rating: type === 'up' ? t.rating + 1 : t.rating - 1 } : t));
    try {
      await fetch(`http://127.0.0.1:8000/api/community-tickets/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const commentCommunityTicket = async (id: string, text: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/community-tickets/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: user?.email || 'User', text })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCommunityTickets(prev => prev.map(t => t.id === id ? data.data : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCommunityTickets();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isHydrated,
        login,
        logout,
        backendOnline,
        systemHealth,
        alerts,
        selectedAlert,
        setSelectedAlert,
        tickets,
        createTicket,
        resolveTicket,
        assignTicket,
        ragTerminalQuery,
        setRagTerminalQuery,
        submitFeedback,
        communityTickets,
        fetchCommunityTickets,
        createCommunityTicket,
        rateCommunityTicket,
        commentCommunityTicket,
        sidebarOpen,
        setSidebarOpen,
        slidePanelOpen,
        setSlidePanelOpen,
        rehydrateAuthFromStorage,
        currentTollId,
        setCurrentTollId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
