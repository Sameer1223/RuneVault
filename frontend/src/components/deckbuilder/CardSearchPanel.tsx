import Card from "./Card";

export default function CardSearchPanel() {
    let searchResults : number = 30;

    return (
        <div className="flex justify-center items-center">
            <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: searchResults }).map((_, index) => (
                    <Card key={index} className="h-[130px] w-[93px]" />
                ))}
            </div>
        </div>
    )
}