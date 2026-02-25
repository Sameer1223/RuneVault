import Card from "./Card";
import cardData from "../../data/cards.json";

interface SideDeckProps {
    side: Record<string, number>;
    selectedCards?: Record<string, number>;
    onHoverCard?: (cardId: string) => void;
    onLeaveCard?: () => void;
    onRemoveCard?: (cardId: string) => void;
    onSelectCard?: (cardId: string) => void;
}

function sortCardIds(cardIds: [string, number][]): [string, number][] {
    return cardIds.sort(([a], [b]) => {
        const cardA = cardData.find((c) => c.cardId === a);
        const cardB = cardData.find((c) => c.cardId === b);
        const energyA = cardA?.energy ?? 0;
        const energyB = cardB?.energy ?? 0;
        if (energyA !== energyB) return energyA - energyB;
        return (cardA?.name ?? a).localeCompare(cardB?.name ?? b);
    });
}

export default function SideDeck ({ side, selectedCards = {}, onHoverCard, onLeaveCard, onRemoveCard, onSelectCard }: SideDeckProps) {
    const sideDeck = sortCardIds(Object.entries(side ?? {})).flatMap(([cardId, count]) => Array(count).fill(cardId));
    
    const deckLength = sideDeck.length;
    const placeholderCount = Math.max(0, 8 - deckLength);

    const renderedCount: Record<string, number> = {};

    return (
        <div className="flex items-center w-full h-full gap-5 overflow-hidden">
            {/* Side Deck */}
            <div className="grid grid-cols-8 grid-rows-1 gap-2">
                {sideDeck.map((cardId, index) => {
                    renderedCount[cardId] = (renderedCount[cardId] ?? 0) + 1;
                    const copyIndex = renderedCount[cardId];
                    const isSelected = copyIndex <= (selectedCards[cardId] ?? 0);

                    return (
                        <div
                            key={index}
                            className={isSelected ? "ring-2 ring-blue-500 rounded-sm" : ""}
                            onMouseEnter={() => onHoverCard?.(cardId)}
                            onMouseLeave={onLeaveCard}
                            onClick={() => onSelectCard?.(cardId)}
                        >
                            <Card cardId={cardId} className="h-[130px] w-[93px]" onRightClick={onRemoveCard}/>
                        </div>
                    );
                })} 

                {/* Placeholders */}
                {Array.from({ length: placeholderCount }).map((_, i) => (
                    <Card key={`placeholder-${i}`} className="h-[130px] w-[93px]" />
                ))}
            </div>
        </div>

    );
}