import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TimerModal } from '../../src/components/TimerModal';
import { Timer } from '../../src/types/timer';
import { validateTimerForm, validateTimerDurationState } from '../../src/utils/validation';

vi.mock('../../src/utils/validation', () => ({
  validateTimerForm: vi.fn(),
  validateTimerDurationState: vi.fn(),
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      timers: (state: Timer[] = [], action: any) => {
        switch (action.type) {
          case 'timer/addTimer':
            return [
              ...state,
              {
                ...action.payload,
                id: 'new-id',
                createdAt: Date.now(),
              },
            ];
          case 'timer/editTimer':
            return state.map((t: Timer) =>
              t.id === action.payload.id
                ? { ...t, ...action.payload.updates }
                : t
            );
          default:
            return state;
        }
      },
    },
    preloadedState: {
      timers: [],
    },
  });
};

const renderModal = (
  isOpen: boolean,
  onClose: () => void,
  timer?: Timer,
  store?: ReturnType<typeof createTestStore>
) => {
  const testStore = store || createTestStore();
  return render(
    <Provider store={testStore}>
      <TimerModal isOpen={isOpen} onClose={onClose} timer={timer} />
    </Provider>
  );
};

const mockTimer: Timer = {
  id: 'timer-1',
  title: 'Existing Timer',
  description: 'Description',
  duration: 120,
  remainingTime: 120,
  isRunning: false,
  createdAt: Date.now(),
};

