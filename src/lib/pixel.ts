// Meta Pixel helper — safe on SSR (no-op) and in the browser.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __pazeInitializedPixels?: Record<string, boolean>;
    __pazePageViewPixels?: Record<string, boolean>;
  }
}

export const META_PIXEL_ID = "37033721662937730";

export function fbqTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

export function fbqTrackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", event, params);
  }
}

export function fbqInit(pixelId: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.__pazeInitializedPixels ??= {};
  if (window.__pazeInitializedPixels[pixelId]) return;
  window.fbq("init", pixelId);
  window.__pazeInitializedPixels[pixelId] = true;
}

export function fbqTrackSingle(pixelId: string, event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  fbqInit(pixelId);
  window.fbq("trackSingle", pixelId, event, params);
}

export function fbqTrackPageViewOnce(pixelId: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  fbqInit(pixelId);
  window.__pazePageViewPixels ??= {};
  if (window.__pazePageViewPixels[pixelId]) return;
  window.fbq("trackSingle", pixelId, "PageView");
  window.__pazePageViewPixels[pixelId] = true;
}
