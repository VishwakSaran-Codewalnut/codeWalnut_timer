import React from 'react';

interface TimerProgressProps {
  progress: number;
}

export const TimerProgress = React.forwardRef<HTMLDivElement, TimerProgressProps>(({ progress }, ref) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
    <div
      ref={ref}
      className="h-full rounded-full bg-blue-600 transition-all duration-1000"
      style={{ width: `${progress}%` }}
    />
  </div>
));
TimerProgress.displayName = 'TimerProgress';