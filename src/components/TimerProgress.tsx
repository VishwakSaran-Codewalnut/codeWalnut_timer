

interface TimerProgressProps {
  progress: number;
}

export const TimerProgress = ({ progress }: TimerProgressProps) => (
  <div
    className="w-full bg-gray-200 rounded-full h-2 mb-4"
    role="progressbar"
    aria-valuenow={progress}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label="Timer Progress"
  >
    <div
      className="h-full rounded-full bg-blue-600 transition-all duration-1000"
      style={{ width: `${progress}%` }}
    />
  </div>
);