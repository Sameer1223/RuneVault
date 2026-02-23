import cardData from "./cards.json";


export const legends:string[] = cardData.filter(card => card.type === "Legend").map(card => card.cardId);
//export const legendNames:string[] = cardData.filter(card => card.type === "Legend").map(card => card.name.split(',')[0]);

export const battlefields:string[] = cardData.filter(card => card.type === "Battlefield").map(card => card.cardId);
export const tokens:string[] = cardData.filter(card => card.type === "Token").map(card => card.cardId);
export const runes:string[] = cardData.filter(card => card.type === "Rune").map(card => card.cardId);
export const sigSpells:string[] = cardData.filter(card => (card.type === "Spell" || card.type === "Unit" || card.type === "Gear") && card.colors.length === 2).map(card => card.cardId);

const legendNameToId: Record<string, string[]> = {};

for (const legendId of legends) {
    const legendCard = cardData.find(card => card.cardId === legendId);
    if (legendCard) {
        const legendName = legendCard.name.split(',')[0];
        if (!legendNameToId[legendName]) {
            legendNameToId[legendName] = [];
        }
        legendNameToId[legendName].push(legendId);
    }
}

export const eligibleChosenChampions: Record<string, string[]> = {};
for (const card of cardData) {
    if (card.type === "Champion") {
        const cardName = card.name.split(',')[0];
        for (const legendName in legendNameToId) {
            if (cardName.includes(legendName)) {
                if (!eligibleChosenChampions[card.cardId]) {
                    eligibleChosenChampions[card.cardId] = [];
                }
                // Add *all* legend IDs that match this legend name
                eligibleChosenChampions[card.cardId].push(...legendNameToId[legendName]);
            }
        }
    }
}