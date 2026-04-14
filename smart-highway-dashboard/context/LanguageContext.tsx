'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es' | 'hi' | 'kn';

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
    'dash.subtitle': 'Control Grid Command Center - Real-time System Monitoring',
    'dash.activeVehicles': 'Active Vehicles',
    'dash.latency': 'Toll Gate Latency',
    'dash.sensors': 'IoT Sensors Online',
    'dash.openTickets': 'Open IT Tickets',
    'dash.overviewTitle': 'Toll plaza overview',
    'dash.tollGate': 'Toll gate',
    'dash.lanesBooth': 'Lanes & booth',
    'dash.cameras': 'Cameras',
    'dash.rfidNodes': 'RFID nodes',
    'dash.flowTickets': 'Flow of tickets raised',
    'dash.last12Hours': 'Last 12 hours (synthetic, gate-specific).',
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
    'dash.subtitle': 'Control Grid - Centro de Comando - Monitoreo del Sistema',
    'dash.activeVehicles': 'Vehículos Activos',
    'dash.latency': 'Latencia de Peaje',
    'dash.sensors': 'Sensores IoT en Línea',
    'dash.openTickets': 'Tiques Abiertos',
    'dash.overviewTitle': 'Resumen de la plaza de peaje',
    'dash.tollGate': 'Puerta de peaje',
    'dash.lanesBooth': 'Carriles y cabina',
    'dash.cameras': 'Cámaras',
    'dash.rfidNodes': 'Nodos RFID',
    'dash.flowTickets': 'Flujo de tiques creados',
    'dash.last12Hours': 'Últimas 12 horas (sintético, por puerta).',
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
  },
  hi: {
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.tickets': 'टिकट',
    'nav.monitoring': 'लाइव मॉनिटरिंग',
    'nav.diagnostics': 'एआई डायग्नोस्टिक्स',
    'nav.logout': 'लॉग आउट',
    // Topbar
    'topbar.title': 'कमांड सेंटर',
    'topbar.subtitle': 'सिस्टम मॉनिटरिंग और एआई टर्मिनल',
    'topbar.light': 'हल्का',
    'topbar.dark': 'गहरा',
    // Dashboard
    'dash.welcome': 'वापसी पर स्वागत है',
    'dash.subtitle': 'कंट्रोल ग्रिड कमांड सेंटर - रियल-टाइम मॉनिटरिंग',
    'dash.activeVehicles': 'सक्रिय वाहन',
    'dash.latency': 'टोल गेट लेटेंसी',
    'dash.sensors': 'IoT सेंसर ऑनलाइन',
    'dash.openTickets': 'खुले टिकट',
    'dash.overviewTitle': 'टोल प्लाज़ा अवलोकन',
    'dash.tollGate': 'टोल गेट',
    'dash.lanesBooth': 'लेन और बूथ',
    'dash.cameras': 'कैमरे',
    'dash.rfidNodes': 'RFID नोड्स',
    'dash.flowTickets': 'उठाए गए टिकटों का प्रवाह',
    'dash.last12Hours': 'पिछले 12 घंटे (सिंथेटिक, गेट-विशिष्ट)।',
    // System Alerts
    'alerts.title': 'सिस्टम अलर्ट',
    'alerts.subtitle': 'मैनुअल जांचने के लिए अलर्ट क्लिक करें।',
    // Community Tickets
    'community.title': 'समुदाय द्वारा समीक्षा किए गए टिकट',
    'community.subtitle': 'अन्य तकनीशियनों से सत्यापित समाधान।',
    'community.solution': 'समाधान:',
    'community.comments': 'टिप्पणियां',
    'community.leaveComment': 'टिप्पणी छोड़ें...',
    // RAG Terminal
    'rag.title': 'RAG एजेंट टर्मिनल',
    'rag.clear': 'साफ़ करें',
    'rag.placeholder': 'समस्या का वर्णन करें या पूछें...',
    'rag.helpful': 'मददगार',
    'rag.notHelpful': 'मददगार नहीं',
  },
  kn: {
    // Navigation
    'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'nav.tickets': 'ಟಿಕೆಟ್‌ಗಳು',
    'nav.monitoring': 'ಲೈವ್ ಮಾನಿಟರಿಂಗ್',
    'nav.diagnostics': 'ಎಐ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ಸ್',
    'nav.logout': 'ಲಾಗ್ ಔಟ್',
    // Topbar
    'topbar.title': 'ಕಮಾಂಡ್ ಸೆಂಟರ್',
    'topbar.subtitle': 'ಸಿಸ್ಟಮ್ ಮಾನಿಟರಿಂಗ್ ಮತ್ತು ಎಐ ಟರ್ಮಿನಲ್',
    'topbar.light': 'ಬೆಳಕು',
    'topbar.dark': 'ಕತ್ತಲು',
    // Dashboard
    'dash.welcome': 'ಮರಳಿ ಸ್ವಾಗತ',
    'dash.subtitle': 'ಕಂಟ್ರೋಲ್ ಗ್ರಿಡ್ ಕಮಾಂಡ್ ಸೆಂಟರ್ - ರಿಯಲ್ ಟೈಮ್ ಮಾನಿಟರಿಂಗ್',
    'dash.activeVehicles': 'ಸಕ್ರಿಯ ವಾಹನಗಳು',
    'dash.latency': 'ಟೋಲ್ ಗೇಟ್ ಲೇಟೆನ್ಸಿ',
    'dash.sensors': 'IoT ಸೆನ್ಸರ್‌ಗಳು ಆನ್‌ಲೈನ್',
    'dash.openTickets': 'ತೆರೆದ ಟಿಕೆಟ್‌ಗಳು',
    'dash.overviewTitle': 'ಟೋಲ್ ಪ್ಲಾಜಾ ಅವಲೋಕನ',
    'dash.tollGate': 'ಟೋಲ್ ಗೇಟ್',
    'dash.lanesBooth': 'ಲೇನ್‌ಗಳು ಮತ್ತು ಬೂತ್',
    'dash.cameras': 'ಕ್ಯಾಮೆರಾಗಳು',
    'dash.rfidNodes': 'RFID ನೋಡ್‌ಗಳು',
    'dash.flowTickets': 'ಎತ್ತಿದ ಟಿಕೆಟ್‌ಗಳ ಹರಿವು',
    'dash.last12Hours': 'ಕಳೆದ 12 ಗಂಟೆಗಳು (ಸಿಂಥೆಟಿಕ್, ಗೇಟ್-ನಿರ್ದಿಷ್ಟ).',
    // System Alerts
    'alerts.title': 'ಸಿಸ್ಟಮ್ ಅಲರ್ಟ್‌ಗಳು',
    'alerts.subtitle': 'ಕೈಪಿಡಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಅಲರ್ಟ್ ಕ್ಲಿಕ್ ಮಾಡಿ.',
    // Community Tickets
    'community.title': 'ಸಮುದಾಯ ಪರಿಶೀಲಿಸಿದ ಟಿಕೆಟ್‌ಗಳು',
    'community.subtitle': 'ತಂತ್ರಜ್ಞರಿಂದ ಪರಿಶೀಲಿಸಲಾದ ಪರಿಹಾರಗಳು.',
    'community.solution': 'ಪರಿಹಾರ:',
    'community.comments': 'ಕಾಮೆಂಟ್‌ಗಳು',
    'community.leaveComment': 'ಕಾಮೆಂಟ್ ಬರೆಯಿರಿ...',
    // RAG Terminal
    'rag.title': 'RAG ಏಜೆಂಟ್ ಟರ್ಮಿನಲ್',
    'rag.clear': 'ಅಳಿಸಿ',
    'rag.placeholder': 'ಸಮಸ್ಯೆ ವಿವರಿಸಿ ಅಥವಾ ಕೇಳಿ...',
    'rag.helpful': 'ಉಪಯುಕ್ತ',
    'rag.notHelpful': 'ಉಪಯುಕ್ತವಲ್ಲ',
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
