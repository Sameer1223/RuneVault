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

    return (
        <div className="flex items-center justify-between w-full h-full p-5 gap-5 overflow-hidden">
            {/* Deck */}
            <div className="grid grid-cols-10 grid-rows-4 gap-2">
                {mainDeck.map((cardId, index) => {
                    const isChampion = index === 0 && chosenChampion;
                    const isSelected = !isChampion && index in selectedCards;

                    return (
                        <Card
                            key={index}
                            cardId={cardId}
                            className="h-[130px] w-[93px]"
                            isSelected={isSelected}
                            disableHoverScale
                            onHover={(id) => onHoverCard?.(id)}
                            onLeave={onLeaveCard}
                            onClick={() => !isChampion && onSelectCard?.(index, cardId)}
                            onRightClick={onRemoveCard}
                        />
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
                        <div key={index} className="relative z-0" onMouseEnter={() => battlefields?.[index] && onHoverCard?.(battlefields[index])} onMouseLeave={onLeaveCard}>
                            {battlefields?.[index] ? (
                                <Card cardId={battlefields[index]} className="h-[93px] w-[130px]" onRightClick={onRemoveCard}/>
                            ) : (
                                <Card className="h-[93px] w-[130px]"/>
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
