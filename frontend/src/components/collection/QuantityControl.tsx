interface QuantityControlProps {
    value: number;
    onChange?: (delta: number) => void;
    compact?: boolean;
}

export default function QuantityControl({ value, onChange, compact = false }: QuantityControlProps) {
    const buttonSize = compact ? "w-4 h-4 text-[10px]" : "w-6 h-6";
    const spanWidth = compact ? "w-3 text-xs" : "w-4 text-xs";

    return (
        <div className={`flex items-center ${compact ? "gap-0" : "gap-1"} shrink-0`} onClick={e => e.stopPropagation()}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onChange?.(-1);
                }}
                disabled={value <= 0}
                className={`${buttonSize} flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded disabled:opacity-30 disabled:hover:bg-zinc-800 transition-colors shrink-0`}
            >
                −
            </button>

            <span className={`${spanWidth} text-center font-medium shrink-0 ${value > 0 ? "text-white" : "text-zinc-500"}`}>
                {value}
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onChange?.(1);
                }}
                className={`${buttonSize} flex items-center justify-center bg-zinc-800 hover:bg-[#caa368] text-zinc-300 hover:text-zinc-900 rounded transition-colors shrink-0`}
            >
                +
            </button>
        </div>
    );
}
