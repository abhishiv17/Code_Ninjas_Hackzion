'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { useUser } from '@auth0/nextjs-auth0/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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
  isAuthenticated: boolean;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!auth0Loading) {
      if (auth0User) {
        // In a true environment, roles are mapped via Auth0 permissions scope
        setUser({ email: auth0User.email!, name: auth0User.name || 'User', role: 'admin' });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsHydrated(true);
    }
  }, [auth0User, auth0Loading]);

  const loadDBTickets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets`);
      if (res.ok) setTickets(await res.json());
    } catch {}
  };

  useEffect(() => {
    loadDBTickets();
  }, []);

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

  // Hydrate auth state from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check Backend Health & Establish SSE Telemetry Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const establishSSE = () => {
      // Standard HTTP fetch for initial data & health check
      fetch(`${API_BASE_URL}/api/live-monitoring/${currentTollId}`)
        .then(res => {
           if(res.ok) setBackendOnline(true);
           else setBackendOnline(false);
        }).catch(() => setBackendOnline(false));

      // Open SSE connection for real-time 2-second telemetry without polling
      eventSource = new EventSource(`${API_BASE_URL}/api/live-monitoring-stream/${currentTollId}`);
      
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
    window.location.href = '/auth/login';
  };

  const logout = () => {
    window.location.href = '/auth/logout';
  };

  const createTicket = async (ticket: Omit<TicketData, 'id' | 'createdAt'>) => {
    try {
      await fetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          severity: ticket.severity,
          tollId: ticket.tollId,
          image_base64: ticket.imageBase64
        })
      });
      loadDBTickets(); // Refresh from DB
    } catch (e) {
      console.error("DB Ticket Creation Error", e);
    }
  };

  const resolveTicket = async (id: string) => {
    await fetch(`${API_BASE_URL}/api/tickets/${id}/resolve`, { method: 'PUT' });
    loadDBTickets();
  };

  const assignTicket = async (id: string, assignedTo: string) => {
    await fetch(`${API_BASE_URL}/api/tickets/${id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: assignedTo })
    });
    loadDBTickets();
  };

  const submitFeedback = async (ticketQuery: string, solution: string, wasSuccessful: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
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
      const response = await fetch(`${API_BASE_URL}/api/community-tickets`);
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
      const res = await fetch(`${API_BASE_URL}/api/community-tickets/new`, {
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
      await fetch(`${API_BASE_URL}/api/community-tickets/${id}/rate`, {
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
      const res = await fetch(`${API_BASE_URL}/api/community-tickets/${id}/comment`, {
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
