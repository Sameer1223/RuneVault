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
import { emptyDeckTemplate } from "../data/emptyDeckTemplate";
import type { FullDeck } from "@/types/deck";
import { addCardToDeckUtil, removeCardFromDeckUtil, setDeckNameUtil, swapCardsUtil } from "@/utils/deckBuilderUtils";
import { filterCards, type CardFilters } from "@/utils/filterCardsUtil";
import ConfirmationModal from "../components/common/ConfirmationModal";
import SwapBar from "../components/deckbuilder/SwapBar";
import { useUserId } from "@/hooks/useUserId";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { API_BASE_URL } from "@/lib/constants";

export default function DeckBuilder() {
  const location = useLocation();
  const incomingDeck = location.state?.deck;
  const { userId } = useUserId();
  const authFetch = useAuthFetch();

  const [deck, setDeck] = useState<FullDeck>(() => {
    if (incomingDeck) return incomingDeck;
    const saved = localStorage.getItem("deckData");
    return saved ? JSON.parse(saved) : { ...emptyDeckTemplate, user_id: userId };
  });

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [filters, setFilters] = useState<CardFilters>({});
  const [activeZone, setActiveZone] = useState<'main' | 'side'>('main');
  const [mainSelections, setMainSelections] = useState<Record<number, string>>({});
  const [sideSelections, setSideSelections] = useState<Record<number, string>>({});

  const mainSelCount = Object.keys(mainSelections).length;
  const sideSelCount = Object.keys(sideSelections).length;

  const clearSelections = useCallback(() => {
    setMainSelections({});
    setSideSelections({});
  }, []);

  const handleSelectMain = useCallback((index: number, cardId: string) => {
    setMainSelections(prev => {
      const next = { ...prev };
      if (index in next) delete next[index];
      else next[index] = cardId;
      return next;
    });
  }, []);

  const handleSelectSide = useCallback((index: number, cardId: string) => {
    setSideSelections(prev => {
      const next = { ...prev };
      if (index in next) delete next[index];
      else next[index] = cardId;
      return next;
    });
  }, []);

  const mainTotal = Object.values(deck.deck_data.Main ?? {}).reduce<number>((a, b) => a + (b as number), 0);
  const sideTotal = Object.values(deck.deck_data.Side ?? {}).reduce<number>((a, b) => a + (b as number), 0);

  const canMoveToSide = mainSelCount > 0 && (sideTotal + mainSelCount - sideSelCount) <= 8;
  const canMoveToMain = sideSelCount > 0 && (mainTotal + sideSelCount - mainSelCount) <= 39;
  const canSwap = mainSelCount > 0 && sideSelCount > 0
    && (mainTotal - mainSelCount + sideSelCount) <= 39
    && (sideTotal - sideSelCount + mainSelCount) <= 8;

  // Convert index-based selections to cardId counts for swap util
  function toCounts(selections: Record<number, string>): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const cardId of Object.values(selections)) {
      counts[cardId] = (counts[cardId] ?? 0) + 1;
    }
    return counts;
  }

  const handleSwap = useCallback(() => {
    if (!canSwap) return;
    setDeck((prev: FullDeck) => swapCardsUtil(prev, toCounts(mainSelections), toCounts(sideSelections)) as FullDeck);
    clearSelections();
  }, [mainSelections, sideSelections, clearSelections, canSwap]);

  const handleMoveToSide = useCallback(() => {
    if (!canMoveToSide) return;
    setDeck((prev: FullDeck) => swapCardsUtil(prev, mainSelections, {}) as FullDeck);
    clearSelections();
  }, [mainSelections, clearSelections, canMoveToSide]);

  const handleMoveToMain = useCallback(() => {
    if (!canMoveToMain) return;
    setDeck((prev: FullDeck) => swapCardsUtil(prev, {}, toCounts(sideSelections)) as FullDeck);
    clearSelections();
  }, [sideSelections, clearSelections, canMoveToMain]);

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "alert" | "save" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
    onConfirm: undefined,
    onCancel: undefined,
  });

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // FIXED: save ALSO behaves like alert (auto-close via OK)
  const openModal = ({ type, title, message, onConfirm, onCancel }: {
    type: "alert" | "save" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => {
    const behavesLikeAlert = type === "alert" || type === "save";

    setModalState({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: behavesLikeAlert ? closeModal : onConfirm,
      onCancel: behavesLikeAlert ? undefined : onCancel || closeModal,
    });
  };

  const filteredCards = useMemo(() => filterCards(cardData as import("@/types/deck").CardData[], filters), [filters]);

  const addCardToDeck = (cardId: string) => {
    setDeck((prev: FullDeck) => addCardToDeckUtil(prev, cardId, activeZone) as FullDeck);
  };

  const removeCardFromDeck = (cardId: string) => {
      setDeck((prev: FullDeck) => removeCardFromDeckUtil(prev, cardId) as FullDeck);
      setHoveredCard((prev) => (prev === cardId ? null : prev));
      closeModal();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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
      const url = `${API_BASE_URL}/api/decks/${isNew ? "" : deck.id}`;

      const deckToSave = { ...deck, lastUpdated: new Date().toISOString() };

      const response = await authFetch(url, {
        method,
        body: JSON.stringify(deckToSave),
      });

      if (!response.ok) throw new Error();

      const result = await response.json();

      if (isNew && result.id) {
        setDeck((prev: FullDeck) => ({
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
        setDeck({ ...emptyDeckTemplate, user_id: userId } as FullDeck);
        closeModal();
      },
    });
  };

  if (!deck.deck_data) return <div>Loading deck data...</div>;

  return (
    <div className="h-[calc(100vh-4rem)] mt-16 flex flex-col bg-[#121418] text-white gap-3 px-6 py-4">
      <EditableDeckTitle
        initialTitle={deck.name || "Untitled Deck"}
        onTitleChange={(t) => setDeck((prev: FullDeck) => setDeckNameUtil(prev, t) as FullDeck)}
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
            <SearchPanel onFilterChange={setFilters} selectedLegend={deck.deck_data.Legend ? { legendId: deck.deck_data.Legend } : undefined} />
          </div>
          <div id="Card-List" className="flex-[2] bg-stone-900 p-2 overflow-y-auto scroll-inside">
            <CardSearchPanel
              cards={filteredCards}
              deckCards={Object.entries({ ...deck.deck_data.Main, ...deck.deck_data.Side }).reduce((acc, [id, _count]) => {
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