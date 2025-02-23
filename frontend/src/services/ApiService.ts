// src/services/ApiService.ts
import { AnalysisRequest, AnalysisResult } from '@/types/Location';

class ApiService {
  private static instance: ApiService;
  private readonly baseUrl: string = 'http://localhost:8000';

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  async getStaticViewUrl(
    lat: number,
    lng: number,
    heading: number,
    pitch: number,
    zoom: number
  ): Promise<string> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      heading: heading.toString(),
      pitch: pitch.toString(),
      zoom: zoom.toString()
    });

    const data = await this.fetchJson<{ url: string }>(
      `/streetview/static-url?${params}`
    );
    return data.url;
  }

  async analyzeView(request: AnalysisRequest): Promise<AnalysisResult> {
    return this.fetchJson<AnalysisResult>('/openai/analyze/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  }
}

export default ApiService;