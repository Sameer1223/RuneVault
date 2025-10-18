import Card from "./Card";

interface SideDeckProps {
    side: Record<string, number>;
    onHoverCard?: (cardId: string) => void;
    onLeaveCard?: () => void;
}

export default function SideDeck ({ side, onHoverCard, onLeaveCard }: MainDeckProps) {
    const sideDeck = Object.entries(side ?? {}).flatMap(([cardId, count]) => Array(count).fill(cardId));
    
    const deckLength = sideDeck.length;
    const placeholderCount = Math.max(0, 8 - deckLength);

    return (
        <div className="flex items-center w-full h-full gap-5 overflow-hidden">
            {/* Side Deck */}
            <div className="grid grid-cols-8 grid-rows-1 gap-2">
                {sideDeck.map((cardId, index) => (
                    <div key={index} onMouseEnter={() => onHoverCard?.(cardId)} onMouseLeave={onLeaveCard}>
                        <Card cardId={cardId} className="h-[130px] w-[93px]" />
                    </div>
                ))} 

                {/* Placeholders */}
                {Array.from({ length: placeholderCount }).map((_, i) => (
                    <Card key={`placeholder-${i}`} className="h-[130px] w-[93px]" />
                ))}
            </div>
        </div>

    );
}