'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.tickets': 'Tickets',
    'nav.monitoring': 'Live Monitoring',
    'nav.diagnostics': 'AI Diagnostics',
    'nav.logout': 'Logout',
    // Topbar
    'topbar.title': 'Command Center',
    'topbar.subtitle': 'Live System Monitoring & AI Support Terminal',
    'topbar.light': 'Light',
    'topbar.dark': 'Dark',
    // Dashboard
    'dash.welcome': 'Welcome back',
    'dash.subtitle': 'Smart Highway Command Center - Real-time System Monitoring',
    'dash.activeVehicles': 'Active Vehicles',
    'dash.latency': 'Toll Gate Latency',
    'dash.sensors': 'IoT Sensors Online',
    'dash.openTickets': 'Open IT Tickets',
    // System Alerts
    'alerts.title': 'System Alerts',
    'alerts.subtitle': 'Click an alert to auto-query the manuals.',
    // Community Tickets
    'community.title': 'Community Reviewed Tickets',
    'community.subtitle': 'Verified solutions from other technicians.',
    'community.solution': 'Solution:',
    'community.comments': 'Comments',
    'community.leaveComment': 'Leave a comment...',
    // RAG Terminal
    'rag.title': 'RAG Agent Terminal',
    'rag.clear': 'Clear',
    'rag.placeholder': 'Describe an issue or ask a manual question...',
    'rag.helpful': 'Helpful',
    'rag.notHelpful': 'Not Helpful',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Tablero',
    'nav.tickets': 'Tiques',
    'nav.monitoring': 'Monitoreo en Vivo',
    'nav.diagnostics': 'Diagnóstico de IA',
    'nav.logout': 'Cerrar sesión',
    // Topbar
    'topbar.title': 'Centro de Comando',
    'topbar.subtitle': 'Monitoreo del Sistema e Terminal de IA',
    'topbar.light': 'Claro',
    'topbar.dark': 'Oscuro',
    // Dashboard
    'dash.welcome': 'Bienvenido de nuevo',
    'dash.subtitle': 'Centro de Comando - Monitoreo del Sistema',
    'dash.activeVehicles': 'Vehículos Activos',
    'dash.latency': 'Latencia de Peaje',
    'dash.sensors': 'Sensores IoT en Línea',
    'dash.openTickets': 'Tiques Abiertos',
    // System Alerts
    'alerts.title': 'Alertas del Sistema',
    'alerts.subtitle': 'Haz clic para consultar manuales.',
    // Community Tickets
    'community.title': 'Tiques de la Comunidad',
    'community.subtitle': 'Soluciones verificadas por técnicos.',
    'community.solution': 'Solución:',
    'community.comments': 'Comentarios',
    'community.leaveComment': 'Deja un comentario...',
    // RAG Terminal
    'rag.title': 'Terminal del Agente RAG',
    'rag.clear': 'Limpiar',
    'rag.placeholder': 'Describe un problema o pregunta algo...',
    'rag.helpful': 'Útil',
    'rag.notHelpful': 'No Útil',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
