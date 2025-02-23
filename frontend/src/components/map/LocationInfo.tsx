// src/components/map/LocationInfo.tsx
import { MapPin, Compass, Navigation, ZoomIn, Calendar } from "lucide-react";
import { ViewInfoItemProps, ViewInfo } from "@/types/Location";
import { getCardinalDirection } from "@/lib/utils";
import { MapLocation } from "@/services/GoogleMap";
import { StreetViewMetadata } from "@/hooks/useStreetView";

// Create a specific interface for LocationInfo
interface LocationInfoComponentProps {
  metadata: StreetViewMetadata | null;
  position: MapLocation | null;
  pov: ViewInfo | null;
  isLoading: boolean;
}

const ViewInfoItem = ({ icon, label, value, description }: ViewInfoItemProps) => (
  <div className="p-2 rounded-lg hover:bg-gray-100 transition-colors group">
    <div className="flex items-center gap-3">
      {icon}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{label}</p>
          <span className="text-xs text-gray-500">{value}</span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

const LocationInfo = ({ metadata, position, pov, isLoading }: LocationInfoComponentProps) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Location</h3>
      <div className="mt-2 space-y-2">
        <div>
          <p className="text-sm text-gray-900">
            {isLoading ? "Loading..." : metadata?.description || "No location data"}
          </p>
        </div>
        
        {position && (
          <ViewInfoItem
            icon={<MapPin className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />}
            label="Coordinates"
            value={`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`}
            description=""
          />
        )}
        
        {pov && (
          <>
            <ViewInfoItem
              icon={<Compass className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />}
              label="Heading"
              value={`${pov.heading.toFixed(1)}°`}
              description={`${getCardinalDirection(pov.heading)} Direction`}
            />

            <ViewInfoItem
              icon={<Navigation className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />}
              label="Pitch"
              value={`${pov.pitch.toFixed(1)}°`}
              description={pov.pitch > 0 ? 'Looking Up' : pov.pitch < 0 ? 'Looking Down' : 'Level'}
            />

            <ViewInfoItem
              icon={<ZoomIn className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />}
              label="Zoom Level"
              value={`${pov.zoom.toFixed(1)}x`}
              description={pov.zoom > 1 ? 'Zoomed In' : 'Default View'}
            />

            <ViewInfoItem
            icon={<Calendar className="w-5 h-5 text-blue-500 group-hover:text-blue-600" />}
            label="Timestamp"
            value={`${metadata?.imageDate}`}
            description="Photo Taken At"
            />

          </>
        )}
        
      </div>
    </div>
  );
};

export default LocationInfo;