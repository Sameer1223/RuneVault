export default function QuantityControl({ value, onChange }) {
    return (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(-1);
                }}
                disabled={value <= 0}
                className="w-6 h-6 bg-zinc-700 rounded disabled:opacity-40"
            >
                −
            </button>

            <span className="text-xs w-4 text-center">
                {value}
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(1);
                }}
                className="w-6 h-6 bg-zinc-700 rounded"
            >
                +
            </button>
        </div>
    );
}
