/**
 * API utility for communicating with the Python backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';

export interface TicketResponse {
  status: 'success' | 'error';
  response: string;
  error?: string;
}

/**
 * Send a query to the RAG agent backend
 */
export async function solveTicket(query: string): Promise<TicketResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/diagnostics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data: TicketResponse = await response.json();
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      status: 'error',
      response: '',
      error: errorMessage,
    };
  }
}
