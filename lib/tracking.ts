"use client";

type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

type FacebookPixel = {
  (method: "trackCustom", eventName: string, payload?: TrackingPayload): void;
  (method: "track", eventName: string, payload?: TrackingPayload): void;
};

declare global {
  interface Window {
    fbq?: FacebookPixel;
  }
}

export function trackPageView(payload: TrackingPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.fbq?.("track", "PageView", payload);
}
