import Card from "./Card";
import cardData from "../../data/cards.json";

interface MainDeckProps {
    legend: string;
    battlefields: string[];
    chosenChampion: string;
    main: Record<string, number>;
    selectedCards?: Record<number, string>;
    onHoverCard?: (cardId: string) => void;
    onLeaveCard?: () => void;
    onRemoveCard?: (cardId: string) => void;
    onSelectCard?: (index: number, cardId: string) => void;
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

export default function MainDeck({
    legend,
    battlefields,
    chosenChampion,
    main,
    selectedCards = {},
    onHoverCard,
    onLeaveCard,
    onRemoveCard,
    onSelectCard,
    collectionMode = false,
    ownedCount,
}: MainDeckProps) {
    // Tracks how many copies of each cardId have already been counted as "owned"
    // while walking the flattened list, so partial ownership (e.g. 1 of 3) colors
    // exactly that many tiles and greys out the rest.
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

    const mainDeck = sortCardIds(Object.entries(main ?? {})).flatMap(([cardId, count]) =>
        Array(count).fill(cardId)
    );

    // Add chosen champion
    if (chosenChampion) {
        mainDeck.unshift(chosenChampion);
    }

    const deckLength = mainDeck.length;
    const deckPlaceholderCount = Math.max(0, 40 - deckLength);

    return (
        <div className="flex flex-col sm:flex-row items-center w-full h-full p-3 sm:p-5 gap-3 sm:gap-5">
            {/* Deck */}
            <div className="shrink-0 grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2">
                {mainDeck.map((cardId, index) => {
                    const isChampion = index === 0 && chosenChampion;
                    const isSelected = !isChampion && index in selectedCards;
                    const dimmed = !isTileOwned(cardId);

                    return (
                        <Card
                            key={index}
                            cardId={cardId}
                            className="w-[var(--dc-card-w)] aspect-[93/130]"
                            isSelected={isSelected}
                            disableHoverScale
                            dimmed={dimmed}
                            onHover={(id) => onHoverCard?.(id)}
                            onLeave={onLeaveCard}
                            onClick={() => !isChampion && onSelectCard?.(index, cardId)}
                            onRightClick={onRemoveCard}
                        />
                    );
                })}

                {/* Placeholders */}
                {Array.from({ length: deckPlaceholderCount }).map((_, i) => (
                    <Card key={`placeholder-${i}`} className="w-[var(--dc-card-w)] aspect-[93/130]" />
                ))}
            </div>

            {/* Legend and Battlefields */}
            <div className="flex flex-row sm:flex-col sm:flex-1 justify-center items-center gap-2 sm:gap-1">
                {legend ? (
                    <div onMouseEnter={() => onHoverCard?.(legend)} onMouseLeave={onLeaveCard}>
                        <Card
                            cardId={legend}
                            className="w-[var(--dc-legend-w)] aspect-[180/251]"
                            dimmed={collectionMode && (ownedCount?.(legend) ?? 0) <= 0}
                            onRightClick={onRemoveCard}
                        />
                    </div>
                ) : (
                    <Card key={`placeholder-legend`} className="w-[var(--dc-legend-w)] aspect-[180/251]" />
                )}

                <div className="flex flex-row sm:flex-col gap-1">
                    {(["Blind", "First", "Second"] as const).map((label, index) => (
                        <div key={index} className="relative z-0" onMouseEnter={() => battlefields?.[index] && onHoverCard?.(battlefields[index])} onMouseLeave={onLeaveCard}>
                            {battlefields?.[index] ? (
                                <Card
                                    cardId={battlefields[index]}
                                    className="w-[var(--dc-bf-w)] aspect-[130/93]"
                                    dimmed={collectionMode && (ownedCount?.(battlefields[index]) ?? 0) <= 0}
                                    onRightClick={onRemoveCard}
                                />
                            ) : (
                                <Card className="w-[var(--dc-bf-w)] aspect-[130/93]"/>
                            )}
                            <span className="absolute top-1 left-1 z-30 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded pointer-events-none">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
