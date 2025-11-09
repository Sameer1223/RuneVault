import { useState } from "react";
import Card from "./Card";

interface CardSearchPanelProps {
  cards?: any[];
  onAddCard?: (card: string) => void;
  onRemoveCard?: (cardId: string) => void;
  deckCards?: Record<string, number>;
}

export default function CardSearchPanel({
  cards = [],
  onAddCard,
  onRemoveCard,
  deckCards = {},
}: CardSearchPanelProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const PREVIEW_WIDTH = 250;
  const PREVIEW_HEIGHT = 350;
  const OFFSET = 5;

  const calcPreviewPosition = () => {
    let left = mousePos.x + OFFSET;
    let top = mousePos.y + OFFSET;

    const maxX = window.innerWidth - PREVIEW_WIDTH - OFFSET;
    const maxY = window.innerHeight - PREVIEW_HEIGHT - OFFSET;

    // Flip horizontally if going off-screen right
    if (left > maxX) left = mousePos.x - PREVIEW_WIDTH - OFFSET;

    // Flip vertically if going off-screen bottom
    if (top > maxY) top = mousePos.y - PREVIEW_HEIGHT - OFFSET;

    return { left, top };
  };

  const previewPos = calcPreviewPosition();

  return (
    <div
      className="flex justify-center items-center relative"
      onMouseMove={handleMouseMove}
    >
      <div className="grid grid-cols-5 gap-2">
        {cards.map((card, index) => {
          const count = deckCards[card.cardId] || 0;
          const isMaxed = count >= 3;

          return (
            <div
              key={`${card.cardId}-${index}`}
              className={`relative cursor-pointer transition-opacity ${
                isMaxed ? "opacity-40" : "hover:opacity-90"
              }`}
              onClick={() => {
                if (!isMaxed) onAddCard?.(card.cardId);
              }}
              onMouseEnter={() => setHoveredCard(card.cardId)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card
                cardId={card.cardId}
                className="h-[130px] w-[93px]"
                onRightClick={onRemoveCard}
              />

              {count > 0 && (
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm">
                  {count}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Smart-positioned hover preview */}
      {hoveredCard && (
        <div
          className="fixed z-50 pointer-events-none transition-transform duration-75"
          style={{
            left: previewPos.left,
            top: previewPos.top,
          }}
        >
          <Card
            cardId={hoveredCard}
            className="h-[350px] w-[250px] drop-shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
