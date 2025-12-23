import { useTimerStore } from "../store/useTimerStore";
import type { Timer } from "../types/timer";
import { TimerAudio } from "../utils/audio";
import { formatTime } from "../utils/time";
import { Button } from "./shared/Button";
import { TimerControls } from "./TimerControls";
import { TimerModal } from "./TimerModal";
import { TimerProgress } from "./TimerProgress";

import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface TimerItemProps {
	timer: Timer;
}

export const TimerItem: React.FC<TimerItemProps> = ({ timer }) => {
	const { toggleTimer, deleteTimer, restartTimer } = useTimerStore();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const intervalRef = useRef<number | null>(null);
	const timerAudio = TimerAudio.getInstance();
	const hasEndedRef = useRef(false);
	const [remainingTime, setRemainingTime] = useState(timer.remainingTime);

	useEffect(() => {
		if (timer.isRunning) {
			intervalRef.current = window.setInterval(() => {
				setRemainingTime((prev) => {
					if (prev <= 1 && !hasEndedRef.current) {
						hasEndedRef.current = true;

						// Play notification sound
						timerAudio.play().catch(console.error);

						// Display snack bar with dismiss option
						toast.success(`Timer "${timer.title}" has ended!`, {
							duration: Infinity, // Keep the snackbar open until dismissed
							action: {
								label: "Dismiss",
								onClick: timerAudio.stop, // Stop sound on dismiss
							},
						});

						return 0;
					}
					return Math.max(0, prev - 1);
				});
			}, 1000);
		} else if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		// Cleanup interval on unmount or timer stop
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [timer.isRunning, timerAudio, timer.title]);

	const handleRestart = () => {
		hasEndedRef.current = false;
		setRemainingTime(timer.duration);
		restartTimer(timer.id);
	};

	const handleDelete = () => {
		timerAudio.stop();
		deleteTimer(timer.id);
	};

	const handleToggle = () => {
		if (remainingTime <= 0) {
			hasEndedRef.current = false;
		}
		toggleTimer(timer.id);
	};

	return (
		<>
			<div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-transform hover:scale-102">
				<div className="absolute inset-0 -z-10 h-full w-full opacity-5">
					<svg
						aria-labelledby="timerBgTitle"
						fill="none"
						role="img"
						viewBox="0 0 100 100"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title id="timerBgTitle">Timer background</title>
						<circle
							cx="50"
							cy="50"
							r="45"
							stroke="currentColor"
							strokeWidth="2"
						/>
						<path
							d="M50 20V50L70 70"
							stroke="currentColor"
							strokeLinecap="round"
							strokeWidth="2"
						/>
					</svg>
				</div>

				<div className="relative">
					<div className="mb-4 flex items-start justify-between">
						<div>
							<h3 className="font-semibold text-gray-800 text-xl">
								{timer.title}
							</h3>
							<p className="mt-1 text-gray-600">{timer.description}</p>
						</div>
						<div className="flex gap-2">
							<Button
								className="rounded-full p-2 text-blue-500 transition-colors hover:bg-blue-50"
								onClick={() => setIsEditModalOpen(true)}
								title="Edit Timer"
								variant="unstyled"
							>
								<Pencil className="h-5 w-5" />
							</Button>

							<Button
								className="rounded-full p-2 text-blue-500 transition-colors hover:bg-blue-50"
								onClick={handleRestart}
								title="Restart Timer"
								variant="unstyled"
							>
								<RotateCcw className="h-5 w-5" />
							</Button>

							<Button
								className="rounded-full p-2 text-red-500 transition-colors hover:bg-red-50"
								onClick={handleDelete}
								title="Delete Timer"
								variant="unstyled"
							>
								<Trash2 className="h-5 w-5" />
							</Button>
						</div>
					</div>
					<div className="mt-6 flex flex-col items-center">
						<div className="mb-4 font-bold font-mono text-4xl text-gray-800">
							{formatTime(remainingTime)}
						</div>

						<TimerProgress progress={(remainingTime / timer.duration) * 100} />

						<TimerControls
							duration={timer.duration}
							isRunning={timer.isRunning}
							onRestart={handleRestart}
							onToggle={handleToggle}
							remainingTime={remainingTime}
						/>
					</div>
				</div>
			</div>

			<TimerModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				timer={timer}
			/>
		</>
	);
};
