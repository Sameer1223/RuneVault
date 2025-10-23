import { useMemo } from "react";

interface DeckRequirementProps {
    deck : DeckData;
}

export default function DeckRequirements({ deck }: DeckRequirementProps) {
    const counts = useMemo(() => {
        return {
            mainDeckCount: Object.values(deck.Main).reduce((sum, count) => sum + count, 0),
            legendCount: deck.Legend ? 1 : 0,
            chosenCount: deck.ChosenChampion ? 1 : 0,
            battlefieldCount: Object.values(deck.Battlefields).length,
            sideDeckCount: Object.values(deck.Side).reduce((sum, count) => sum + count, 0),
            runesCount: Object.values(deck.Runes).reduce((sum, count) => sum + count, 0)
        }
    });

    const deckRequirements = [
        { label: "Deck", value: counts.mainDeckCount + counts.chosenCount, requirement: 40},
        { label: "Legend", value: counts.legendCount, requirement: 1},
        { label: "Chosen Champion", value: counts.chosenCount, requirement: 1},
        { label: "Battlefields", value: counts.battlefieldCount, requirement: 3},
        { label: "Side Deck", value: counts.sideDeckCount, requirement: 8},
        { label: "Runes", value: counts.runesCount, requirement: 12},
    ];

    return (
        <div>
            {deckRequirements.map((req) => (
                <div key={req.label} className="flex justify-between">
                    <span className="text-sm font-semibold text-white">{req.label}</span>
                    <span className={`text-sm font-semibold 
                    ${req.value === req.requirement ? 
                        "text-green-300" : 
                        req.label === "Side Deck" ? "text-yellow-200" : "text-red-400"}`}>
                        {req.value} / {req.requirement}
                    </span>
                </div>
            ))}
        </div>
    );
}