import { ArrowUp, AlertCircle } from 'lucide-react';
import { AnalysisResult } from "@/types/Location";

interface TimelineEvent {
  timestamp: Date;
  result: AnalysisResult;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

const ActivityTimeline = ({ events }: ActivityTimelineProps) => {
  const lastFiveEvents = events.slice(-5);

  const getHeadingChange = (currentEvent: TimelineEvent, prevEvent: TimelineEvent): number => {
    const currentHeading = currentEvent.result.next_action === 'new_panorama' 
      ? currentEvent.result.next_heading 
      : currentEvent.result.next_heading;
    
    const prevHeading = prevEvent.result.next_action === 'new_panorama'
      ? prevEvent.result.next_heading
      : prevEvent.result.next_heading;

    if (currentHeading === undefined || prevHeading === undefined) return 0;

    // Calculate absolute angular distance (0-180 degrees)
    const change = Math.abs(((currentHeading - prevHeading + 540) % 360) - 180);
    return change;
  };

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-[2px] flex-1 bg-gray-200" />
        <h4 className="text-xs font-medium text-gray-500">
          Last 5 Actions
        </h4>
        <div className="h-[2px] flex-1 bg-gray-200" />
      </div>
      {lastFiveEvents.length > 0 && (
      <div className="relative">
        {/* Horizontal line through timeline */}
        <div className="absolute left-0 right-0 top-2 h-[2px] bg-blue-100" />
        
        {/* Timeline events container */}
        
        <div className="flex justify-between items-start relative">
          {lastFiveEvents.map((event, index) => {
            const prevEvent = index > 0 ? lastFiveEvents[index - 1] : null;
            const headingChange = prevEvent ? getHeadingChange(event, prevEvent) : 0;
            const showAlert = headingChange > 90;

            return (
              <div 
                key={index}
                className="flex-1 px-2 first:pl-0 last:pr-0"
              >
                {/* Event dot and line */}
                <div className="relative flex justify-center">
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
                </div>
                
                {/* Event content */}
                <div className="mt-6 text-center">
                  <span className="text-xs text-gray-500 block">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs font-medium">
                      {event.result.next_action === 'new_panorama' ? 'Move' :
                       event.result.next_action === 'new_view' ? 'View' : 
                       'Complete'}
                    </span>
                    {(event.result.next_heading !== undefined || event.result.next_action === 'new_panorama') && (
                      <div className="flex items-center gap-1">
                        <ArrowUp 
                          className="w-3 h-3 text-blue-500"
                          style={{ 
                            transform: `rotate(${
                              event.result.next_action === 'new_panorama' 
                                ? event.result.next_heading ?? 0 
                                : event.result.next_heading ?? 0
                            }deg)`
                          }}
                        />
                        <span className="text-xs text-blue-500">
                          {Math.round(
                            event.result.next_action === 'new_panorama'
                              ? event.result.next_heading ?? 0
                              : event.result.next_heading ?? 0
                          )}°
                        </span>
                        {showAlert && (
                          <div className="group relative">
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                            <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 hidden group-hover:block">
                              <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                Large turn: {Math.round(headingChange)}°
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Fill empty slots if less than 5 events */}
          {Array.from({ length: Math.max(0, 5 - lastFiveEvents.length) }).map((_, index) => (
            <div 
              key={`empty-${index}`}
              className="flex-1 px-2 first:pl-0 last:pr-0"
            >
              <div className="relative flex justify-center">
                <div className="absolute top-1 w-4 h-4 rounded-full bg-gray-200 border-2 border-white" />
              </div>
            </div>
          ))}
        </div>
        
      </div>
      )}
    </div>
  );
};

export default ActivityTimeline;