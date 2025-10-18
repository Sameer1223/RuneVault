interface CardProps {
    cardId: string;
    className?: string;
    onHover?: (cardId: string) => void;
    onLeave?: () => void;
}
  
export default function Card({ cardId, className = "", onHover, onLeave }: CardProps) {
    const cardImg = `TempCards/${cardId}.webp`;
  
    return (
        <div
            className={`
            bg-gray-800
            outline-1 outline-zinc-800
            shadow-md hover:shadow-lg transition-all duration-300
            hover:scale-[1.03] cursor-pointer
            relative
            ${className}
            `}
            onMouseEnter={() => onHover?.(cardId)}
            onMouseLeave={onLeave}
        >
            {cardId && <img src={cardImg} alt={cardId} className="w-full h-full object-cover" />}
        </div>
    );
}
