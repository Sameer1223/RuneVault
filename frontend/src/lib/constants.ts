/** Base URL for all API requests */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/** Card rarity types (without "All") */
export const RARITY_TYPES = ["Common", "Uncommon", "Rare", "Epic", "Alternate Art"] as const;

/** Card rarity types with "All" option for dropdowns */
export const RARITY_OPTIONS = ["All", ...RARITY_TYPES] as const;

/** Legend image cover position percentages (vertical positioning for legend cards in deck backgrounds) */
export const LEGEND_IMAGE_COVER_MAP: Record<string, number> = {
  kaisa: 12,
  ahri: 27,
  sett: 3,
  jinx: 3,
  teemo: 20,
  volibear: 8,
  darius: 6,
  leesin: 12,
  viktor: 15,
  leona: 12,
  missfortune: 20,
  annie: 25,
  masteryi: 25,
  lux: 12,
  garen: 20,
  irelia: 18,
  draven: 5,
  rumble: 12,
  lucian: 5,
  reksai: 45,
  ornn: 15,
  jax: 40,
  azir: 16,
  ezreal: 25,
  renata: 6,
  sivir: 15,
  fiora: 15,
  jhin: 17,
  rengar: 35,
  pyke: 30,
  vi: 25,
  lillia: 22,
  vex: 25,
  ivern: 20,
  diana: 10,
  leblanc: 12,
  khazix: 52,
  poppy: 19
};

/** Legend name → signature spell card IDs */
export const LEGEND_SIGNATURE_MAP: Record<string, string[]> = {
    "Kai'Sa": ["OGN-248"],
    "Volibear": ["OGN-250"],
    "Jinx": ["OGN-252"],
    "Darius": ["OGN-254"],
    "Ahri": ["OGN-256"],
    "Lee Sin": ["OGN-258"],
    "Yasuo": ["OGN-260"],
    "Leona": ["OGN-262"],
    "Teemo": ["OGN-264"],
    "Viktor": ["OGN-266"],
    "Miss Fortune": ["OGN-268"],
    "Sett": ["OGN-270"],
    "Annie": ["OGS-018"],
    "Master Yi": ["OGS-020", "UNL-192"],
    "Lux": ["OGS-020"],
    "Garen": ["OGS-024"],
    "Rumble": ["SFD-182"],
    "Lucian": ["SFD-184"],
    "Draven": ["SFD-186"],
    "Rek'Sai": ["SFD-188"],
    "Ornn": ["SFD-190", "SFD-191", "SFD-192"],
    "Jax": ["SFD-194"],
    "Irelia": ["SFD-196"],
    "Azir": ["SFD-198"],
    "Ezreal": ["SFD-200"],
    "Renata": ["SFD-202"],
    "Sivir": ["SFD-204"],
    "Fiora": ["SFD-206"],
    "Jhin": ["UNL-182"],
    "Rengar": ["UNL-184"],
    "Pyke": ["UNL-186"],
    "Vi": ["UNL-188"],
    "Lillia": ["UNL-190"],
    "Vex": ["UNL-194"],
    "Ivern": ["UNL-196"],
    "Diana": ["UNL-198"],
    "LeBlanc": ["UNL-200"],
    "Kha'Zix": ["UNL-202"],
    "Poppy": ["UNL-204"]
};
