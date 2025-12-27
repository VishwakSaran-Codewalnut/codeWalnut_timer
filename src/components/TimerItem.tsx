import { useEffect, useRef, useState, useCallback } from 'react';
import { Trash2, RotateCcw, Pencil } from 'lucide-react';
import { Timer } from '../types/timer';
import { formatTime } from '../utils/time';
import { useTimerStore } from '../store/useTimerStore';
import { toast } from 'sonner';
import { TimerAudio } from '../utils/audio';
import { TimerControls } from './TimerControls';
import { TimerProgress } from './TimerProgress';
import { Button } from './shared/Button';
import { TimerModal } from './TimerModal';

interface TimerItemProps {
  timer: Timer;
}

export const TimerItem = ({ timer }: TimerItemProps) => {
  const { toggleTimer, deleteTimer, restartTimer } = useTimerStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timerAudio = TimerAudio.getInstance();
  const hasEndedRef = useRef(false);
  const [remainingTime, setRemainingTime] = useState(timer.remainingTime);

  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1 && !hasEndedRef.current) {
            hasEndedRef.current = true;

            // Play notification sound
            timerAudio.play().catch(console.error);

            // Display snack bar with dismiss option
            toast.success(`Timer "${timer.title}" has ended!`, {
              duration: Infinity, // Keep the snackbar open until dismissed
              action: {
                label: 'Dismiss',
                onClick: timerAudio.stop, // Stop sound on dismiss
              },
            });

            return 0;
          }
          return Math.max(0, prev - 1);
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup interval on unmount or timer stop
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timer.isRunning, timerAudio, timer.title]);

  const handleRestart = useCallback(() => {
    hasEndedRef.current = false;
    setRemainingTime(timer.duration);
    restartTimer(timer.id);
  }, [timer.duration, timer.id, restartTimer]);

  const handleDelete = useCallback(() => {
    timerAudio.stop();
    deleteTimer(timer.id);
  }, [timer.id, deleteTimer, timerAudio]);

  const handleToggle = useCallback(() => {
    if (remainingTime <= 0) {
      hasEndedRef.current = false;
    }
    toggleTimer(timer.id);
  }, [remainingTime, timer.id, toggleTimer]);



  return (
    <>
      <div className="relative bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-102 overflow-hidden">
        <div className="absolute inset-0 w-full h-full -z-10 opacity-5">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
            <path
              d="M50 20V50L70 70"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{timer.title}</h3>
              <p className="text-gray-600 mt-1">{timer.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition-colors"
                variant="unstyled"
                title="Edit Timer"
                aria-label="Edit Timer"
              >
                <Pencil className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleRestart}
                className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition-colors"
                variant="unstyled"
                title="Restart Timer"
                aria-label="Restart Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                variant="unstyled"
                title="Delete Timer"
                aria-label="Delete Timer"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center mt-6">
            <div className="text-4xl font-mono font-bold text-gray-800 mb-4">
              {formatTime(remainingTime)}
            </div>

            <TimerProgress
              progress={(remainingTime / timer.duration) * 100}
            />

            <TimerControls
              isRunning={timer.isRunning}
              remainingTime={remainingTime}
              onToggle={handleToggle}
              onRestart={handleRestart}
            />
          </div>
        </div>
      </div>


      <TimerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        timer={timer}
      />

    </>
  );
};
