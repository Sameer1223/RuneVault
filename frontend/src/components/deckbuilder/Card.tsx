import cardData from "../../data/cards.json";

interface CardProps {
    cardId: string;
    className?: string;
    onHover?: (cardId: string) => void;
    onLeave?: () => void;
    onRightClick?: (cardId: string) => void; 
}
  
export default function Card({ cardId, className = "", onHover, onLeave, onRightClick }: CardProps) {
    const cardImg = `TempCards/${cardId}.avif`;

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        onRightClick?.(cardId);
    };
  
    return (
        <div
            className={`
            bg-[#121212]
            outline-1 outline-zinc-950
            shadow-md hover:shadow-lg transition-all duration-300
            hover:scale-[1.03] cursor-pointer
            relative
            ${className}
            `}
            onMouseEnter={() => onHover?.(cardId)}
            onMouseLeave={onLeave}
            onContextMenu={handleContextMenu}
        >
            {cardId && <img src={cardImg} alt={cardId} className="w-full h-full object-cover" />}
        </div>
    );
}
