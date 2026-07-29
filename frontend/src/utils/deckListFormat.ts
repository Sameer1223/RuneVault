import cardData from "@/data/cards.json";
import { addCardToDeckUtil } from "./deckBuilderUtils";
import type { DeckInnerData, FullDeck } from "@/types/deck";

type CardEntry = (typeof cardData)[number];

/** Builds the plain-text decklist used for both "Plain Text" export and paste-to-import. */
export function buildDeckListText(deck: DeckInnerData, cardLookup: Record<string, CardEntry>): string {
  const nameOf = (id: string) => cardLookup[id]?.name ?? id;
  const lines: string[] = [];

  if (deck.Legend) lines.push(`Legend: ${nameOf(deck.Legend)}`);
  if (deck.ChosenChampion) lines.push(`Chosen Champion: ${nameOf(deck.ChosenChampion)}`);
  lines.push("");

  lines.push("Main Deck:");
  for (const [id, count] of Object.entries(deck.Main ?? {})) {
    lines.push(`${count} ${nameOf(id)}`);
  }
  lines.push("");

  if (deck.Battlefields?.length) {
    lines.push("Battlefields:");
    for (const bf of deck.Battlefields) lines.push(nameOf(bf));
    lines.push("");
  }

  if (deck.Runes && Object.keys(deck.Runes).length) {
    lines.push("Runes:");
    for (const [id, count] of Object.entries(deck.Runes)) lines.push(`${count} ${nameOf(id)}`);
    lines.push("");
  }

  if (deck.Side && Object.keys(deck.Side).length) {
    lines.push("Sideboard:");
    for (const [id, count] of Object.entries(deck.Side)) lines.push(`${count} ${nameOf(id)}`);
  }

  return lines.join("\n").trim() + "\n";
}

interface ParsedEntry {
  name: string;
  count: number;
}

interface ParsedDeckList {
  legendName?: string;
  chosenChampionName?: string;
  main: ParsedEntry[];
  battlefields: string[];
  runes: ParsedEntry[];
  side: ParsedEntry[];
}

const COUNT_LINE_RE = /^(\d+)\s+(.+)$/;

/** Strips a leading "<count> " prefix from a card/legend/champion line, if present. */
function stripCount(line: string): string {
  const m = line.match(COUNT_LINE_RE);
  return m ? m[2].trim() : line;
}

type SectionKey = "legend" | "champion" | "main" | "battlefields" | "runes" | "side";

// Recognizes section headers across common format variations:
// - inline values on the same line ("Legend: Kai'Sa, ...") or header-only lines
//   whose value(s) follow on subsequent lines ("Legend:" then "1 Akali, ...")
// - alternate spellings/spacing ("Champion" vs "Chosen Champion", "MainDeck" vs "Main Deck")
const HEADER_RE =
  /^(chosen champion|champion|legend|main ?deck|main|battlefields?|runes?|side ?board|side ?deck|side)\s*:\s*(.*)$/i;

function canonicalizeHeader(raw: string): SectionKey {
  const key = raw.toLowerCase().replace(/\s+/g, "");
  if (key === "legend") return "legend";
  if (key === "champion" || key === "chosenchampion") return "champion";
  if (key === "main" || key === "maindeck") return "main";
  if (key === "battlefield" || key === "battlefields") return "battlefields";
  if (key === "rune" || key === "runes") return "runes";
  return "side"; // sideboard / side / sidedeck / sideboarddeck
}

