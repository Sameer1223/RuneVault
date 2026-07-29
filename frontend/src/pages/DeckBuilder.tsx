import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import cardData from "../data/cards.json";
import CardImage from "@/components/CardImage";
import EditableDeckTitle from "../components/deckbuilder/EditableDeckTitle";
import MainDeck from "../components/deckbuilder/MainDeck";
import SideDeck from "../components/deckbuilder/SideDeck";
import RunesDeck from "../components/deckbuilder/RunesDeck";
import DeckRequirements from "../components/deckbuilder/DeckRequirements";
import OptionsPanel from "../components/deckbuilder/OptionsPanel";
import SearchPanel from "../components/deckbuilder/SearchPanel";
import CardSearchPanel from "../components/deckbuilder/CardSearchPanel";
import { emptyDeckTemplate } from "../data/emptyDeckTemplate";
import type { FullDeck, DeckInnerData } from "@/types/deck";
import { addCardToDeckUtil, removeCardFromDeckUtil, setDeckNameUtil, swapCardsUtil } from "@/utils/deckBuilderUtils";
import { filterCards, type CardFilters } from "@/utils/filterCardsUtil";
import ConfirmationModal from "../components/common/ConfirmationModal";
import SwapBar from "../components/deckbuilder/SwapBar";
import CollectionModeToggle from "../components/deckbuilder/CollectionModeToggle";
import { useUserId } from "@/hooks/useUserId";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useCollection } from "@/hooks/useCollection";
import { API_BASE_URL } from "@/lib/constants";
import { ClipboardList } from "lucide-react";
import { computeMissingCards, formatMissingCardsList } from "@/utils/missingCardsUtil";

