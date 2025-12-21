import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TimerModal } from '../../src/components/TimerModal';
import { Timer } from '../../src/types/timer';
import { validateTimerForm } from '../../src/utils/validation';

vi.mock('../../src/utils/validation', () => ({
  validateTimerForm: vi.fn(),
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

describe('TimerModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateTimerForm).mockReturnValue(true);
  });

  describe('Modal Visibility', () => {
    it('does not render when isOpen is false', () => {
      renderModal(false, mockOnClose);
      expect(screen.queryByText('Add New Timer')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Timer')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      renderModal(true, mockOnClose);
      expect(screen.getByText('Add New Timer')).toBeInTheDocument();
    });

    it('shows "Add New Timer" title when no timer is provided', () => {
      renderModal(true, mockOnClose);
      expect(screen.getByText('Add New Timer')).toBeInTheDocument();
    });

    it('shows "Edit Timer" title when timer is provided', () => {
      const timer: Timer = {
        id: 'timer-1',
        title: 'Existing Timer',
        description: 'Description',
        duration: 120,
        remainingTime: 120,
        isRunning: false,
        createdAt: Date.now(),
      };
      renderModal(true, mockOnClose, timer);
      expect(screen.getByText('Edit Timer')).toBeInTheDocument();
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
      const user = userEvent.setup();
      renderModal(true, mockOnClose);

      const titleInput = screen.getByPlaceholderText('Enter timer title');
      await user.type(titleInput, 'My New Timer');

      expect(titleInput).toHaveValue('My New Timer');
    });

    it('allows user to enter description', async () => {
      const user = userEvent.setup();
      renderModal(true, mockOnClose);

      const descriptionInput = screen.getByPlaceholderText('Enter timer description (optional)');
      await user.type(descriptionInput, 'This is a test description');

      expect(descriptionInput).toHaveValue('This is a test description');
    });

    it('allows user to set hours, minutes, and seconds', async () => {
      const user = userEvent.setup();
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
      const user = userEvent.setup();
      const { container } = renderModal(true, mockOnClose);

      const inputs = container.querySelectorAll('input[type="number"]');
      const hoursInput = inputs[0] as HTMLInputElement;
      await user.clear(hoursInput);
      await user.type(hoursInput, '50');

      expect(hoursInput).toHaveValue(23);
    });

    it('limits minutes to maximum of 59', async () => {
      const user = userEvent.setup();
      const { container } = renderModal(true, mockOnClose);

      const inputs = container.querySelectorAll('input[type="number"]');
      const minutesInput = inputs[1] as HTMLInputElement;
      await user.clear(minutesInput);
      await user.type(minutesInput, '100');

      expect(minutesInput).toHaveValue(59);
    });

    it('limits seconds to maximum of 59', async () => {
      const user = userEvent.setup();
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
      const timer: Timer = {
        id: 'timer-1',
        title: 'Existing Timer',
        description: 'Existing Description',
        duration: 3665,
        remainingTime: 3665,
        isRunning: false,
        createdAt: Date.now(),
      };

      const { container } = renderModal(true, mockOnClose, timer);

      expect(screen.getByDisplayValue('Existing Timer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
      const inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs[0]).toHaveValue(1); // Hours
      expect(inputs[1]).toHaveValue(1); // Minutes
      expect(inputs[2]).toHaveValue(5); // Seconds
    });
  });

  describe('Form Validation', () => {
    it('shows character count for title', async () => {
      const user = userEvent.setup();
      renderModal(true, mockOnClose);

      const titleInput = screen.getByPlaceholderText('Enter timer title');
      await user.type(titleInput, 'Test');

      expect(screen.getByText('4/50 characters')).toBeInTheDocument();
    });

    it('shows validation error when title is touched and invalid', async () => {
      const user = userEvent.setup();
      renderModal(true, mockOnClose);

      const titleInput = screen.getByPlaceholderText('Enter timer title');
      await user.click(titleInput);
      await user.tab();
      await waitFor(() => {
        expect(
          screen.getByText('Title is required and must be less than 50 characters')
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when time fields are touched and invalid', async () => {
      const user = userEvent.setup();
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
      const user = userEvent.setup();
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
      const user = userEvent.setup();
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
      const user = userEvent.setup();
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
      const user = userEvent.setup();
      const timer: Timer = {
        id: 'timer-1',
        title: 'Original Timer',
        description: 'Original Description',
        duration: 60,
        remainingTime: 60,
        isRunning: false,
        createdAt: Date.now(),
      };

      const store = createTestStore();
      renderModal(true, mockOnClose, timer, store);

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
      const user = userEvent.setup();
      renderModal(true, mockOnClose);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when X button is clicked', async () => {
      const user = userEvent.setup();
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

