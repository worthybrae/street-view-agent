// src/pages/HomePage.tsx
import { useEffect, useState, useCallback } from "react";
import DirectStreetView from "@/components/map/DirectStreetView";
import { useStreetView } from "@/hooks/useStreetView";
import ControlPanel from "@/components/map/ControlPanel";
import AnalysisResults from "@/components/results/AnalysisResults";
import ExplorationMap from "@/components/map/ExplorationMap";
import ActivityTimeline from "@/components/timeline/ActivityTimeline";
import ImportantNotes from "@/components/results/ImportantNotes";
import { Card } from "@/components/ui/card";
import { AnalysisResult, AnalysisMetrics } from "@/types/Location";
import { useViewUpdate } from "@/hooks/useViewUpdate";
import { useAnalysisMetrics } from "@/hooks/useAnalysisMetrics";
import { useImportantNotes } from "@/hooks/useImportantNotes";

interface TimelineEvent {
  timestamp: Date;
  result: AnalysisResult;
}

const HomePage = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [visitedPanoramas, setVisitedPanoramas] = useState<Set<string>>(new Set());
  
  // Street View State Management
  const { streetViewState, showStreetView, setStreetViewState } = useStreetView(map);
  const { metadata, position, pov, isLoading: locationLoading } = streetViewState;

  // Metrics and Notes Management
  const { metrics, updateMetrics } = useAnalysisMetrics(pov);
  const { notes, addNotes } = useImportantNotes();

  // Create a memoized handler for metrics updates
  const handleMetricsUpdate = useCallback((
    result: AnalysisResult, 
    position: { lat: number; lng: number }, 
    panoId: string
  ): AnalysisMetrics => {
    console.log('HomePage: Handling metrics update', {
      currentMetrics: metrics,
      result,
      position,
      panoId
    });
    
    const updatedMetrics = updateMetrics(result, position, panoId);
    
    console.log('HomePage: Updated metrics', updatedMetrics);
    return updatedMetrics;
  }, [metrics, updateMetrics]);

  // Handle analysis results
  const handleAnalysis = useCallback((result: AnalysisResult) => {
    console.log('HomePage: Handling analysis result', result);
    setAnalysisResult(result);
    setTimelineEvents(prev => [...prev, { 
      timestamp: new Date(), 
      result 
    }]);
    
    // Add any new important notes
    if (result.important_notes.length > 0) {
      addNotes(result.important_notes);
    }
  }, [addNotes]);

  // View Update Management
  const { 
    isUpdatingView,
    handleViewUpdate
  } = useViewUpdate({
    panorama: window.panorama,
    metadata,
    visitedPanoramas,
    setVisitedPanoramas,
    setStreetViewState,
    pov
  });

  // Initialize window.panorama when map is ready
  useEffect(() => {
    if (map) {
      window.panorama = map.getStreetView();
    }
  }, [map]);

  // Show street view when position changes
  useEffect(() => {
    if (position) {
      showStreetView(position);
    }
  }, [position?.lat, position?.lng, showStreetView]);

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex gap-4 justify-center">
          {/* Analysis Results Panel */}
          <div className="w-96 flex-shrink-0 space-y-4">
            <ImportantNotes notes={notes} />
            {analysisResult && (
              <>
                <Card className="p-4">
                  <AnalysisResults result={analysisResult} />
                </Card>
                <ExplorationMap metrics={metrics} />
              </>
            )}
          </div>

          {/* Main Street View and Timeline */}
          <div className="flex flex-col gap-4">
            <div className="w-[640px] h-[640px] bg-white rounded-lg shadow-md overflow-hidden">
              <DirectStreetView onMapLoad={setMap} />
            </div>
            
            <Card className="w-[640px]">
              <ActivityTimeline events={timelineEvents} />
            </Card>
          </div>

          {/* Control Panel */}
          <div className="w-96 flex-shrink-0">
            <Card className="p-4">
              <ControlPanel
                metadata={metadata}
                position={position}
                pov={pov}
                isLoading={locationLoading || isUpdatingView}
                onAnalyze={result => {
                  console.log('HomePage: Control Panel analyze', result);
                  handleAnalysis(result);
                  handleViewUpdate(result);
                }}
                notes={notes}    
                metrics={metrics}
                onUpdateMetrics={handleMetricsUpdate}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;