import type React from "react";

export const EmptyState: React.FC = () => (
	<svg
		aria-labelledby="emptyStateTitle"
		className="mb-4 h-64 w-64 text-gray-300"
		fill="none"
		role="img"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title id="emptyStateTitle">No timers available</title>
		<circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
		<path
			d="M12 6V12L16 16"
			stroke="currentColor"
			strokeLinecap="round"
			strokeWidth="2"
		/>
		<path
			d="M7 8.5C7 8.5 8.5 7 12 7C15.5 7 17 8.5 17 8.5"
			stroke="currentColor"
			strokeLinecap="round"
			strokeWidth="2"
		/>
	</svg>
);
