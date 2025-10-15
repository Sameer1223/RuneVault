export default function DeckRequirements() {
    const deckRequirements = [
        { label: "Deck", value: 40, requirement: 40},
        { label: "Legend", value: 1, requirement: 1},
        { label: "Chosen Champion", value: 1, requirement: 11},
        { label: "Battlefields", value: 3, requirement: 3},
        { label: "Side Deck", value: 8, requirement: 8},
        { label: "Runes", value: 12, requirement: 12},
    ];

    return (
        <div>
            {deckRequirements.map((req) => (
                <div key={req.label} className="flex justify-between">
                    <span className="text-sm font-medium text-gray-800">{req.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{req.value} / {req.requirement}</span>
                </div>
            ))}
        </div>
    );
}