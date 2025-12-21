import React, { FC, useEffect, useState, useCallback, useMemo } from 'react';
import { X, Clock } from 'lucide-react';
import { Button } from './shared/Button';
import { Timer } from '../types/timer';
import { useTimerStore } from '../store/useTimerStore';
import { validateTimerForm } from '../utils/validation';

interface TimerModalProps {
    /** Controls whether the modal is open or not */
    isOpen: boolean;
    /** Callback to close the modal */
    onClose: () => void;
    /** If `timer` is provided, we switch to "Edit" mode; otherwise, "Add" mode */
    timer?: Timer;
}

export const TimerModal: FC<TimerModalProps> = ({ isOpen, onClose, timer }) => {
    const isEditing = Boolean(timer);

    // State for form fields
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [seconds, setSeconds] = useState<number>(0);

    // Track "touched" fields to trigger validation messages
    const [touched, setTouched] = useState<{
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
    const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

    // Timer store actions
    const { addTimer, editTimer } = useTimerStore();

    const resetForm = useCallback(() => {
        setTitle('');
        setDescription('');
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setTouched({
            title: false,
            hours: false,
            minutes: false,
            seconds: false,
        });
        setFormErrorMessage(null);
    }, []);

    // Reset form fields whenever the modal opens/closes or when switching timers
    useEffect(() => {
        if (isOpen) {
            // If editing, populate fields from existing timer
            if (isEditing && timer) {
                setTitle(timer.title);
                setDescription(timer.description);
                setHours(Math.floor(timer.duration / 3600));
                setMinutes(Math.floor((timer.duration % 3600) / 60));
                setSeconds(timer.duration % 60);
                // Clear any previous errors
                setFormErrorMessage(null);
                setTouched({
                    title: false,
                    hours: false,
                    minutes: false,
                    seconds: false,
                });
            } else {
                // New timer: start with empty fields
                resetForm();
            }
        }
    }, [isOpen, isEditing, timer, resetForm]);

    const isTimeValid = useMemo(() => {
        return hours > 0 || minutes > 0 || seconds > 0;
    }, [hours, minutes, seconds]);

    const isTitleValid = useMemo(() => {
        return title.trim().length > 0 && title.length <= 50;
    }, [title]);

    const handleClose = (): void => {
        onClose();
        resetForm();
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        // Validate form fields
        const isFormValid = validateTimerForm({ title, description, hours, minutes, seconds });
        if (!isFormValid) {
            setFormErrorMessage('Please fix the highlighted fields before submitting.');
            return;
        }

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (isEditing && timer) {
            // Editing an existing timer
            editTimer(timer.id, {
                title: title.trim(),
                description: description.trim(),
                duration: totalSeconds,
            });

            // Reset immediately after successful edit
            resetForm();
        } else {
            // Creating a new timer
            addTimer({
                title: title.trim(),
                description: description.trim(),
                duration: totalSeconds,
                remainingTime: totalSeconds,
                isRunning: false,
            });
        }

        handleClose();
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
                            {isEditing ? 'Edit Timer' : 'Add New Timer'}
                        </h2>
                    </div>
                    <Button
                        onClick={handleClose}
                        variant="unstyled"
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Top-level error message */}
                {formErrorMessage && (
                    <div className="mb-4 text-sm font-medium text-red-600">
                        {formErrorMessage}
                    </div>
                )}

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() =>
                                setTouched((prev) => ({ ...prev, title: true }))
                            }
                            maxLength={50}
                            className={`w-full px-3 py-2 border ${touched.title && !isTitleValid
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                } rounded-md shadow-sm focus:outline-none focus:ring-2`}
                            placeholder="Enter timer title"
                        />
                        {touched.title && !isTitleValid && (
                            <p className="mt-1 text-sm text-red-500">
                                Title is required and must be less than 50 characters
                            </p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            {title.length}/50 characters
                        </p>
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
                                    value={hours}
                                    onChange={(e) =>
                                        setHours(Math.min(23, parseInt(e.target.value, 10) || 0))
                                    }
                                    onBlur={() =>
                                        setTouched((prev) => ({ ...prev, hours: true }))
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
                                    value={minutes}
                                    onChange={(e) =>
                                        setMinutes(Math.min(59, parseInt(e.target.value, 10) || 0))
                                    }
                                    onBlur={() =>
                                        setTouched((prev) => ({ ...prev, minutes: true }))
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
                                    value={seconds}
                                    onChange={(e) =>
                                        setSeconds(Math.min(59, parseInt(e.target.value, 10) || 0))
                                    }
                                    onBlur={() =>
                                        setTouched((prev) => ({ ...prev, seconds: true }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        {touched.hours && touched.minutes && touched.seconds && !isTimeValid && (
                            <p className="mt-2 text-sm text-red-500">
                                Please set a duration greater than 0
                            </p>
                        )}
                    </div>

                    {/* Form Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button label="Cancel" onClick={handleClose} variant="secondary" />
                        {/* Not disabling the button, so user can see error message if invalid */}
                        <Button
                            label={isEditing ? 'Save Changes' : 'Add Timer'}
                            type="submit"
                            variant="primary"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};
