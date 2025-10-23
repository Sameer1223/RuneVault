import Card from "./Card";

interface CardSearchPanelProps {
    cards?: any[];
    onAddCard?: (card: string) => void;
    onRemoveCard?: (cardId: string) => void;
}

export default function CardSearchPanel({ cards, onAddCard, onRemoveCard }: CardSearchPanelProps) {
    return (
        <div className="flex justify-center items-center">
            <div className="grid grid-cols-5 gap-2">
                {cards.map((card, index) => (
                    <div key={`${card.cardId}-${index}`} onClick={() => onAddCard?.(card.cardId)}>
                        <Card cardId={card.cardId} className="h-[130px] w-[93px]" onRightClick={onRemoveCard} />
                    </div>
                ))}
            </div>
        </div>
    )
}