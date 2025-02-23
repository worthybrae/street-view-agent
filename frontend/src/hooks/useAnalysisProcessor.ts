import { useState, useCallback, useEffect, useRef } from 'react';
import { AnalysisControlProps, AnalysisResult } from '@/types/Location';
import ApiService from '@/services/ApiService';
import { QueuedOperation } from './useOperationQueue';
import PanoramaCache from '@/services/PanoramaCache';

interface UseAnalysisProcessorProps extends AnalysisControlProps {
  onUpdateMetrics: (result: AnalysisResult, position: { lat: number; lng: number }, panoId: string) => void;
  important_notes: string[];
}

export const useAnalysisProcessor = (
  props: UseAnalysisProcessorProps,
  addToQueue: (operation: QueuedOperation) => void
) => {
  const [goal, setGoal] = useState("explore the surrounding area");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const lastAnalysisRef = useRef<number>(0);
  const apiService = ApiService.getInstance();
  const panoramaCache = PanoramaCache.getInstance();

  const performAnalysis = useCallback(async () => {
    const { position, pov, metadata, onAnalyze, onUpdateMetrics } = props;
    if (!position || !pov || !metadata?.pano || !window.panorama) return;
    
    // Prevent rapid-fire analysis
    const timeSinceLastAnalysis = Date.now() - lastAnalysisRef.current;
    if (timeSinceLastAnalysis < 2000) {
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      lastAnalysisRef.current = Date.now();

      // Get the image URL first
      const imageUrl = await apiService.getStaticViewUrl(
        position.lat,
        position.lng,
        pov.heading,
        pov.pitch,
        pov.zoom
      );

      const result = await apiService.analyzeView({
        goal,
        latitude: position.lat,
        longitude: position.lng,
        heading: pov.heading,
        pitch: pov.pitch,
        zoom: pov.zoom,
        images: [imageUrl],
        timeline: [], // This should come from props
        panoramas: await panoramaCache.getConnectedPanoramas(metadata.pano),
        metrics: {
          totalActions: 0, // This should come from props
          bounds: {
            minLat: null,
            maxLat: null,
            minLng: null,
            maxLng: null
          }
        },
        important_notes: props.important_notes
      });

      if (!isPlaying) return;

      onUpdateMetrics(result, position, metadata.pano);
      onAnalyze(result);

      // Queue the next operation based on analysis result
      if (result.next_action === 'new_panorama' && result.next_panorama && result.next_heading !== undefined) {
        addToQueue({
          type: 'panorama',
          panoId: result.next_panorama,
          heading: result.next_heading,
          pitch: result.next_pitch,
          zoom: result.next_zoom,
          timestamp: Date.now()
        });
      } else if (result.next_action === 'new_view' && result.next_heading !== undefined) {
        addToQueue({
          type: 'view',
          heading: result.next_heading,
          pitch: result.next_pitch,
          zoom: result.next_zoom,
          timestamp: Date.now()
        });
      }

      if (isPlaying && result.next_action !== 'complete') {
        setIsAnalyzing(false);
      } else {
        setIsPlaying(false);
        setIsAnalyzing(false);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Analysis error:', error);
      setError(errorMessage);
      setIsPlaying(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, [props, goal, isPlaying, addToQueue]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isPlaying && !isAnalyzing) {
      timeoutId = setTimeout(() => {
        performAnalysis();
      }, 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isPlaying, isAnalyzing, performAnalysis]);

  return {
    goal,
    isAnalyzing,
    isPlaying,
    error,
    setGoal,
    setIsPlaying,
    performAnalysis
  };
};