import { legends, battlefields, runes, sigSpells, eligibleChosenChampions, tokens } from "../data/keyCards";
import cardData from "../data/cards.json";
import type { DeckInnerData, FullDeck } from "@/types/deck";
import { LEGEND_SIGNATURE_MAP } from "@/lib/constants";

export function setDeckNameUtil(deck: FullDeck, name: string) {
    const newDeck: FullDeck = JSON.parse(JSON.stringify(deck));
    newDeck.name = name;
    return newDeck;
}

export function addCardToDeckUtil(deck: FullDeck, cardId: string, target: 'main' | 'side' = 'main') {
    const newDeck: FullDeck = JSON.parse(JSON.stringify(deck));

    // Legend Check
    if (legends.includes(cardId)) {
        if (newDeck.deck_data.Legend) {
            // For each card in main deck, side deck, runes, check if color matches new legend colors and if not remove them
            const sections: ("Main" | "Side" | "Runes")[] = ["Main", "Side", "Runes"];
            const legendColors = cardData.find(card => card.cardId === cardId)?.colors || [];
            for (const section of sections) {
                for (const c in newDeck.deck_data[section]) {
                    const card = cardData.find(card => card.cardId === c);
                    const cardColor = card?.colors?.[0];
                    if (!cardColor || !legendColors.includes(cardColor)) {
                        delete newDeck.deck_data[section][c];
                    }
                }
            }

            // Delete chosen champion if it doesn't match colours
            if (newDeck.deck_data.ChosenChampion) {
                const chosenChampionCard = cardData.find(card => card.cardId === newDeck.deck_data.ChosenChampion);
                const chosenChampionColor = chosenChampionCard?.colors?.[0];
                if (!chosenChampionColor || !legendColors.includes(chosenChampionColor)) {
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
    const mainDeckCount = (mainDeck[cardId] ?? 0) + (mainDeck[cardId + "a"] ?? 0);
    const sideDeckCount = (sideDeck[cardId] ?? 0) + (sideDeck[cardId + "a"] ?? 0);
    const legendColors = cardData.find(card => card.cardId === newDeck.deck_data.Legend)?.colors || [];
    const cardColor = cardData.find(card => card.cardId === cardId)?.colors?.[0] ?? "";
    if (mainDeckCount + sideDeckCount >= 3 || !legendColors.includes(cardColor)) {
        return newDeck;
    }

    // Runes Check
    if (runes.includes(cardId)) {
        const runesDeck = { ...newDeck.deck_data.Runes };
        if (Object.keys(runesDeck).length > 2 || Object.values(runesDeck).reduce((a: number, b: number) => a + b, 0) >= 12) {
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

    // Try target zone first, then overflow to the other (only from main → side)
    const zones = target === 'side'
        ? [{ deck: sideDeck, key: 'Side' as const, max: 8 }]
        : [{ deck: mainDeck, key: 'Main' as const, max: 39 }, { deck: sideDeck, key: 'Side' as const, max: 8 }];

    for (const zone of zones) {
        if (Object.values(zone.deck).reduce((a: number, b: number) => a + b, 0) < zone.max) {
            zone.deck[cardId] = (zone.deck[cardId] ?? 0) + 1;
            newDeck.deck_data[zone.key] = zone.deck;
            return newDeck;
        }
    }

    return newDeck;
}

export function swapCardsUtil(
    deck: FullDeck,
    mainSelections: Record<string, number>,
    sideSelections: Record<string, number>
) {
    const newDeck: FullDeck = JSON.parse(JSON.stringify(deck));

    const transfer = (from: Record<string, number>, to: Record<string, number>, selections: Record<string, number>) => {
        for (const [cardId, count] of Object.entries(selections)) {
            from[cardId] = (from[cardId] ?? 0) - count;
            if (from[cardId] <= 0) delete from[cardId];
            to[cardId] = (to[cardId] ?? 0) + count;
        }
    };

    transfer(newDeck.deck_data.Main, newDeck.deck_data.Side, mainSelections);
    transfer(newDeck.deck_data.Side, newDeck.deck_data.Main, sideSelections);

    return newDeck;
}

export function removeCardFromDeckUtil(deck: FullDeck, cardId: string) {
    // Don't remove if card not in deck
    if (deck.deck_data.Side[cardId] === undefined && deck.deck_data.Main[cardId] === undefined 
        && deck.deck_data.Runes[cardId] === undefined 
        && deck.deck_data.ChosenChampion !== cardId 
        && deck.deck_data.Legend !== cardId
        && !deck.deck_data.Battlefields.includes(cardId)) {
        return deck;
    }

    const newDeck: FullDeck = JSON.parse(JSON.stringify(deck));
    if (deck.deck_data.Side[cardId]) {
        newDeck.deck_data.Side = removeCard(newDeck.deck_data, cardId, 'Side');
    } else if (deck.deck_data.Main[cardId]) {
        newDeck.deck_data.Main = removeCard(newDeck.deck_data, cardId, 'Main');
    } else if (deck.deck_data.Runes[cardId]) {
        newDeck.deck_data.Runes = removeCard(newDeck.deck_data, cardId, 'Runes');
    } else if (battlefields.includes(cardId)) {
        newDeck.deck_data.Battlefields = newDeck.deck_data.Battlefields.filter((bf: string) => bf !== cardId);
    } else if (deck.deck_data.ChosenChampion === cardId) {
        newDeck.deck_data.ChosenChampion = '';
    } else if (deck.deck_data.Legend === cardId) {
        newDeck.deck_data.Legend = '';
    }
    
    return newDeck;
}

// Helpers

function removeCard(deck: DeckInnerData, cardId: string, deckSection: 'Main' | 'Side' | 'Runes'){
    const newDeckSection = { ...deck[deckSection] };
    newDeckSection[cardId] -= 1;
    if (newDeckSection[cardId] <= 0) {
        delete newDeckSection[cardId];
    }
    return newDeckSection;
}

function isValidSignature(legendCardId: string, cardToAddId: string) {
    const legendCard = cardData.find(card => card.cardId === legendCardId);
    const legendName = legendCard?.name.split(',')[0] || "";
    return LEGEND_SIGNATURE_MAP[legendName]?.includes(cardToAddId) ?? false;
}