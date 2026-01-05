import { toast } from 'sonner';
import { calculateTotalSecondsFromHoursMinutesSeconds } from './time';

export interface TimerFormData {
  title: string;
  description: string;
  hours: number;
  minutes: number;
  seconds: number;
}

export const validateTimerForm = (data: TimerFormData): boolean => {
  const { title, hours, minutes, seconds } = data;

  if (!title.trim()) {
    toast.error('Title is required');
    return false;
  }

  if (hours < 0 || minutes < 0 || seconds < 0) {
    toast.error('Time values cannot be negative');
    return false;
  }

  if (minutes > 59 || seconds > 59) {
    toast.error('Minutes and seconds must be between 0 and 59');
    return false;
  }

  const totalSeconds = calculateTotalSecondsFromHoursMinutesSeconds(hours, minutes, seconds);
  if (totalSeconds === 0) {
    toast.error('Please set a time greater than 0');
    return false;
  }

  if (totalSeconds > 86400) { // 24 hours
    toast.error('Timer cannot exceed 24 hours');
    return false;
  }

  return true;
};

export const validateTimerDurationState = (hours: number, minutes: number, seconds: number): boolean => {
  return hours > 0 || minutes > 0 || seconds > 0;
};