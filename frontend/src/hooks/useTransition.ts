import { useState, useCallback } from 'react';
import { useRotationAnimation } from './useRotationAnimation';
import { setPanoramaOptions, waitForPanoTransition } from '@/lib/utils';
import PanoramaCache from '@/services/PanoramaCache';

interface TransitionState {
  inProgress: boolean;
  targetPanoId: string | null;
  attempts: number;
}

export const useTransitions = () => {
  const [error, setError] = useState<string | null>(null);
  const [transitionState, setTransitionState] = useState<TransitionState>({
    inProgress: false,
    targetPanoId: null,
    attempts: 0
  });

  const { animateRotation } = useRotationAnimation();
  const panoramaCache = PanoramaCache.getInstance();

  const validateTransition = useCallback(async (panoId: string): Promise<boolean> => {
    if (!window.panorama) return false;
    try {
      const data = await panoramaCache.getPanorama(panoId);
      return !!data?.location?.pano;
    } catch (error) {
      console.error('Transition validation failed:', error);
      return false;
    }
  }, []);

  const transitionToPanorama = useCallback(async (
    targetPanoId: string,
    heading: number,
    pitch: number = 0,
    zoom: number | undefined = undefined
  ): Promise<boolean> => {
    if (!window.panorama || transitionState.inProgress) {
      return false;
    }

    const MAX_ATTEMPTS = 3;
    
    setTransitionState({
      inProgress: true,
      targetPanoId,
      attempts: 0
    });

    try {
      const isValid = await validateTransition(targetPanoId);
      if (!isValid) {
        throw new Error('Invalid panorama target');
      }

      setPanoramaOptions(window.panorama, true);

      const currentHeading = window.panorama.getPov().heading;
      await animateRotation(currentHeading, heading, 1500);

      let success = false;
      while (transitionState.attempts < MAX_ATTEMPTS && !success) {
        try {
          await panoramaCache.getPanorama(targetPanoId);
          window.panorama.setPano(targetPanoId);
          
          await waitForPanoTransition(window.panorama, targetPanoId);
          
          window.panorama.setPov({ heading, pitch });
          if (zoom !== undefined) {
            window.panorama.setZoom(zoom);
          }
          
          success = true;
        } catch (error) {
          console.error(`Transition attempt ${transitionState.attempts + 1} failed:`, error);
          setTransitionState(prev => ({
            ...prev,
            attempts: prev.attempts + 1
          }));
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!success) {
        throw new Error('All transition attempts failed');
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      if (window.panorama) {
        setPanoramaOptions(window.panorama, false);
      }
      setTransitionState({
        inProgress: false,
        targetPanoId: null,
        attempts: 0
      });
    }
  }, [transitionState, validateTransition, animateRotation]);

  return {
    error,
    transitionState,
    transitionToPanorama,
    clearError: () => setError(null)
  };
};