/** Parses the plain-text decklist format back into named entries (no card IDs resolved yet). */
export function parseDeckListText(text: string): ParsedDeckList {
  const result: ParsedDeckList = { main: [], battlefields: [], runes: [], side: [] };
  let section: SectionKey | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const headerMatch = line.match(HEADER_RE);
    if (headerMatch) {
      const key = canonicalizeHeader(headerMatch[1]);
      const inline = headerMatch[2].trim();

      if (key === "legend") {
        if (inline) result.legendName = stripCount(inline);
        section = inline ? null : "legend";
      } else if (key === "champion") {
        if (inline) result.chosenChampionName = stripCount(inline);
        section = inline ? null : "champion";
      } else {
        section = key;
        if (inline) {
          if (key === "battlefields") result.battlefields.push(stripCount(inline));
          else {
            const m = inline.match(COUNT_LINE_RE);
            result[key].push(m ? { name: m[2].trim(), count: parseInt(m[1], 10) } : { name: inline, count: 1 });
          }
        }
      }
      continue;
    }

    if (section === "legend") {
      result.legendName = stripCount(line);
      section = null;
      continue;
    }
    if (section === "champion") {
      result.chosenChampionName = stripCount(line);
      section = null;
      continue;
    }
    if (section === "battlefields") {
      result.battlefields.push(stripCount(line));
      continue;
    }
    if (section === "main" || section === "runes" || section === "side") {
      const m = line.match(COUNT_LINE_RE);
      const entry: ParsedEntry = m
        ? { name: m[2].trim(), count: parseInt(m[1], 10) }
        : { name: line, count: 1 };
      result[section].push(entry);
    }
  }

  return result;
}

export interface DeckListImportResult {
  deckData: DeckInnerData;
  importedCount: number;
  warnings: string[];
}

function findCandidates(name: string, allowedTypes?: string[]) {
  const normalized = name.trim().toLowerCase();
  return cardData
    .filter((c) => c.name.trim().toLowerCase() === normalized && (!allowedTypes || allowedTypes.includes(c.type)))
    .sort((a, b) => a.cardId.localeCompare(b.cardId));
}

/**
 * Resolves a pasted decklist into a fresh DeckInnerData, reusing addCardToDeckUtil for every
 * card so all normal deck-building rules (color matching, copy limits, capacity, etc.) apply
 * exactly as if the user had clicked each card in manually.
 */
export function resolveDeckListImport(text: string): DeckListImportResult {
  const parsed = parseDeckListText(text);
  const warnings: string[] = [];
  let importedCount = 0;

  let deck: FullDeck = {
    user_id: null,
    name: "",
    deck_data: { Legend: "", ChosenChampion: "", Battlefields: [], Main: {}, Side: {}, Runes: {} },
  };

  const tryAdd = (name: string, allowedTypes: string[] | undefined, target: "main" | "side", label: string) => {
    const candidates = findCandidates(name, allowedTypes);
    if (candidates.length === 0) {
      warnings.push(`Card not found: "${name}" (${label})`);
      return;
    }
    for (const candidate of candidates) {
      const before = JSON.stringify(deck.deck_data);
      const next = addCardToDeckUtil(deck, candidate.cardId, target) as FullDeck;
      if (JSON.stringify(next.deck_data) !== before) {
        deck = next;
        importedCount++;
        return;
      }
    }
    warnings.push(`Could not add "${name}" (${label}) - may violate deck rules or already be at its copy limit`);
  };

  if (parsed.legendName) {
    tryAdd(parsed.legendName, ["Legend"], "main", "Legend");
  } else {
    warnings.push("No Legend line found - deck imported without a Legend.");
  }

  if (parsed.chosenChampionName) {
    tryAdd(parsed.chosenChampionName, ["Champion"], "main", "Chosen Champion");
  }

  for (const bf of parsed.battlefields) {
    tryAdd(bf, ["Battlefield"], "main", "Battlefield");
  }

  const nonSpecialTypes = undefined; // Unit/Spell/Gear/Champion - let addCardToDeckUtil's own routing decide
  for (const entry of parsed.main) {
    for (let i = 0; i < entry.count; i++) tryAdd(entry.name, nonSpecialTypes, "main", "Main Deck");
  }

  for (const entry of parsed.runes) {
    for (let i = 0; i < entry.count; i++) tryAdd(entry.name, ["Rune"], "main", "Runes");
  }

  for (const entry of parsed.side) {
    for (let i = 0; i < entry.count; i++) tryAdd(entry.name, nonSpecialTypes, "side", "Sideboard");
  }

  // A single unresolvable line with count > 1 would otherwise push the same
  // warning once per copy attempted - collapse to one message per unique issue.
  return { deckData: deck.deck_data, importedCount, warnings: [...new Set(warnings)] };
}
