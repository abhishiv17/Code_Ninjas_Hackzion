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
  type: 'Hardware' | 'Software' | 'Network';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  timestamp: string;
}

export interface AIAnalysis {
  ticketId: string;
  issue_type: string;
  priority: string;
  solution: string;
  confidence: number;
  source: string;
  duplicate: boolean;
  similar_ticket: string;
}

// Generate 50 mock nodes in a grid-like layout
export const mockNodes: HighwayNode[] = Array.from({ length: 50 }, (_, i) => ({
  id: `N-${100 + i}`,
  x: (i % 10) * 10 + Math.random() * 5, // Percentages for positioning
  y: Math.floor(i / 10) * 20 + 10 + Math.random() * 5,
  state: i === 24 ? 'critical' : i === 12 ? 'warning' : 'healthy',
  label: `HWY-${100 + i}`
}));

export const mockTicket: Ticket = {
  id: 'TKT-8992',
  nodeId: 'N-124',
  type: 'Hardware',
  priority: 'Critical',
  description: 'Temperature sensor threshold exceeded. Potential fire hazard in control panel.',
  timestamp: new Date().toISOString(),
};

export const mockAIAnalysis: AIAnalysis = {
  ticketId: 'TKT-8992',
  issue_type: 'Hardware (Overheating)',
  priority: 'Critical',
  solution: '1. Isolate Power to Panel B immediately.\n2. Dispatch response unit.\n3. Replace 15A fuse and thermal sensor module.',
  confidence: 94,
  source: 'Vendor Manual: Section 4 - Thermal Management (Page 42)',
  duplicate: true,
  similar_ticket: 'TKT-8105'
};

export const mockLogs = [
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
  load: 30 + Math.random() * 20
}));
