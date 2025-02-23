// src/services/PanoramaCache.ts
import _ from 'lodash';
import { ConnectedPanorama } from '@/types/Location';

interface CachedPanorama {
  panoId: string;
  data: google.maps.StreetViewPanoramaData;
  timestamp: number;
}

class PanoramaCache {
  private static instance: PanoramaCache;
  private cache: Map<string, CachedPanorama>;
  private pendingRequests: Map<string, Promise<google.maps.StreetViewPanoramaData>>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private streetViewService: google.maps.StreetViewService | null = null;

  private constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  static getInstance(): PanoramaCache {
    if (!PanoramaCache.instance) {
      PanoramaCache.instance = new PanoramaCache();
    }
    return PanoramaCache.instance;
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_DURATION;
  }

  private getStreetViewService(): google.maps.StreetViewService {
    if (!this.streetViewService) {
      if (typeof google === 'undefined') {
        throw new Error('Google Maps API not loaded');
      }
      this.streetViewService = new google.maps.StreetViewService();
    }
    return this.streetViewService;
  }

  async getPanorama(panoId: string): Promise<google.maps.StreetViewPanoramaData> {
    // Check if we have a valid cached entry
    const cached = this.cache.get(panoId);
    if (cached && !this.isExpired(cached.timestamp)) {
      return cached.data;
    }

    // Check if there's already a pending request for this panoId
    let pendingRequest = this.pendingRequests.get(panoId);
    if (pendingRequest) {
      return pendingRequest;
    }

    // Create new request
    try {
      const sv = this.getStreetViewService();
      pendingRequest = sv
        .getPanorama({ pano: panoId })
        .then(response => {
          // Cache the result
          this.cache.set(panoId, {
            panoId,
            data: response.data,
            timestamp: Date.now()
          });
          // Clear the pending request
          this.pendingRequests.delete(panoId);
          return response.data;
        })
        .catch(error => {
          // Clear the pending request on error
          this.pendingRequests.delete(panoId);
          throw error;
        });

      // Store the pending request
      this.pendingRequests.set(panoId, pendingRequest);
      return pendingRequest;
    } catch (error) {
      console.error('Error getting panorama:', error);
      throw error;
    }
  }

  async getConnectedPanoramas(panoId: string): Promise<ConnectedPanorama[]> {
    try {
      const data = await this.getPanorama(panoId);
      if (!data.location?.latLng || !data.links) return [];
      
      // Filter and process links
      return data.links
        .filter((link): link is (google.maps.StreetViewLink & { pano: string; heading: number }) => 
          link.pano !== null && 
          link.heading !== null && 
          typeof link.pano === 'string' && 
          typeof link.heading === 'number'
        )
        .map(link => ({
          pano: link.pano,
          heading: link.heading,
          description: link.description || ''
        }));
    } catch (error) {
      console.error('Error getting connected panoramas:', error);
      return [];
    }
  }

  async batchPreloadPanoramas(panoIds: string[]): Promise<void> {
    // Deduplicate and filter out already cached panoramas
    const uniquePanoIds = _.uniq(panoIds).filter(id => {
      const cached = this.cache.get(id);
      return !cached || this.isExpired(cached.timestamp);
    });

    // Batch requests with a concurrency limit of 3
    const batchSize = 3;
    for (let i = 0; i < uniquePanoIds.length; i += batchSize) {
      const batch = uniquePanoIds.slice(i, i + batchSize);
      await Promise.all(batch.map(id => this.getPanorama(id).catch(err => {
        console.error(`Error preloading panorama ${id}:`, err);
      })));
    }
  }

  clearExpiredCache(): void {
    for (const [panoId, entry] of this.cache.entries()) {
      if (this.isExpired(entry.timestamp)) {
        this.cache.delete(panoId);
      }
    }
  }
}

export default PanoramaCache;