interface ProgressWheelProps {
    collected: number;
    total: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
}

export default function ProgressWheel({
    collected,
    total,
    size = 48,
    strokeWidth = 6,
    color = "#f59e0b", // amber-500
    trackColor = "rgba(255,255,255,0.15)"
}: ProgressWheelProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const safeTotal = total > 0 ? total : 1;
    const progress = Math.min(collected / safeTotal, 1);
    const offset = circumference * (1 - progress);

    return (
        <div
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size}>
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />

                {/* Progress ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: "stroke-dashoffset 300ms ease",
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%"
                    }}
                />
            </svg>

            {/* Center text */}
            <div className="absolute text-[10px] font-semibold text-gray-200">
                {total === 0 ? "—" : `${collected}/${total}`}
            </div>
        </div>
    );
}
