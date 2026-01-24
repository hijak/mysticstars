/**
 * API Client for MysticStars backend
 * Handles all communication with the horoscope API
 */

export interface LuckyInfluences {
  number: number | null;
  color: string | null;
  time: string | null;
}

export interface HoroscopeData {
  daily: string | null;
  love: string | null;
  career: string | null;
  health: string | null;
  lucky: LuckyInfluences;
}

export interface CompleteHoroscopeResponse {
  success: boolean;
  zodiacSign: string;
  data: HoroscopeData;
  validFrom: string;
  validUntil: string;
  generatedAt: string;
  warnings?: string[];
}

export interface ReadingResponse {
  success: boolean;
  data: {
    zodiacSign: string;
    readingType: string;
    content: string;
    validFrom: string;
    validUntil: string;
    generatedAt: string;
    isCurrentlyValid: boolean;
  };
}

export interface AllReadingsResponse {
  success: boolean;
  zodiacSign: string;
  data: Record<string, {
    content: string;
    validFrom: string;
    validUntil: string;
    generatedAt: string;
    isCurrentlyValid: boolean;
  }>;
  availableTypes: string[];
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    if (typeof window === 'undefined') {
      // Server-side: Always use internal Docker network
      this.baseUrl = 'http://api:3000';
    } else {
      // Client-side: Use env var or default
      this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    }
  }

  /**
   * Get complete horoscope data for a zodiac sign
   * Includes daily, love, career, health readings and lucky influences
   */
  async getCompleteHoroscope(sign: string): Promise<CompleteHoroscopeResponse> {
    const response = await fetch(`${this.baseUrl}/api/readings/${sign.toLowerCase()}/complete`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch horoscope for ${sign}`);
    }

    return response.json();
  }

  /**
   * Get a specific reading type for a zodiac sign
   */
  async getReading(sign: string, type: string): Promise<ReadingResponse> {
    const response = await fetch(`${this.baseUrl}/api/readings/${sign.toLowerCase()}/${type.toLowerCase()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch ${type} reading for ${sign}`);
    }

    return response.json();
  }

  /**
   * Get all available readings for a zodiac sign
   */
  async getAllReadings(sign: string): Promise<AllReadingsResponse> {
    const response = await fetch(`${this.baseUrl}/api/readings/${sign.toLowerCase()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch readings for ${sign}`);
    }

    return response.json();
  }

  /**
   * Get API status and statistics
   */
  async getStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/readings/status`);

    if (!response.ok) {
      throw new Error('Failed to fetch API status');
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { HoroscopeData, LuckyInfluences, CompleteHoroscopeResponse, ReadingResponse, AllReadingsResponse };
