import { Button } from "./components/shared/Button";
import { TimerList } from "./components/TimerList";
import { TimerModal } from "./components/TimerModal";
import { useTimerStore } from "./store/useTimerStore";

import { Clock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

function Home() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [toasterPosition, setToasterPosition] = useState<
		"top-right" | "bottom-center"
	>("top-right");

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth <= 768) {
				setToasterPosition("bottom-center"); // Mobile
			} else {
				setToasterPosition("top-right"); // Desktop
			}
		};

		handleResize(); // Set initial position
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<Toaster position={toasterPosition} />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-6 flex items-center justify-between">
					{/* Timer Title */}
					<div className="flex items-center gap-3">
						<Clock className="h-8 w-8 text-blue-600" />
						<h1 className="font-bold text-3xl text-gray-900">Timer</h1>
					</div>

					{/* Add Timer Button */}
					<Button onClick={() => setIsModalOpen(true)} variant="primary">
						<Plus className="h-5 w-5" />
						Add Timer
					</Button>
				</div>

				<TimerList />

				<TimerModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
				/>
			</div>
		</div>
	);
}

export default Home;
