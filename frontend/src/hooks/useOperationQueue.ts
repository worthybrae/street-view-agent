import { useState, useCallback, useRef, useEffect } from 'react';
import { useTransitions } from './useTransition';
import { useRotationAnimation } from './useRotationAnimation';

export interface QueuedOperation {
  type: 'panorama' | 'view';
  panoId?: string;
  heading: number;
  pitch?: number;
  zoom?: number;
  timestamp: number;
}

export const useOperationQueue = () => {
  const [operationQueue, setOperationQueue] = useState<QueuedOperation[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const lastOperationRef = useRef<number>(0);
  
  const { transitionToPanorama } = useTransitions();
  const { animateRotation } = useRotationAnimation();

  const processQueue = useCallback(async () => {
    if (isProcessingQueue || !window.panorama || operationQueue.length === 0) return;

    try {
      setIsProcessingQueue(true);
      const operation = operationQueue[0];
      
      // Ensure minimum time between operations
      const timeSinceLastOperation = Date.now() - lastOperationRef.current;
      if (timeSinceLastOperation < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - timeSinceLastOperation));
      }

      if (operation.type === 'panorama' && operation.panoId) {
        await transitionToPanorama(
          operation.panoId,
          operation.heading,
          operation.pitch,
          operation.zoom
        );
      } else {
        await animateRotation(
          window.panorama.getPov().heading,
          operation.heading,
          1500
        );
        if (operation.zoom !== undefined) {
          window.panorama.setZoom(operation.zoom);
        }
      }

      lastOperationRef.current = Date.now();
      setOperationQueue(queue => queue.slice(1));
    } finally {
      setIsProcessingQueue(false);
    }
  }, [isProcessingQueue, operationQueue, transitionToPanorama, animateRotation]);

  useEffect(() => {
    if (operationQueue.length > 0 && !isProcessingQueue) {
      processQueue();
    }
  }, [operationQueue, isProcessingQueue, processQueue]);

  const addToQueue = useCallback((operation: QueuedOperation) => {
    setOperationQueue(queue => [...queue, operation]);
  }, []);

  return {
    operationQueue,
    isProcessingQueue,
    addToQueue,
    clearQueue: () => setOperationQueue([])
  };
};