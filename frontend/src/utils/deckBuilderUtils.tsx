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
        if (newDeck.deck_data.Legend) {
            // For each card in main deck, side deck, runes, check if color matches new legend colors and if not remove them
            const sections: (keyof DeckData)[] = ["Main", "Side", "Runes"];
            const legendColors = cardData.find(card => card.cardId === cardId)?.colors || [];
            console.log(legendColors);
            for (const section of sections) {
                for (const c in newDeck.deck_data[section]) {
                    const card = cardData.find(card => card.cardId === c);
                    const cardColor = card?.colors?.[0];
                    if (!legendColors.includes(cardColor)) {
                        delete newDeck.deck_data[section][c];
                    }
                }
            }

            // Delete chosen champion if it doesn't match colours
            if (newDeck.deck_data.ChosenChampion) {
                const chosenChampionCard = cardData.find(card => card.cardId === newDeck.deck_data.ChosenChampion);
                const chosenChampionColor = chosenChampionCard?.colors?.[0];
                if (!legendColors.includes(chosenChampionColor)) {
                    newDeck.deck_data.ChosenChampion = '';
                }
            }
            
        }
        newDeck.deck_data.Legend = cardId;
        return newDeck;
    }

    // Legend must be picked first
    if (!newDeck.deck_data.Legend) {
        return newDeck;
    }

    // // Chosen Champion Check
    if (!newDeck.deck_data.ChosenChampion && cardId in eligibleChosenChampions && eligibleChosenChampions[cardId].includes(newDeck.deck_data.Legend)) {
        newDeck.deck_data.ChosenChampion = cardId;
        return newDeck;
    }

    // Do not add tokens
    if (tokens.includes(cardId)) {
        return newDeck;
    }

    // Battlefield Check
    const cardNum = parseInt(cardId.split("-")[1]);
    if (battlefields.includes(cardId)) {
        if (newDeck.deck_data.Battlefields.length < 3 && !newDeck.deck_data.Battlefields.includes(cardId)) {
            newDeck.deck_data.Battlefields.push(cardId);
        }
        return newDeck;
    }

    // Access main deck
    const mainDeck = { ...newDeck.deck_data.Main };
    const sideDeck = { ...newDeck.deck_data.Side };

    // Do not add more than 3 copies of the same card But also do not add if side deck and main deck exceeds 3 copies
    // Also do not add if colour does not match legend colours
    const mainDeckCount = mainDeck[cardId] ?? 0;
    const sideDeckCount = sideDeck[cardId] ?? 0;
    const legendColors = cardData.find(card => card.cardId === newDeck.deck_data.Legend)?.colors || [];
    const cardColor = cardData.find(card => card.cardId === cardId)?.colors[0] || [];
    if (mainDeckCount + sideDeckCount >= 3 || !legendColors.includes(cardColor)) {
        return newDeck;
    }

    // Runes Check
    if (runes.includes(cardId)) {
        const runesDeck = { ...newDeck.deck_data.Runes };
        if (runesDeck.length > 2 || Object.values(runesDeck).reduce((a, b) => a + b, 0) >= 12) {
            return deck;
        }

        for (const runeId in runesDeck) {
            if (runeId !== cardId && runeId.slice(0, 7) === cardId.slice(0, 7)) {
                return newDeck;
            }
        }

        runesDeck[cardId] = (runesDeck[cardId] ?? 0) + 1;
        newDeck.deck_data.Runes = runesDeck;
        return newDeck;
    }

    // Signature Spell Check
    if (sigSpells.includes(cardId) && !isValidSignature(newDeck.deck_data.Legend, cardId)) {
        return newDeck;
    }

    // Add to main deck if no other checks triggered
    if (Object.values(mainDeck).reduce((a, b) => a + b, 0) < 39 ){
        mainDeck[cardId] = (mainDeck[cardId] ?? 0) + 1;
        newDeck.deck_data.Main = mainDeck;
        return newDeck;
    }


    // Add to side deck if main deck is full
    if (Object.values(mainDeck).reduce((a, b) => a + b, 0) >= 39 
            && Object.values(sideDeck).reduce((a, b) => a + b, 0) < 8) {
        sideDeck[cardId] = (sideDeck[cardId] ?? 0) + 1;
        newDeck.deck_data.Side = sideDeck;
        return newDeck;
    }

    return newDeck;
}