export default function DeckBuilder() {
  const location = useLocation();
  const incomingDeck = location.state?.deck;
  const { userId } = useUserId();
  const authFetch = useAuthFetch();
  const { ownedCount } = useCollection();
  const [collectionMode, setCollectionMode] = useState(false);

  const [deck, setDeck] = useState<FullDeck>(() => {
    if (incomingDeck) return incomingDeck;
    const saved = localStorage.getItem("deckData");
    return saved ? JSON.parse(saved) : { ...emptyDeckTemplate, user_id: userId };
  });

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const HOVER_PREVIEW_DELAY = 175; // ms - avoids flicker/flooding on quick mouse passes

  const handleHoverCard = useCallback((cardId: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoveredCard(cardId), HOVER_PREVIEW_DELAY);
  }, []);

  const handleLeaveCard = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredCard(null);
  }, []);

  // Keeps the floating hover preview fully on-screen by flipping it to the
  // opposite side of the cursor whenever it would otherwise overflow the viewport.
  const calcHoverPreviewPosition = (cardId: string, x: number, y: number) => {
    const isBattlefield = cardData.find((c) => c.cardId === cardId)?.type === "Battlefield";
    const OFFSET = 15;
    const previewHeight = Math.min(400, window.innerHeight * 0.45);
    const ratio = isBattlefield ? 130 / 93 : 93 / 130;
    const previewWidth = Math.min(previewHeight * ratio, window.innerWidth * 0.7);

    let left = x + OFFSET;
    let top = y + OFFSET;

    if (left + previewWidth > window.innerWidth) left = x - previewWidth - OFFSET;
    if (top + previewHeight > window.innerHeight) top = y - previewHeight - OFFSET;

    left = Math.max(4, Math.min(left, window.innerWidth - previewWidth - 4));
    top = Math.max(4, Math.min(top, window.innerHeight - previewHeight - 4));

    return { left, top };
  };
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

  const canMoveToSide = mainSelCount > 0 && (sideTotal + mainSelCount - sideSelCount) <= 10;
  const canMoveToMain = sideSelCount > 0 && (mainTotal + sideSelCount - mainSelCount) <= 39;
  const canSwap = mainSelCount > 0 && sideSelCount > 0
    && (mainTotal - mainSelCount + sideSelCount) <= 39
    && (sideTotal - sideSelCount + mainSelCount) <= 10;

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
    setDeck((prev: FullDeck) => swapCardsUtil(prev, toCounts(mainSelections), {}) as FullDeck);
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
      if (!userId) {
        openModal({
          type: "save",
          title: "Login Required",
          message: "You must be logged in to save your deck.",
        });
        return;
      }

      const isNew = !deck.id;
      const method = isNew ? "POST" : "PUT";
      const url = `${API_BASE_URL}/decks/${isNew ? "" : deck.id}`;

      // Ensure deck has the latest user_id
      const deckWithUser = { ...deck, user_id: userId };
      const deckToSave = { ...deckWithUser, lastUpdated: new Date().toISOString() };

      const response = await authFetch(url, {
        method,
        body: JSON.stringify(deckToSave),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Save failed");
      }

      const result = await response.json();

      if (isNew && result.id) {
        setDeck((prev: FullDeck) => ({
          ...prev,
          id: result.id,
          user_id: userId,
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

  // IMPORT DECK (replace)
  const handleImportDeck = (deckData: DeckInnerData, importedCount: number, warnings: string[]) => {
    const warningNote = warnings.length
      ? ` ${warnings.length} card${warnings.length === 1 ? "" : "s"} could not be matched - see console for details.`
      : "";
    openModal({
      type: "confirm",
      title: "Import & Replace Deck?",
      message: `This will replace your current deck with ${importedCount} card${importedCount === 1 ? "" : "s"} from the pasted list. This cannot be undone.${warningNote}`,
      onConfirm: () => {
        setDeck((prev: FullDeck) => ({ ...prev, deck_data: deckData }));
        if (warnings.length) console.warn("Deck import warnings:", warnings);
        closeModal();
      },
    });
  };

  // COPY MISSING CARDS
  const handleCopyMissing = () => {
    const missing = computeMissingCards(deck.deck_data, ownedCount);
    if (missing.length === 0) {
      openModal({
        type: "alert",
        title: "Nothing Missing",
        message: "You own every card in this deck.",
      });
      return;
    }
    navigator.clipboard.writeText(formatMissingCardsList(missing));
    openModal({
      type: "alert",
      title: "Copied!",
      message: `Missing cards list copied to clipboard (${missing.length} card${missing.length === 1 ? "" : "s"}).`,
    });
  };

  if (!deck.deck_data) return <div>Loading deck data...</div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden mt-16 flex flex-col bg-[#121418] text-white gap-3 px-3 sm:px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <EditableDeckTitle
            initialTitle={deck.name || "Untitled Deck"}
            onTitleChange={(t) => setDeck((prev: FullDeck) => setDeckNameUtil(prev, t) as FullDeck)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {collectionMode && (
            <button
              onClick={handleCopyMissing}
              title="Copy a list of the cards you're missing to your clipboard"
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-zinc-900 border border-zinc-700 hover:border-[#caa368]/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline whitespace-nowrap">Copy Missing</span>
            </button>
          )}
          <CollectionModeToggle enabled={collectionMode} onChange={setCollectionMode} />
        </div>
      </div>

      <div id="Deck-Builder" className="flex flex-col lg:flex-row flex-1 gap-3 min-h-0 relative">
        <div id="Cards-Panel" className="flex flex-col lg:flex-[3] gap-3 min-h-0">
          <div
            id="Main-Deck"
            className={`bg-[#1E1E1E] min-h-[420px] lg:min-h-0 lg:flex-[16] overflow-y-auto relative cursor-pointer ring-inset ${
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
              onHoverCard={handleHoverCard}
              onLeaveCard={handleLeaveCard}
              onRemoveCard={removeCardFromDeck}
              onSelectCard={handleSelectMain}
              collectionMode={collectionMode}
              ownedCount={ownedCount}
            />

            {hoveredCard && (() => {
              const pos = calcHoverPreviewPosition(hoveredCard, mousePos.x, mousePos.y);
              return (
                <div
                  className="fixed z-50 pointer-events-none"
                  style={{ left: pos.left, top: pos.top }}
                >
                  <CardImage
                    cardId={hoveredCard}
                    className="h-[min(400px,45vh)] w-auto max-w-[70vw] object-cover rounded-lg shadow-2xl"
                  />
                </div>
              );
            })()}
          </div>

          <div id="Side-Deck-Stats" className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-3 min-h-0 lg:flex-[4]">
            <div
              id="Side-Deck"
              className={`bg-[#1E1E1E] p-2 overflow-auto cursor-pointer ring-inset w-full sm:w-auto ${
                activeZone === 'side' ? 'ring-1 ring-gray-700' : ''
              }`}
              onClick={() => setActiveZone('side')}
            >
              <SideDeck
                side={deck.deck_data.Side}
                selectedCards={sideSelections}
                onHoverCard={handleHoverCard}
                onLeaveCard={handleLeaveCard}
                onRemoveCard={removeCardFromDeck}
                onSelectCard={handleSelectSide}
                collectionMode={collectionMode}
                ownedCount={ownedCount}
              />
            </div>
            <div id="Runes-Deck" className="bg-[#1E1E1E] p-2 overflow-auto w-full sm:w-auto">
              <RunesDeck runes={deck.deck_data.Runes} onRemoveCard={removeCardFromDeck} />
            </div>
            <div id="Deck-Stats" className="bg-[#1E1E1E] sm:flex-[2] p-2 w-full sm:w-auto sm:min-w-[150px] overflow-auto min-h-0">
              <DeckRequirements deck={deck.deck_data} />
            </div>
          </div>

          <div id="Options-Panel" className="bg-[#121418] lg:flex-[1] p-3">
            <OptionsPanel
              onSave={saveDeck}
              onClear={clearDeck}
              onImport={handleImportDeck}
              deck={deck.deck_data}
              deckId={deck.id}
            />
          </div>
        </div>

        <div id="Search-Panel" className="flex flex-col lg:flex-[1.3] gap-3 min-h-0">
          <div id="Filters" className="bg-[#1E1E1E] lg:flex-none p-3">
            <SearchPanel onFilterChange={setFilters} selectedLegend={deck.deck_data.Legend ? { legendId: deck.deck_data.Legend } : undefined} />
          </div>
          <div id="Card-List" className="min-h-[420px] lg:min-h-0 lg:flex-1 bg-stone-900 p-2 overflow-y-auto scroll-inside">
            <CardSearchPanel
              cards={filteredCards}
              deckCards={Object.entries({ ...deck.deck_data.Main, ...deck.deck_data.Side }).reduce((acc, [id]) => {
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