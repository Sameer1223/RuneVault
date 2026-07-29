import Card from "./Card";
import cardData from "../../data/cards.json";

interface SideDeckProps {
    side: Record<string, number>;
    selectedCards?: Record<number, string>;
    onHoverCard?: (cardId: string) => void;
    onLeaveCard?: () => void;
    onRemoveCard?: (cardId: string) => void;
    onSelectCard?: (index: number, cardId: string) => void;
    onDuplicateCard?: (cardId: string) => void;
    collectionMode?: boolean;
    ownedCount?: (cardId: string) => number;
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

export default function SideDeck ({ side, selectedCards = {}, onHoverCard, onLeaveCard, onRemoveCard, onSelectCard, onDuplicateCard, collectionMode = false, ownedCount }: SideDeckProps) {
    const sideDeck = sortCardIds(Object.entries(side ?? {})).flatMap(([cardId, count]) => Array(count).fill(cardId));

    // Tracks how many copies of each cardId have already been counted as "owned"
    // so partial ownership colors exactly that many tiles and greys out the rest.
    const ownedRemaining: Record<string, number> = {};
    const isTileOwned = (cardId: string) => {
        if (!collectionMode) return true;
        if (!(cardId in ownedRemaining)) ownedRemaining[cardId] = ownedCount?.(cardId) ?? 0;
        if (ownedRemaining[cardId] > 0) {
            ownedRemaining[cardId] -= 1;
            return true;
        }
        return false;
    };

    const deckLength = sideDeck.length;
    const placeholderCount = Math.max(0, 10 - deckLength);

    return (
        <div className="flex items-center w-full h-full gap-5">
            {/* Side Deck */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                {sideDeck.map((cardId, index) => {
                    const isSelected = index in selectedCards;
                    const dimmed = !isTileOwned(cardId);

                    return (
                        <div
                            key={index}
                            className={isSelected ? "ring-2 ring-blue-500 rounded-sm" : ""}
                            onMouseEnter={() => onHoverCard?.(cardId)}
                            onMouseLeave={onLeaveCard}
                            onClick={(e) => {
                                if (e.ctrlKey || e.metaKey) onDuplicateCard?.(cardId);
                                else onSelectCard?.(index, cardId);
                            }}
                        >
                            <Card cardId={cardId} className="w-[var(--dc-card-w)] aspect-[93/130]" dimmed={dimmed} onRightClick={onRemoveCard}/>
                        </div>
                    );
                })}

                {/* Placeholders */}
                {Array.from({ length: placeholderCount }).map((_, i) => (
                    <Card key={`placeholder-${i}`} className="w-[var(--dc-card-w)] aspect-[93/130]" />
                ))}
            </div>
        </div>

    );
}