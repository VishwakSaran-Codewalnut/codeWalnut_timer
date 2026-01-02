import { configureStore, createSlice } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { Timer } from '../types/timer';

const LOCAL_STORAGE_KEY = 'timers';

const loadTimersFromLocalStorage = (): Timer[] => {
  const storedTimers = localStorage.getItem(LOCAL_STORAGE_KEY);
  return storedTimers ? JSON.parse(storedTimers) : [];
};

const saveTimersToLocalStorage = (timers: Timer[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timers));
};

const initialState = {
  timers: loadTimersFromLocalStorage(),
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    addTimer: (state, action) => {
      const newTimer = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      state.timers.push(newTimer);
      saveTimersToLocalStorage(state.timers);
    },
    deleteTimer: (state, action) => {
      state.timers = state.timers.filter(timer => timer.id !== action.payload);
      saveTimersToLocalStorage(state.timers);
    },
    toggleTimer: (state, action) => {
      const timer = state.timers.find(timer => timer.id === action.payload);
      if (timer) {
        if (timer.isRunning) {
          if (timer.endTime) {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
            timer.remainingTime = remaining;
            timer.endTime = undefined;
          }
        } else {
          timer.endTime = Date.now() + (timer.remainingTime * 1000);
        }
        timer.isRunning = !timer.isRunning;
        saveTimersToLocalStorage(state.timers);
      }
    },
    updateTimer: (state, action) => {
      const timer = state.timers.find(timer => timer.id === action.payload);
      if (timer && timer.isRunning && timer.endTime) {
        const now = Date.now();
        if (now >= timer.endTime) {
          timer.remainingTime = 0;
          timer.isRunning = false;
          timer.endTime = undefined;
          saveTimersToLocalStorage(state.timers);
        }
      }
    },
    restartTimer: (state, action) => {
      const timer = state.timers.find(timer => timer.id === action.payload);
      if (timer) {
        timer.remainingTime = timer.duration;
        timer.isRunning = false;
        timer.endTime = undefined;
        saveTimersToLocalStorage(state.timers);
      }
    },
    editTimer: (state, action) => {
      const timer = state.timers.find(timer => timer.id === action.payload.id);
      if (timer) {
        const { duration, ...rest } = action.payload.updates;
        Object.assign(timer, {
          ...rest,
          duration: duration ?? timer.duration,
          remainingTime: duration ?? timer.remainingTime,
          isRunning: false,
          endTime: undefined
        });
        saveTimersToLocalStorage(state.timers);
      }
    },
  },
});

const store = configureStore({
  reducer: timerSlice.reducer,
});

export { store };

export const {
  addTimer,
  deleteTimer,
  toggleTimer,
  updateTimer,
  restartTimer,
  editTimer,
} = timerSlice.actions;

export const useTimerStore = () => {
  const dispatch = useDispatch();
  const timers = useSelector((state: { timers: Timer[] }) => state.timers);

  return {
    timers,
    addTimer: (timer: Omit<Timer, 'id' | 'createdAt'>) => dispatch(addTimer(timer)),
    deleteTimer: (id: string) => dispatch(deleteTimer(id)),
    toggleTimer: (id: string) => dispatch(toggleTimer(id)),
    updateTimer: (id: string) => dispatch(updateTimer(id)),
    restartTimer: (id: string) => dispatch(restartTimer(id)),
    editTimer: (id: string, updates: Partial<Timer>) =>
      dispatch(editTimer({ id, updates })),
  };
};
