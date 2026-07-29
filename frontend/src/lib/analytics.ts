// Lightweight Google Analytics 4 (gtag.js) integration.
// No-ops entirely when VITE_GA_MEASUREMENT_ID isn't set, so this is safe to
// call in every environment (local dev, CI, deploys without an ID yet).

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let initialized = false;

/** Injects gtag.js and configures GA4. Call once at app startup. */
export function initAnalytics() {
  if (initialized || !GA_MEASUREMENT_ID) return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  window.gtag("js", new Date());
  // We send page_view manually per route change (see trackPageView), so
  // disable gtag's own automatic one to avoid double-counting the first load.
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

/** Records a page view for the given path - call on every route change. */
export function trackPageView(path: string) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Records a custom event, e.g. trackEvent("deck_created", { deck_id }). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  window.gtag("event", name, params);
}
