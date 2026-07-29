import Card from "./Card";

interface RuneDeckProps {
    runes: Record<string, number>;
    onRemoveCard?: (cardId: string) => void;
    onDuplicateCard?: (cardId: string) => void;
}

export default function RunesDeck ({ runes, onRemoveCard, onDuplicateCard }: RuneDeckProps) {
    const runeDeck = Object.entries(runes ?? {});

    const deckLength = runeDeck.length;
    const placeholderCount = Math.max(0, 2 - deckLength);

    return (
        <div className="flex items-center w-full h-full gap-5">
            {/* Deck */}
            <div className="grid grid-cols-2 gap-2">
                {runeDeck.map(([cardId, count], index) => (
                    <div
                        key={index}
                        className="relative w-[var(--dc-card-w)] aspect-[93/130]"
                        onClick={(e) => {
                            if (e.ctrlKey || e.metaKey) onDuplicateCard?.(cardId);
                        }}
                    >
                        <Card cardId={cardId} className="h-full w-full" onRightClick={onRemoveCard}/>
                        <div className="absolute bottom-0 right-0 bg-[#caa368] text-white text-xs font-semibold
                                    h-8 w-8 flex items-center justify-center rounded-tl-md">
                        x{count}
                        </div>
                    </div>
                ))}


                {/* Placeholders */}
                {Array.from({ length: placeholderCount }).map((_, i) => (
                    <Card key={`placeholder-${i}`} className="w-[var(--dc-card-w)] aspect-[93/130]" />
                ))}
            </div>
        </div>

    );
}
