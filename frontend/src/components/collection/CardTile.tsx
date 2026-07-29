import { memo, type MouseEvent, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import QuantityControl from "./QuantityControl";
import { getCardImagePath, getCardImageFallback } from "@/utils/imageUtils";
import { RARITY_COLOR_HEX } from "@/lib/constants";

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
    compact?: boolean;
}

function CardTile({
    card,
    owned,
    foil,
    onChangeOwned,
    onChangeFoil,
    compact = false
}: CardTileProps) {
    const isOwned = owned > 0;
    const canFoil = card.rarity === "Common" || card.rarity === "Uncommon";
    const accentColor = RARITY_COLOR_HEX[card.rarity ?? "Common"] ?? RARITY_COLOR_HEX.Common;
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
            className={`group rounded-xl bg-zinc-900/60 border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer flex flex-col ${
                isOwned ? "border-[#caa368]/50 hover:border-[#caa368]" : "border-white/10 hover:border-white/25"
            }`}
            style={{ boxShadow: isOwned ? `0 0 0 1px ${accentColor}22` : undefined }}
        >
            <div className="relative aspect-[3/4] bg-cover bg-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] z-10" style={{ backgroundColor: accentColor }} />
                <img
                    src={imageSrc}
                    alt={card.name}
                    onError={handleImageError}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04] ${!isOwned ? "grayscale brightness-[0.55]" : ""}`}
                />
                {foil > 0 && (
                    <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-[#caa368]/50 rounded-full px-2 py-0.5">
                        <Sparkles className="w-3 h-3 text-[#caa368]" />
                        <span className="text-[11px] font-semibold text-[#caa368]">{foil}</span>
                    </div>
                )}
            </div>

            <div className={compact ? "p-1.5 flex flex-col gap-1" : "p-2.5 flex flex-col gap-2"}>
                <h3 className="text-xs sm:text-sm font-medium text-zinc-200 truncate min-h-[1.25rem]" title={card.name}>
                    {card.name}
                </h3>

                <div className="flex items-center justify-between gap-1">
                    <QuantityControl
                        value={owned}
                        onChange={onChangeOwned}
                        compact={compact}
                    />

                    {canFoil ? (
                        <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                            onContextMenu={(e) => e.stopPropagation()}
                        >
                            {!compact && <Sparkles className="w-3.5 h-3.5 text-[#caa368]/80 shrink-0" />}
                            <QuantityControl
                                value={foil}
                                onChange={onChangeFoil}
                                compact={compact}
                            />
                        </div>
                    ) : (
                        <div className={compact ? "h-4" : "h-6"} aria-hidden />
                    )}
                </div>
            </div>
        </div>
    );
}

export default memo(CardTile);
