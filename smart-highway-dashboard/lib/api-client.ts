/**
 * API Client for Smart Highway Backend
 * Connects frontend to Groq LLM and ML Models
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface AnalysisResponse {
  type: string;
  solution: string;
  confidence: number;
}

export interface RootCauseResponse {
  root_cause: string;
  confidence: number;
}

export interface AnomalyResponse {
  status: 'normal' | 'anomaly';
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Health check - verify backend is running
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Health check failed');
      return response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Analyze a support ticket using LLM
   */
  async analyzeTicket(ticket: string, imageBase64?: string): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/solve-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: ticket, image_base64: imageBase64 }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ticket analysis error:', error);
      throw error;
    }
  }

  /**
   * Predict root cause using ML model
   */
  async predictRootCause(description: string): Promise<RootCauseResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predict-root-cause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error(`Root cause prediction failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Root cause prediction error:', error);
      throw error;
    }
  }

  /**
   * Detect anomalies in system metrics
   */
  async detectAnomaly(temperature: number, voltage: number): Promise<AnomalyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/detect-anomaly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ temperature, voltage }),
      });

      if (!response.ok) {
        throw new Error(`Anomaly detection failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Anomaly detection error:', error);
      throw error;
    }
  }

  /**
   * Get API health and info
   */
  async getAPIInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/openapi.json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch API info');
      return response.json();
    } catch (error) {
      console.error('API info error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient();

/**
 * Batch API utility functions
 */
export async function extractTicketAnalysis(ticketDescription: string, imageBase64?: string) {
  try {
    const analysisResult = await apiClient.analyzeTicket(ticketDescription, imageBase64);
    // Root cause ML model is text only currently, but we pass description
    const rootCauseResult = await apiClient.predictRootCause(ticketDescription);

    return {
      analysis: analysisResult,
      rootCause: rootCauseResult,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Batch analysis error:', error);
    throw error;
  }
}

/**
 * Monitor system health
 */
export async function checkSystemHealth(): Promise<{
  backendStatus: 'online' | 'offline';
  responseTime: number;
}> {
  try {
    const startTime = performance.now();
    await apiClient.healthCheck();
    const responseTime = Math.round(performance.now() - startTime);

    return {
      backendStatus: 'online',
      responseTime,
    };
  } catch (error) {
    return {
      backendStatus: 'offline',
      responseTime: 0,
    };
  }
}
