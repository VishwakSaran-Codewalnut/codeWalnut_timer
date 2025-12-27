import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TimerProgress } from '../../src/components/TimerProgress';
import React from 'react';
import '@testing-library/jest-dom';

describe('TimerProgress', () => {
    const renderTimerProgress = (props: { progress: number }) => {
        return render(<TimerProgress {...props} />);
    };

    it('renders progress bar with correct accessibility attributes', () => {
        renderTimerProgress({ progress: 50 });

        const progressBar = screen.getByLabelText(/timer progress/i);
        expect(progressBar).toBeInTheDocument();
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');
        expect(progressBar).toHaveAttribute('aria-valuemin', '0');
        expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders progress bar width visibly', () => {
        renderTimerProgress({ progress: 75 });
        const progressBar = screen.getByLabelText(/timer progress/i);
        const innerBar = progressBar.firstElementChild;
        expect(innerBar).toHaveStyle({ width: '75%' });
    });

    it('updates aria-valuenow when progress changes', () => {
        const { rerender } = renderTimerProgress({ progress: 20 });
        let progressBar = screen.getByLabelText(/timer progress/i);
        expect(progressBar).toHaveAttribute('aria-valuenow', '20');

        rerender(<TimerProgress progress={80} />);
        progressBar = screen.getByLabelText(/timer progress/i);
        expect(progressBar).toHaveAttribute('aria-valuenow', '80');
    });
});
