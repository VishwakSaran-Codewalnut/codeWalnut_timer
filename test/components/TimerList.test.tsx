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

const mockTimers: Timer[] = [
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


describe('TimerList', () => {
  describe('Empty State', () => {
    it('displays empty state message when no timers exist', () => {
      renderWithStore([]);

      expect(screen.getByText('No timers yet. Add one to get started!')).toBeInTheDocument();
      expect(
        screen.getByText('Click the "Add Timer" button above to create your first timer.')
      ).toBeInTheDocument();
    });
  });

  describe('Timer Display', () => {
    it('displays single timer when one timer exists', () => {
      renderWithStore([mockTimers[0]]);

      expect(screen.getByText('Timer One')).toBeInTheDocument();
      expect(screen.getByText('Description One')).toBeInTheDocument();
    });

    it('displays multiple timers when multiple timers exist', () => {
      renderWithStore(mockTimers);

      expect(screen.getByText('Timer One')).toBeInTheDocument();
      expect(screen.getByText('Timer Two')).toBeInTheDocument();
      expect(screen.getByText('Timer Three')).toBeInTheDocument();
    });

    it('does not display empty state when timers exist', () => {
      renderWithStore([mockTimers[0]]);

      expect(
        screen.queryByText('No timers yet. Add one to get started!')
      ).not.toBeInTheDocument();
    });
  });


});

