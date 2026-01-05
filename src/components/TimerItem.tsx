import React, { useEffect, useRef, useState } from 'react';
import { Trash2, RotateCcw, Pencil } from 'lucide-react';
import { Timer } from '../types/timer';
import { formatTimeSecondsToDisplayString } from '../utils/time';
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

export const TimerItem: React.FC<TimerItemProps> = ({ timer }) => {
  const { toggleTimer, deleteTimer, restartTimer, updateTimer } = useTimerStore();
  const [isEditTimerModalOpen, setIsEditTimerModalOpen] = useState(false);
  const timerAudio = TimerAudio.getInstance();
  const hasEndedRef = useRef(false);

  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentRemainingTime = timer.isRunning && timer.endTime
    ? Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000))
    : timer.remainingTime;

  useEffect(() => {
    let intervalId: number;
    if (timer.isRunning) {
      intervalId = window.setInterval(() => {
        const now = Date.now();
        const remaining = timer.endTime
          ? Math.max(0, Math.ceil((timer.endTime - now) / 1000))
          : 0;
        if (timeDisplayRef.current) {
          timeDisplayRef.current.textContent = formatTimeSecondsToDisplayString(remaining);
        }

        if (progressRef.current) {
          const newProgress = (remaining / timer.duration) * 100;
          progressRef.current.style.width = `${newProgress}%`;
        }
        if (remaining <= 0) {
          if (!hasEndedRef.current) {
            hasEndedRef.current = true;

            // Play notification sound
            timerAudio.play().catch(console.error);

            // Display snack bar
            toast.success(`Timer "${timer.title}" has ended!`, {
              duration: Infinity, // Keep the snackbar open until dismissed
              action: {
                label: 'Dismiss',
                onClick: timerAudio.stop, // Stop sound on dismiss
              },
            });

            updateTimer(timer.id);
          }
        }
      }, 200);
    } else {
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = formatTimeSecondsToDisplayString(currentRemainingTime);
      }
      if (progressRef.current) {
        const newProgress = (currentRemainingTime / timer.duration) * 100;
        progressRef.current.style.width = `${newProgress}%`;
      }
    }
    return () => clearInterval(intervalId);
  }, [timer.isRunning, timer.endTime, timer.duration, timer.id, timer.title, timerAudio, updateTimer]);

  useEffect(() => {
    if (currentRemainingTime > 0) {
      hasEndedRef.current = false;
    }
  }, [currentRemainingTime]);


  const handleRestartTimerClick = () => {
    hasEndedRef.current = false;
    timerAudio.stop();
    restartTimer(timer.id);
  };

  const handleDeleteTimerClick = () => {
    timerAudio.stop();
    deleteTimer(timer.id);
  };

  const handleToggleTimerClick = () => {
    if (currentRemainingTime <= 0) {
      hasEndedRef.current = false;
    }
    toggleTimer(timer.id);
  };

  const handleEditTimerClick = () => {
    setIsEditTimerModalOpen(true);
  };

  const handleCloseEditTimerModal = () => {
    setIsEditTimerModalOpen(false);
  };

  const progress = (currentRemainingTime / timer.duration) * 100;

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
                onClick={handleEditTimerClick}
                className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition-colors"
                variant="unstyled"
                title="Edit Timer"
              >
                <Pencil className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleRestartTimerClick}
                className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition-colors"
                variant="unstyled"
                title="Restart Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Button
                onClick={handleDeleteTimerClick}
                className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                variant="unstyled"
                title="Delete Timer"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center mt-6">
            <div
              ref={timeDisplayRef}
              className="text-4xl font-mono font-bold text-gray-800 mb-4"
            >
              {formatTimeSecondsToDisplayString(currentRemainingTime)}
            </div>

            <TimerProgress ref={progressRef} progress={progress} />

            <TimerControls
              isRunning={timer.isRunning}
              remainingTime={currentRemainingTime}
              duration={timer.duration}
              onToggle={handleToggleTimerClick}
              onRestart={handleRestartTimerClick}
            />
          </div>
        </div>
      </div>

      <TimerModal
        isOpen={isEditTimerModalOpen}
        onClose={handleCloseEditTimerModal}
        timer={timer}
      />

    </>
  );
};
