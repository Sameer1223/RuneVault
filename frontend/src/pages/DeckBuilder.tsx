import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import cardData from "../data/cards.json";
import EditableDeckTitle from "../components/deckbuilder/EditableDeckTitle";
import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import DeckRequirements from "../components/deckbuilder/DeckRequirements";
import OptionsPanel from "../components/deckbuilder/OptionsPanel";
import SearchPanel from "../components/deckbuilder/SearchPanel";
import CardSearchPanel from "../components/deckbuilder/CardSearchPanel";
import { DeckData, emptyDeckTemplate } from "../data/emptyDeckTemplate";
import { addCardToDeckUtil, removeCardFromDeckUtil, setDeckNameUtil } from "@/utils/deckBuilderUtils";
import { filterCards } from "@/utils/filterCardsUtil";
import ConfirmationModal from "../components/common/ConfirmationModal";

export default function DeckBuilder() {
  const location = useLocation();
  const incomingDeck = location.state?.deck;

  const [deck, setDeck] = useState(() => {
    if (incomingDeck) return incomingDeck;
    const saved = localStorage.getItem("deckData");
    return saved ? JSON.parse(saved) : emptyDeckTemplate;
  });

  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState({});

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "alert", // "alert" | "save" | "confirm"
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // FIXED: save ALSO behaves like alert (auto-close via OK)
  const openModal = ({ type, title, message, onConfirm, onCancel }) => {
    const behavesLikeAlert = type === "alert" || type === "save";

    setModalState({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: behavesLikeAlert ? closeModal : onConfirm,
      onCancel: behavesLikeAlert ? null : onCancel || closeModal,
    });
  };

  const filteredCards = useMemo(() => filterCards(cardData, filters), [filters]);

  const addCardToDeck = (cardId) => {
    setDeck((prev) => addCardToDeckUtil(prev, cardId));
  };

  const removeCardFromDeck = (cardId) => {
    openModal({
      type: "confirm",
      title: "Remove Card?",
      message: "Are you sure you want to remove this card?",
      onConfirm: () => {
        setDeck((prev) => removeCardFromDeckUtil(prev, cardId));
        setHoveredCard((prev) => (prev === cardId ? null : prev));
        closeModal();
      },
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    localStorage.setItem("deckData", JSON.stringify(deck));
  }, [deck]);

  useEffect(() => {
    if (incomingDeck) setDeck(incomingDeck);
  }, [incomingDeck]);

  // SAVE DECK
  const saveDeck = async () => {
    if (!deck.deck_data?.Legend || deck.deck_data.Legend.length === 0) {
      openModal({
        type: "save",
        title: "Cannot Save Deck",
        message: "You must select a Legend before saving your deck.",
      });
      return;
    }

    try {
      const isNew = !deck.id;
      const method = isNew ? "POST" : "PUT";
      const url = `http://127.0.0.1:5000/api/decks/${isNew ? "" : deck.id}`;

      const deckToSave = { ...deck, lastUpdated: new Date().toISOString() };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deckToSave),
      });

      if (!response.ok) throw new Error();

      const result = await response.json();

      if (isNew && result.id) {
        setDeck((prev) => ({
          ...prev,
          id: result.id,
          lastUpdated: result.lastUpdated ?? new Date().toISOString(),
        }));
      }

      openModal({
        type: "save",
        title: "Deck Saved",
        message: "Your deck was saved successfully.",
      });
    } catch {
      openModal({
        type: "save",
        title: "Save Failed",
        message: "There was an error saving your deck.",
      });
    }
  };

  // CLEAR DECK
  const clearDeck = () => {
    openModal({
      type: "confirm",
      title: "Clear Deck?",
      message: "Are you sure you want to remove all cards from your deck?",
      onConfirm: () => {
        setDeck(emptyDeckTemplate);
        closeModal();
      },
    });
  };

  if (!deck.deck_data) return <div>Loading deck data...</div>;

  return (
    <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121418] text-white gap-3 px-6 py-4">
      <EditableDeckTitle
        initialTitle={deck.name || "Untitled Deck"}
        onTitleChange={(t) => setDeck((prev) => setDeckNameUtil(prev, t))}
      />

      <div id="Deck-Builder" className="flex flex-1 gap-3 min-h-0 relative">
        <div id="Cards-Panel" className="flex flex-col flex-[3] gap-3 min-h-0">
          <div id="Main-Deck" className="bg-[#1E1E1E] flex-[16] min-h-0 overflow-hidden relative">
            <MainDeck
              legend={deck.deck_data.Legend}
              battlefields={deck.deck_data.Battlefields}
              chosenChampion={deck.deck_data.ChosenChampion}
              main={deck.deck_data.Main}
              onHoverCard={(id) => setHoveredCard(id)}
              onLeaveCard={() => setHoveredCard(null)}
              onRemoveCard={removeCardFromDeck}
            />

            {hoveredCard && (
              <div
                className="fixed z-50 pointer-events-none"
                style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
              >
                <img
                  src={`/TempCards/${hoveredCard}.avif`}
                  alt={hoveredCard}
                  className="h-[400px] w-auto object-cover rounded-lg shadow-2xl"
                />
              </div>
            )}
          </div>

          <div id="Side-Deck-Stats" className="flex flex-[4] gap-3 min-h-0">
            <div id="Side-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
              <SideDeck side={deck.deck_data.Side} onRemoveCard={removeCardFromDeck} />
            </div>
            <div id="Runes-Deck" className="bg-[#1E1E1E] p-2 overflow-auto">
              <RunesDeck runes={deck.deck_data.Runes} onRemoveCard={removeCardFromDeck} />
            </div>
            <div id="Deck-Stats" className="bg-[#1E1E1E] flex-[2] p-2">
              <DeckRequirements deck={deck.deck_data} />
            </div>
          </div>

          <div id="Options-Panel" className="bg-[#121212] flex-[1] p-3">
            <OptionsPanel onSave={saveDeck} onClear={clearDeck} deck={deck.deck_data} />
          </div>
        </div>

        <div id="Search-Panel" className="flex flex-col flex-[1.3] gap-3 min-h-0">
          <div id="Filters" className="bg-[#1E1E1E] flex-[1] p-3">
            <SearchPanel onFilterChange={setFilters} selectedLegend={deck.deck_data.Legend} />
          </div>
          <div id="Card-List" className="flex-[2] bg-stone-900 p-2 overflow-y-auto scroll-inside">
            <CardSearchPanel
              cards={filteredCards}
              deckCards={{ ...deck.deck_data.Main, ...deck.deck_data.Side }}
              onAddCard={addCardToDeck}
              onRemoveCard={removeCardFromDeck}
              isBattlefieldsSelected={filters.selectedType === "Battlefields"}
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        mode={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
      />
    </div>
  );
}
