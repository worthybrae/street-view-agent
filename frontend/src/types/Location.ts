// src/types/Location.ts

import { StreetViewMetadata } from '@/hooks/useStreetView';
import { MapLocation } from '@/services/GoogleMap';

export interface ViewInfo {
  heading: number;
  pitch: number;
  zoom: number;
}

export interface StreetViewState {
  isLoading: boolean;
  isAvailable: boolean;
  isVisible: boolean;
  position: MapLocation | null;
  error: string | null;
  pov: ViewInfo;
  metadata: StreetViewMetadata | null;
}

export interface TimelineEvent {
  timestamp: Date;
  result: AnalysisResult;
}

export interface LocationInfoProps {
    metadata: StreetViewMetadata | null;
    position: MapLocation | null;
    pov: ViewInfo | null;
    isLoading: boolean;
    onAnalyze?: (result: AnalysisResult) => void;
    metrics: AnalysisMetrics;
    notes: string[];
    onUpdateMetrics: (
      result: AnalysisResult,
      position: { lat: number; lng: number },
      panoId: string
    ) => AnalysisMetrics; // Changed from void to AnalysisMetrics
  }
export interface ViewInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

export interface PanoramaLink extends google.maps.StreetViewLink {
  description: string | null;
  heading: number | null;
  pano: string | null;
}

export interface ConnectedPanorama {
  pano: string;
  heading: number;
}

export interface ConnectedPanoramasProps {
  links: PanoramaLink[];
  currentHeading: number;
}

export interface AnalysisControlProps {
  position: MapLocation | null;
  pov: ViewInfo | null;
  metadata: StreetViewMetadata | null;
  onAnalyze: (data: AnalysisResult) => void;
}

export interface AnalysisResult {
    thoughts: string;
    goal_response: string;
    important_notes: string[];
    next_action: 'new_panorama' | 'new_view' | 'complete';
    next_panorama?: string;
    next_heading?: number;
    next_pitch?: number;
    next_zoom?: number;
  }

export interface ActionTimeline {
  action: string;
  panorama: string;
  heading: number;
  pitch: number;
  zoom: number;
}

export interface TimelineEntry extends ActionTimeline {
    timestamp: string;
  }
  
  export interface AnalysisRequest {
    goal: string;
    latitude: number;
    longitude: number;
    heading: number;
    pitch: number;
    zoom: number;
    images: string[];
    timeline: TimelineEntry[];
    panoramas: ConnectedPanorama[];
    metrics: {
      totalActions: number;
      bounds: {
        minLat: number | null;
        maxLat: number | null;
        minLng: number | null;
        maxLng: number | null;
      };
    };
    important_notes: string[];  // Add notes field
    temperature?: number;
    model?: string;
    max_tokens?: number;
  }
// Analytics and metrics interfaces
export interface AnalysisMetrics {
  totalActions: number;
  bounds: {
    minLat: number | null;
    maxLat: number | null;
    minLng: number | null;
    maxLng: number | null;
  };
  recentActions: {
    timestamp: Date;
    result: AnalysisResult;
    position: {
      lat: number;
      lng: number;
    };
  }[];
  timeline: ActionTimeline[];
}

export interface AnalysisStateProps {
  position: MapLocation | null;
  pov: ViewInfo | null;
  metadata: StreetViewMetadata | null;
  onAnalyze: (result: AnalysisResult) => void;
  visitedPanoramas: Set<string>;
  actionTimeline: ActionTimeline[];
}

export interface AnalysisStateManagerProps extends AnalysisControlProps {
    onUpdateMetrics: (
      result: AnalysisResult, 
      position: { lat: number; lng: number }, 
      panoId: string
    ) => AnalysisMetrics;
    metrics: AnalysisMetrics;
    important_notes: string[];
  }
  
  export interface AnalysisOperation {
    type: 'panorama' | 'view';
    panoId?: string;
    heading: number;
    pitch?: number;
    zoom?: number;
    timestamp: number;
  }
  
  export interface TransitionState {
    inProgress: boolean;
    targetPanoId: string | null;
    timestamp: number;
    attempts: number;
  }