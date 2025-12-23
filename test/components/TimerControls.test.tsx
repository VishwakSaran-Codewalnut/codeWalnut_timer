import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TimerControls } from '../../src/components/TimerControls';
import React, { useState } from 'react';

describe('TimerControls', () => {
  const defaultProps = {
    remainingTime: 60,
    onToggle: vi.fn(),
    onRestart: vi.fn(),
    isRunning: false
  };

  it('displays Start button correctly when timer is paused (Non-Reset State)', () => {
    render(<TimerControls {...defaultProps} isRunning={false} />);

    const startButton = screen.getByRole('button', { name: /start timer/i });
    expect(startButton).toBeInTheDocument();
  });

  it('displays Pause button correctly when timer is running', () => {
    render(<TimerControls {...defaultProps} isRunning={true} />);

    const pauseButton = screen.getByRole('button', { name: /pause timer/i });
    expect(pauseButton).toBeInTheDocument();
  });

  it('displays Restart button correctly when timer is completed', () => {
    render(<TimerControls {...defaultProps} isRunning={false} remainingTime={0} />);

    const restartButton = screen.getByRole('button', { name: /restart timer/i });
    expect(restartButton).toBeInTheDocument();
  });

  it('toggles between Start and Pause buttons based on prop changes', () => {
    const { rerender } = render(<TimerControls {...defaultProps} isRunning={false} />);

    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /pause timer/i })).not.toBeInTheDocument();

    rerender(<TimerControls {...defaultProps} isRunning={true} />);

    expect(screen.getByRole('button', { name: /pause timer/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start timer/i })).not.toBeInTheDocument();

    rerender(<TimerControls {...defaultProps} isRunning={false} />);

    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
  });

  it('transitions from Restart to Start button based on prop changes', () => {
    const { rerender } = render(<TimerControls {...defaultProps} isRunning={false} remainingTime={0} />);

    expect(screen.getByRole('button', { name: /restart timer/i })).toBeInTheDocument();

    rerender(<TimerControls {...defaultProps} isRunning={false} remainingTime={60} />);

    expect(screen.getByRole('button', { name: /start timer/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /restart timer/i })).not.toBeInTheDocument();
  });
});