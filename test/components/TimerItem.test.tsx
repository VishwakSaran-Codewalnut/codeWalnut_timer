import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TimerItem } from '../../src/components/TimerItem';
import { useTimerStore } from '../../src/store/useTimerStore';
import { Timer } from '../../src/types/timer';
import React from 'react';
import '@testing-library/jest-dom';

vi.mock('../../src/store/useTimerStore');

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
    },
}));

vi.mock('../../src/utils/audio', () => ({
    TimerAudio: {
        getInstance: () => ({
            play: vi.fn().mockResolvedValue(undefined),
            stop: vi.fn(),
        }),
    },
}));

describe('TimerItem', () => {
    const mockToggleTimer = vi.fn();
    const mockDeleteTimer = vi.fn();
    const mockRestartTimer = vi.fn();
    const mockUpdateTimer = vi.fn();

    const defaultTimer: Timer = {
        id: '1',
        title: 'Test Timer',
        description: 'Test Description',
        duration: 60,
        remainingTime: 60,
        isRunning: false,
        createdAt: Date.now(),
    };

    const renderTimerItem = (props = {}) => {
        return render(<TimerItem timer={{ ...defaultTimer, ...props }} />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useTimerStore as any).mockReturnValue({
            toggleTimer: mockToggleTimer,
            deleteTimer: mockDeleteTimer,
            restartTimer: mockRestartTimer,
            updateTimer: mockUpdateTimer,
        });
    });

    it('renders timer details correctly', () => {
        renderTimerItem();

        expect(screen.getByText('Test Timer')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('01:00')).toBeInTheDocument();
    });

    it('toggles timer when start button is clicked', async () => {
        const user = userEvent.setup();
        renderTimerItem();

        const startButton = screen.getByRole('button', { name: /^start timer$/i });
        await user.click(startButton);

        expect(mockToggleTimer).toHaveBeenCalledWith(defaultTimer.id);
    });

    it('opens edit modal when edit button is clicked', async () => {
        const user = userEvent.setup();
        renderTimerItem();

        const editButton = screen.getByRole('button', { name: /edit timer/i });
        await user.click(editButton);

        expect(screen.getByRole('heading', { name: /edit timer/i })).toBeInTheDocument();
    });

    it('restarts timer and resets time display when restart button is clicked', async () => {
        const user = userEvent.setup();
        renderTimerItem({ remainingTime: 10, isRunning: false });

        expect(screen.getByText('00:10')).toBeInTheDocument();

        const restartButton = screen.getByRole('button', { name: /restart timer/i });
        await user.click(restartButton);

        expect(screen.getByText('01:00')).toBeInTheDocument();
        expect(mockRestartTimer).toHaveBeenCalledWith(defaultTimer.id);
    });

    it('decrements time locally when running', async () => {
        vi.useFakeTimers();
        renderTimerItem({ isRunning: true });

        expect(screen.getByText('01:00')).toBeInTheDocument();

        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByText('00:59')).toBeInTheDocument();
        vi.useRealTimers();
    });
});
