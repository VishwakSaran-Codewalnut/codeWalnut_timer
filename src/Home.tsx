import { useState, useEffect, useCallback } from 'react';
import { Plus, Clock } from 'lucide-react';
import { TimerList } from './components/TimerList';
import { Toaster } from 'sonner';
import { Button } from './components/shared/Button';
import { TimerModal } from './components/TimerModal';

function Home() {
  const [isAddTimerModalOpen, setIsAddTimerModalOpen] = useState(false);
  const [toastNotificationPosition, setToastNotificationPosition] = useState<'top-right' | 'bottom-center'>(
    'top-right'
  );

  const handleToastPositionOnResize = useCallback(() => {
    if (window.innerWidth <= 768) {
      setToastNotificationPosition('bottom-center'); // Mobile
    } else {
      setToastNotificationPosition('top-right'); // Desktop
    }
  }, []);

  useEffect(() => {
    handleToastPositionOnResize(); // Set initial position
    window.addEventListener('resize', handleToastPositionOnResize);

    return () => {
      window.removeEventListener('resize', handleToastPositionOnResize);
    };
  }, [handleToastPositionOnResize]);

  const handleToggleAddTimerModal = () => {
    setIsAddTimerModalOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position={toastNotificationPosition} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          {/* Timer Title */}
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Timer</h1>
          </div>

          {/* Add Timer Button */}
          <Button
            onClick={handleToggleAddTimerModal}
            variant="primary"
          >
            <Plus className="w-5 h-5" />
            Add Timer
          </Button>
        </div>

        <TimerList />

        <TimerModal
          isOpen={isAddTimerModalOpen}
          onClose={handleToggleAddTimerModal}
        />
      </div>
    </div>
  );
}

export default Home;
