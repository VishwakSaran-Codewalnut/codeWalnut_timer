import { useTimerStore } from "../store/useTimerStore";
import { EmptyState } from "./EmptyState";
import { TimerItem } from "./TimerItem";

import type React from "react";

export const TimerList: React.FC = () => {
	const { timers } = useTimerStore();

	return (
		<div className="min-h-[400px] space-y-4">
			{timers.length === 0 ? (
				<div className="flex h-[400px] flex-col items-center justify-center">
					<EmptyState />
					<p className="text-center font-medium text-gray-500 text-xl">
						No timers yet. Add one to get started!
					</p>
					<p className="mt-2 text-center text-gray-400">
						Click the "Add Timer" button above to create your first timer.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{timers.map((timer) => (
						<TimerItem key={timer.id} timer={timer} />
					))}
				</div>
			)}
		</div>
	);
};
