import React, { useEffect, useState, useCallback } from 'react';
import { X, Clock } from 'lucide-react';
import { Button } from './shared/Button';
import { Timer } from '../types/timer';
import { useTimerStore } from '../store/useTimerStore';
import { validateTimerForm, validateTimerDurationState } from '../utils/validation';
import { calculateTotalSecondsFromHoursMinutesSeconds, convertSecondsToHoursMinutesSeconds } from '../utils/time';

interface TimerModalProps {
    /** Controls whether the modal is open or not */
    isOpen: boolean;
    /** Callback to close the modal */
    onClose: () => void;
    /** If `timer` is provided, we switch to "Edit" mode; otherwise, "Add" mode */
    timer?: Timer;
}

export const TimerModal = ({ isOpen, onClose, timer }: TimerModalProps) => {
    const isEditingExistingTimer = Boolean(timer);

    // State for form fields
    const [timerTitleInput, setTimerTitleInput] = useState<string>('');
    const [timerDescriptionInput, setTimerDescriptionInput] = useState<string>('');
    const [timerDurationHours, setTimerDurationHours] = useState<number>(0);
    const [timerDurationMinutes, setTimerDurationMinutes] = useState<number>(0);
    const [timerDurationSeconds, setTimerDurationSeconds] = useState<number>(0);

    // Track "touched" fields to trigger validation messages
    const [touchedFormFields, setTouchedFormFields] = useState<{
        title: boolean;
        hours: boolean;
        minutes: boolean;
        seconds: boolean;
    }>({
        title: false,
        hours: false,
        minutes: false,
        seconds: false,
    });

    // For top-level error message
    const [formSubmissionErrorMessage, setFormSubmissionErrorMessage] = useState<string | null>(null);

    // Timer store actions
    const { addTimer, editTimer } = useTimerStore();

    const resetTimerForm = useCallback(() => {
        setTimerTitleInput('');
        setTimerDescriptionInput('');
        setTimerDurationHours(0);
        setTimerDurationMinutes(0);
        setTimerDurationSeconds(0);
        setTouchedFormFields({
            title: false,
            hours: false,
            minutes: false,
            seconds: false,
        });
        setFormSubmissionErrorMessage(null);
    }, []);

    // Reset form fields whenever the modal opens/closes or when switching timers
    useEffect(() => {
        if (isOpen) {
            // If editing, populate fields from existing timer
            if (isEditingExistingTimer && timer) {
                setTimerTitleInput(timer.title);
                setTimerDescriptionInput(timer.description);
                const { hours: initialHours, minutes: initialMinutes, seconds: initialSeconds } = convertSecondsToHoursMinutesSeconds(timer.duration);
                setTimerDurationHours(initialHours);
                setTimerDurationMinutes(initialMinutes);
                setTimerDurationSeconds(initialSeconds);
                // Clear any previous errors
                setFormSubmissionErrorMessage(null);
                setTouchedFormFields({
                    title: false,
                    hours: false,
                    minutes: false,
                    seconds: false,
                });
            } else {
                // New timer: start with empty fields
                resetTimerForm();
            }
        }
    }, [isOpen, isEditingExistingTimer, timer, resetTimerForm]);

    const isTimerDurationValid = validateTimerDurationState(timerDurationHours, timerDurationMinutes, timerDurationSeconds);
    const isTimerTitleValid = timerTitleInput.trim().length > 0;

    const handleCloseTimerModal = (): void => {
        onClose();
        resetTimerForm();
    };

    const handleTimerFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        // Validate form fields
        const isFormValid = validateTimerForm({ title: timerTitleInput, description: timerDescriptionInput, hours: timerDurationHours, minutes: timerDurationMinutes, seconds: timerDurationSeconds });
        if (!isFormValid) {
            setFormSubmissionErrorMessage('Please fix the highlighted fields before submitting.');
            return;
        }

        const totalSeconds = calculateTotalSecondsFromHoursMinutesSeconds(timerDurationHours, timerDurationMinutes, timerDurationSeconds);

        if (isEditingExistingTimer && timer) {
            // Editing an existing timer
            editTimer(timer.id, {
                title: timerTitleInput.trim(),
                description: timerDescriptionInput.trim(),
                duration: totalSeconds,
            });

            // Reset immediately after successful edit
            resetTimerForm();
        } else {
            // Creating a new timer
            addTimer({
                title: timerTitleInput.trim(),
                description: timerDescriptionInput.trim(),
                duration: totalSeconds,
                remainingTime: totalSeconds,
                isRunning: false,
            });
        }

        handleCloseTimerModal();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold">
                            {isEditingExistingTimer ? 'Edit Timer' : 'Add New Timer'}
                        </h2>
                    </div>
                    <Button
                        onClick={handleCloseTimerModal}
                        variant="unstyled"
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Top-level error message */}
                {formSubmissionErrorMessage && (
                    <div className="mb-4 text-sm font-medium text-red-600">
                        {formSubmissionErrorMessage}
                    </div>
                )}

                {/* Modal Form */}
                <form onSubmit={handleTimerFormSubmit} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={timerTitleInput}
                            onChange={(e) => setTimerTitleInput(e.target.value)}
                            onBlur={() =>
                                setTouchedFormFields((prev) => ({ ...prev, title: true }))
                            }
                            className={`w-full px-3 py-2 border ${touchedFormFields.title && !isTimerTitleValid
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                } rounded-md shadow-sm focus:outline-none focus:ring-2`}
                            placeholder="Enter timer title"
                        />
                        {touchedFormFields.title && !isTimerTitleValid && (
                            <p className="mt-1 text-sm text-red-500">
                                Title is required
                            </p>
                        )}
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={timerDescriptionInput}
                            onChange={(e) => setTimerDescriptionInput(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter timer description (optional)"
                        />
                    </div>

                    {/* Duration Inputs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Duration <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Hours
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={23}
                                    value={timerDurationHours}
                                    onChange={(e) =>
                                        setTimerDurationHours(Math.min(23, parseInt(e.target.value, 10) || 0))
                                    }
                                    onBlur={() =>
                                        setTouchedFormFields((prev) => ({ ...prev, hours: true }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Minutes
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={timerDurationMinutes}
                                    onChange={(e) =>
                                        setTimerDurationMinutes(Math.min(59, parseInt(e.target.value, 10) || 0))
                                    }
                                    onBlur={() =>
                                        setTouchedFormFields((prev) => ({ ...prev, minutes: true }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Seconds
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={59}
                                    value={timerDurationSeconds}
                                    onChange={(e) =>
                                        setTimerDurationSeconds(Math.min(59, parseInt(e.target.value, 10) || 0))
                                    }
                                    onBlur={() =>
                                        setTouchedFormFields((prev) => ({ ...prev, seconds: true }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        {touchedFormFields.hours && touchedFormFields.minutes && touchedFormFields.seconds && !isTimerDurationValid && (
                            <p className="mt-2 text-sm text-red-500">
                                Please set a duration greater than 0
                            </p>
                        )}
                    </div>

                    {/* Form Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button label="Cancel" onClick={handleCloseTimerModal} variant="secondary" />
                        {/* Not disabling the button, so user can see error message if invalid */}
                        <Button
                            label={isEditingExistingTimer ? 'Save Changes' : 'Add Timer'}
                            type="submit"
                            variant="primary"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};
