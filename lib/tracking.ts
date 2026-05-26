"use client";

type TrackingPayload = Record<string, string | number | boolean | null | undefined>;

type FacebookPixel = {
  (method: "trackCustom", eventName: string, payload?: TrackingPayload): void;
  (method: "track", eventName: string, payload?: TrackingPayload): void;
};

type GoogleTag = (command: "event" | "config" | "js", eventName: string | Date, payload?: TrackingPayload) => void;

declare global {
  interface Window {
    fbq?: FacebookPixel;
    gtag?: GoogleTag;
  }
}

function fireEvent(eventName: string, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.fbq?.("trackCustom", eventName, payload);
  window.gtag?.("event", eventName, payload);
}

export function trackPageView(payload: TrackingPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.fbq?.("track", "PageView", payload);
  window.gtag?.("event", "page_view", payload);
}

export function trackQuizStart(payload: TrackingPayload = {}) {
  fireEvent("quiz_start", payload);
}

export function trackQuestionAnswered(payload: TrackingPayload = {}) {
  fireEvent("question_answered", payload);
}

export function trackStageComplete(payload: TrackingPayload = {}) {
  fireEvent("stage_complete", payload);
}

export function trackRewardGranted(payload: TrackingPayload = {}) {
  fireEvent("reward_granted", payload);
}

export function trackRewardClosed(payload: TrackingPayload = {}) {
  fireEvent("reward_closed", payload);
}

export function trackQuizComplete(payload: TrackingPayload = {}) {
  fireEvent("quiz_complete", payload);
}
