import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { GoogleMap, Polyline, Marker } from '@react-google-maps/api';
import { AnalysisMetrics } from '@/types/Location';
import { MapPin } from 'lucide-react';

interface ExplorationMapProps {
  metrics: AnalysisMetrics;
}

const ExplorationMap = ({ metrics }: ExplorationMapProps) => {
  const [zoom, setZoom] = useState(18);
  
  // Only render if we have recent actions
  if (metrics.recentActions.length === 0) {
    return null;
  }

  // Calculate bounds from recent actions
  const bounds = metrics.recentActions.reduce((acc, action) => ({
    north: Math.max(acc.north, action.position.lat),
    south: Math.min(acc.south, action.position.lat),
    east: Math.max(acc.east, action.position.lng),
    west: Math.min(acc.west, action.position.lng)
  }), {
    north: -90,
    south: 90,
    east: -180,
    west: 180
  });

  // Calculate center from bounds
  const center = {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2
  };

  // Calculate appropriate zoom level based on bounds
  useEffect(() => {
    const latDiff = Math.abs(bounds.north - bounds.south);
    const lngDiff = Math.abs(bounds.east - bounds.west);
    
    // Adjust zoom based on the larger difference
    const maxDiff = Math.max(latDiff, lngDiff);
    let newZoom = 18; // Default zoom
    
    if (maxDiff > 0.01) newZoom = 15;      // ~1km
    if (maxDiff > 0.05) newZoom = 14;      // ~5km
    if (maxDiff > 0.1) newZoom = 13;       // ~10km
    if (maxDiff > 0.5) newZoom = 12;       // ~50km
    
    setZoom(newZoom);
  }, [bounds.north, bounds.south, bounds.east, bounds.west]);

  // Create path from recentActions which contain the position data
  const path = metrics.recentActions.map(action => ({
    lat: action.position.lat,
    lng: action.position.lng
  }));

  // Get start and current positions
  const startPosition = path[0];
  const currentPosition = path[path.length - 1];

  const options = {
    disableDefaultUI: true,
    zoomControl: false,
    clickableIcons: false,
    scrollwheel: false,
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  // Custom marker SVGs with smaller, simpler dots
  const startMarkerSvg = `
    <svg width="12" height="12" viewBox="0 0 12 12">
      <circle cx="6" cy="6" r="4" fill="#22c55e" stroke="white" stroke-width="2"/>
    </svg>
  `;

  const currentMarkerSvg = `
    <svg width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill="#3b82f6" stroke="white" stroke-width="2"/>
    </svg>
  `;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Exploration Coverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <GoogleMap
            mapContainerClassName="w-full h-full rounded-lg"
            center={center}
            zoom={zoom}
            options={options}
          >
            {/* Path line */}
            <Polyline
              path={path}
              options={{
                strokeColor: "#2563eb",
                strokeOpacity: 0.8,
                strokeWeight: 6
              }}
            />

            {/* Start point */}
            {startPosition && (
              <Marker
                position={startPosition}
                icon={{
                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(startMarkerSvg)}`,
                  anchor: new google.maps.Point(6, 6),
                }}
              />
            )}

            {/* Current position */}
            {currentPosition && (
              <Marker
                position={currentPosition}
                icon={{
                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(currentMarkerSvg)}`,
                  anchor: new google.maps.Point(8, 8),
                }}
              />
            )}
          </GoogleMap>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExplorationMap;