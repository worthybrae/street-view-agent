// src/components/map/ControlPanel.tsx
import { LocationInfoProps, PanoramaLink, AnalysisResult } from "@/types/Location";
import LocationInfo from "./LocationInfo";
import ConnectedPanoramas from "./ConnectedPanoramas";
import ScreenshotControl from "./ScreenshotControl";
import AnalysisStateManager from "../analysis/AnalysisStateManager";

const ControlPanel = ({ 
  metadata, 
  position, 
  pov, 
  isLoading, 
  onAnalyze,
  metrics,
  notes,
  onUpdateMetrics 
}: LocationInfoProps) => {
  const handleAnalysis = (result: AnalysisResult) => {
    console.log('ControlPanel: Handling analysis', result);
    onAnalyze?.(result);
  };

  const handleMetricsUpdate = (
    result: AnalysisResult,
    position: { lat: number; lng: number },
    panoId: string
  ) => {
    return onUpdateMetrics(result, position, panoId);
  };

  return (
    <div className="space-y-6">
      <AnalysisStateManager
        position={position}
        pov={pov}
        metadata={metadata}
        onAnalyze={handleAnalysis}
        onUpdateMetrics={handleMetricsUpdate}
        metrics={metrics}
        important_notes={notes}
      />
      
      <LocationInfo
        metadata={metadata}
        position={position}
        pov={pov}
        isLoading={isLoading}
      />

      <ConnectedPanoramas
        links={metadata?.links as PanoramaLink[] || []}
        currentHeading={pov?.heading || 0}
      />

      <ScreenshotControl
        position={position}
        pov={pov}
      />
    </div>
  );
};

export default ControlPanel;