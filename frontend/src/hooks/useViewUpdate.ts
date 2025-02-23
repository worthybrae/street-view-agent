// src/hooks/useViewUpdate.ts
import { useState, useCallback, useRef } from 'react';
import { 
  AnalysisResult, 
  ViewInfo, 
  StreetViewState 
} from '@/types/Location';
import { StreetViewMetadata } from '@/hooks/useStreetView';
import PanoramaCache from '@/services/PanoramaCache';
import { getShortestRotation } from '@/lib/utils';

interface UseViewUpdateProps {
  panorama: google.maps.StreetViewPanorama | null;
  metadata: StreetViewMetadata | null;
  visitedPanoramas: Set<string>;
  setVisitedPanoramas: React.Dispatch<React.SetStateAction<Set<string>>>;
  setStreetViewState: React.Dispatch<React.SetStateAction<StreetViewState>>;
  pov: ViewInfo | null;
}

export const useViewUpdate = ({
  panorama,
  metadata,
  visitedPanoramas,
  setVisitedPanoramas,
  setStreetViewState,
  pov
}: UseViewUpdateProps) => {
  const [isUpdatingView, setIsUpdatingView] = useState(false);
  const [currentPanoId, setCurrentPanoId] = useState<string | null>(null);
  const updateQueueRef = useRef<Promise<void>>(Promise.resolve());
  const isTransitioningRef = useRef(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Smooth rotation animation
  const animateRotation = (
    panorama: google.maps.StreetViewPanorama,
    startHeading: number,
    targetHeading: number,
    duration: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const delta = getShortestRotation(startHeading, targetHeading);

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeInOutCubic for smooth acceleration and deceleration
        const easing = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const currentHeading = startHeading + (delta * easing);
        
        panorama.setPov({
          heading: currentHeading,
          pitch: panorama.getPov().pitch
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  // Wait for panorama transition to complete
  const waitForTransition = async (targetPanoId: string): Promise<void> => {
    const startTime = Date.now();
    const TIMEOUT = 10000;
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!panorama || Date.now() - startTime > TIMEOUT) {
          clearInterval(checkInterval);
          resolve();
          return;
        }

        const currentPano = panorama.getPano();
        if (currentPano === targetPanoId) {
          clearInterval(checkInterval);
          setTimeout(resolve, 1000); // Short wait after transition
        }
      }, 100);
    });
  };

  // Get fresh panorama data
  const getFreshPanoData = async (panoId: string) => {
    const panoramaCache = PanoramaCache.getInstance();
    return panoramaCache.getPanorama(panoId);
  };

  const handleViewUpdate = useCallback(async (result: AnalysisResult) => {
    if (!panorama || isTransitioningRef.current) return;

    try {
      setIsUpdatingView(true);
      isTransitioningRef.current = true;
      
      switch (result.next_action) {
        case 'new_panorama': {
          if (result.next_panorama && result.next_heading !== undefined) {
            if (currentPanoId === result.next_panorama) break;

            // First animate rotation to face the direction of movement
            const currentHeading = panorama.getPov().heading;
            await animateRotation(panorama, currentHeading, result.next_heading, 1500);

            // Set pitch after rotation if specified
            if (result.next_pitch !== undefined) {
              panorama.setPov({
                heading: result.next_heading,
                pitch: result.next_pitch
              });
            }

            // Small pause after rotation
            await sleep(500);

            // Then set new panorama
            panorama.setPano(result.next_panorama);
            
            // Wait for transition
            await waitForTransition(result.next_panorama);
            
            // Get fresh data after transition
            const freshData = await getFreshPanoData(result.next_panorama);
            if (!freshData?.location?.latLng) break;

            if (result.next_zoom !== undefined) {
              panorama.setZoom(result.next_zoom);
            }

            // Update state with fresh data
            const position = freshData.location.latLng;
            setStreetViewState(prev => ({
              ...prev,
              metadata: {
                pano: result.next_panorama!,
                location: {
                  lat: position.lat(),
                  lng: position.lng()
                },
                description: freshData.location?.description || '',
                links: freshData.links || [],
                copyright: freshData.copyright || '',
                imageDate: freshData.imageDate || ''
              },
              position: {
                lat: position.lat(),
                lng: position.lng()
              }
            }));
            
            setCurrentPanoId(result.next_panorama);
            setVisitedPanoramas(prev => new Set([...Array.from(prev), result.next_panorama!]));
          }
          break;
        }

        case 'new_view': {
          if (result.next_heading !== undefined) {
            // Animate rotation to new heading
            const currentHeading = panorama.getPov().heading;
            await animateRotation(panorama, currentHeading, result.next_heading, 1500);
            
            // Set pitch after rotation if specified
            if (result.next_pitch !== undefined) {
              panorama.setPov({
                heading: result.next_heading,
                pitch: result.next_pitch
              });
            }
            
            if (result.next_zoom !== undefined) {
              panorama.setZoom(result.next_zoom);
            }

            // Small pause after movement
            await sleep(500);
            
            if (metadata?.pano) {
              setCurrentPanoId(metadata.pano);
              setVisitedPanoramas(prev => new Set([...Array.from(prev), metadata.pano]));
            }
          }
          break;
        }
      }
    } finally {
      await sleep(500);
      setIsUpdatingView(false);
      isTransitioningRef.current = false;
    }
  }, [panorama, currentPanoId, metadata, setVisitedPanoramas, setStreetViewState]);

  return {
    isUpdatingView,
    handleViewUpdate,
    currentPanoId
  };
};