// src/hooks/useAnalysisMetrics.ts

import { useState, useCallback, useRef } from 'react';
import _ from 'lodash';
import { AnalysisResult, ViewInfo, AnalysisMetrics, ActionTimeline } from '@/types/Location';

export const useAnalysisMetrics = (pov: ViewInfo | null) => {
  const metricsRef = useRef<AnalysisMetrics>({
    totalActions: 0,
    bounds: {
      minLat: null,
      maxLat: null,
      minLng: null,
      maxLng: null,
    },
    recentActions: [],
    timeline: []
  });

  const [metrics, setMetrics] = useState<AnalysisMetrics>(metricsRef.current);

  const updateMetrics = useCallback((
    result: AnalysisResult, 
    currentPosition: { lat: number; lng: number },
    currentPano: string
  ): AnalysisMetrics => {
    console.log('useAnalysisMetrics: Updating metrics with', {
      currentMetrics: metricsRef.current,
      result,
      currentPosition,
      currentPano
    });

    // Create new action for timeline
    const newTimelineAction: ActionTimeline = {
      action: result.next_action,
      panorama: currentPano,
      heading: result.next_heading || pov?.heading || 0,
      pitch: result.next_pitch || pov?.pitch || 0,
      zoom: result.next_zoom || pov?.zoom || 1
    };

    // Create new recent action
    const newAction = {
      timestamp: new Date(),
      result,
      position: currentPosition
    };

    // Calculate new metrics state
    const newMetrics: AnalysisMetrics = {
      totalActions: metricsRef.current.totalActions + 1,
      recentActions: [...metricsRef.current.recentActions, newAction].slice(-5),
      timeline: [...metricsRef.current.timeline, newTimelineAction],
      bounds: {
        minLat: Math.min(currentPosition.lat, metricsRef.current.bounds.minLat ?? currentPosition.lat),
        maxLat: Math.max(currentPosition.lat, metricsRef.current.bounds.maxLat ?? currentPosition.lat),
        minLng: Math.min(currentPosition.lng, metricsRef.current.bounds.minLng ?? currentPosition.lng),
        maxLng: Math.max(currentPosition.lng, metricsRef.current.bounds.maxLng ?? currentPosition.lng)
      }
    };

    console.log('useAnalysisMetrics: New metrics calculated', {
      totalActions: newMetrics.totalActions,
      timelineLength: newMetrics.timeline.length,
      recentActionsLength: newMetrics.recentActions.length,
      bounds: newMetrics.bounds
    });

    // Update both ref and state
    metricsRef.current = newMetrics;
    setMetrics(newMetrics);

    return newMetrics;
  }, [pov]);

  return { metrics, updateMetrics };
};