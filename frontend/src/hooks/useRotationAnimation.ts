import { useCallback } from 'react';
import { getShortestRotation } from '@/lib/utils';

export const useRotationAnimation = () => {
  const animateRotation = useCallback(
    (
      startHeading: number,
      targetHeading: number,
      duration: number = 1000
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
          
          if (window.panorama) {
            window.panorama.setPov({
              heading: currentHeading,
              pitch: window.panorama.getPov().pitch
            });
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };

        requestAnimationFrame(animate);
      });
    },
    []
  );

  return { animateRotation };
};