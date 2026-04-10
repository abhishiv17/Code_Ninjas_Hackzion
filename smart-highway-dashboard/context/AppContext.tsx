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
  severity: 'critical' | 'warning' | 'info';
  createdAt: string;
  updatedAt?: string;
  assignedTo?: string;
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
  login: (email: string) => void;
  logout: () => void;

  // System State
  backendOnline: boolean;
  systemHealth: {
    uptime: string;
    activeVehicles: number;
    latency: number;
    sensorsOnline: number;
  };

  // Alerts & Tickets
  alerts: SystemAlert[];
  selectedAlert: SystemAlert | null;
  setSelectedAlert: (alert: SystemAlert | null) => void;
  tickets: TicketData[];
  ragTerminalQuery: string;
  setRagTerminalQuery: (query: string) => void;

  // Feedback
  submitFeedback: (ticketQuery: string, solution: string, wasSuccessful: boolean) => Promise<void>;

  // Community Tickets
  communityTickets: CommunityTicketData[];
  fetchCommunityTickets: () => Promise<void>;
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
  const authenticated = localStorage.getItem('authenticated');

  if (authenticated === 'true' && storedEmail) {
    return {
      user: {
        email: storedEmail,
        name: storedName || storedEmail.split('@')[0],
        role: 'engineer' as const,
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
  const [systemHealth, setSystemHealth] = useState({
    uptime: '99.8%',
    activeVehicles: 12405,
    latency: 42,
    sensorsOnline: 98,
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

  // Check Backend Health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.healthCheck();
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const login = (email: string) => {
    const name = email.split('@')[0];
    const userData = { email, name, role: 'engineer' as const };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_name', name);
    localStorage.setItem('authenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Clear both new and old auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('authenticated');
  };

  const submitFeedback = async (ticketQuery: string, solution: string, wasSuccessful: boolean) => {
    try {
      const response = await fetch('http://127.0.0.1:8001/api/feedback', {
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
      const response = await fetch('http://127.0.0.1:8001/api/community-tickets');
      const data = await response.json();
      if (data.status === 'success') {
        setCommunityTickets(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch community tickets', e);
    }
  };

  const rateCommunityTicket = async (id: string, type: 'up' | 'down') => {
    setCommunityTickets(prev => prev.map(t => t.id === id ? { ...t, rating: type === 'up' ? t.rating + 1 : t.rating - 1 } : t));
    try {
      await fetch(`http://127.0.0.1:8001/api/community-tickets/${id}/rate`, {
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
      const res = await fetch(`http://127.0.0.1:8001/api/community-tickets/${id}/comment`, {
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
        ragTerminalQuery,
        setRagTerminalQuery,
        submitFeedback,
        communityTickets,
        fetchCommunityTickets,
        rateCommunityTicket,
        commentCommunityTicket,
        sidebarOpen,
        setSidebarOpen,
        slidePanelOpen,
        setSlidePanelOpen,
        rehydrateAuthFromStorage,
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
