import { useEffect, useState, useMemo, useCallback } from "react";
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
import { addCardToDeckUtil, removeCardFromDeckUtil, setDeckNameUtil, swapCardsUtil } from "@/utils/deckBuilderUtils";
import { filterCards } from "@/utils/filterCardsUtil";
import ConfirmationModal from "../components/common/ConfirmationModal";
import SwapBar from "../components/deckbuilder/SwapBar";
import { useUserId } from "@/hooks/useUserId";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export default function DeckBuilder() {
  const location = useLocation();
  const incomingDeck = location.state?.deck;
  const { userId } = useUserId();
  const authFetch = useAuthFetch();

  const [deck, setDeck] = useState(() => {
    if (incomingDeck) return incomingDeck;
    const saved = localStorage.getItem("deckData");
    return saved ? JSON.parse(saved) : { ...emptyDeckTemplate, user_id: userId };
  });

  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState({});
  const [activeZone, setActiveZone] = useState<'main' | 'side'>('main');
  const [mainSelections, setMainSelections] = useState<Record<string, number>>({});
  const [sideSelections, setSideSelections] = useState<Record<string, number>>({});

  const mainSelCount = Object.values(mainSelections).reduce((a, b) => a + b, 0);
  const sideSelCount = Object.values(sideSelections).reduce((a, b) => a + b, 0);

  const clearSelections = useCallback(() => {
    setMainSelections({});
    setSideSelections({});
  }, []);

  const handleSelectMain = useCallback((cardId: string) => {
    setMainSelections((prev) => {
      const current = prev[cardId] ?? 0;
      const max = deck.deck_data.Main[cardId] ?? 0;
      if (current >= max) {
        const { [cardId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [cardId]: current + 1 };
    });
  }, [deck.deck_data.Main]);

  const handleSelectSide = useCallback((cardId: string) => {
    setSideSelections((prev) => {
      const current = prev[cardId] ?? 0;
      const max = deck.deck_data.Side[cardId] ?? 0;
      if (current >= max) {
        const { [cardId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [cardId]: current + 1 };
    });
  }, [deck.deck_data.Side]);

  const mainTotal = Object.values(deck.deck_data.Main ?? {}).reduce((a, b) => a + b, 0);
  const sideTotal = Object.values(deck.deck_data.Side ?? {}).reduce((a, b) => a + b, 0);

  const canMoveToSide = mainSelCount > 0 && (sideTotal + mainSelCount - sideSelCount) <= 8;
  const canMoveToMain = sideSelCount > 0 && (mainTotal + sideSelCount - mainSelCount) <= 39;
  const canSwap = mainSelCount > 0 && sideSelCount > 0
    && (mainTotal - mainSelCount + sideSelCount) <= 39
    && (sideTotal - sideSelCount + mainSelCount) <= 8;

  const handleSwap = useCallback(() => {
    if (!canSwap) return;
    setDeck((prev) => swapCardsUtil(prev, mainSelections, sideSelections));
    clearSelections();
  }, [mainSelections, sideSelections, clearSelections, canSwap]);

  const handleMoveToSide = useCallback(() => {
    if (!canMoveToSide) return;
    setDeck((prev) => swapCardsUtil(prev, mainSelections, {}));
    clearSelections();
  }, [mainSelections, clearSelections, canMoveToSide]);

  const handleMoveToMain = useCallback(() => {
    if (!canMoveToMain) return;
    setDeck((prev) => swapCardsUtil(prev, {}, sideSelections));
    clearSelections();
  }, [sideSelections, clearSelections, canMoveToMain]);

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
    setDeck((prev) => addCardToDeckUtil(prev, cardId, activeZone));
  };

  const removeCardFromDeck = (cardId) => {
      setDeck((prev) => removeCardFromDeckUtil(prev, cardId));
      setHoveredCard((prev) => (prev === cardId ? null : prev));
      closeModal();
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

      const response = await authFetch(url, {
        method,
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
        setDeck({ ...emptyDeckTemplate, user_id: userId });
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
          <div
            id="Main-Deck"
            className={`bg-[#1E1E1E] flex-[16] min-h-0 overflow-hidden relative cursor-pointer ring-inset ${
              activeZone === 'main' ? 'ring-1 ring-gray-700' : ''
            }`}
            onClick={() => setActiveZone('main')}
          >
            <MainDeck
              legend={deck.deck_data.Legend}
              battlefields={deck.deck_data.Battlefields}
              chosenChampion={deck.deck_data.ChosenChampion}
              main={deck.deck_data.Main}
              selectedCards={mainSelections}
              onHoverCard={(id) => setHoveredCard(id)}
              onLeaveCard={() => setHoveredCard(null)}
              onRemoveCard={removeCardFromDeck}
              onSelectCard={handleSelectMain}
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
            <div
              id="Side-Deck"
              className={`bg-[#1E1E1E] p-2 overflow-auto cursor-pointer ring-inset ${
                activeZone === 'side' ? 'ring-1 ring-gray-700' : ''
              }`}
              onClick={() => setActiveZone('side')}
            >
              <SideDeck side={deck.deck_data.Side} selectedCards={sideSelections} onRemoveCard={removeCardFromDeck} onSelectCard={handleSelectSide} />
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
              deckCards={Object.entries({ ...deck.deck_data.Main, ...deck.deck_data.Side }).reduce((acc, [id, count]) => {
                acc[id] = (deck.deck_data.Main[id] ?? 0) + (deck.deck_data.Side[id] ?? 0);
                return acc;
              }, {} as Record<string, number>)}
              onAddCard={addCardToDeck}
              onRemoveCard={removeCardFromDeck}
              isBattlefieldsSelected={filters.selectedType === "Battlefields"}
            />
          </div>
        </div>
      </div>

      <SwapBar
        mainCount={mainSelCount}
        sideCount={sideSelCount}
        onMoveToSide={handleMoveToSide}
        onMoveToMain={handleMoveToMain}
        onSwap={handleSwap}
        onCancel={clearSelections}
        canMoveToSide={canMoveToSide}
        canMoveToMain={canMoveToMain}
        canSwap={canSwap}
      />

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