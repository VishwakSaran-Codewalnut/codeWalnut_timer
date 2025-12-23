import { Button } from "./shared/Button";

import { Pause, Play, RotateCcw } from "lucide-react";
import type React from "react";

interface TimerControlsProps {
	isRunning: boolean;
	remainingTime: number;
	duration: number;
	onToggle: () => void;
	onRestart: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
	isRunning,
	remainingTime,
	onToggle,
	onRestart,
}) => {
	const isCompleted = remainingTime <= 0;

	if (isCompleted) {
		return (
			<Button
				className="rounded-full bg-blue-100 p-3 text-blue-600 transition-colors hover:bg-blue-200"
				onClick={onRestart}
				title="Restart Timer"
				variant="unstyled"
			>
				<RotateCcw className="h-6 w-6" />
			</Button>
		);
	}

	return (
		<Button
			className={`rounded-full p-3 transition-colors ${
				isRunning
					? "bg-red-100 text-red-600 hover:bg-red-200"
					: "bg-green-100 text-green-600 hover:bg-green-200"
			}`}
			onClick={onToggle}
			title={isRunning ? "Pause Timer" : "Start Timer"}
			variant="unstyled"
		>
			{isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
		</Button>
	);
};
