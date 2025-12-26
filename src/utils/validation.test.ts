import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateTimerForm, TimerFormData } from './validation';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('validateTimerForm', () => {
  beforeEach(() => {
    // Reset all mock calls before each test
    vi.clearAllMocks();
  });

  it('fails when title is empty', () => {
    const data: TimerFormData = {
      title: '',
      description: '',
      hours: 0,
      minutes: 0,
      seconds: 1,
    };

    const result = validateTimerForm(data);
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Title is required');
  });

  it('fails when hours, minutes, or seconds are negative', () => {
    const data: TimerFormData = {
      title: 'Test Timer',
      description: '',
      hours: -1, // negative
      minutes: 0,
      seconds: 0,
    };

    const result = validateTimerForm(data);
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Time values cannot be negative');
  });

  it('fails when minutes or seconds exceed 59', () => {
    const data: TimerFormData = {
      title: 'Test Timer',
      description: '',
      hours: 0,
      minutes: 60, // invalid
      seconds: 0,
    };

    const result = validateTimerForm(data);
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Minutes and seconds must be between 0 and 59');
  });

  it('fails when total time is 0', () => {
    const data: TimerFormData = {
      title: 'Test Timer',
      description: '',
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    const result = validateTimerForm(data);
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Please set a time greater than 0');
  });

  it('fails when total time exceeds 24 hours', () => {
    const data: TimerFormData = {
      title: 'Test Timer',
      description: '',
      hours: 24, // 24 hours
      minutes: 0,
      seconds: 1,
    };

    const result = validateTimerForm(data);
    expect(result).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Timer cannot exceed 24 hours');
  });

  it('passes when all fields are valid', () => {
    const data: TimerFormData = {
      title: 'Valid Timer',
      description: 'Some optional description',
      hours: 1,
      minutes: 10,
      seconds: 30,
    };

    const result = validateTimerForm(data);
    expect(result).toBe(true);
    // Make sure no error was called
    expect(toast.error).not.toHaveBeenCalled();
  });
});
