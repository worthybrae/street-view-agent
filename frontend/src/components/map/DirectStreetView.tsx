import { useRef, useState } from 'react';
import { useLoadScript, GoogleMap } from '@react-google-maps/api';
import { useStreetView } from '@/hooks/useStreetView';
import { GoogleMapsService } from '@/services/GoogleMap';

const STARTING_LOCATION = {
  lat: 42.461851,
  lng: -71.143309
};

interface DirectStreetViewProps {
  onMapLoad: (map: google.maps.Map) => void;
}

const DirectStreetView = ({ onMapLoad }: DirectStreetViewProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapService = GoogleMapsService.getInstance();
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: mapService.libraries,
  });

  const { showStreetView } = useStreetView(map);

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
    onMapLoad(map);

    // Create and set up the Street View panorama with smooth transitions
    const panorama = new google.maps.StreetViewPanorama(
      map.getDiv(),
      {
        position: STARTING_LOCATION,
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
        motionTracking: false,
        motionTrackingControl: false,
        enableCloseButton: false,
        linksControl: true,
        panControl: true,
        zoomControl: true,
        fullscreenControl: false,
        addressControl: true,
        showRoadLabels: false,
        clickToGo: false,
        visible: true
      }
    );
    
    map.setStreetView(panorama);
    
    // Initialize with starting position
    showStreetView(STARTING_LOCATION);
  };

  return (
    <div className="h-full w-full">
      {!isLoaded ? (
        <div className="h-full w-full flex items-center justify-center">
          <p>Loading Street View...</p>
        </div>
      ) : (
        <GoogleMap
          mapContainerClassName="h-full w-full"
          center={STARTING_LOCATION}
          zoom={mapService.defaultZoom}
          onLoad={handleMapLoad}
          options={{
            streetViewControl: false,
          }}
        />
      )}
    </div>
  );
};

export default DirectStreetView;