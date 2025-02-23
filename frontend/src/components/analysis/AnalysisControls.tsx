import { Play, Pause, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AnalysisControlsProps {
  goal: string;
  onGoalChange: (goal: string) => void;
  isPlaying: boolean;
  isAnalyzing: boolean;
  onPlayPause: (play: boolean) => void;
  disabled: boolean;
}

const AnalysisControls = ({
  goal,
  onGoalChange,
  isPlaying,
  isAnalyzing,
  onPlayPause,
  disabled
}: AnalysisControlsProps) => {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="goal" className="text-xs text-gray-500 mb-1 block">
          Exploration Goal
        </label>
        <Input
          id="goal"
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder="Enter your exploration goal..."
          className="w-full"
        />
      </div>
      <div className="flex gap-2">
        {!isPlaying ? (
          <Button 
            variant="outline" 
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => onPlayPause(true)}
            disabled={disabled || isAnalyzing}
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="flex-1 flex items-center justify-center gap-2 bg-blue-50"
            disabled={true}
          >
            <PlayCircle className="w-4 h-4 animate-spin" />
            <span>Playing</span>
          </Button>
        )}
        <Button 
          variant={isPlaying ? "default" : "outline"}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => onPlayPause(false)}
          disabled={!isPlaying}
        >
          <Pause className="w-4 h-4" />
          <span>Pause</span>
        </Button>
      </div>
    </div>
  );
};

export default AnalysisControls;