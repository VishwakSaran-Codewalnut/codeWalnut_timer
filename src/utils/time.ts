export const padNumberWithZero = (num: number): string => num.toString().padStart(2, '0');

export const convertSecondsToHoursMinutesSeconds = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
};

export const calculateTotalSecondsFromHoursMinutesSeconds = (hours: number, minutes: number, seconds: number): number => {
  return hours * 3600 + minutes * 60 + seconds;
};

export const formatTimeSecondsToDisplayString = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${padNumberWithZero(hours)}:${padNumberWithZero(minutes)}:${padNumberWithZero(remainingSeconds)}`;
  }
  return `${padNumberWithZero(minutes)}:${padNumberWithZero(remainingSeconds)}`;
};