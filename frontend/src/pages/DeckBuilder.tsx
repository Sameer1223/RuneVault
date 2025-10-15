import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import DeckRequirements from "../components/deckbuilder/DeckRequirements";
import OptionsPanel from "../components/deckbuilder/OptionsPanel";
import SearchPanel from "../components/deckbuilder/SearchPanel";
import CardSearchPanel from "../components/deckbuilder/CardSearchPanel";

export default function DeckBuilder() {
    return (
    <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121212] text-white gap-3 px-6 py-4">
        <div className="py-1 text-3xl font-semibold">Deck Builder Title</div>

        <div id="Deck-Builder" className="flex flex-1 gap-3 min-h-0">
            <div id="Cards-Panel" className="flex flex-col flex-[3] gap-3 min-h-0">
                <div id="Main-Deck" className="bg-red-300 flex-[16] min-h-0 overflow-hidden"><MainDeck /></div>

                <div id="Side-Deck-Stats" className="flex flex-[4] gap-3 min-h-0">
                    <div id="Side-Deck" className="bg-orange-300 p-2 overflow-auto"><SideDeck /></div>
                    <div id="Runes-Deck" className="bg-yellow-300 p-2 overflow-auto"><RunesDeck /></div>
                    <div id="Deck-Stats" className="bg-lime-300 flex-[2] p-2"><DeckRequirements /></div>
                </div>

                <div id="Options-Panel" className="bg-blue-400 flex-[1] p-3"><OptionsPanel /></div>
            </div>

            <div id="Search-Panel" className="flex flex-col flex-[1.3] gap-3 min-h-0">
                <div id="Filters" className="bg-green-400 flex-[1] p-3"><SearchPanel /></div>
                <div id="Card-List" className="flex-[2] bg-stone-900 p-2 overflow-y-auto scroll-inside"><CardSearchPanel /></div>
            </div>
        </div>
    </div>
  );
}
  