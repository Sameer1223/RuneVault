interface CardProps {
    cardId?: string;
    className?: string;
    isSelected?: boolean;
    disableHoverScale?: boolean;
    onHover?: (cardId: string) => void;
    onLeave?: () => void;
    onClick?: () => void;
    onRightClick?: (cardId: string) => void; 
}
  
export default function Card({ cardId, className = "", isSelected = false, disableHoverScale = false, onHover, onLeave, onClick, onRightClick }: CardProps) {
    const cardImg = cardId ? `TempCards/${cardId}.avif` : undefined;

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
            ${className}
            `}
            onMouseEnter={() => cardId && onHover?.(cardId)}
            onMouseLeave={onLeave}
            onClick={onClick}
            onContextMenu={handleContextMenu}
        >
            {cardImg && <img src={cardImg} alt={cardId} className="w-full h-full object-cover" />}
            {isSelected && (
                <div className="absolute inset-0 border-3 border-blue-500 rounded-sm pointer-events-none z-10" />
            )}
        </div>
    );
}
