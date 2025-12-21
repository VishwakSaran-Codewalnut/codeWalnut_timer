import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TimerList } from '../../src/components/TimerList';
import { Timer } from '../../src/types/timer';

const createTestStore = (initialTimers: Timer[] = []) => {
  return configureStore({
    reducer: {
      timers: (state: Timer[] = initialTimers) => state,
    },
    preloadedState: {
      timers: initialTimers,
    },
  });
};

const renderWithStore = (timers: Timer[]) => {
  const store = createTestStore(timers);
  return render(
    <Provider store={store}>
      <TimerList />
    </Provider>
  );
};

describe('TimerList', () => {
  describe('Empty State', () => {
    it('displays empty state message when no timers exist', () => {
      renderWithStore([]);

      expect(screen.getByText('No timers yet. Add one to get started!')).toBeInTheDocument();
      expect(
        screen.getByText('Click the "Add Timer" button above to create your first timer.')
      ).toBeInTheDocument();
    });

    it('displays EmptyState component when no timers exist', () => {
      renderWithStore([]);

      const emptyStateContainer = screen.getByText('No timers yet. Add one to get started!')
        .closest('div');
      expect(emptyStateContainer).toBeInTheDocument();
    });
  });

  describe('Timer Display', () => {
    it('displays single timer when one timer exists', () => {
      const timer: Timer = {
        id: 'timer-1',
        title: 'Test Timer',
        description: 'Test Description',
        duration: 60,
        remainingTime: 60,
        isRunning: false,
        createdAt: Date.now(),
      };

      renderWithStore([timer]);

      expect(screen.getByText('Test Timer')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('displays multiple timers when multiple timers exist', () => {
      const timers: Timer[] = [
        {
          id: 'timer-1',
          title: 'Timer One',
          description: 'Description One',
          duration: 60,
          remainingTime: 60,
          isRunning: false,
          createdAt: Date.now(),
        },
        {
          id: 'timer-2',
          title: 'Timer Two',
          description: 'Description Two',
          duration: 120,
          remainingTime: 120,
          isRunning: false,
          createdAt: Date.now(),
        },
        {
          id: 'timer-3',
          title: 'Timer Three',
          description: 'Description Three',
          duration: 180,
          remainingTime: 180,
          isRunning: false,
          createdAt: Date.now(),
        },
      ];

      renderWithStore(timers);

      expect(screen.getByText('Timer One')).toBeInTheDocument();
      expect(screen.getByText('Timer Two')).toBeInTheDocument();
      expect(screen.getByText('Timer Three')).toBeInTheDocument();
    });

    it('does not display empty state when timers exist', () => {
      const timer: Timer = {
        id: 'timer-1',
        title: 'Test Timer',
        description: 'Test Description',
        duration: 60,
        remainingTime: 60,
        isRunning: false,
        createdAt: Date.now(),
      };

      renderWithStore([timer]);

      expect(
        screen.queryByText('No timers yet. Add one to get started!')
      ).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders timers in a grid layout', () => {
      const timers: Timer[] = [
        {
          id: 'timer-1',
          title: 'Timer One',
          description: 'Description',
          duration: 60,
          remainingTime: 60,
          isRunning: false,
          createdAt: Date.now(),
        },
        {
          id: 'timer-2',
          title: 'Timer Two',
          description: 'Description',
          duration: 120,
          remainingTime: 120,
          isRunning: false,
          createdAt: Date.now(),
        },
      ];

      renderWithStore(timers);

      const gridContainer = screen.getByText('Timer One').closest('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('maintains minimum height for empty state', () => {
      renderWithStore([]);

      const container = screen
        .getByText('No timers yet. Add one to get started!')
        .closest('.min-h-\\[400px\\]');
      expect(container).toBeInTheDocument();
    });
  });
});

