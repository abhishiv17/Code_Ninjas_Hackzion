export type NodeState = 'healthy' | 'warning' | 'critical';

export interface HighwayNode {
  id: string;
  x: number;
  y: number;
  state: NodeState;
  label: string;
}

export interface Ticket {
  id: string;
  nodeId: string;
  type: 'Hardware' | 'Software' | 'Network' | string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  description: string;
  timestamp: string;
  location?: string;
  sensorType?: string;
}

export interface AIAnalysis {
  ticketId: string;
  issue_type: string;
  root_cause?: string;
  priority: string;
  solution: string;
  steps?: string[];
  why_solution?: string;
  estimated_time?: string;
  confidence: number;
  source: string;
  duplicate: boolean;
  similar_ticket: string;
  similar_ticket_time?: string;
}

// Generate 50 mock nodes in a grid-like layout
export const mockNodes: HighwayNode[] = Array.from({ length: 50 }, (_, i) => ({
  id: `N-${100 + i}`,
  x: (i % 10) * 10 + Math.random() * 5,
  y: Math.floor(i / 10) * 20 + 10 + Math.random() * 5,
  state: 'healthy', // All healthy initially for simulation
  label: `HWY-${100 + i}`
}));

export const mockTicket: Ticket = {
  id: 'T-101',
  nodeId: 'HWY-042',
  type: 'Hardware',
  priority: 'Critical',
  description: 'Thermal spike detected in control panel.',
  timestamp: 'Live',
  location: 'Sector 4, Mile Marker 12',
  sensorType: 'Thermal (T-INFRARED)',
};

export const mockAIAnalysis: AIAnalysis = {
  ticketId: 'T-101',
  issue_type: 'Hardware',
  root_cause: 'Thermal fuse F-15 overloaded due to ambient heat spike.',
  priority: 'Critical',
  solution: 'Replace 15A fuse in Panel B',
  steps: [
    'Isolate power to Panel B immediately.',
    'Dispatch physical response unit to HWY-042.',
    'Replace the 15A thermal fuse and recalibrate sensor.'
  ],
  why_solution: 'Historical data shows this resolves 99% of identical thermal anomalies without full grid shutdown.',
  estimated_time: '14 minutes',
  confidence: 94,
  source: 'Vendor Manual: Section 4 / 3 Historical Tickets',
  duplicate: true,
  similar_ticket: 'T-087',
  similar_ticket_time: '12 minutes'
};

export const generateTicketId = () => `T-${Math.floor(Math.random() * 900) + 100}`;

  { time: '14:02:11', msg: 'System check completed. All nodes online.', type: 'info' },
  { time: '14:05:32', msg: 'Traffic anomalies detected on Sector 4.', type: 'warning' },
  { time: '14:15:00', msg: 'Node N-112 reporting latency spike (150ms).', type: 'warning' },
  { time: '14:22:15', msg: 'CRITICAL: Temperature spike at N-124.', type: 'error' },
  { time: '14:22:16', msg: 'Ticket TKT-8992 auto-generated.', type: 'info' },
  { time: '14:22:18', msg: 'AI Analysis requested for TKT-8992...', type: 'info' },
];

export const mockTelemetryData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  temp: i < 15 ? 45 + Math.random() * 5 : 85 + Math.random() * 15,
}));

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  contentSnippet: string;
  relevance: number;
}

export const mockDocs: KnowledgeDoc[] = [
  {
    id: 'DOC-912A',
    title: 'Thermal Management Protocol - Vendor Manual',
    category: 'Hardware OT',
    contentSnippet: 'If temperature sensor threshold exceeds 80C, physically isolate Power to Panel B immediately to prevent severe thermal runaway. Replace the 15A thermal fuse.',
    relevance: 98
  },
  {
    id: 'DOC-441X',
    title: 'Sensor Latency Troubleshooting',
    category: 'Network IT',
    contentSnippet: 'Sudden bandwidth spikes causing latency >100ms across multiple nodes usually signify localized router failure or fiber attenuation at Sector 4.',
    relevance: 62
  },
  {
    id: 'DOC-110B',
    title: 'Firmware Over-the-Air Reversion',
    category: 'Software',
    contentSnippet: 'If continuous bootloop detected on edge processing nodes, initialize reversion command via serial interface to rollback to v2.4 stable.',
    relevance: 45
  }
];
