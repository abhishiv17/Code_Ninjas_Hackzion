'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Alert {
  id: number;
  title: string;
  location: string;
  time: string;
  critical: boolean;
}

interface DashboardContextType {
  selectedAlert: Alert | null;
  setSelectedAlert: (alert: Alert | null) => void;
  ragTerminalQuery: string;
  setRagTerminalQuery: (query: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [ragTerminalQuery, setRagTerminalQuery] = useState('');

  return (
    <DashboardContext.Provider
      value={{
        selectedAlert,
        setSelectedAlert,
        ragTerminalQuery,
        setRagTerminalQuery,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
