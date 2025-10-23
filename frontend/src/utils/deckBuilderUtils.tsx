import { legends, battlefields, runes, sigSpells, eligibleChosenChampions, legendNames, tokens } from "../data/keyCards";
import cardData from "../data/cards.json";

export function setDeckNameUtil(deck: DeckData, name: string) {
    const newDeck: DeckData = JSON.parse(JSON.stringify(deck));
    newDeck.name = name;
    return newDeck;
}

export function addCardToDeckUtil(deck: DeckData, cardId: string) {
    const newDeck: DeckData = JSON.parse(JSON.stringify(deck));

    // Legend Check
    if (legends.includes(cardId)) {
        if (newDeck.Legend) {
            // For each card in main deck, side deck, runes, check if color matches new legend colors and if not remove them
            const sections: (keyof DeckData)[] = ["Main", "Side", "Runes"];
            const legendColors = cardData.find(card => card.cardId === cardId)?.colors || [];
            
            for (const section of sections) {
                for (const c in newDeck[section]) {
                    const card = cardData.find(card => card.cardId === c);
                    const cardColor = card?.colors?.[0];
                    if (!legendColors.includes(cardColor)) {
                        delete newDeck[section][c];
                    }
                }
            }
            
        }
        newDeck.Legend = cardId;
        return newDeck;
    }

    // Legend must be picked first
    if (!newDeck.Legend) {
        return newDeck;
    }

    // // Chosen Champion Check
    if (!newDeck.ChosenChampion && cardId in eligibleChosenChampions && eligibleChosenChampions[cardId].includes(newDeck.Legend)) {
        newDeck.ChosenChampion = cardId;
        return newDeck;
    }

    // Do not add tokens
    if (tokens.includes(cardId)) {
        return newDeck;
    }

    // Battlefield Check
    const cardNum = parseInt(cardId.split("-")[1]);
    if (battlefields.includes(cardId)) {
        if (newDeck.Battlefields.length < 3 && !newDeck.Battlefields.includes(cardId)) {
            newDeck.Battlefields.push(cardId);
        }
        return newDeck;
    }

    // Access main deck
    const mainDeck = { ...newDeck.Main };
    const sideDeck = { ...newDeck.Side };

    // Do not add more than 3 copies of the same card But also do not add if side deck and main deck exceeds 3 copies
    // Also do not add if colour does not match legend colours
    const mainDeckCount = mainDeck[cardId] ?? 0;
    const sideDeckCount = sideDeck[cardId] ?? 0;
    const legendColors = cardData.find(card => card.cardId === newDeck.Legend)?.colors || [];
    const cardColor = cardData.find(card => card.cardId === cardId)?.colors[0] || [];
    if (mainDeckCount + sideDeckCount >= 3 || !legendColors.includes(cardColor)) {
        return newDeck;
    }

    // Runes Check
    if (runes.includes(cardId)) {
        const runesDeck = { ...newDeck.Runes };
        if (runesDeck.length > 2 || Object.values(runesDeck).reduce((a, b) => a + b, 0) >= 12) {
            return deck;
        }

        for (const runeId in runesDeck) {
            if (runeId !== cardId && runeId.slice(0, 7) === cardId.slice(0, 7)) {
                return newDeck;
            }
        }

        runesDeck[cardId] = (runesDeck[cardId] ?? 0) + 1;
        newDeck.Runes = runesDeck;
        return newDeck;
    }

    // Signature Spell Check
    const cardDetails = cardId.split("-");
    const matchingLegend = cardDetails[0] + '-' + parseInt(cardDetails[1] - 1).toString().padStart(3, '0');
    if (sigSpells.includes(cardId) && newDeck.Legend !== matchingLegend) {
        return newDeck;
    }

    // Add to main deck if no other checks triggered
    if (Object.values(mainDeck).reduce((a, b) => a + b, 0) < 40 ){
        mainDeck[cardId] = (mainDeck[cardId] ?? 0) + 1;
        newDeck.Main = mainDeck;
        return newDeck;
    }


    // Add to side deck if main deck is full
    if (Object.values(mainDeck).reduce((a, b) => a + b, 0) >= 40 
            && Object.values(sideDeck).reduce((a, b) => a + b, 0) < 8) {
        sideDeck[cardId] = (sideDeck[cardId] ?? 0) + 1;
        newDeck.Side = sideDeck;
        return newDeck;
    }

    return newDeck;
}

export function removeCardFromDeckUtil(deck: DeckData, cardId: string) {
    // Don't remove if card not in deck
    if (deck.Side[cardId] === undefined && deck.Main[cardId] === undefined 
        && deck.Runes[cardId] === undefined 
        && deck.ChosenChampion !== cardId 
        && deck.Legend !== cardId
        && !deck.Battlefields.includes(cardId)) {
        return deck;
    }

    const newDeck: DeckData = JSON.parse(JSON.stringify(deck));
    if (deck.Side[cardId]) {
        newDeck.Side = removeCard(newDeck, cardId, 'Side');
    } else if (deck.Main[cardId]) {
        newDeck.Main = removeCard(newDeck, cardId, 'Main');
    } else if (deck.Runes[cardId]) {
        newDeck.Runes = removeCard(newDeck, cardId, 'Runes');
    } else if (battlefields.includes(cardId)) {
        newDeck.Battlefields = newDeck.Battlefields.filter(bf => bf !== cardId);
    } else if (deck.ChosenChampion === cardId) {
        newDeck.ChosenChampion = '';
    } else if (deck.Legend === cardId) {
        newDeck.Legend = '';
    }
    
    return newDeck;
}

function removeCard(deck: any, cardId: string, deckSection: 'Main' | 'Side' | 'Runes'){
    const newDeckSection = { ...deck[deckSection] };
    newDeckSection[cardId] -= 1;
    if (newDeckSection[cardId] <= 0) {
        delete newDeckSection[cardId];
    }
    return newDeckSection;
}