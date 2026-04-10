/** Deterministic pseudo-random stream per toll gate (stable across renders). */
export function createTollRng(tollId: number, salt = 0) {
  let s = (tollId * 1103515245 + salt * 2654435761 + 12345) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export type TicketFlowPoint = {
  hourLabel: string;
  tickets: number;
};

/** Last 12 hours of synthetic ticket volume; changes with `tollId`. */
export function getTicketFlowSeries(tollId: number): TicketFlowPoint[] {
  const rng = createTollRng(tollId, 7);
  const base = 12 + (tollId % 11) * 2.2;
  return Array.from({ length: 12 }, (_, i) => {
    const hoursAgo = 11 - i;
    const wave = Math.sin((hoursAgo + tollId * 0.17) * 0.55) * 9;
    const noise = rng() * 18;
    const tickets = Math.max(
      0,
      Math.round(base + wave + noise + (i / 11) * 6),
    );
    return {
      hourLabel: hoursAgo === 0 ? 'Now' : `${hoursAgo}h`,
      tickets,
    };
  });
}

/** AI urgency confidence % (45–98), derived from toll selection. */
export function getUrgencyConfidence(tollId: number): number {
  const rng = createTollRng(tollId, 901);
  return Math.round(45 + rng() * 53);
}

export function getLaneCount(tollId: number): number {
  const rng = createTollRng(tollId, 3);
  return 3 + Math.floor(rng() * 4);
}

export function getCameraCountPerLane(tollId: number): number {
  return 1 + (tollId % 3);
}

export function getRfidNodesPerLane(tollId: number): number {
  return 2 + (tollId % 4);
}
