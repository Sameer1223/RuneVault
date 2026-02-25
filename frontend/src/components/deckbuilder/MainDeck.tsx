import Card from "./Card";
import cardData from "../../data/cards.json";

interface MainDeckProps {
    legend: string;
    battlefields: string[];
    chosenChampion: string;
    main: Record<string, number>;
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
}: MainDeckProps) {
    const mainDeck = sortCardIds(Object.entries(main ?? {})).flatMap(([cardId, count]) =>
        Array(count).fill(cardId)
    );

    // Add chosen champion
    if (chosenChampion) {
        mainDeck.unshift(chosenChampion);
    }

    const deckLength = mainDeck.length;
    const deckPlaceholderCount = Math.max(0, 40 - deckLength);

    // Track how many of each card we've rendered to determine which copies are selected
    const renderedCount: Record<string, number> = {};

    return (
        <div className="flex items-center justify-between w-full h-full p-5 gap-5 overflow-hidden">
            {/* Deck */}
            <div className="grid grid-cols-10 grid-rows-4 gap-2">
                {mainDeck.map((cardId, index) => {
                    const isChampion = index === 0 && chosenChampion;
                    renderedCount[cardId] = (renderedCount[cardId] ?? 0) + 1;
                    const copyIndex = renderedCount[cardId];
                    const isSelected = !isChampion && copyIndex <= (selectedCards[cardId] ?? 0);

                    return (
                        <div
                            key={index}
                            className={isSelected ? "ring-2 ring-blue-500 rounded-sm" : ""}
                            onMouseEnter={() => onHoverCard?.(cardId)}
                            onMouseLeave={onLeaveCard}
                            onClick={() => !isChampion && onSelectCard?.(cardId)}
                        >
                            <Card cardId={cardId} className="h-[130px] w-[93px]" onRightClick={onRemoveCard} />
                        </div>
                    );
                })}

                {/* Placeholders */}
                {Array.from({ length: deckPlaceholderCount }).map((_, i) => (
                    <Card key={`placeholder-${i}`} className="h-[130px] w-[93px]" />
                ))}
            </div>

            {/* Legend and Battlefields */}
            <div className="h-full flex flex-col justify-center items-center flex-1 gap-1">
                {legend ? (
                    <div onMouseEnter={() => onHoverCard?.(legend)} onMouseLeave={onLeaveCard}>
                        <Card cardId={legend} className="h-[251px] w-[180px]" onRightClick={onRemoveCard}/>
                    </div>
                ) : (
                    <Card key={`placeholder-legend`} className="h-[251px] w-[180px]" />
                )}

                <div className="flex flex-col gap-1">
                    {(["Blind", "First", "Second"] as const).map((label, index) => (
                        <div key={index} className="relative" onMouseEnter={() => battlefields?.[index] && onHoverCard?.(battlefields[index])} onMouseLeave={onLeaveCard}>
                            <span className="absolute top-1 left-1 z-10 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                {label}
                            </span>
                            {battlefields?.[index] ? (
                                <Card cardId={battlefields[index]} className="h-[93px] w-[130px]" onRightClick={onRemoveCard}/>
                            ) : (
                                <Card className="h-[93px] w-[130px]"/>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
