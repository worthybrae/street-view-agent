// src/components/map/ScreenshotControl.tsx
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapLocation } from "@/services/GoogleMap";
import { ViewInfo } from "@/types/Location";
import ApiService from "@/services/ApiService";

interface ScreenshotControlProps {
  position: MapLocation | null;
  pov: ViewInfo | null;
}

const ScreenshotControl = ({ position, pov }: ScreenshotControlProps) => {
  const apiService = ApiService.getInstance();

  const handleScreenshot = async () => {
    if (!position || !pov) return;

    try {
      const url = await apiService.getStaticViewUrl(
        position.lat,
        position.lng,
        pov.heading,
        pov.pitch,
        pov.zoom
      );
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading screenshot:', error);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Screenshot</h3>
      <div className="space-y-2">
        {position && pov && (
          <div className="p-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={handleScreenshot}
            >
              <Camera className="w-4 h-4" />
              <span>Open Screenshot</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenshotControl;