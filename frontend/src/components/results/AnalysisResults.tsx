import { Lightbulb, CheckCircle2, Loader2 } from "lucide-react";
import { AnalysisResult } from "@/types/Location";

interface AnalysisResultsProps {
  result: AnalysisResult | null;
}

const AnalysisResults = ({ result }: AnalysisResultsProps) => {
  if (!result) return null;

  const isComplete = result.next_action === 'complete';

  return (
    <div className="space-y-6">
      {/* Main analysis section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Thoughts</h3>
        <div className="space-y-4">
          <div className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">{result.thoughts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal response section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Goal Progress</h3>
        <div className="space-y-4">
          <div className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-start gap-3">
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
              ) : (
                <Loader2 className="w-5 h-5 text-blue-500 mt-1 animate-spin" />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-700">{result.goal_response}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;