"use client";

type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

type FacebookPixel = {
  (method: "trackCustom", eventName: string, payload?: TrackingPayload): void;
  (method: "track", eventName: string, payload?: TrackingPayload): void;
};

type GoogleTag = (command: "config", id: string, payload?: TrackingPayload) => void;

declare global {
  interface Window {
    fbq?: FacebookPixel;
    gtag?: GoogleTag;
  }
}

export function trackPageView(payload: TrackingPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.fbq?.("track", "PageView", payload);
  window.gtag?.("config", "G-44LV753KWN", payload);
}
