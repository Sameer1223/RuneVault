// Google Analytics 4 helpers.
//
// The gtag.js snippet itself lives statically in index.html (the standard
// install Google documents). Loading it there rather than injecting it from
// JS means Google's own tooling - Tag Assistant, the GA setup checker - can
// actually discover the tag; a script injected later by React is invisible
// to them and makes the site look untagged.
//
// index.html sets send_page_view: false because this is a single-page app,
// so route changes (not full page loads) are what we need to report. The
// functions below do that reporting.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Records a page view for the given path - call on every route change. */
export function trackPageView(path: string) {
  if (!window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Records a custom event, e.g. trackEvent("deck_created", { deck_id }). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!window.gtag) return;
  window.gtag("event", name, params);
}
