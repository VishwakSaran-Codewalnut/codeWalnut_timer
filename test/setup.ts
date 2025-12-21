import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage before any imports
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Also set it on global for Node.js environment
global.localStorage = localStorageMock as any;

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});

