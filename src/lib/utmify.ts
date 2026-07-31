export const UTMIFY_TRACKING_KEYS = [
  "src",
  "sck",
  "utm_source",
  "utm_campaign",
  "utm_medium",
  "utm_content",
  "utm_term",
] as const;

export type UtmifyTracking = Partial<
  Record<(typeof UTMIFY_TRACKING_KEYS)[number], string>
>;

const STORAGE_KEY = "kit-sandalias-utmify-tracking";
const SCRIPT_ID = "utmify-utms-script";

export function captureUtmifyTracking(): UtmifyTracking {
  if (typeof window === "undefined") return {};

  let stored: UtmifyTracking = {};
  try {
    stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    stored = {};
  }

  const params = new URLSearchParams(window.location.search);
  for (const key of UTMIFY_TRACKING_KEYS) {
    const value = params.get(key)?.trim();
    if (value) stored[key] = value.slice(0, 255);
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // O tracking continua funcionando na navegação atual mesmo sem sessionStorage.
  }
  return stored;
}

export function installUtmifyTracking() {
  if (typeof document === "undefined") return;
  captureUtmifyTracking();
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://cdn.utmify.com.br/scripts/utms/latest.js";
  script.async = true;
  script.defer = true;
  script.setAttribute("data-utmify-prevent-xcod-sck", "");
  script.setAttribute("data-utmify-prevent-subids", "");
  document.head.appendChild(script);
}
