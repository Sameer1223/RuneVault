export interface CardFilters {
    query?: string;
    selectedType?: string | null;
    setFilter?: string;
    cardType?: string;
    energyRange?: [number, number];
    powerRange?: [number, number];
    mightRange?: [number, number];
    colorFilter?: string | null;
}
  
  export function filterCards(cardData: any[], filters: CardFilters) {
    return cardData.filter((card) => {
        const q = filters.query?.toLowerCase() ?? "";
    
        if (q && !card.name.toLowerCase().includes(q) && !card.cardId.toLowerCase().includes(q))
            return false;
    
        if (filters.cardType && filters.cardType !== "All" && card.type !== filters.cardType)
            return false;
    
        if (filters.setFilter && filters.setFilter !== "All" && card.set !== filters.setFilter)
            return false;

        if (filters.colorFilter) {
            if (!card.colors || !card.colors.includes(filters.colorFilter)) {
                return false;
            }
        }
        
        const isCostFilterChanged =
            filters.energyRange?.[0] !== 0 ||
            filters.energyRange?.[1] !== 12 ||
            filters.powerRange?.[0] !== 0 ||
            filters.powerRange?.[1] !== 4;

        // If cost filters have changed exclude any cards without energy (this means no power as well)
        if (isCostFilterChanged) {
            if (card.energy === undefined ||
                (card.energy !== undefined && (card.energy < filters.energyRange?.[0] || card.energy > filters.energyRange?.[1]))) {
                return false;
            }

            if (card.power !== undefined && (card.power < filters.powerRange?.[0] || card.power > filters.powerRange?.[1])){
                return false;
            }
        }
    
        const isMightFilterChanged = filters.mightRange?.[0] !== 0 || filters.mightRange?.[1] !== 10;
        if (isMightFilterChanged)
            if (card.might === undefined || 
                (card.might !== undefined && (card.might < filters.mightRange?.[0] || card.might > filters.mightRange?.[1]))) {
                return false;
            }
    
        // Handle type toggle (Legends/Battlefields/Cards/Runes)
        if (filters.selectedType) {
            const type = filters.selectedType.toLowerCase();
            if (type === "legends" && card.type !== "Legend") return false;
            if (type === "battlefields" && card.type !== "Battlefield") return false;
            if (type === "runes" && card.type !== "Rune") return false;
            if (type === "cards" && ["Legend", "Battlefield", "Rune"].includes(card.type)) return false;
        }
    
        return true;
    });
}
  