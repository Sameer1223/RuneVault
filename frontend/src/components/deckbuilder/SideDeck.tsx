import Card from "./Card";

export default function SideDeck () {
    const deckLength = 40;

    return (
        <div className="flex items-center w-full h-full gap-5 overflow-hidden">
            {/* Deck */}
            <div className="grid grid-cols-8 grid-rows-1 gap-2">
                {Array.from({ length: 40 }).map((_, index) => (
                <Card key={index} className="h-[130px] w-[93px]" />
                ))}
            </div>
        </div>

    );
}