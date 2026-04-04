import { memo, type MouseEvent, useState, useEffect } from "react";
import QuantityControl from "./QuantityControl";
import { getCardImagePath, getCardImageFallback } from "@/utils/imageUtils";

interface CollectionCard {
    cardId: string;
    name: string;
    rarity?: string;
}

interface CardTileProps {
    card: CollectionCard;
    owned: number;
    foil: number;
    onChangeOwned?: (delta: number) => void;
    onChangeFoil?: (delta: number) => void;
}

function CardTile({
    card,
    owned,
    foil,
    onChangeOwned,
    onChangeFoil
}: CardTileProps) {
    const isOwned = owned > 0;
    const [imageSrc, setImageSrc] = useState(getCardImagePath(card.cardId));

    // Reset image source when card changes
    useEffect(() => {
        setImageSrc(getCardImagePath(card.cardId));
    }, [card.cardId]);

    const handleImageError = () => {
        // Try fallback PNG if AVIF fails
        if (imageSrc.endsWith('.avif')) {
            setImageSrc(getCardImageFallback(card.cardId));
        }
    };

    const handleLeftClick = () => {
        onChangeOwned?.(1);
    };

    const handleRightClick = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        onChangeOwned?.(-1);
    };

    return (
        <div
            onClick={handleLeftClick}
            onContextMenu={handleRightClick}
            className="rounded-xl bg-black/40 border border-white/10 overflow-hidden transition hover:scale-[1.03] cursor-pointer flex flex-col"
        >
            <div className="aspect-[3/4] bg-cover bg-center overflow-hidden">
                <img
                    src={imageSrc}
                    alt={card.name}
                    onError={handleImageError}
                    className={`w-full h-full object-cover ${!isOwned ? "grayscale brightness-75" : ""}`}
                />
            </div>

            <div className="p-3 flex flex-col justify-between">
                <h3 className="text-sm font-medium truncate min-h-[1.4rem]">
                    {card.name}
                </h3>

                <div className="flex justify-between items-center h-10 mt-2">
                    <div className="flex-shrink-0">
                        <QuantityControl
                            value={owned}
                            onChange={onChangeOwned}
                        />
                    </div>

                    <div className="flex items-center justify-end min-w-[96px]">
                        {(card.rarity === "Common" || card.rarity === "Uncommon") ? (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.stopPropagation()}>
                                <span className="text-lg">✨</span>
                                <QuantityControl
                                    value={foil}
                                    onChange={onChangeFoil}
                                />
                            </div>
                        ) : (
                            <div className="w-[96px] h-10 flex items-center justify-center" aria-hidden />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(CardTile);
