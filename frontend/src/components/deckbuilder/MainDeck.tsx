import Card from "./Card";

interface MainDeckProps {
    legend: string;
    battlefields: string[];
    chosenChampion: string;
    main: Record<string, number>;
    onHoverCard?: (cardId: string) => void;
    onLeaveCard?: () => void;
    onRemoveCard?: (cardId: string) => void;
}

export default function MainDeck({
    legend,
    battlefields,
    chosenChampion,
    main,
    onHoverCard,
    onLeaveCard,
    onRemoveCard,
}: MainDeckProps) {
    const mainDeck = Object.entries(main ?? {}).flatMap(([cardId, count]) =>
        Array(count).fill(cardId)
    );

    // Add chosen champion
    if (chosenChampion) {
        mainDeck.unshift(chosenChampion);
    }

    const deckLength = mainDeck.length;
    const deckPlaceholderCount = Math.max(0, 40 - deckLength);
    const bfPlaceholderCount = Math.max(0, 3 - battlefields?.length);

    return (
        <div className="flex items-center justify-between w-full h-full p-5 gap-5 overflow-hidden">
            {/* Deck */}
            <div className="grid grid-cols-10 grid-rows-4 gap-2">
                {mainDeck.map((cardId, index) => (
                    <div key={index} onMouseEnter={() => onHoverCard?.(cardId)} onMouseLeave={onLeaveCard}>
                        <Card cardId={cardId} className="h-[130px] w-[93px]" onRightClick={onRemoveCard} />
                    </div>
                ))}

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
                    {battlefields?.map((cardId, index) => (
                        <div key={index} onMouseEnter={() => onHoverCard?.(cardId)} onMouseLeave={onLeaveCard}>
                            <Card cardId={cardId} className="h-[93px] w-[130px]" onRightClick={onRemoveCard}/>
                        </div>
                    ))}

                    {/* Battlefield placeholders */}
                    {Array.from({ length: bfPlaceholderCount }).map((_, i) => (
                        <Card key={`placeholder-bf-${i}`} className="h-[93px] w-[130px]"/>
                    ))}
                </div>
            </div>
        </div>
    );
}
