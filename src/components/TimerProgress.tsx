import React from 'react';

interface TimerProgressProps {
  progress: number;
}

export const TimerProgress = React.forwardRef<HTMLDivElement, TimerProgressProps>(({ progress }, ref) => {
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div
        ref={ref}
        className="h-full rounded-full bg-blue-600 transition-all duration-1000"
        style={{ width: `${safeProgress}%` }}
        role="progressbar"
        aria-valuenow={safeProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
});
TimerProgress.displayName = 'TimerProgress';