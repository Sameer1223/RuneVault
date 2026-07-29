import { ArrowRightLeft, ArrowRight, X } from "lucide-react";

interface SwapBarProps {
    mainCount: number;
    sideCount: number;
    onMoveToSide: () => void;
    onMoveToMain: () => void;
    onSwap: () => void;
    onCancel: () => void;
    canMoveToSide?: boolean;
    canMoveToMain?: boolean;
    canSwap?: boolean;
}

export default function SwapBar({ mainCount, sideCount, onMoveToSide, onMoveToMain, onSwap, onCancel, canMoveToSide = true, canMoveToMain = true, canSwap = true }: SwapBarProps) {
    if (mainCount === 0 && sideCount === 0) return null;

    return (
        <div className="fixed lg:absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-[#1a1a2e] border border-zinc-700 rounded-lg px-3 sm:px-5 py-2 sm:py-3 shadow-2xl max-w-[95vw]">
            {/* Main selections label */}
            {mainCount > 0 && (
                <span className="text-sm text-blue-400 font-medium">
                    {mainCount} from Main
                </span>
            )}

            {/* Move to Side button */}
            {mainCount > 0 && sideCount === 0 && (
                <button
                    onClick={onMoveToSide}
                    disabled={!canMoveToSide}
                    className={`flex items-center gap-1.5 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors ${
                        canMoveToSide ? 'bg-blue-600 hover:bg-blue-500' : 'bg-zinc-600 opacity-50 cursor-not-allowed'
                    }`}
                    title={!canMoveToSide ? 'Side deck is full (max 10)' : undefined}
                >
                    Move to Side <ArrowRight size={14} />
                </button>
            )}

            {/* Swap button */}
            {mainCount > 0 && sideCount > 0 && (
                <button
                    onClick={onSwap}
                    disabled={!canSwap}
                    className={`flex items-center gap-1.5 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors ${
                        canSwap ? 'bg-purple-600 hover:bg-purple-500' : 'bg-zinc-600 opacity-50 cursor-not-allowed'
                    }`}
                    title={!canSwap ? 'Swap would exceed deck capacity' : undefined}
                >
                    <ArrowRightLeft size={14} /> Swap
                </button>
            )}

            {/* Side selections label */}
            {sideCount > 0 && (
                <span className="text-sm text-blue-400 font-medium">
                    {sideCount} from Side
                </span>
            )}

            {/* Move to Main button */}
            {sideCount > 0 && mainCount === 0 && (
                <button
                    onClick={onMoveToMain}
                    disabled={!canMoveToMain}
                    className={`flex items-center gap-1.5 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors ${
                        canMoveToMain ? 'bg-blue-600 hover:bg-blue-500' : 'bg-zinc-600 opacity-50 cursor-not-allowed'
                    }`}
                    title={!canMoveToMain ? 'Main deck is full (max 39)' : undefined}
                >
                    <ArrowRight size={14} className="rotate-180" /> Move to Main
                </button>
            )}

            {/* Cancel */}
            <button
                onClick={onCancel}
                className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm px-2 py-1.5 rounded transition-colors"
            >
                <X size={14} /> Cancel
            </button>
        </div>
    );
}
