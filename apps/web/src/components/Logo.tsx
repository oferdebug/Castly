export function Logo({ size = "sm" }: { size?: "sm" | "md" }) {
	const dim = size === "sm" ? 28 : 44;
	const rx = size === "sm" ? 8 : 12;
	return (
		<svg
			width={dim}
			height={dim}
			viewBox="0 0 44 44"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect width="44" height="44" rx={rx} fill="#6366F1" />
			<rect
				x="16"
				y="8"
				width="12"
				height="18"
				rx="6"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<path
				d="M10 23 Q10 34 22 34 Q34 34 34 23"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
				fill="none"
			/>
			<line
				x1="22"
				y1="34"
				x2="22"
				y2="40"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<line
				x1="16"
				y1="40"
				x2="28"
				y2="40"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}