export function removeCardFromDeckUtil(deck: DeckData, cardId: string) {
    // Don't remove if card not in deck
    if (deck.deck_data.Side[cardId] === undefined && deck.deck_data.Main[cardId] === undefined 
        && deck.deck_data.Runes[cardId] === undefined 
        && deck.deck_data.ChosenChampion !== cardId 
        && deck.deck_data.Legend !== cardId
        && !deck.deck_data.Battlefields.includes(cardId)) {
        return deck;
    }

    const newDeck: DeckData = JSON.parse(JSON.stringify(deck));
    if (deck.deck_data.Side[cardId]) {
        newDeck.deck_data.Side = removeCard(newDeck.deck_data, cardId, 'Side');
    } else if (deck.deck_data.Main[cardId]) {
        newDeck.deck_data.Main = removeCard(newDeck.deck_data, cardId, 'Main');
    } else if (deck.deck_data.Runes[cardId]) {
        newDeck.deck_data.Runes = removeCard(newDeck.deck_data, cardId, 'Runes');
    } else if (battlefields.includes(cardId)) {
        newDeck.deck_data.Battlefields = newDeck.deck_data.Battlefields.filter(bf => bf !== cardId);
    } else if (deck.deck_data.ChosenChampion === cardId) {
        newDeck.deck_data.ChosenChampion = '';
    } else if (deck.deck_data.Legend === cardId) {
        newDeck.deck_data.Legend = '';
    }
    
    return newDeck;
}

// Helpers

function removeCard(deck: any, cardId: string, deckSection: 'Main' | 'Side' | 'Runes'){
    const newDeckSection = { ...deck[deckSection] };
    newDeckSection[cardId] -= 1;
    if (newDeckSection[cardId] <= 0) {
        delete newDeckSection[cardId];
    }
    return newDeckSection;
}

function isValidSignature(legendCardId: string, cardToAddId: string) {
    const legendToSignatureMap = {
        "Kai'Sa": ["OGN-248"],
        "Volibear": ["OGN-250"],
        "Jinx": ["OGN-252"],
        "Darius": ["OGN-254"],
        "Ahri": ["OGN-256"],
        "Lee Sin": ["OGN-258"],
        "Yasuo": ["OGN-260"],
        "Leona": ["OGN-262"],
        "Teemo": ["OGN-264"],
        "Viktor": ["OGN-266"],
        "Miss Fortune": ["OGN-268"],
        "Sett": ["OGN-270"],
        "Annie": ["OGS-018"],
        "Master Yi": ["OGS-020"],
        "Lux": ["OGS-020"],
        "Garen": ["OGS-024"],
        "Rumble": ["SFD-182"],
        "Lucian": ["SFD-184"],
        "Draven": ["SFD-186"],
        "Rek'Sai": ["SFD-188"],
        "Ornn": ["SFD-190", "SFD-191", "SFD-192"],
        "Jax": ["SFD-194"],
        "Irelia": ["SFD-196"],
        "Azir": ["SFD-198"],
        "Ezreal": ["SFD-200"],
        "Renata": ["SFD-202"],
        "Sivir": ["SFD-204"],
        "Fiora": ["SFD-206"]
    }


    const legendCard = cardData.find(card => card.cardId === legendCardId);
    const legendName = legendCard?.name.split(',')[0] || "";
    // Check if matching signature spell exists for this legend
    console.log(`Checking if card ${cardToAddId} is a valid signature spell for legend ${legendName}`);
    return legendToSignatureMap[legendName]?.includes(cardToAddId) ?? false;
}