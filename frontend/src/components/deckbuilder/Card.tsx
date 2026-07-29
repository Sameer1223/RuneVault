import { Ban } from 'lucide-react';
import CardImage from '../CardImage';
import { bannedCardIds } from '@/data/bannedCards';

interface CardProps {
    cardId?: string;
    className?: string;
    isSelected?: boolean;
    disableHoverScale?: boolean;
    dimmed?: boolean;
    onHover?: (cardId: string) => void;
    onLeave?: () => void;
    onClick?: () => void;
    onRightClick?: (cardId: string) => void;
}

export default function Card({ cardId, className = "", isSelected = false, disableHoverScale = false, dimmed = false, onHover, onLeave, onClick, onRightClick }: CardProps) {
    const isBanned = !!cardId && bannedCardIds.includes(cardId);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        if (cardId) onRightClick?.(cardId);
    };

    return (
        <div
            className={`
            bg-[#121212]
            outline-1 outline-zinc-950
            shadow-md hover:shadow-lg transition-all duration-300
            ${disableHoverScale ? '' : 'hover:scale-[1.03] hover:z-20'} cursor-pointer
            relative
            ${isBanned ? 'ring-2 ring-red-500/70' : ''}
            ${className}
            `}
            onMouseEnter={() => cardId && onHover?.(cardId)}
            onMouseLeave={onLeave}
            onClick={onClick}
            onContextMenu={handleContextMenu}
        >
            {cardId && (
                <CardImage
                    cardId={cardId}
                    className={`w-full h-full object-cover ${dimmed ? "grayscale brightness-[0.55]" : ""}`}
                />
            )}
            {isSelected && (
                <div className="absolute inset-0 border-3 border-blue-500 rounded-sm pointer-events-none z-10" />
            )}
            {isBanned && (
                <div
                    title="Banned"
                    className="absolute top-1 right-1 z-20 flex items-center justify-center bg-black/45 border border-red-400/60 text-red-400 rounded-md p-0.5 pointer-events-none"
                >
                    <Ban className="w-3 h-3" strokeWidth={2.5} />
                </div>
            )}
        </div>
    );
}
