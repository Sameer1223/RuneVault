const SITE_NAME = "RuneVault";

/** Static route -> page name. Dynamic routes are handled by the prefix list below. */
const EXACT_TITLES: Record<string, string> = {
  "/": "Home",
  "/decks": "My Decks",
  "/deckbuilder": "Deck Builder",
  "/deckviewer": "Deck Viewer",
  "/collection": "Collection",
  "/riftboundle": "Riftboundle",
};

/**
 * Routes with dynamic segments (e.g. /deckviewer/:deckId). These are matched by
 * prefix so every deck doesn't become its own distinct page title in analytics -
 * the specific id still comes through in page_path if it's ever needed.
 */
const PREFIX_TITLES: [string, string][] = [
  ["/deckviewer/", "Deck Viewer"],
  ["/collection/", "Collection"],
];

/** Human-readable document title for a route, e.g. "Deck Builder | RuneVault". */
export function getPageTitle(pathname: string): string {
  const exact = EXACT_TITLES[pathname];
  if (exact) return `${exact} | ${SITE_NAME}`;

  for (const [prefix, name] of PREFIX_TITLES) {
    if (pathname.startsWith(prefix)) return `${name} | ${SITE_NAME}`;
  }

  return SITE_NAME;
}
