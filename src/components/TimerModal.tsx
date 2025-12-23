import { useTimerStore } from "../store/useTimerStore";
import type { Timer } from "../types/timer";
import { validateTimerForm } from "../utils/validation";
import { Button } from "./shared/Button";

import { Clock, X } from "lucide-react";
import type React from "react";
import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";

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
	const [title, setTitle] = useState<string>("");
	const [description, setDescription] = useState<string>("");
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

	// Helper to reset all fields
	const resetForm = useCallback(() => {
		setTitle("");
		setDescription("");
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

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
		e.preventDefault();

		// Validate form fields
		const isFormValid = validateTimerForm({
			title,
			description,
			hours,
			minutes,
			seconds,
		});
		if (!isFormValid) {
			setFormErrorMessage(
				"Please fix the highlighted fields before submitting.",
			);
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

	const handleClose = (): void => {
		onClose();
		// Also reset form on close, to be completely sure
		resetForm();
	};

	// Validation checks
	const isTimeValid = hours > 0 || minutes > 0 || seconds > 0;
	const isTitleValid = title.trim().length > 0 && title.length <= 50;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
			<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
				{/* Modal Header */}
				<div className="mb-6 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-blue-600" />
						<h2 className="font-semibold text-xl">
							{isEditing ? "Edit Timer" : "Add New Timer"}
						</h2>
					</div>
					<Button
						className="rounded-full p-1 transition-colors hover:bg-gray-100"
						onClick={handleClose}
						variant="unstyled"
					>
						<X className="h-5 w-5" />
					</Button>
				</div>

				{/* Top-level error message */}
				{formErrorMessage && (
					<div className="mb-4 font-medium text-red-600 text-sm">
						{formErrorMessage}
					</div>
				)}

				{/* Modal Form */}
				<form className="space-y-6" onSubmit={handleSubmit}>
					{/* Title Input */}
					<div>
						<label
							className="mb-1 block font-medium text-gray-700 text-sm"
							htmlFor="timer-title"
						>
							Title <span className="text-red-500">*</span>
						</label>
						<input
							className={`w-full border px-3 py-2 ${
								touched.title && !isTitleValid
									? "border-red-500 focus:ring-red-500"
									: "border-gray-300 focus:ring-blue-500"
							} rounded-md shadow-sm focus:outline-none focus:ring-2`}
							id="timer-title"
							maxLength={50}
							onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter timer title"
							type="text"
							value={title}
						/>
						{touched.title && !isTitleValid && (
							<p className="mt-1 text-red-500 text-sm">
								Title is required and must be less than 50 characters
							</p>
						)}
						<p className="mt-1 text-gray-500 text-sm">
							{title.length}/50 characters
						</p>
					</div>

					{/* Description Input */}
					<div>
						<label
							className="mb-1 block font-medium text-gray-700 text-sm"
							htmlFor="timer-description"
						>
							Description
						</label>
						<textarea
							className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							id="timer-description"
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Enter timer description (optional)"
							rows={3}
							value={description}
						/>
					</div>

					{/* Duration Inputs */}
					<div>
						<span className="mb-3 block font-medium text-gray-700 text-sm">
							Duration <span className="text-red-500">*</span>
						</span>
						<div className="grid grid-cols-3 gap-4">
							<div>
								<label
									className="mb-1 block text-gray-600 text-sm"
									htmlFor="timer-hours"
								>
									Hours
								</label>
								<input
									className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									id="timer-hours"
									max={23}
									min={0}
									onBlur={() =>
										setTouched((prev) => ({ ...prev, hours: true }))
									}
									onChange={(e) =>
										setHours(Math.min(23, parseInt(e.target.value, 10) || 0))
									}
									type="number"
									value={hours}
								/>
							</div>
							<div>
								<label
									className="mb-1 block text-gray-600 text-sm"
									htmlFor="timer-minutes"
								>
									Minutes
								</label>
								<input
									className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									id="timer-minutes"
									max={59}
									min={0}
									onBlur={() =>
										setTouched((prev) => ({ ...prev, minutes: true }))
									}
									onChange={(e) =>
										setMinutes(Math.min(59, parseInt(e.target.value, 10) || 0))
									}
									type="number"
									value={minutes}
								/>
							</div>
							<div>
								<label
									className="mb-1 block text-gray-600 text-sm"
									htmlFor="timer-seconds"
								>
									Seconds
								</label>
								<input
									className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									id="timer-seconds"
									max={59}
									min={0}
									onBlur={() =>
										setTouched((prev) => ({ ...prev, seconds: true }))
									}
									onChange={(e) =>
										setSeconds(Math.min(59, parseInt(e.target.value, 10) || 0))
									}
									type="number"
									value={seconds}
								/>
							</div>
						</div>
						{touched.hours &&
							touched.minutes &&
							touched.seconds &&
							!isTimeValid && (
								<p className="mt-2 text-red-500 text-sm">
									Please set a duration greater than 0
								</p>
							)}
					</div>

					{/* Form Buttons */}
					<div className="flex justify-end gap-3 border-t pt-4">
						<Button label="Cancel" onClick={handleClose} variant="secondary" />
						{/* Not disabling the button, so user can see error message if invalid */}
						<Button
							label={isEditing ? "Save Changes" : "Add Timer"}
							type="submit"
							variant="primary"
						/>
					</div>
				</form>
			</div>
		</div>
	);
};
