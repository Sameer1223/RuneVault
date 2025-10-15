export default function CardsPage() {
    return (
      <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white gap-3 px-6 py-4">
        
        <div className="bg-amber-300 p-3 text-black text-xl font-semibold">Deck Builder Title</div>
  
        <div id="Deck-Builder" className="flex gap-3">
          <div id="Cards-Panel" className="flex flex-col gap-3">
            <div id="Main-Deck" className="bg-red-300 p-3">Main Deck</div>
  
            <div id="Side-Deck-Stats" className="flex gap-3">
              <div id="Side-Deck" className="bg-orange-300  p-3">Side Deck</div>
              <div id="Deck-Stats" className="bg-lime-300 p-3">Deck Stats</div>
            </div>
  
            <div id="Options-Panel" className="bg-blue-400 p-3">Options Panel</div>
          </div>
  
          <div id="Search-Panel" className="flex flex-col  gap-3">
            <div id="Filters" className="bg-green-400 p-3">Filters</div>
            <div id="Card-List" className="bg-fuchsia-400 p-3 overflow-y-auto">Card List</div>
          </div>  
        </div>
  
      </div>
    );
  }  