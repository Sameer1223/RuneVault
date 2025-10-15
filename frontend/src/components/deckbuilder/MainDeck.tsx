import Card from "./Card";

export default function MainDeck () {
    const deckLength = 40;

    return (
        <div className="flex items-center justify-between w-full h-full p-5 gap-5 overflow-hidden">
            {/* Deck */}
            <div className="grid grid-cols-10 grid-rows-4 gap-2">
                {Array.from({ length: deckLength }).map((_, index) => (
                <Card key={index} className="h-[130px] w-[93px]" />
                ))}
            </div>

            {/* Legend and Battlefields */}
            <div className="h-full flex flex-col justify-center items-center flex-1 gap-1 bg-gray-700">
                <Card className="h-[251px] w-[180px]"/>
                
                <div className="flex flex-col gap-1">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="h-[93px] w-[130px]"/>
                    ))}
                </div>
            </div>
        </div>

    );
}