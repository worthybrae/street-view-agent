import { AlertCircle, ArrowUpCircle } from "lucide-react";
import { ConnectedPanoramasProps, PanoramaLink } from "@/types/Location";
import { getCardinalDirection } from "@/lib/utils";

const ConnectedPanoramas = ({ links, currentHeading }: ConnectedPanoramasProps) => {
  const handlePanoramaClick = (pano: string | null | undefined) => {
    if (!pano || !window.panorama) return;
    window.panorama.setPano(pano);
  };

  // Sort links by angular distance from current heading
  const sortedLinks = [...links].sort((a: PanoramaLink, b: PanoramaLink) => {
    const headingA = a.heading ?? 0;
    const headingB = b.heading ?? 0;
    
    // Calculate absolute angular distances (0-180 degrees)
    const distanceA = Math.abs(((headingA - currentHeading + 540) % 360) - 180);
    const distanceB = Math.abs(((headingB - currentHeading + 540) % 360) - 180);
    
    return distanceA - distanceB;
  });

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Connected Panoramas</h3>
      <div className="space-y-2">
        {sortedLinks.length === 0 ? (
          <div className="text-sm text-gray-500">
            No connecting panoramas available
          </div>
        ) : (
          sortedLinks.map((link, index) => {
            // Skip rendering if no pano ID
            if (!link.pano) return null;
            
            return (
              <div 
                key={index}
                onClick={() => handlePanoramaClick(link.pano)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer group transition-colors"
              >
                <div className="relative">
                  <ArrowUpCircle 
                    className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors"
                    style={{ transform: `rotate(${link.heading ?? 0}deg)` }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {link.description || `View ${getCardinalDirection(link.heading)}`}
                      </p>
                      {Math.abs(((link.heading ?? 0) - currentHeading + 540) % 360 - 180) > 90 && (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {link.heading?.toFixed(0)}°
                    </span>
                  </div>
                  {link.description && (
                    <p className="text-xs text-gray-500">
                      {getCardinalDirection(link.heading)} Direction
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConnectedPanoramas;