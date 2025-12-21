import { useState, useEffect, useCallback } from 'react';
import { Plus, Clock } from 'lucide-react';
import { TimerList } from './components/TimerList';
import { Toaster } from 'sonner';
import { Button } from './components/shared/Button';
import { TimerModal } from './components/TimerModal';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toasterPosition, setToasterPosition] = useState<'top-right' | 'bottom-center'>(
    'top-right'
  );

  const handleResize = useCallback(() => {
    if (window.innerWidth <= 768) {
      setToasterPosition('bottom-center'); // Mobile
    } else {
      setToasterPosition('top-right'); // Desktop
    }
  }, []);

  useEffect(() => {
    handleResize(); // Set initial position
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position={toasterPosition} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          {/* Timer Title */}
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Timer</h1>
          </div>

          {/* Add Timer Button */}
          <Button
            onClick={handleOpenModal}
            variant="primary"
          >
            <Plus className="w-5 h-5" />
            Add Timer
          </Button>
        </div>

        <TimerList />

        <TimerModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}

export default Home;
