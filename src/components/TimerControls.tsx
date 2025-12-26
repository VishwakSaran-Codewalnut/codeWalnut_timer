import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from './shared/Button';

interface TimerControlsProps {
  isRunning: boolean;
  remainingTime: number;
  onToggle: () => void;
  onRestart: () => void;
}

export const TimerControls = ({
  isRunning,
  remainingTime,
  onToggle,
  onRestart,
}: TimerControlsProps) => {
  const isCompleted = remainingTime <= 0;

  const COMPLETED_CLASS = "p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors";
  const RUNNING_CLASS = "bg-red-100 text-red-600 hover:bg-red-200";
  const PAUSED_CLASS = "bg-green-100 text-green-600 hover:bg-green-200";

  if (isCompleted) {
    return (
      <Button
        onClick={onRestart}
        variant="unstyled"
        className={COMPLETED_CLASS}
        title="Restart Timer"
        aria-label="Restart Timer"
      >
        <RotateCcw className="w-6 h-6" />
      </Button>
    );
  }

  const label = isRunning ? 'Pause Timer' : 'Start Timer';
  const stateClass = isRunning ? RUNNING_CLASS : PAUSED_CLASS;

  return (
    <Button
      onClick={onToggle}
      variant="unstyled"
      className={`p-3 rounded-full transition-colors ${stateClass}`}
      title={label}
      aria-label={label}
    >
      {isRunning ? (
        <Pause className="w-6 h-6" />
      ) : (
        <Play className="w-6 h-6" />
      )}
    </Button>
  );
};