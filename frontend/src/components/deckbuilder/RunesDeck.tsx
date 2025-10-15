import Card from "./Card";

export default function RunesDeck () {
    const deckLength = 2;

    return (
        <div className="flex items-center w-full h-full gap-5 overflow-hidden">
            {/* Deck */}
            <div className="grid grid-cols-2 grid-rows-1 gap-2">
                {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="h-[130px] w-[90px]" />
                ))}
            </div>
        </div>

    );
}