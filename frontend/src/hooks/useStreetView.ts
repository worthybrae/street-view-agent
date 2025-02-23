import { useState, useCallback, useRef, useEffect } from 'react';
import { MapLocation } from '@/services/GoogleMap';

export interface StreetViewMetadata {
  pano: string;
  location: MapLocation;
  description: string;
  links: google.maps.StreetViewLink[];
  copyright: string;
  imageDate: string;
}

export interface StreetViewState {
  isLoading: boolean;
  isAvailable: boolean;
  isVisible: boolean;
  position: MapLocation | null;
  error: string | null;
  pov: {
    heading: number;
    pitch: number;
    zoom: number;
  };
  metadata: StreetViewMetadata | null;
}

export function useStreetView(mapInstance: google.maps.Map | null) {
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const isUpdatingRef = useRef(false);
  
  const [state, setState] = useState<StreetViewState>({
    isLoading: false,
    isAvailable: false,
    isVisible: false,
    position: null,
    error: null,
    pov: {
      heading: 0,
      pitch: 0,
      zoom: 1
    },
    metadata: null
  });

  const processPanoramaData = useCallback((data: google.maps.StreetViewPanoramaData) => {
    if (!data.location?.latLng) {
      throw new Error('No location data available');
    }

    const position = data.location.latLng;
    const metadata: StreetViewMetadata = {
      pano: data.location.pano || '',
      location: {
        lat: position.lat(),
        lng: position.lng()
      },
      description: data.location.description || 
                  data.location.shortDescription || 
                  `${position.lat().toFixed(6)}, ${position.lng().toFixed(6)}`,
      links: data.links || [],
      copyright: data.copyright || '© Google',
      imageDate: ''
    };

    return metadata;
  }, []);

  const updateState = useCallback((panorama: google.maps.StreetViewPanorama) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      const position = panorama.getPosition();
      const pov = panorama.getPov();
      const zoom = panorama.getZoom();

      setState(prev => ({
        ...prev,
        position: position ? {
          lat: position.lat(),
          lng: position.lng()
        } : null,
        pov: {
          heading: pov.heading || 0,
          pitch: pov.pitch || 0,
          zoom: zoom || 1
        }
      }));
    } finally {
      isUpdatingRef.current = false;
    }
  }, []);

  const showStreetView = useCallback(async (location: MapLocation) => {
    if (!mapInstance) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const sv = new google.maps.StreetViewService();
      const response = await sv.getPanorama({
        location,
        radius: 50,
        preference: google.maps.StreetViewPreference.NEAREST,
        source: google.maps.StreetViewSource.OUTDOOR
      });

      if (!response?.data?.location?.latLng) {
        throw new Error('No panorama data available');
      }

      const panorama = mapInstance.getStreetView();
      panoramaRef.current = panorama;

      const metadata = processPanoramaData(response.data);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAvailable: true,
        position: metadata.location,
        metadata
      }));

      // Update panorama without triggering state updates
      isUpdatingRef.current = true;
      panorama.setPano(metadata.pano);
      panorama.setPosition(response.data.location.latLng);
      panorama.setVisible(true);
      isUpdatingRef.current = false;

    } catch (error) {
      console.error('Street View error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAvailable: false,
        error: 'Street View is not available at this location'
      }));
    }
  }, [mapInstance, processPanoramaData]);

  // Set up event listeners
  useEffect(() => {
    if (!mapInstance) return;

    const panorama = mapInstance.getStreetView();
    panoramaRef.current = panorama;

    const handlePovChanged = () => {
      if (!isUpdatingRef.current) {
        updateState(panorama);
      }
    };

    const handlePositionChanged = () => {
      if (!isUpdatingRef.current) {
        updateState(panorama);
      }
    };

    const listeners = [
      panorama.addListener('pov_changed', handlePovChanged),
      panorama.addListener('position_changed', handlePositionChanged),
      panorama.addListener('zoom_changed', handlePovChanged)
    ];

    return () => {
      listeners.forEach(listener => google.maps.event.removeListener(listener));
    };
  }, [mapInstance, updateState]);

  return {
    streetViewState: state,
    showStreetView,
    setStreetViewState: setState
  };
}