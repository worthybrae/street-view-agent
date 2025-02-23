import { MapPin, Activity } from "lucide-react";
import { AnalysisMetrics as AnalysisMetricsType } from "@/types/Location";

interface AnalysisMetricsProps {
  metrics: AnalysisMetricsType;
}

const AnalysisMetrics = ({ metrics }: AnalysisMetricsProps) => {
  const calculateArea = () => {
    if (!metrics.bounds.maxLat || !metrics.bounds.minLat || 
        !metrics.bounds.maxLng || !metrics.bounds.minLng) {
      return 0;
    }
    
    const latDiff = metrics.bounds.maxLat - metrics.bounds.minLat;
    const lngDiff = metrics.bounds.maxLng - metrics.bounds.minLng;
    
    // Convert to kilometers (approximate)
    const latKm = latDiff * 111; // 1 degree latitude ≈ 111 km
    const lngKm = lngDiff * Math.cos((metrics.bounds.minLat + metrics.bounds.maxLat) / 2 * Math.PI / 180) * 111;
    
    return (latKm * lngKm).toFixed(3);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Analysis Metrics</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {calculateArea()} km²
            </div>
            <div className="text-xs text-gray-500">Area Explored</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {metrics.totalActions}
            </div>
            <div className="text-xs text-gray-500">Total Actions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisMetrics;