import type React from "react";

export const TimerBackground: React.FC = () => (
	<svg
		aria-labelledby="timerBackgroundTitle"
		className="absolute inset-0 -z-10 h-full w-full opacity-5"
		fill="none"
		role="img"
		viewBox="0 0 100 100"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title id="timerBackgroundTitle">Timer background pattern</title>
		<circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
		<path
			d="M50 20V50L70 70"
			stroke="currentColor"
			strokeLinecap="round"
			strokeWidth="2"
		/>
	</svg>
);
