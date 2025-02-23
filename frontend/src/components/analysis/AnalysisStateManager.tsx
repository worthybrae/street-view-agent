import { AnalysisStateManagerProps } from '@/types/Location';
import { useOperationQueue } from '@/hooks/useOperationQueue';
import { useAnalysisProcessor } from '@/hooks/useAnalysisProcessor';
import AnalysisControls from './AnalysisControls';
import AnalysisMetrics from './AnalysisMetrics';
import ErrorAlert from './ErrorAlert';

const AnalysisStateManager: React.FC<AnalysisStateManagerProps> = (props) => {
  const { operationQueue, addToQueue } = useOperationQueue();
  
  const {
    goal,
    isAnalyzing,
    isPlaying,
    error,
    setGoal,
    setIsPlaying
  } = useAnalysisProcessor(props, addToQueue);

  return (
    <div className="space-y-4">
      <ErrorAlert error={error} />
      
      <AnalysisControls
        goal={goal}
        onGoalChange={setGoal}
        isPlaying={isPlaying}
        isAnalyzing={isAnalyzing}
        onPlayPause={setIsPlaying}
        disabled={!props.position || !props.pov}
      />
      
      <AnalysisMetrics metrics={props.metrics} />
    </div>
  );
};

export default AnalysisStateManager;