import type React from "react";

interface TimerProgressProps {
	progress: number;
}

export const TimerProgress: React.FC<TimerProgressProps> = ({ progress }) => (
	<div className="mb-4 h-2 w-full rounded-full bg-gray-200">
		<div
			className="h-full rounded-full bg-blue-600 transition-all duration-1000"
			style={{ width: `${progress}%` }}
		/>
	</div>
);
