import { useState, useRef, useCallback } from "react";
import Card from "./Card";
import cardData from "../../data/cards.json";
import type { CardData } from "@/types/deck";

interface CardSearchPanelProps {
  cards?: CardData[];
  onAddCard?: (card: string) => void;
  onRemoveCard?: (cardId: string) => void;
  deckCards?: Record<string, number>;
  isBattlefieldsSelected?: boolean;
}

export default function CardSearchPanel({
  cards = [],
  onAddCard,
  onRemoveCard,
  deckCards = {},
  isBattlefieldsSelected = false,
}: CardSearchPanelProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutDuration = 175; // ms

  const handleHover = useCallback((cardId: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoveredCard(cardId), timeoutDuration);
  }, []);

  const handleLeave = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredCard(null);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const PREVIEW_WIDTH = isBattlefieldsSelected ? 350 : 250;
  const PREVIEW_HEIGHT = isBattlefieldsSelected ? 250 : 350;

  const OFFSET = 1;

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

  const isBattlefield = (cardId: string | null) => {
    if (cardId === null) return false;
    const card = cardData.find((card) => card.cardId === cardId);
    return card?.type === "Battlefield";

  }

  return (
    <div
      className="flex justify-center items-center relative"
      onMouseMove={handleMouseMove}
    >
      <div className={
        isBattlefieldsSelected
          ? "grid grid-cols-4 gap-2"
          : "grid grid-cols-5 gap-2"}
      >
      {cards
        .filter(card => card.type?.toLowerCase() !== 'token')
        .map((card, index) => {
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
            onMouseEnter={() => handleHover(card.cardId)}
            onMouseLeave={handleLeave}
          >
            <Card
              cardId={card.cardId}
              className={
                isBattlefield(card.cardId)
                  ? "h-[93px] w-[130px]"
                  : "h-[130px] w-[93px]"
              }
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

      {/* Smart preview */}
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
            className={
              "drop-shadow-2xl " +
              (isBattlefield(hoveredCard)
                ? "h-[250px] w-[350px]"
                : "h-[350px] w-[250px]")
            }
          />
        </div>
      )}
    </div>
  );
}