describe('TimerModal', () => {
  const mockOnClose = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateTimerForm).mockReturnValue(true);
    vi.mocked(validateTimerDurationState).mockReturnValue(true);
    user = userEvent.setup();
  });

  describe('Modal Visibility', () => {
    it('does not render when isOpen is false', () => {
      renderModal(false, mockOnClose);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Add New Timer')).not.toBeInTheDocument();
    });

    it('renders "Add New Timer" mode by default', () => {
      renderModal(true, mockOnClose);
      expect(screen.getByText('Add New Timer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add timer/i })).toBeInTheDocument();
    });

    it('renders "Edit Timer" mode when a timer is provided', () => {
      renderModal(true, mockOnClose, mockTimer);
      expect(screen.getByText('Edit Timer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  describe('Form Fields - Add Mode', () => {
    it('displays empty form fields when adding a new timer', () => {
      const { container } = renderModal(true, mockOnClose);

      expect(screen.getByPlaceholderText('Enter timer title')).toHaveValue('');
      expect(screen.getByPlaceholderText('Enter timer description (optional)')).toHaveValue('');
      const inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs[0]).toHaveValue(0); // Hours
      expect(inputs[1]).toHaveValue(0); // Minutes
      expect(inputs[2]).toHaveValue(0); // Seconds
    });

    it('allows user to enter title', async () => {
      renderModal(true, mockOnClose);

      const titleInput = screen.getByPlaceholderText('Enter timer title');
      await user.type(titleInput, 'My New Timer');

      expect(titleInput).toHaveValue('My New Timer');
    });

    it('allows user to enter description', async () => {
      renderModal(true, mockOnClose);

      const descriptionInput = screen.getByPlaceholderText('Enter timer description (optional)');
      await user.type(descriptionInput, 'This is a test description');

      expect(descriptionInput).toHaveValue('This is a test description');
    });

    it('allows user to set hours, minutes, and seconds', async () => {
      const { container } = renderModal(true, mockOnClose);

      const inputs = container.querySelectorAll('input[type="number"]');
      const hoursInput = inputs[0] as HTMLInputElement;
      const minutesInput = inputs[1] as HTMLInputElement;
      const secondsInput = inputs[2] as HTMLInputElement;

      await user.clear(hoursInput);
      await user.type(hoursInput, '1');
      await user.clear(minutesInput);
      await user.type(minutesInput, '30');
      await user.clear(secondsInput);
      await user.type(secondsInput, '45');

      expect(hoursInput).toHaveValue(1);
      expect(minutesInput).toHaveValue(30);
      expect(secondsInput).toHaveValue(45);
    });

    it('limits hours to maximum of 23', async () => {
      const { container } = renderModal(true, mockOnClose);

      const inputs = container.querySelectorAll('input[type="number"]');
      const hoursInput = inputs[0] as HTMLInputElement;
      await user.clear(hoursInput);
      await user.type(hoursInput, '50');

      expect(hoursInput).toHaveValue(23);
    });

    it('limits minutes to maximum of 59', async () => {
      const { container } = renderModal(true, mockOnClose);

      const inputs = container.querySelectorAll('input[type="number"]');
      const minutesInput = inputs[1] as HTMLInputElement;
      await user.clear(minutesInput);
      await user.type(minutesInput, '100');

      expect(minutesInput).toHaveValue(59);
    });

    it('limits seconds to maximum of 59', async () => {
      const { container } = renderModal(true, mockOnClose);

      const inputs = container.querySelectorAll('input[type="number"]');
      const secondsInput = inputs[2] as HTMLInputElement;
      await user.clear(secondsInput);
      await user.type(secondsInput, '100');

      expect(secondsInput).toHaveValue(59);
    });
  });

  describe('Form Fields - Edit Mode', () => {
    it('pre-fills form fields with existing timer data', () => {
      // Need a timer with specific values for this test to match expectations
      const editTimer: Timer = {
        ...mockTimer,
        title: 'Existing Timer',
        description: 'Existing Description',
        duration: 3665,
      };

      const { container } = renderModal(true, mockOnClose, editTimer);

      expect(screen.getByDisplayValue('Existing Timer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
      const inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs[0]).toHaveValue(1); // Hours
      expect(inputs[1]).toHaveValue(1); // Minutes
      expect(inputs[2]).toHaveValue(5); // Seconds
    });
  });

  describe('Form Validation', () => {
    it('shows validation error when title is touched and invalid', async () => {
      renderModal(true, mockOnClose);

      const titleInput = screen.getByPlaceholderText('Enter timer title');
      await user.click(titleInput);
      await user.tab();
      await waitFor(() => {
        expect(
          screen.getByText('Title is required')
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when time fields are touched and invalid', async () => {
      vi.mocked(validateTimerDurationState).mockReturnValue(false);
      const { container } = renderModal(true, mockOnClose);

      const inputs = container.querySelectorAll('input[type="number"]');
      const hoursInput = inputs[0] as HTMLInputElement;
      const minutesInput = inputs[1] as HTMLInputElement;
      const secondsInput = inputs[2] as HTMLInputElement;

      await user.click(hoursInput);
      await user.tab();
      await user.click(minutesInput);
      await user.tab();
      await user.click(secondsInput);
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Please set a duration greater than 0')
        ).toBeInTheDocument();
      });
    });

    it('shows error message when form validation fails on submit', async () => {
      vi.mocked(validateTimerForm).mockReturnValue(false);
      renderModal(true, mockOnClose);

      const submitButton = screen.getByRole('button', { name: /add timer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please fix the highlighted fields before submitting.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Add Mode', () => {
    it('calls addTimer when form is submitted with valid data', async () => {
      const store = createTestStore();
      const { container } = renderModal(true, mockOnClose, undefined, store);

      await user.type(screen.getByPlaceholderText('Enter timer title'), 'New Timer');
      await user.type(screen.getByPlaceholderText('Enter timer description (optional)'), 'Description');
      const inputs = container.querySelectorAll('input[type="number"]');
      const hoursInput = inputs[0] as HTMLInputElement;
      const minutesInput = inputs[1] as HTMLInputElement;
      await user.clear(hoursInput);
      await user.type(hoursInput, '1');
      await user.clear(minutesInput);
      await user.type(minutesInput, '30');

      const submitButton = screen.getByRole('button', { name: /add timer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('closes modal after successful submission', async () => {
      const { container } = renderModal(true, mockOnClose);

      await user.type(screen.getByPlaceholderText('Enter timer title'), 'New Timer');
      const inputs = container.querySelectorAll('input[type="number"]');
      const secondsInput = inputs[2] as HTMLInputElement;
      await user.clear(secondsInput);
      await user.type(secondsInput, '30');

      const submitButton = screen.getByRole('button', { name: /add timer/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission - Edit Mode', () => {
    it('calls editTimer when form is submitted with valid data', async () => {
      const editTimer: Timer = {
        ...mockTimer,
        title: 'Original Timer',
        description: 'Original Description',
        duration: 60,
      };

      const store = createTestStore();
      renderModal(true, mockOnClose, editTimer, store);

      const titleInput = screen.getByDisplayValue('Original Timer');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Timer');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Close', () => {
    it('calls onClose when cancel button is clicked', async () => {
      renderModal(true, mockOnClose);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when X button is clicked', async () => {
      renderModal(true, mockOnClose);

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find(btn =>
        btn.querySelector('svg') && btn.className.includes('rounded-full')
      );

      if (xButton) {
        await user.click(xButton);
        expect(mockOnClose).toHaveBeenCalled();
      } else {
        const fallbackButton = screen.getByRole('button', { name: /close/i });
        await user.click(fallbackButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

  });
});

